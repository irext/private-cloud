package net.irext.server.model;

/**
 * Filename:       FileDownloadURL.java
 * Revised:        Date: 2026-08-29
 * Revision:       Revision: 1.0
 * <p>
 * Description:    File download URL model from public server response
 * <p>
 * Revision log:
 * 2026-08-29: created by strawmanbobi
 */
public class FileDownloadURL {
    private String downloadURL;
    private String fileName;

    public FileDownloadURL() {
    }

    public FileDownloadURL(String downloadURL, String fileName) {
        this.downloadURL = downloadURL;
        this.fileName = fileName;
    }

    public String getDownloadURL() {
        return downloadURL;
    }

    public void setDownloadURL(String downloadURL) {
        this.downloadURL = downloadURL;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}
