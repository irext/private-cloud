package net.irext.server.service.businesslogic;

import com.squareup.okhttp.*;
import net.irext.decode.sdk.bean.TemperatureRange;
import net.irext.server.service.mapper.CollectKeyMapper;
import net.irext.server.service.mapper.DecodeRemoteMapper;
import net.irext.server.service.mapper.RemoteIndexMapper;
import net.irext.server.service.model.ACParameters;
import net.irext.server.service.model.CollectKey;
import net.irext.server.service.model.DecodeRemote;
import net.irext.server.service.model.RemoteIndex;
import net.irext.server.service.utils.FileUtil;
import net.irext.server.service.utils.LoggerUtil;
import net.irext.server.service.utils.MD5Util;
import net.irext.decode.sdk.IRDecode;
import net.irext.decode.sdk.bean.ACStatus;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import javax.servlet.ServletContext;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.util.List;

/**
 * Filename:       OperationLogic
 * Revised:        Date: 2018-12-30
 * Revision:       Revision: 1.0
 * <p>
 * Description:    IRext private server decode logic
 * <p>
 * Revision log:
 * 2018-12-30: created by strawmanbobi
 */
@SuppressWarnings("Duplicates")
@Controller
public class OperationLogic {

    private static final String TAG = OperationLogic.class.getSimpleName();
    private static final boolean DEBUG = true;

    private static final String IR_BIN_FILE_PREFIX = "irda_";
    private static final String IR_BIN_FILE_SUFFIX = ".bin";

    private static final String IR_BIN_DOWNLOAD_PREFIX = "http://irext-debug.oss-cn-hangzhou.aliyuncs.com/";

    private static OperationLogic operationLogic;

    public static OperationLogic getInstance() {
        if (null == operationLogic) {
            operationLogic = new OperationLogic();
        }
        return operationLogic;
    }

    private RemoteIndexMapper remoteIndexMapper;

    private DecodeRemoteMapper decodeRemoteMapper;

    private CollectKeyMapper collectKeyMapper;

    @Autowired
    public void setRemoteIndexMapper(RemoteIndexMapper remoteIndexMapper) {
        this.remoteIndexMapper = remoteIndexMapper;
    }

    @Autowired
    public void setDecodeRemoteMapper(DecodeRemoteMapper decodeRemoteMapper) {
        this.decodeRemoteMapper = decodeRemoteMapper;
    }

    @Autowired
    public void setCollectKeyMapper(CollectKeyMapper collectKeyMapper) {
        this.collectKeyMapper = collectKeyMapper;
    }

    public RemoteIndex prepareBinary(int remoteIndexId) {
        RemoteIndex remoteIndex = null;
        try {
            List<RemoteIndex> remoteIndexList = remoteIndexMapper.getRemoteIndexById(remoteIndexId);
            if (null != remoteIndexList && remoteIndexList.size() > 0) {
                remoteIndex = remoteIndexList.get(0);
                String checksum = remoteIndex.getBinaryMd5().toUpperCase();
                String remoteMap = remoteIndex.getRemoteMap();

                LoggerUtil.getInstance().trace(TAG, "checksum for remoteIndex " +
                        remoteIndex.getId() + " = " + checksum);

                // read from file or OSS
                String projectPath = System.getProperty("user.dir");
                if (null != projectPath) {
                    String downloadPath = projectPath + File.separator + "bin_cache" + File.separator;
                    String fileName = IR_BIN_FILE_PREFIX + remoteMap + IR_BIN_FILE_SUFFIX;
                    String localFilePath = downloadPath + fileName;

                    File binFile = new File(localFilePath);
                    FileInputStream fin = getFile(binFile, downloadPath, fileName, checksum);
                    if (null != fin) {
                        byte[] newBinaries = IOUtils.toByteArray(fin);
                        LoggerUtil.getInstance().trace(TAG, "binary content get, save it to redis");
                        remoteIndex.setBinaries(newBinaries);
                    }
                } else {
                    LoggerUtil.getInstance().trace(TAG, "project root is null");
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        } finally {
            LoggerUtil.getInstance().trace(TAG, "return remote index");
        }
        return remoteIndex;
    }

    public int[] decodeIR(RemoteIndex remoteIndex, ACStatus acStatus,
                        int keyCode, int changeWindDirection) {
        try {
            int[] decoded = null;
            synchronized (this) {
                if (null != remoteIndex) {
                    int categoryId = remoteIndex.getCategoryId();
                    int subCate = remoteIndex.getSubCate();
                    byte[] binaryContent = remoteIndex.getBinaries();
                    IRDecode irDecode = IRDecode.getInstance();
                    int ret = irDecode.openBinary(categoryId, subCate, binaryContent, binaryContent.length);
                    if (0 == ret) {
                        decoded = irDecode.decodeBinary(keyCode, acStatus, changeWindDirection);
                    }
                    irDecode.closeBinary();
                    return decoded;
                }
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }

    public int[] decodeIRDirect(Integer indexId, int keyCode, int paraData) {
        String keyValueString = null;
        String[] keyValues;
        int[] keyValue = null;

        if (0 == paraData) {
            List<DecodeRemote> decodeRemoteList = decodeRemoteMapper.directDecode(indexId, keyCode);
            if (null != decodeRemoteList && decodeRemoteList.size() > 0) {
                keyValueString = decodeRemoteList.get(0).getKeyValue();
            }
        } else {
            List<CollectKey> collectKeyList = collectKeyMapper.directDecode(indexId, keyCode);
            if (null != collectKeyList && collectKeyList.size() > 0) {
                keyValueString = collectKeyList.get(0).getKeyValue();
            }
        }
        if (null != keyValueString && keyValueString.length() > 0) {
            keyValues = keyValueString.split(",");
            keyValue = new int[keyValues.length];
            for (int i = 0; i < keyValues.length; i++) {
                keyValue[i] = Integer.parseInt(keyValues[i]);
            }
        }
        return keyValue;
    }

    public ACParameters getACParameters(RemoteIndex remoteIndex, Integer mode) {
        ACParameters acParameters = null;
        try {
            int categoryId = remoteIndex.getCategoryId();
            int subCate = remoteIndex.getSubCate();
            byte[] binaryContent = remoteIndex.getBinaries();
            IRDecode irDecode = IRDecode.getInstance();
            int ret = irDecode.openBinary(categoryId, subCate, binaryContent, binaryContent.length);
            if (0 == ret) {
                acParameters = new ACParameters();
                int[] supportedModes = irDecode.getACSupportedMode();
                if (DEBUG) {
                    LoggerUtil.getInstance().trace(TAG, "supported modes got : ");
                    for (int i = 0; i < supportedModes.length; i++) {
                        LoggerUtil.getInstance().trace(TAG, "supported mode [" + i + "] = " + supportedModes[i]);
                    }
                }
                acParameters.setSupportedModes(supportedModes);
                if (1 == supportedModes[mode]) {
                    // if this mode is really supported by this AC, get other parameters
                    TemperatureRange temperatureRange = irDecode.getTemperatureRange(mode);
                    int[] supportedWindSpeed = irDecode.getACSupportedWindSpeed(mode);

                    if (DEBUG) {
                        LoggerUtil.getInstance().trace(TAG, "supported wind speed got for mode : " + mode);
                        for (int i = 0; i < supportedWindSpeed.length; i++) {
                            LoggerUtil.getInstance().trace(TAG, "supported wind speed [" + i + "] = " + supportedWindSpeed[i]);
                        }
                    }
                    int[] supportedSwing = irDecode.getACSupportedSwing(mode);

                    if (DEBUG) {
                        LoggerUtil.getInstance().trace(TAG, "supported swing got for mode : " + mode);
                        for (int i = 0; i < supportedSwing.length; i++) {
                            LoggerUtil.getInstance().trace(TAG, "supported swing [" + i + "] = " + supportedSwing[i]);
                        }
                    }

                    int supportedWindDirection = irDecode.getACSupportedWindDirection(mode);

                    if (DEBUG) {
                        LoggerUtil.getInstance().trace(TAG,
                                "supported wind directions for mode : " + mode +
                                        " = " + supportedWindDirection);
                    }

                    acParameters.setTempMax(temperatureRange.getTempMax());
                    acParameters.setTempMin(temperatureRange.getTempMin());
                    acParameters.setSupportedWindSpeed(supportedWindSpeed);
                    acParameters.setSupportedSwing(supportedSwing);
                    acParameters.setSupportedWindSpeed(supportedWindSpeed);
                }
                irDecode.closeBinary();
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return acParameters;
    }

    // helper methods
    private FileInputStream getFile(File binFile, String downloadPath, String fileName, String checksum) {
        try {
            if (binFile.exists()) {
                FileInputStream fileInputStream = new FileInputStream(binFile);
                // validate binary content
                byte[] binaries = IOUtils.toByteArray(fileInputStream);
                String fileChecksum =
                        MD5Util.byteArrayToHexString(MessageDigest.getInstance("MD5").digest(binaries)).toUpperCase();

                if (fileChecksum.equals(checksum)) {
                    return new FileInputStream(binFile);
                }
            }
            InputStream inputStream = getBinInputStream(fileName);
            // validate binary content
            if (null != inputStream) {
                byte[] binaries = IOUtils.toByteArray(inputStream);
                inputStream.close();
                String ossChecksum =
                        MD5Util.byteArrayToHexString(MessageDigest.getInstance("MD5").digest(binaries)).toUpperCase();
                if (ossChecksum.equals(checksum)) {
                    FileUtil.createDirs(downloadPath);
                    if (FileUtil.write(binFile, binaries)) {
                        LoggerUtil.getInstance().trace(TAG,"download file successfully");
                        return new FileInputStream(binFile);
                    } else {
                        LoggerUtil.getInstance().trace(TAG,"fatal : write file to local path failed");
                        return null;
                    }
                } else {
                    LoggerUtil.getInstance().trace(TAG,"fatal : checksum does not match even downloaded from OSS, " +
                            " please contact the admin");
                    return null;
                }
            } else{
                LoggerUtil.getInstance().trace(TAG,"fatal : download file failed");
                return null;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private InputStream getBinInputStream(String fileName) {
        String downloadURL = IR_BIN_DOWNLOAD_PREFIX + fileName;
        try {
            LoggerUtil.getInstance().trace(TAG,"download file from OSS : " + downloadURL);
            return getFileByteStreamByURL(downloadURL);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private InputStream getFileByteStreamByURL(String url) throws IOException {
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        Response response = new OkHttpClient().newCall(request).execute();
        return response.body().byteStream();
    }

    public File getDownloadFile(ServletContext context, int remoteIndexId) {
        try {
            List<RemoteIndex> remoteIndexList = remoteIndexMapper.getRemoteIndexById(remoteIndexId);
            if (null == remoteIndexList || 0 == remoteIndexList.size()) {
                return null;
            }
            RemoteIndex remoteIndex = remoteIndexList.get(0);
            String downloadPath = context.getRealPath("") + "bin_cache" + File.separator;
            String fileName = IR_BIN_FILE_PREFIX + remoteIndex.getRemoteMap() + IR_BIN_FILE_SUFFIX;
            String localFilePath = downloadPath + fileName;
            File binFile = new File(localFilePath);
            getFile(binFile, downloadPath, fileName, remoteIndex.getBinaryMd5().toUpperCase());
            return binFile;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
