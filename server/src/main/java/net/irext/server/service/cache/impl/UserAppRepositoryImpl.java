package net.irext.server.service.cache.impl;

import net.irext.server.service.cache.IUserAppRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

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
public class UserAppRepositoryImpl implements IUserAppRepository {
    private static final String KEY = "USER_APP_KEY";

    @Resource(name = "redisTemplate")
    private RedisTemplate<String, Object> redisTemplate;
    private HashOperations hashOperations;

    @Autowired
    public UserAppRepositoryImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @PostConstruct
    private void init() {
        hashOperations = redisTemplate.opsForHash();
    }

    public void add(Integer id, String token) {
        hashOperations.put(KEY, token, id);
    }

    public void delete(final String token) {
        hashOperations.delete(KEY, token);
    }

    public Integer find(final String token) {
        return (Integer)hashOperations.get(KEY, token);
    }

}