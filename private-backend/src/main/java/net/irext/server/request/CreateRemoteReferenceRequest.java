package net.irext.server.request;

import net.irext.server.model.RemoteRef;

/**
 * Filename:       CreateRemoteReferenceRequest.java
 * Revised:        Date: 2025-10-24
 * Revision:       Revision: 1.0
 * <p>
 * Description:    HTTP API for adding remote reference
 * <p>
 * Revision log:
 * 2025-10-24: created by strawmanbobi
 */
public class CreateRemoteReferenceRequest extends BaseRequest {
    RemoteRef remoteRef;

    public CreateRemoteReferenceRequest(int id, String token, RemoteRef remoteRef) {
        super(id, token);
        this.remoteRef = remoteRef;
    }

    public CreateRemoteReferenceRequest() {

    }

    public void setRemoteRef(RemoteRef remoteRef) {
        this.remoteRef = remoteRef;
    }
    
}