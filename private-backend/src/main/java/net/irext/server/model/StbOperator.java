package net.irext.server.model;

public class StbOperator {
    private Integer id;
    private String operatorId;
    private String operatorName;
    private String cityCode;
    private String cityName;
    private Byte status;
    private String operatorNameTw;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(String operatorId) {
        this.operatorId = operatorId;
    }

    public String getOperatorName() {
        return operatorName;
    }

    public void setOperatorName(String operatorName) {
        this.operatorName = operatorName;
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

    public Byte getStatus() {
        return status;
    }

    public void setStatus(Byte status) {
        this.status = status;
    }

    public String getOperatorNameTw() {
        return operatorNameTw;
    }

    public void setOperatorNameTw(String operatorNameTw) {
        this.operatorNameTw = operatorNameTw;
    }
}