package net.irext.server.cache.impl;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import net.irext.server.cache.IUserAppRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.concurrent.TimeUnit;

/**
 * Filename:       UserAppRepositoryImpl.java
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
        redisTemplate.expire(token, 7 , TimeUnit.DAYS);
    }

    public void delete(final String token) {
        hashOperations.delete(KEY, token);
    }

    public Integer find(final String token) {
        return (Integer)hashOperations.get(KEY, token);
    }

}