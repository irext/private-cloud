package net.irext.server.response;

import net.irext.server.utils.Constants;

/**
 * Filename:       Status.java
 * Revised:        Date: 2018-12-08
 * Revision:       Revision: 1.0
 * <p>
 * Description:    HTTP response status
 * <p>
 * Revision log:
 * 2018-12-08: created by strawmanbobi
 */
public class Status {

    private int code;
    private String cause;

    public Status(int code, String cause) {
        this.code = code;
        this.cause = cause;
    }

    public Status() {
        this.code = Constants.ERROR_CODE_SUCCESS;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getCause() {
        return cause;
    }

    public void setCause(String cause) {
        this.cause = cause;
    }
}
