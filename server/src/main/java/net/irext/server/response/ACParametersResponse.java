package net.irext.server.response;

import net.irext.server.model.ACParameters;

/**
 * Filename:       ACParametersResponse.java
 * Revised:        Date: 2017-05-16
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Air conditioner support parameters response
 * <p>
 * Revision log:
 * 2019-02-14: created by strawmanbobi
 */
public class ACParametersResponse extends ServiceResponse {

    private ACParameters entity;

    public ACParametersResponse(Status status, ACParameters entity) {
        super(status);
        this.entity = entity;
    }

    public ACParametersResponse() {
        super(new Status());
        this.entity = null;
    }

    public ACParameters getEntity() {
        return entity;
    }

    public void setEntity(ACParameters entity) {
        this.entity = entity;
    }
}