package net.irext.server.service.model;

public class CollectRemote {

    private Integer id;
    private String name;
    private Integer categoryId;
    private String categoryName;
    private Integer brandId;
    private String brandName;
    private String cityCode;
    private String cityName;
    private Integer operatorId;
    private String operatorName;
    private String protocol;
    private String remote;
    private String remoteMap;
    private Byte status;
    private String updateTime;
    private String contributor;

    public CollectRemote(Integer id, String name, Integer categoryId, String categoryName,
                         Integer brandId, String brandName,
                         String cityCode, String cityName, Integer operatorId, String operatorName,
                         String protocol, String remote, String remoteMap,
                         Byte status, String updateTime, String contributor) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.brandId = brandId;
        this.brandName = brandName;
        this.cityCode = cityCode;
        this.cityName = cityName;
        this.operatorId = operatorId;
        this.operatorName = operatorName;
        this.protocol = protocol;
        this.remote = remote;
        this.remoteMap = remoteMap;
        this.status = status;
        this.updateTime = updateTime;
        this.contributor = contributor;
    }

    public CollectRemote() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Integer getBrandId() {
        return brandId;
    }

    public void setBrandId(Integer brandId) {
        this.brandId = brandId;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public Integer getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Integer operatorId) {
        this.operatorId = operatorId;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getRemote() {
        return remote;
    }

    public void setRemote(String remote) {
        this.remote = remote;
    }

    public String getRemoteMap() {
        return remoteMap;
    }

    public void setRemoteMap(String remoteMap) {
        this.remoteMap = remoteMap;
    }

    public Byte getStatus() {
        return status;
    }

    public void setStatus(Byte status) {
        this.status = status;
    }

    public String getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(String updateTime) {
        this.updateTime = updateTime;
    }

    public String getContributor() {
        return contributor;
    }

    public void setContributor(String contributor) {
        this.contributor = contributor;
    }
}