package net.irext.server.response;

/**
 * Filename:       StringResponse.java
 * Revised:        Date: 2017-05-16
 * Revision:       Revision: 1.0
 * <p>
 * Description:    String response
 * <p>
 * Revision log:
 * 2017-05-16: created by strawmanbobi
 */
public class StringResponse extends ServiceResponse {

    private String entity;

    public StringResponse(Status status, String entity) {
        super(status);
        this.entity = entity;
    }

    public StringResponse() {

    }

    public String getEntity() {
        return entity;
    }

    public void setEntity(String entity) {
        this.entity = entity;
    }
}

