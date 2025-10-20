/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

require('../mini_poem/configuration/constants');

let AdminAuth = require('../authentication/admin_auth.js');
let RequestSender = require('../mini_poem/http/request.js');

let ErrorCode = require('../constants/error_code.js');
const {set} = require("express/lib/application");
let logger = require('../mini_poem/logging/logger4js').helper;

let errorCode = new ErrorCode();

let adminAuth = new AdminAuth(REDIS_HOST, REDIS_PORT, null, REDIS_PASSWORD);

let SIGN_IN_SERVICE = "/irext-server/app/admin_login";

exports.adminLoginWorkUnit = function (userName, password, callback) {

    let queryParams = new Map();

    let requestSender =
        new RequestSender(EXTERNAL_SERVER_ADDRESS,
            EXTERNAL_SERVER_PORT,
            SIGN_IN_SERVICE,
            queryParams);

    let signinInfo = {
        userName : userName,
        password : password
    };
    requestSender.sendPostRequest(signinInfo,
        function(signInRequestErr, signInResponse) {
            if (signInRequestErr === errorCode.SUCCESS.code && null != signInResponse) {
                let resp = JSON.parse(signInResponse);
                if (undefined !== resp.entity) {
                    let admin = resp.entity;
                    let token,
                        key,
                        ttl = 24 * 60 * 60 * 14,
                        timeStamp,
                        name;
                    timeStamp = new Date().getTime();
                    token = admin.token;
                    key = "admin_" + admin.id;
                    adminAuth.setAuthInfo(key, token, ttl, function(setAdminAuthErr) {
                        if (errorCode.SUCCESS.code === setAdminAuthErr.code) {
                            key = "admin_name_" + admin.id;
                            name = admin.userName;
                            adminAuth.setAuthInfo(key, name, ttl, function(setAdminNameErr) {
                                if (errorCode.SUCCESS.code === setAdminNameErr.code) {
                                    admin.token = token;
                                }
                                callback(setAdminNameErr, admin);
                            });
                        } else {
                            callback(errorCode.FAILED, null);
                        }
                    });
                } else {
                    callback(errorCode.FAILED, null);
                }
            } else {
                callback(errorCode.FAILED, null);
            }
        });
};

exports.verifyTokenWorkUnit = function (id, token, callback) {
    let key = "admin_" + id;
    adminAuth.validateAuthInfo(key, token, function(validateAdminAuthErr, result) {
        if (validateAdminAuthErr.code !== errorCode.SUCCESS.code) {
            logger.info("token validation failed");
        }
        callback(validateAdminAuthErr);
    });
};

exports.verifyTokenWithPermissionWorkUnit = function (id, token, permissions, callback) {
    let key = "admin_" + id;
    adminAuth.validateAuthInfo(key, token, function(validateAdminAuthErr, result) {
        if (validateAdminAuthErr.code === errorCode.SUCCESS.code) {
            logger.info("token validation successfully");
            if (undefined !== result && null !== result && "" !== result) {
                if (result.indexOf(permissions) !== -1) {
                    callback(errorCode.SUCCESS);
                } else {
                    logger.info("permission do not match");
                    callback(errorCode.AUTHENTICATION_FAILURE);
                }
            }
        } else {
            logger.info("token validation failed");
            callback(validateAdminAuthErr);
        }
    });
};