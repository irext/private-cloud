package net.irext.server.service.request;

/**
 * Filename:       ListIndexesRequest.java
 * Revised:        Date: 2017-04-12
 * Revision:       Revision: 1.0
 * <p>
 * Description:    HTTP list remote indexes request
 * <p>
 * Revision log:
 * 2017-04-12: created by strawmanbobi
 */
public class ListIndexesRequest extends BaseRequest {

    private int from;
    private int count;
    private int categoryId;
    private int brandId;
    private String cityCode;
    private String operatorId;

    // try index in IRIS with this flag set to 1
    private int withParaData;

    public ListIndexesRequest(int from, int count, int categoryId, int brandId,
                              String cityCode, String operatorId, int withParaData) {
        this.from = from;
        this.count = count;
        this.categoryId = categoryId;
        this.brandId = brandId;
        this.cityCode = cityCode;
        this.operatorId = operatorId;
        this.withParaData = withParaData;
    }

    public ListIndexesRequest() {

    }

    public int getFrom() {
        return from;
    }

    public void setFrom(int from) {
        this.from = from;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public int getBrandId() {
        return brandId;
    }

    public void setBrandId(int brandId) {
        this.brandId = brandId;
    }

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
    }

    public String getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(String operatorId) {
        this.operatorId = operatorId;
    }

    public int getWithParaData() {
        return withParaData;
    }

    public void setWithParaData(int withParaData) {
        this.withParaData = withParaData;
    }
}
