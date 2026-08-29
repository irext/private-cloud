package net.irext.server.businesslogic;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import net.irext.server.model.FileDownloadURL;
import net.irext.server.utils.Constants;
import net.irext.server.utils.LoggerUtil;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import net.irext.server.component.UpdateStatusTracker;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import org.apache.commons.compress.archivers.tar.TarArchiveEntry;
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream;
import org.apache.commons.compress.compressors.gzip.GzipCompressorInputStream;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Filename:       PublishManagementBusinessLogic.java
 * Revised:        Date: 2026-08-29
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Publish management business logic for private cloud data update
 * <p>
 * Revision log:
 * 2026-08-29: created by strawmanbobi
 */
@Controller
public class PublishManagementBusinessLogic {
    private static final String TAG = PublishManagementBusinessLogic.class.getName();

    private static final MediaType JSON
            = MediaType.parse("application/json; charset=utf-8");

    @Value("${user.irext.server}")
    private String irextServerUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Autowired
    private UpdateStatusTracker statusTracker;

    public FileDownloadURL preparePrivateData(String appKey, String appSecret) {
        String url = irextServerUrl + Constants.PREPARE_PRIVATE_DATA_URL;
        
        statusTracker.sendEvent("preparing_data", "running", "preparing data");
        PreparePrivateDataRequest request = new PreparePrivateDataRequest(appKey, appSecret);
        String requestBody = new Gson().toJson(request);
        
        OkHttpClient client = new OkHttpClient.Builder()
                .connectTimeout(60, java.util.concurrent.TimeUnit.SECONDS)
                .readTimeout(300, java.util.concurrent.TimeUnit.SECONDS)
                .build();

        RequestBody body = RequestBody.create(requestBody, JSON);
        Request httpRequest = new Request.Builder()
                .url(url)
                .post(body)
                .build();

        try {
            Response response = client.newCall(httpRequest).execute();
            if (response.body() != null) {
                String responseBody = response.body().string();
                LoggerUtil.getInstance().trace(TAG, "preparePrivateData response: " + responseBody);
                
                JsonObject jsonObj = JsonParser.parseString(responseBody).getAsJsonObject();
                int code = jsonObj.getAsJsonObject("status").get("code").getAsInt();
                if (code == Constants.ERROR_CODE_SUCCESS && jsonObj.has("entity") && !jsonObj.get("entity").isJsonNull()) {
                    FileDownloadURL downloadURL = new Gson().fromJson(jsonObj.get("entity"), FileDownloadURL.class);
                    return downloadURL;
                } else {
                    LoggerUtil.getInstance().trace(TAG, "preparePrivateData failed, code: " + code);
                }
            }
        } catch (Exception e) {
            LoggerUtil.getInstance().trace(TAG, "preparePrivateData exception: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    public boolean downloadFile(String downloadUrl, String fileName) {
        File tempDir = new File(Constants.TEMP_DATA_DIR);
        if (!tempDir.exists()) {
            if (!tempDir.mkdirs()) {
                LoggerUtil.getInstance().trace(TAG, "failed to create temp directory: " + Constants.TEMP_DATA_DIR);
                return false;
            }
        }

        String targetPath = Constants.TEMP_DATA_DIR + fileName;
        LoggerUtil.getInstance().trace(TAG, "downloading file to: " + targetPath);
        statusTracker.sendEvent("downloading", "running", "downloading encrypted file");

        try (InputStream in = new URL(downloadUrl).openStream();
             ReadableByteChannel rbc = Channels.newChannel(in);
             FileOutputStream fos = new FileOutputStream(targetPath)) {
            fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
            LoggerUtil.getInstance().trace(TAG, "file downloaded successfully: " + targetPath);
            return true;
        } catch (Exception e) {
            LoggerUtil.getInstance().trace(TAG, "downloadFile exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public String decryptFile(String encryptedPath, String appSecret) {
        LoggerUtil.getInstance().trace(TAG, "decrypting file: " + encryptedPath);
        statusTracker.sendEvent("decrypting", "running", "decrypting file");
        try {
            byte[] fileData = Files.readAllBytes(Paths.get(encryptedPath));

            // verify magic number
            byte[] magicBytes = Constants.ENCRYPT_MAGIC_NUMBER.getBytes("UTF-8");
            if (fileData.length < magicBytes.length + 16) {
                LoggerUtil.getInstance().trace(TAG, "file too small to contain magic number and IV");
                return null;
            }
            for (int i = 0; i < magicBytes.length; i++) {
                if (fileData[i] != magicBytes[i]) {
                    LoggerUtil.getInstance().trace(TAG, "invalid magic number");
                    return null;
                }
            }

            // extract IV
            int ivOffset = magicBytes.length;
            byte[] iv = new byte[16];
            System.arraycopy(fileData, ivOffset, iv, 0, 16);

            // extract encrypted data
            int dataOffset = ivOffset + 16;
            byte[] encryptedData = new byte[fileData.length - dataOffset];
            System.arraycopy(fileData, dataOffset, encryptedData, 0, encryptedData.length);

            // derive key from appSecret (hex string -> bytes, take first 32 bytes)
            byte[] keyBytes = hexToBytes(appSecret);
            byte[] key = new byte[32];
            System.arraycopy(keyBytes, 0, key, 0, Math.min(keyBytes.length, 32));

            // decrypt with AES/CBC/PKCS5Padding
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, keySpec, ivSpec);
            byte[] decrypted = cipher.doFinal(encryptedData);

            // output as .tar.gz (remove .enc extension)
            String decryptedPath = encryptedPath.replace(".enc", "");
            Files.write(Paths.get(decryptedPath), decrypted);
            LoggerUtil.getInstance().trace(TAG, "file decrypted successfully: " + decryptedPath);
            return decryptedPath;
        } catch (Exception e) {
            LoggerUtil.getInstance().trace(TAG, "decryptFile exception: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public String extractTarGz(String tarGzPath, String appKey) {
        LoggerUtil.getInstance().trace(TAG, "extracting file: " + tarGzPath);
        statusTracker.sendEvent("extracting", "running", "extracting data package");

        // derive extracted folder name: remove _{appKey}.tar.gz from fileName
        String fileName = new File(tarGzPath).getName();
        String suffix = "_" + appKey + ".tar.gz";
        if (!fileName.endsWith(suffix)) {
            LoggerUtil.getInstance().trace(TAG, "unexpected file name format: " + fileName);
            return null;
        }
        String folderName = fileName.substring(0, fileName.length() - suffix.length());
        String extractDir = Constants.TEMP_DATA_DIR + folderName;

        // check if target directory already exists and remove it
        File targetDir = new File(extractDir);
        if (targetDir.exists()) {
            deleteDirectory(targetDir);
        }

        try (FileInputStream fis = new FileInputStream(tarGzPath);
             GzipCompressorInputStream gis = new GzipCompressorInputStream(fis);
             TarArchiveInputStream tis = new TarArchiveInputStream(gis)) {

            TarArchiveEntry entry;
            while ((entry = tis.getNextEntry()) != null) {
                File outputFile = new File(Constants.TEMP_DATA_DIR + entry.getName());
                if (entry.isDirectory()) {
                    if (!outputFile.exists()) {
                        if (!outputFile.mkdirs()) {
                            LoggerUtil.getInstance().trace(TAG, "failed to create directory: " + outputFile.getAbsolutePath());
                            return null;
                        }
                    }
                } else {
                    File parent = outputFile.getParentFile();
                    if (!parent.exists()) {
                        if (!parent.mkdirs()) {
                            LoggerUtil.getInstance().trace(TAG, "failed to create parent directory: " + parent.getAbsolutePath());
                            return null;
                        }
                    }
                    try (FileOutputStream fos = new FileOutputStream(outputFile)) {
                        byte[] buffer = new byte[8192];
                        int len;
                        while ((len = tis.read(buffer)) != -1) {
                            fos.write(buffer, 0, len);
                        }
                    }
                }
            }
            LoggerUtil.getInstance().trace(TAG, "file extracted successfully: " + extractDir);
            return extractDir;
        } catch (Exception e) {
            LoggerUtil.getInstance().trace(TAG, "extractTarGz exception: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean backupDatabase() {
        LoggerUtil.getInstance().trace(TAG, "backing up database");
        statusTracker.sendEvent("backing_up", "running", "backing up database and binaries");
        
        String dbName = "irext";
        if (dbUrl != null && dbUrl.contains("/")) {
            int start = dbUrl.lastIndexOf('/') + 1;
            int end = dbUrl.indexOf('?', start);
            if (end == -1) end = dbUrl.length();
            dbName = dbUrl.substring(start, end);
        }
        
        String backupDir = "/data/irext/database/backup";
        File backupDirFile = new File(backupDir);
        if (!backupDirFile.exists()) {
            if (!backupDirFile.mkdirs()) {
                LoggerUtil.getInstance().trace(TAG, "failed to create backup directory");
                return false;
            }
        }
        
        // delete old backup if exists
        File oldBackup = new File(backupDir + "/" + dbName + "_backup.sql");
        if (oldBackup.exists()) {
            oldBackup.delete();
        }
        
        String backupPath = backupDir + "/" + dbName + "_backup.sql";
        
        try {
            String[] cmd = {"mysqldump", "-u", dbUsername, "-p" + dbPassword, dbName, "-r", backupPath};
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                LoggerUtil.getInstance().trace(TAG, "database backed up to: " + backupPath);
                return true;
            } else {
                LoggerUtil.getInstance().trace(TAG, "database backup failed with exit code: " + exitCode + ", output: " + output.toString());
                return false;
            }
        } catch (Exception e) {
            LoggerUtil.getInstance().trace(TAG, "backupDatabase exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean importSql(String sqlFilePath) {
        LoggerUtil.getInstance().trace(TAG, "importing SQL file: " + sqlFilePath);
        statusTracker.sendEvent("importing_sql", "running", "importing database");
        
        // extract database name from jdbc url
        String dbName = "irext";
        if (dbUrl != null && dbUrl.contains("/")) {
            int start = dbUrl.lastIndexOf('/') + 1;
            int end = dbUrl.indexOf('?', start);
            if (end == -1) end = dbUrl.length();
            dbName = dbUrl.substring(start, end);
        }
        
        try {
            String[] cmd = {"mysql", "-u", dbUsername, "-p" + dbPassword, dbName, "-e", "source " + sqlFilePath};
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            
            // read output to check for errors
            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }
            
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                LoggerUtil.getInstance().trace(TAG, "SQL imported successfully");
                return true;
            } else {
                LoggerUtil.getInstance().trace(TAG, "SQL import failed with exit code: " + exitCode + ", output: " + output.toString());
                return false;
            }
        } catch (Exception e) {
            LoggerUtil.getInstance().trace(TAG, "importSql exception: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean replaceBinaries(String extractedDir) {
        LoggerUtil.getInstance().trace(TAG, "replacing binaries from: " + extractedDir);
        statusTracker.sendEvent("replacing_binaries", "running", "replacing binary files");
        
        // find the binaries folder in extracted dir (name starts with "irext-binaries")
        File extractedFolder = new File(extractedDir);
        File newBinariesDir = null;
        File[] children = extractedFolder.listFiles();
        if (children != null) {
            for (File child : children) {
                if (child.isDirectory() && child.getName().startsWith("irext-binaries")) {
                    newBinariesDir = child;
                    break;
                }
            }
        }
        
        if (newBinariesDir == null) {
            LoggerUtil.getInstance().trace(TAG, "no irext-binaries folder found in extracted directory");
            return false;
        }
        
        // target: /data/irext/database/binaries/irext-binaries
        String binariesBasePath = "/data/irext/database/binaries/irext-binaries";
        File targetDir = new File(binariesBasePath);
        
        // backup old binaries by renaming to .bak
        File backupDir = new File(binariesBasePath + ".bak");
        if (targetDir.exists()) {
            if (backupDir.exists()) {
                deleteDirectory(backupDir);
            }
            if (!targetDir.renameTo(backupDir)) {
                LoggerUtil.getInstance().trace(TAG, "failed to backup old binaries");
                return false;
            }
            LoggerUtil.getInstance().trace(TAG, "old binaries backed up to: " + backupDir.getAbsolutePath());
        }
        
        // copy new binaries to target
        if (!copyDirectory(newBinariesDir, targetDir)) {
            LoggerUtil.getInstance().trace(TAG, "failed to copy new binaries");
            // restore backup
            if (backupDir.exists()) {
                backupDir.renameTo(targetDir);
            }
            return false;
        }
        
        LoggerUtil.getInstance().trace(TAG, "binaries replaced successfully, backup kept at: " + backupDir.getAbsolutePath());
        return true;
    }

    private boolean copyDirectory(File source, File target) {
        if (source.isDirectory()) {
            if (!target.exists()) {
                if (!target.mkdirs()) return false;
            }
            File[] children = source.listFiles();
            if (children != null) {
                for (File child : children) {
                    if (!copyDirectory(child, new File(target, child.getName()))) {
                        return false;
                    }
                }
            }
            return true;
        } else {
            try (InputStream in = new FileInputStream(source);
                 OutputStream out = new FileOutputStream(target)) {
                byte[] buffer = new byte[8192];
                int len;
                while ((len = in.read(buffer)) != -1) {
                    out.write(buffer, 0, len);
                }
                return true;
            } catch (Exception e) {
                LoggerUtil.getInstance().trace(TAG, "copyDirectory exception: " + e.getMessage());
                return false;
            }
        }
    }

    private boolean deleteDirectory(File dir) {
        if (dir.isDirectory()) {
            File[] children = dir.listFiles();
            if (children != null) {
                for (File child : children) {
                    deleteDirectory(child);
                }
            }
        }
        return dir.delete();
    }

    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    private static class PreparePrivateDataRequest {
        private String appKey;
        private String appSecret;

        public PreparePrivateDataRequest(String appKey, String appSecret) {
            this.appKey = appKey;
            this.appSecret = appSecret;
        }

        public String getAppKey() {
            return appKey;
        }

        public void setAppKey(String appKey) {
            this.appKey = appKey;
        }

        public String getAppSecret() {
            return appSecret;
        }

        public void setAppSecret(String appSecret) {
            this.appSecret = appSecret;
        }
    }
}
