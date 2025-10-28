package net.irext.server.response;

/**
 * Filename:       ServiceResponse.java
 * Revised:        Date: 2018-12-08
 * Revision:       Revision: 1.0
 * <p>
 * Description:    HTTP Response class
 * <p>
 * Revision log:
 * 2018-12-08: created by strawmanbobi
 */
public class ServiceResponse {

    private Status status;

    public ServiceResponse(Status status) {
        this.status = status;
    }

    public ServiceResponse() {

    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
