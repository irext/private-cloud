package net.irext.server.request;

/**
 * Filename:       CloseRequest.java
 * Revised:        Date: 2018-12-18
 * Revision:       Revision: 1.0
 * <p>
 * Description:    HTTP server online
 * <p>
 * Revision log:
 * 2018-12-18: created by strawmanbobi
 */
public class CloseRequest extends BaseRequest {

    private String sessionId;

    public CloseRequest(String sessionId) {
        this.sessionId = sessionId;
    }

    public CloseRequest() {

    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
}
