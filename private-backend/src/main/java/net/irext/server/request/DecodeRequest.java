package net.irext.server.request;

import net.irext.decode.sdk.bean.ACStatus;

/**
 * Filename:       DecodeRequest.java
 * Revised:        Date: 2017-05-16
 * Revision:       Revision: 1.0
 * <p>
 * Description:    HTTP decode online
 * <p>
 * Revision log:
 * 2017-05-16: created by strawmanbobi
 */
public class DecodeRequest extends BaseRequest {

    private int indexId;
    private ACStatus acStatus;
    private int keyCode;
    private Integer changeWindDir;
    private Integer directDecode;
    private Integer paraData;

    public DecodeRequest(int indexId, ACStatus acStatus, int keyCode, Integer changeWindDir,
                         Integer directDecode, Integer paraData) {
        this.indexId = indexId;
        this.acStatus = acStatus;
        this.keyCode = keyCode;
        this.changeWindDir = changeWindDir;
        this.directDecode = directDecode;
        this.paraData = paraData;
    }

    public DecodeRequest() {

    }

    public int getIndexId() {
        return indexId;
    }

    public void setIndexId(int indexId) {
        this.indexId = indexId;
    }

    public ACStatus getAcStatus() {
        return acStatus;
    }

    public void setAcStatus(ACStatus acStatus) {
        this.acStatus = acStatus;
    }

    public int getKeyCode() {
        return keyCode;
    }

    public void setKeyCode(int keyCode) {
        this.keyCode = keyCode;
    }

    public Integer getChangeWindDir() {
        return changeWindDir;
    }

    public void setChangeWindDir(Integer changeWindDir) {
        this.changeWindDir = changeWindDir;
    }

    public Integer getDirectDecode() {
        return directDecode;
    }

    public void setDirectDecode(Integer directDecode) {
        this.directDecode = directDecode;
    }

    public Integer getParaData() {
        return paraData;
    }

    public void setParaData(Integer paraData) {
        this.paraData = paraData;
    }
}
