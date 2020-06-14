/**
 * Created by strawmanbobi
 * 2016-11-24
 */

require('../mini_poem/configuration/constants');
let Cache = require('../mini_poem/cache/redis.js');
let logger = require('../mini_poem/logging/logger4js').helper;
let Enums = require('../constants/enums');
let ErrorCode = require('../constants/error_code');

let enums = new Enums();
let errorCode = new ErrorCode();


let AdminAuth = function(_cacheHost, _cachePort, _cacheAdmin, _cachePassword) {
    this.cache = new Cache(_cacheHost, _cachePort, _cacheAdmin, _cachePassword);
};

AdminAuth.prototype.setAuthInfo = function(id, token, ttl, callback) {
    this.cache.set(id, token, ttl, function(setAdminAuthErr, data) {
        let error = errorCode.SUCCESS;
        if(setAdminAuthErr !== errorCode.SUCCESS.code) {
            error = errorCode.FAILED;
        }
        callback(error, data);
    });
};

AdminAuth.prototype.validateAuthInfo = function(id, token, callback) {
    let error = errorCode.SUCCESS;
    this.cache.get(id, false, function(getAdminAuthErr, result) {
        if(errorCode.SUCCESS.code !== getAdminAuthErr || !result || token !== result) {
            error = errorCode.AUTHENTICATION_FAILURE;
        }
        callback(error, result);
    });
};

AdminAuth.prototype.getAuthInfo = function(id, callback) {
    let error = errorCode.SUCCESS;
    this.cache.get(id, false, function(getAdminAuthErr, result) {
        if(errorCode.SUCCESS.code !== getAdminAuthErr) {
            error = errorCode.FAILED;
        }
        callback(error, result);
    });
};

AdminAuth.prototype.deleteAuthInfo = function(id, callback) {
    let error = errorCode.SUCCESS;
    this.cache.delete(id, function(deleteAdminAuthErr) {
        if(deleteAdminAuthErr !== errorCode.SUCCESS.code) {
            error = errorCode.FAILED;
        }
        callback(error);
    });
};

module.exports = AdminAuth;