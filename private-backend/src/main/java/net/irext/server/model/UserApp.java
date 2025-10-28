package net.irext.server.model;

public class UserApp {

    private Integer id;
    private String appName;
    private Integer adminId;
    private String adminName;
    private Byte appType;
    private String androidPackageName;
    private String androidSignature;
    private String iosIdentity;
    private Byte isDebug;
    private String appKey;
    private String appSecret;
    private String updateTime;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public Integer getAdminId() {
        return adminId;
    }

    public void setAdminId(Integer adminId) {
        this.adminId = adminId;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public Byte getAppType() {
        return appType;
    }

    public void setAppType(Byte appType) {
        this.appType = appType;
    }

    public String getAndroidPackageName() {
        return androidPackageName;
    }

    public void setAndroidPackageName(String androidPackageName) {
        this.androidPackageName = androidPackageName;
    }

    public String getAndroidSignature() {
        return androidSignature;
    }

    public void setAndroidSignature(String androidSignature) {
        this.androidSignature = androidSignature;
    }

    public String getIosIdentity() {
        return iosIdentity;
    }

    public void setIosIdentity(String iosIdentity) {
        this.iosIdentity = iosIdentity;
    }

    public Byte getIsDebug() {
        return isDebug;
    }

    public void setIsDebug(Byte isDebug) {
        this.isDebug = isDebug;
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

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }

    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}