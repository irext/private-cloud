package net.irext.server.service.cache.impl;

import net.irext.server.service.cache.IDecodeSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Filename:       IDecodeSessionRepositoryImpl.java
 * Revised:        Date: 2018-12-29
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Redis cache class
 * <p>
 * Revision log:
 * 2018-12-29: created by strawmanbobi
 */
@Repository
public class DecodeSessionRepositoryImpl implements IDecodeSessionRepository {
    private static final String KEY = "DECODE_SESSION_KEY";

    private RedisTemplate<String, Object> redisTemplate;
    private HashOperations hashOperations;

    @Autowired
    public DecodeSessionRepositoryImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    private void init() {
        hashOperations = redisTemplate.opsForHash();
    }

    public void add(final String decodeSessionId, Integer binaryId) {
        hashOperations.put(KEY, decodeSessionId, binaryId);
        redisTemplate.expire(decodeSessionId, 7 , TimeUnit.DAYS);
    }

    public void delete(String decodeSessionId) {
        hashOperations.delete(KEY, decodeSessionId);
    }

    public Integer find(String decodeSessionId) {
        return (Integer) hashOperations.get(KEY, decodeSessionId);
    }

    public Map<Object, Object> findAllDecodeSessions() {
        return hashOperations.entries(KEY);
    }
}