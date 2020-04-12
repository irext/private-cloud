package net.irext.server.service.model;

public class DecodeRemote {

    private Integer id;
    private Integer categoryId;
    private Integer brandId;
    private String cityCode;
    private Integer operatorId;
    private Integer remoteIndexId;
    private Integer keyNumber;
    private String keyName;
    private String keyValue;

    public DecodeRemote(Integer id, Integer categoryId, Integer brandId,
                        String cityCode, Integer operatorId,
                        Integer remoteIndexId, Integer keyNumber, String keyName, String keyValue) {
        this.id = id;
        this.categoryId = categoryId;
        this.brandId = brandId;
        this.cityCode = cityCode;
        this.operatorId = operatorId;
        this.remoteIndexId = remoteIndexId;
        this.keyNumber = keyNumber;
        this.keyName = keyName;
        this.keyValue = keyValue;
    }

    public DecodeRemote() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public Integer getBrandId() {
        return brandId;
    }

    public void setBrandId(Integer brandId) {
        this.brandId = brandId;
    }

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
    }

    public Integer getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Integer operatorId) {
        this.operatorId = operatorId;
    }

    public Integer getRemoteIndexId() {
        return remoteIndexId;
    }

    public void setRemoteIndexId(Integer remoteIndexId) {
        this.remoteIndexId = remoteIndexId;
    }

    public Integer getKeyNumber() {
        return keyNumber;
    }

    public void setKeyNumber(Integer keyNumber) {
        this.keyNumber = keyNumber;
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