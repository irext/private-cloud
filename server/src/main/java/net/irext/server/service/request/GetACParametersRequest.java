package net.irext.server.service.request;

/**
 * Filename:       GetACParametersRequest.java
 * Revised:        Date: 2017-05-16
 * Revision:       Revision: 1.0
 * <p>
 * Description:    HTTP server online
 * <p>
 * Revision log:
 * 2019-02-14: created by strawmanbobi
 */
public class GetACParametersRequest extends BaseRequest {
    private int indexId;
    private int mode;

    public GetACParametersRequest(int indexId, int mode) {
        this.indexId = indexId;
        this.mode = mode;
    }

    public GetACParametersRequest() {

    }

    public int getIndexId() {
        return indexId;
    }

    public void setIndexId(int indexId) {
        this.indexId = indexId;
    }

    public int getMode() {
        return mode;
    }

    public void setMode(int mode) {
        this.mode = mode;
    }
}
