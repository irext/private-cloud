package net.irext.server.cache;

import java.util.Map;

/**
 * Filename:       IDecodeSessionRepository.java
 * Revised:        Date: 2018-12-29
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Redis cache class
 * <p>
 * Revision log:
 * 2018-12-29: created by strawmanbobi
 */
public interface IDecodeSessionRepository {

    Map<Object, Object> findAllDecodeSessions();

    void add(String decodeSessionId, Integer remoteId);

    void delete(String decodeSessionId);

    Integer find(String decodeSessionId);

}