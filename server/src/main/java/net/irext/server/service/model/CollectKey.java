package net.irext.server.service.model;

/**
 * Filename:       CollectKey.java
 * Revised:        Date: 2019-08-23
 * Revision:       Revision: 1.0
 * <p>
 * Description:    CollectKey Model
 * <p>
 * Revision log:
 * 2019-08-23: created by strawmanbobi
 */
public class CollectKey {

    private Integer id;
    private Integer collectRemoteId;
    private Integer keyId;
    private String keyName;
    private String keyValue;

    public CollectKey(Integer id, Integer collectRemoteId, Integer keyId, String keyName, String keyValue) {
        this.id = id;
        this.collectRemoteId = collectRemoteId;
        this.keyId = keyId;
        this.keyName = keyName;
        this.keyValue = keyValue;
    }

    public CollectKey() {

    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCollectRemoteId() {
        return collectRemoteId;
    }

    public void setCollectRemoteId(Integer collectRemoteId) {
        this.collectRemoteId = collectRemoteId;
    }

    public Integer getKeyId() {
        return keyId;
    }

    public void setKeyId(Integer keyId) {
        this.keyId = keyId;
    }

    public String getKeyName() {
        return keyName;
    }

    public void setKeyName(String keyName) {
        this.keyName = keyName;
    }

    public String getKeyValue() {
        return keyValue;
    }

    public void setKeyValue(String keyValue) {
        this.keyValue = keyValue;
    }
}
