package net.irext.server.request;

/**
 * Filename:       AppVerifyRequest.java
 * Revised:        Date: 2020-08-14
 * Revision:       Revision: 1.0
 * <p>
 * Description:    HTTP user APPs id and token verification
 * <p>
 * Revision log:
 * 2020-08-14: created by strawmanbobi
 */
public class AppVerifyRequest extends BaseRequest {

    private String appKey;

    private String appSecret;

    public AppVerifyRequest(Integer id, String token) {
        super(id, token);
    }

    public AppVerifyRequest(int id, String token, String appKey, String appSecret) {
        super(id, token);
        this.appKey = appKey;
        this.appSecret = appSecret;
    }

    public AppVerifyRequest(String appKey, String appSecret) {
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
