package net.irext.server.aspect;

import net.irext.server.response.ServiceResponse;

/**
 * Filename:       TokenValidation.java
 * Revised:        Date: 2017-05-08
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Token validation aspect logic
 * <p>
 * Revision log:
 * 2017-05-08: created by strawmanbobi
 */
public interface TokenValidation {

    ServiceResponse validateToken(Integer userId, String token);

    <T extends ServiceResponse> T validateToken(Integer userId, String token,
                                                Class<T> c);

}
