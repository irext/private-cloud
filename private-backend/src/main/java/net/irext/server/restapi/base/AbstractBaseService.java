package net.irext.server.restapi.base;

import net.irext.server.utils.Constants;
import net.irext.server.aspect.TokenValidation;
import net.irext.server.cache.IUserAppRepository;
import net.irext.server.response.ServiceResponse;
import net.irext.server.response.Status;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Filename:       AbstractBaseService.java
 * Revised:        Date: 2017-04-27
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Base restapi abstract class implemented restapi interface
 * <p>
 * Revision log:
 * 2017-04-27: created by strawmanbobi
 */
@SuppressWarnings("unused")
public abstract class AbstractBaseService implements TokenValidation {

    protected static Log log = LogFactory.getLog(AbstractBaseService.class);

    @Autowired
    IUserAppRepository userAppRepository;

    @Override
    public ServiceResponse validateToken(Integer userId, String token) {
        if (log.isDebugEnabled()) {
            log.debug("Auth token id: " + userId + ", token: " + token);
        }
        ServiceResponse response = new ServiceResponse();
        Status status = new Status();

        if (null == userId || null == token) {
            status.setCode(Constants.ERROR_CODE_AUTH_FAILURE);
        } else {
            status = validateUserToken(userId, token);
        }

        response.setStatus(status);
        return response;
    }

    @Override
    public <T extends ServiceResponse> T validateToken(Integer userId, String token,
                                                       Class<T> c) {
        T r = null;
        Status status = new Status();

        if (null == userId || null == token) {
            status.setCode(Constants.ERROR_CODE_AUTH_FAILURE);
        } else {
            status = validateUserToken(userId, token);
        }

        try {
            r = c.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            log.error("Error when new instance of class: " + c.getName(), e);
        }

        if (null != r) {
            r.setStatus(status);
        }
        return r;
    }

    protected ServiceResponse getExceptionResponse() {
        ServiceResponse r = new ServiceResponse();
        Status status = new Status();
        status.setCode(Constants.ERROR_CODE_AUTH_FAILURE);
        r.setStatus(status);
        return r;
    }

    protected <T extends ServiceResponse> T getExceptionResponse(Class<T> c) {
        T r = null;
        Status status = new Status();
        try {
            r = c.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            log.error("Error when new instance of class: " + c.getName(), e);
        }
        status.setCode(Constants.ERROR_CODE_AUTH_FAILURE);
        if (null != r) {
            r.setStatus(status);
        }
        return r;
    }

    private Status validateUserToken(Integer userId, String token) {
        Status status = new Status();

        Integer cachedId = userAppRepository.find(token);
        if (null != cachedId && cachedId.equals(userId)) {
            status.setCode(Constants.ERROR_CODE_SUCCESS);
        } else {
            status.setCode(Constants.ERROR_CODE_AUTH_FAILURE);
        }

        return status;
    }
}
