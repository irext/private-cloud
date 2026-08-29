package net.irext.server.restapi;

import jakarta.servlet.http.HttpServletRequest;
import net.irext.server.businesslogic.PublishManagementBusinessLogic;
import net.irext.server.model.FileDownloadURL;
import net.irext.server.response.Status;
import net.irext.server.response.StringResponse;
import net.irext.server.restapi.base.AbstractBaseService;
import net.irext.server.utils.Constants;
import net.irext.server.utils.LoggerUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import net.irext.server.component.UpdateStatusTracker;

import java.io.File;
import java.util.Map;

/**
 * Filename:       PublishManagementService.java
 * Revised:        Date: 2026-08-29
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Publish management REST API for private cloud data update
 * <p>
 * Revision log:
 * 2026-08-29: created by strawmanbobi
 */

@RestController
@RequestMapping("/irext-server/publish")
@Service("PublishManagementService")
@SuppressWarnings("unused")
public class PublishManagementService extends AbstractBaseService {

    private static final String TAG = PublishManagementService.class.getSimpleName();

    private PublishManagementBusinessLogic publishManageLogic;
    private UpdateStatusTracker statusTracker;

    @Autowired
    public void setPublishManageLogic(PublishManagementBusinessLogic publishManageLogic) {
        this.publishManageLogic = publishManageLogic;
    }

    @Autowired
    public void setStatusTracker(UpdateStatusTracker statusTracker) {
        this.statusTracker = statusTracker;
    }

    @GetMapping("/update_status")
    public SseEmitter updateStatus() {
        SseEmitter emitter = new SseEmitter(300000L);
        statusTracker.registerEmitter(emitter);
        LoggerUtil.getInstance().trace(TAG, "SSE emitter registered for update_status");
        return emitter;
    }

    @PostMapping("/prepare_private_data")
    public StringResponse preparePrivateData(HttpServletRequest request, @RequestBody Map<String, String> params) {
        try {
            StringResponse response = new StringResponse();
            response.setStatus(new Status());

            String appKey = params.get("appKey");
            String appSecret = params.get("appSecret");

            if (!StringUtils.hasText(appKey) || !StringUtils.hasText(appSecret)) {
                response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                response.setEntity("missing parameters");
                return response;
            }

            FileDownloadURL downloadURL = publishManageLogic.preparePrivateData(appKey, appSecret);
            if (downloadURL != null && StringUtils.hasText(downloadURL.getDownloadURL())) {
                boolean downloaded = publishManageLogic.downloadFile(downloadURL.getDownloadURL(), downloadURL.getFileName());
                if (downloaded) {
                    String encryptedPath = Constants.TEMP_DATA_DIR + downloadURL.getFileName();
                    String decryptedPath = publishManageLogic.decryptFile(encryptedPath, appSecret);
                    if (decryptedPath != null) {
                        String extractedDir = publishManageLogic.extractTarGz(decryptedPath, appKey);
                        if (extractedDir != null) {
                            // find SQL file in extracted directory
                            File extractedFolder = new File(extractedDir);
                            File sqlFile = null;
                            File[] files = extractedFolder.listFiles();
                            if (files != null) {
                                for (File f : files) {
                                    if (f.getName().endsWith(".sql")) {
                                        sqlFile = f;
                                        break;
                                    }
                                }
                            }
                            
                            if (sqlFile != null) {
                                // backup database before import
                                boolean dbBackedUp = publishManageLogic.backupDatabase();
                                if (!dbBackedUp) {
                                    statusTracker.sendEvent("failed", "error", "failed to backup database");
                                    statusTracker.complete();
                                    response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                                    response.setEntity("failed to backup database");
                                    return response;
                                }
                                
                                boolean sqlImported = publishManageLogic.importSql(sqlFile.getAbsolutePath());
                                if (sqlImported) {
                                    boolean binariesReplaced = publishManageLogic.replaceBinaries(extractedDir);
                                    if (binariesReplaced) {
                                        statusTracker.sendEvent("completed", "success", "data updated successfully");
                                        statusTracker.complete();
                                        response.getStatus().setCode(Constants.ERROR_CODE_SUCCESS);
                                        response.setEntity("data updated successfully");
                                    } else {
                                        statusTracker.sendEvent("failed", "error", "failed to replace binaries");
                                        statusTracker.complete();
                                        response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                                        response.setEntity("failed to replace binaries");
                                    }
                                } else {
                                    statusTracker.sendEvent("failed", "error", "failed to import SQL");
                                    statusTracker.complete();
                                    response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                                    response.setEntity("failed to import SQL");
                                }
                            } else {
                                statusTracker.sendEvent("failed", "error", "SQL file not found in extracted data");
                                statusTracker.complete();
                                response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                                response.setEntity("SQL file not found in extracted data");
                            }
                        } else {
                            statusTracker.sendEvent("failed", "error", "failed to extract file");
                            statusTracker.complete();
                            response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                            response.setEntity("failed to extract file");
                        }
                    } else {
                        statusTracker.sendEvent("failed", "error", "failed to decrypt file");
                        statusTracker.complete();
                        response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                        response.setEntity("failed to decrypt file");
                    }
                } else {
                    statusTracker.sendEvent("failed", "error", "failed to download file");
                    statusTracker.complete();
                    response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                    response.setEntity("failed to download file");
                }
            } else {
                statusTracker.sendEvent("failed", "error", "failed to prepare data");
                statusTracker.complete();
                response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                response.setEntity("failed to prepare data");
            }

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return getExceptionResponse(StringResponse.class);
        }
    }

    @PostMapping("/offline_update")
    public StringResponse offlineUpdate(HttpServletRequest request, @RequestBody Map<String, String> params) {
        try {
            StringResponse response = new StringResponse();
            response.setStatus(new Status());

            String filePath = params.get("filePath");
            String appSecret = params.get("appSecret");

            if (!StringUtils.hasText(filePath) || !StringUtils.hasText(appSecret)) {
                response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                response.setEntity("missing parameters");
                return response;
            }

            // verify file exists
            File encryptedFile = new File(filePath);
            if (!encryptedFile.exists()) {
                statusTracker.sendEvent("failed", "error", "uploaded file not found");
                statusTracker.complete();
                response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                response.setEntity("uploaded file not found");
                return response;
            }

            LoggerUtil.getInstance().trace(TAG, "offline update with file: " + filePath);

            // decrypt the uploaded file
            String decryptedPath = publishManageLogic.decryptFile(filePath, appSecret);
            if (decryptedPath != null) {
                // extract appKey from filename: {baseName}_{appKey}.tar.gz.enc
                String fileName = encryptedFile.getName();
                String appKey = "";
                int lastUnderscore = fileName.lastIndexOf("_");
                int dotTar = fileName.lastIndexOf(".tar.gz.enc");
                if (lastUnderscore > 0 && dotTar > lastUnderscore) {
                    appKey = fileName.substring(lastUnderscore + 1, dotTar);
                }

                String extractedDir = publishManageLogic.extractTarGz(decryptedPath, appKey);
                if (extractedDir != null) {
                    // find SQL file in extracted directory
                    File extractedFolder = new File(extractedDir);
                    File sqlFile = null;
                    File[] files = extractedFolder.listFiles();
                    if (files != null) {
                        for (File f : files) {
                            if (f.getName().endsWith(".sql")) {
                                sqlFile = f;
                                break;
                            }
                        }
                    }

                    if (sqlFile != null) {
                        // backup database before import
                        boolean dbBackedUp = publishManageLogic.backupDatabase();
                        if (!dbBackedUp) {
                            statusTracker.sendEvent("failed", "error", "failed to backup database");
                            statusTracker.complete();
                            response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                            response.setEntity("failed to backup database");
                            return response;
                        }

                        boolean sqlImported = publishManageLogic.importSql(sqlFile.getAbsolutePath());
                        if (sqlImported) {
                            boolean binariesReplaced = publishManageLogic.replaceBinaries(extractedDir);
                            if (binariesReplaced) {
                                statusTracker.sendEvent("completed", "success", "data updated successfully");
                                statusTracker.complete();
                                response.getStatus().setCode(Constants.ERROR_CODE_SUCCESS);
                                response.setEntity("data updated successfully");
                            } else {
                                statusTracker.sendEvent("failed", "error", "failed to replace binaries");
                                statusTracker.complete();
                                response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                                response.setEntity("failed to replace binaries");
                            }
                        } else {
                            statusTracker.sendEvent("failed", "error", "failed to import SQL");
                            statusTracker.complete();
                            response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                            response.setEntity("failed to import SQL");
                        }
                    } else {
                        statusTracker.sendEvent("failed", "error", "SQL file not found in extracted data");
                        statusTracker.complete();
                        response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                        response.setEntity("SQL file not found in extracted data");
                    }
                } else {
                    statusTracker.sendEvent("failed", "error", "failed to extract file");
                    statusTracker.complete();
                    response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                    response.setEntity("failed to extract file");
                }
            } else {
                statusTracker.sendEvent("failed", "error", "failed to decrypt file");
                statusTracker.complete();
                response.getStatus().setCode(Constants.ERROR_CODE_NETWORK_ERROR);
                response.setEntity("failed to decrypt file");
            }

            return response;
        } catch (Exception e) {
            e.printStackTrace();
            return getExceptionResponse(StringResponse.class);
        }
    }
}
