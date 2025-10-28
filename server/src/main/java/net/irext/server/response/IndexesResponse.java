package net.irext.server.response;

import net.irext.server.model.RemoteIndex;

import java.util.List;

/**
 * Filename:       IndexesResponse.java
 * Revised:        Date: 2019-06-21
 * Revision:       Revision: 1.0
 * <p>
 * Description:    IndexesResponse
 * <p>
 * Revision log:
 * 2019-06-21: created by strawmanbobi
 */
public class IndexesResponse extends ServiceResponse {

    private List<RemoteIndex> entity;

    public IndexesResponse(Status status, List<RemoteIndex> remoteIndexes) {
        super(status);
        this.entity = remoteIndexes;
    }

    public IndexesResponse() {

    }

    public List<RemoteIndex> getEntity() {
        return entity;
    }

    public void setEntity(List<RemoteIndex> entity) {
        this.entity = entity;
    }
}
