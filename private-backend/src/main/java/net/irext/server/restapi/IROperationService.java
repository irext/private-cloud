package net.irext.server.restapi;

import com.google.gson.Gson;
import jakarta.servlet.ServletContext;
import net.irext.server.businesslogic.OperationLogic;
import net.irext.server.cache.IDecodeSessionRepository;
import net.irext.server.cache.IIRBinaryRepository;
import net.irext.server.model.ACParameters;
import net.irext.server.model.RemoteIndex;
import net.irext.server.request.*;
import net.irext.server.response.*;
import net.irext.server.utils.LoggerUtil;
import net.irext.server.businesslogic.IndexingLogic;
import net.irext.server.restapi.base.AbstractBaseService;
import net.irext.decode.sdk.bean.ACStatus;
import net.irext.decode.sdk.utils.Constants;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.ws.rs.core.HttpHeaders;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Filename:       IRDecodeService.java
 * Revised:        Date: 2018-12-16
 * Revision:       Revision: 1.0
 * <p>
 * Description:    IRext operation server
 * <p>
 * Revision log:
 * 2018-12-16: created by strawmanbobi
 */

@RestController
@RequestMapping("/irext-server/operation")
@Service("IROperationService")
@SuppressWarnings("unused")
public class IROperationService extends AbstractBaseService {

    private static final String TAG = IROperationService.class.getSimpleName();

    private ServletContext context;

    private IndexingLogic indexingLogic;

    private OperationLogic operationLogic;

    private IIRBinaryRepository irBinaryRepository;

    private IDecodeSessionRepository decodeSessionRepository;

    @Autowired
    public void setContext(ServletContext context) {
        this.context = context;
    }

    @Autowired
    public void setIndexingLogic(IndexingLogic indexingLogic) {
        this.indexingLogic = indexingLogic;
    }

    @Autowired
    public void setOperationLogic(OperationLogic operationLogic) {
        this.operationLogic = operationLogic;
    }

    @Autowired
    public void setIrBinaryRepository(IIRBinaryRepository irBinaryRepository) {
        this.irBinaryRepository = irBinaryRepository;
    }

    @Autowired
    public void setDecodeSessionRepository(IDecodeSessionRepository decodeSessionRepository) {
        this.decodeSessionRepository = decodeSessionRepository;
    }

    @PostMapping("/download_bin")
    public ResponseEntity<InputStreamResource> downloadBin(
            @RequestBody DownloadBinaryRequest downloadBinaryRequest) throws IOException {
        int id = downloadBinaryRequest.getId();
        String token = downloadBinaryRequest.getToken();
        int indexId = downloadBinaryRequest.getIndexId();
        File downloadFile = operationLogic.getDownloadFile(context, indexId);

        ServiceResponse response = validateToken(id, token, ServiceResponse.class);
        if (response.getStatus().getCode() == net.irext.server.utils.Constants.ERROR_CODE_AUTH_FAILURE) {
            return null;
        }
        if (null == downloadFile) {
            return ResponseEntity.ok().body(null);
        }

        InputStreamResource resource = new InputStreamResource(new FileInputStream(downloadFile));
        String fileName = downloadFile.getName();
        long fileLength = downloadFile.length();
        indexingLogic.statRemoteRef(indexId, id, token);
        return ResponseEntity.ok()
                // Content-Disposition
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + fileName)
                // Content-Length
                .contentLength(fileLength)
                .body(resource);
    }

    @PostMapping("/get_ac_parameters")
    public ACParametersResponse getACParameters(@RequestBody GetACParametersRequest getACParametersRequest) {
        int id = getACParametersRequest.getId();
        String token = getACParametersRequest.getToken();
        ACParametersResponse response = validateToken(id, token, ACParametersResponse.class);
        if (response.getStatus().getCode() == net.irext.server.utils.Constants.ERROR_CODE_AUTH_FAILURE) {
            return response;
        }

        try {
            int remoteIndexId = getACParametersRequest.getIndexId();
            int mode = getACParametersRequest.getMode();
            RemoteIndex remoteIndex = operationLogic.prepareBinary(remoteIndexId);
            ACParameters acParameters = OperationLogic.getInstance().getACParameters(remoteIndex, mode);

            response.setStatus(new Status(Constants.ERROR_CODE_SUCCESS, Constants.ERROR_CODE_SUCESS_TEXT));
            response.setEntity(acParameters);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            return getExceptionResponse(ACParametersResponse.class);
        }
    }

    @PostMapping("/decode")
    public DecodeResponse decodeIR(@RequestBody DecodeRequest decodeRequest) {
        int id = decodeRequest.getId();
        String token = decodeRequest.getToken();
        DecodeResponse response = validateToken(id, token, DecodeResponse.class);
        if (response.getStatus().getCode() == net.irext.server.utils.Constants.ERROR_CODE_AUTH_FAILURE) {
            return response;
        }
        try {
            int indexId = decodeRequest.getIndexId();
            ACStatus acStatus = decodeRequest.getAcStatus();
            int keyCode = decodeRequest.getKeyCode();
            Integer changeWindDir = decodeRequest.getChangeWindDir();
            Integer directDecode = decodeRequest.getDirectDecode();
            Integer paraData = decodeRequest.getParaData();
            RemoteIndex remoteIndex = null;

            LoggerUtil.getInstance().trace(TAG, "decodeIR entry, indexId = " + indexId);

            if (null == acStatus.getChangeWindDir() && null != changeWindDir) {
                acStatus.setChangeWindDir(changeWindDir);
            }
            int[] decoded = null;
            LoggerUtil.getInstance().trace(TAG, "decodeIR entry, keyCode = " + keyCode + ", acStatus = " +
                    new Gson().toJson(acStatus));

            // handle default value of arguments
            if (null == directDecode) {
                directDecode = 0;
            }
            if (null == paraData || 0 == paraData) {
                paraData = 0;
                // validate remote remoteIndex
                remoteIndex = indexingLogic.getRemoteIndex(indexId);
                if (null == remoteIndex) {
                    response.setEntity(null);
                    response.setStatus(new Status(Constants.ERROR_CODE_NETWORK_ERROR,
                            Constants.ERROR_CODE_NETWORK_ERROR_TEXT));
                    return response;
                }
            }

            if (1 == directDecode) {
                decoded = operationLogic.decodeIRDirect(indexId, keyCode, paraData);
            } else {
                if (1 == paraData) {
                    response.setEntity(null);
                    response.setStatus(new Status(Constants.ERROR_CODE_INVALID_PARAMETER,
                            Constants.ERROR_CODE_INVALID_PARAMETER_TEXT));
                } else {
                    if (null == remoteIndex) {
                        response.setEntity(null);
                        response.setStatus(new Status(Constants.ERROR_CODE_NETWORK_ERROR,
                                Constants.ERROR_CODE_NETWORK_ERROR_TEXT));
                        return response;
                    }
                    // NOTE: here remoteIndex instances changes
                    remoteIndex = operationLogic.prepareBinary(remoteIndex.getId());
                    decoded = operationLogic.decodeIR(remoteIndex, acStatus, keyCode);
                }
            }
            response.setEntity(decoded);
            if (null != remoteIndex) {
                indexingLogic.statRemoteRef(remoteIndex, id, token);
            }
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return getExceptionResponse(DecodeResponse.class);
        }
    }

    private RemoteIndex getCachedRemoteIndex(String sessionId, int remoteIndexId) {
        RemoteIndex cachedRemoteIndex = null;

        if (null == sessionId) {
            LoggerUtil.getInstance().trace(TAG, "sessionId is not given, abort");
        } else {
            Integer cachedRemoteIndexId = decodeSessionRepository.find(sessionId);
            if (null != cachedRemoteIndexId) {
                cachedRemoteIndex = irBinaryRepository.find(cachedRemoteIndexId);
                if (null != cachedRemoteIndex) {
                    if (remoteIndexId != cachedRemoteIndex.getId()) {
                        cachedRemoteIndex = null;
                    }
                }
            }
        }
        return cachedRemoteIndex;
    }
}
