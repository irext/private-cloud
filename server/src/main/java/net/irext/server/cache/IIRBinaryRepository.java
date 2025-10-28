package net.irext.server.cache;

import net.irext.server.model.RemoteIndex;

import java.util.Map;

/**
 * Filename:       IRRepository.java
 * Revised:        Date: 2018-12-30
 * Revision:       Revision: 1.0
 * <p>
 * Description:    IR binary cache for performance optimization on decoding
 * <p>
 * Revision log:
 * 2018-12-30: created by strawmanbobi
 */
public interface IIRBinaryRepository {

    Map<Object, Object> findAllRemoteIndexes();

    void add(Integer id, RemoteIndex remoteIndex);

    void delete(Integer id);

    RemoteIndex find(Integer id);
}