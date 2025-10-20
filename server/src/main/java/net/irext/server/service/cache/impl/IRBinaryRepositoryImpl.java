package net.irext.server.service.cache.impl;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import net.irext.server.service.cache.IIRBinaryRepository;
import net.irext.server.service.model.RemoteIndex;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Filename:       IIRBinaryRepositoryImpl.java
 * Revised:        Date: 2018-12-29
 * Revision:       Revision: 1.0
 * <p>
 * Description:    Redis cache class
 * <p>
 * Revision log:
 * 2018-12-29: created by strawmanbobi
 */
@Repository
public class IRBinaryRepositoryImpl implements IIRBinaryRepository {
    private static final String KEY = "IR_BINARY_KEY";

    @Resource(name = "redisTemplate")
    private RedisTemplate<String, Object> redisTemplate;
    private HashOperations hashOperations;

    @Autowired
    public IRBinaryRepositoryImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    private void init() {
        hashOperations = redisTemplate.opsForHash();
    }

    public void add(Integer id, RemoteIndex remoteIndex) {
        hashOperations.put(KEY, id, remoteIndex);
        redisTemplate.expire(Integer.toString(id), 7 , TimeUnit.DAYS);
    }

    public void delete(final Integer id) {
        hashOperations.delete(KEY, id);
    }

    public RemoteIndex find(final Integer id) {
        return (RemoteIndex) hashOperations.get(KEY, id);
    }

    public Map<Object, Object> findAllRemoteIndexes() {
        return hashOperations.entries(KEY);
    }
}