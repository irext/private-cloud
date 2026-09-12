/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

require('../mini_poem/configuration/constants');

let fs = require('fs');
let crypto = require('crypto');
let AdminAuth = require('../authentication/admin_auth.js');
let RequestSender = require('../mini_poem/http/request.js');

let Enums = require('../constants/enums.js');
let ErrorCode = require('../constants/error_code.js');

const {set} = require("express/lib/application");
let logger = require('../mini_poem/logging/logger4js').helper;

let enums = new Enums();
let errorCode = new ErrorCode();

let adminAuth = new AdminAuth(REDIS_HOST, REDIS_PORT, null, REDIS_PASSWORD);

let ADMIN_SIGN_IN_SERVICE = "/irext-server/app/private_cloud_admin_login";
let APP_SIGN_IN_SERVICE = "/irext-server/app/web_console_login";
let ADMIN_INFO_PATH = "/data/irext/database/admin/admin_info.json";


exports.adminLoginWorkUnit = function (userName, password, callback) {
    // check if running in offline mode
    if (process.env.OFFLINE === '1') {
        offlineAdminLogin(userName, password, callback);
        return;
    }

    let queryParams = new Map();

    let requestSender =
        new RequestSender(EXTERNAL_SERVER_ADDRESS,
            EXTERNAL_SERVER_PORT,
            ADMIN_SIGN_IN_SERVICE,
            queryParams);

    let signinInfo = {
        userName : userName,
        password : password,
        appKey : process.env.APP_KEY,
        appSecret : process.env.APP_SECRET
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

/**
 * Offline admin login - read credentials from local JSON file
 */
function offlineAdminLogin(userName, password, callback) {
    try {
        if (!fs.existsSync(ADMIN_INFO_PATH)) {
            logger.error('admin info file not found: ' + ADMIN_INFO_PATH);
            callback(errorCode.FAILED, null);
            return;
        }

        let adminInfoRaw = fs.readFileSync(ADMIN_INFO_PATH, 'utf8');
        let adminInfo = JSON.parse(adminInfoRaw);

        // validate userName and password (password is already MD5 hashed from frontend)
        if (adminInfo.userName !== userName || adminInfo.password.toLowerCase() !== password.toLowerCase()) {
            logger.info('offline admin login failed: invalid credentials');
            callback(errorCode.FAILED, null);
            return;
        }

        logger.info('offline admin login success for: ' + userName);

        // generate token in format: {md5_hash},{permissions}
        let timeStamp = new Date().getTime();
        let tokenSource = timeStamp + adminInfo.userName;
        let tokenHash = crypto.createHash('md5').update(tokenSource).digest('hex');
        let token = tokenHash + ',' + adminInfo.permissions;

        let admin = {
            id: adminInfo.id,
            userName: adminInfo.userName,
            token: token,
            permissions: adminInfo.permissions,
            adminType: adminInfo.adminType
        };

        // store token in Redis
        let key = "admin_" + admin.id;
        let ttl = 24 * 60 * 60 * 14;
        adminAuth.setAuthInfo(key, token, ttl, function(setAdminAuthErr) {
            if (errorCode.SUCCESS.code === setAdminAuthErr.code) {
                let nameKey = "admin_name_" + admin.id;
                adminAuth.setAuthInfo(nameKey, admin.userName, ttl, function(setAdminNameErr) {
                    if (errorCode.SUCCESS.code === setAdminNameErr.code) {
                        admin.token = token;
                    }
                    callback(setAdminNameErr, admin);
                });
            } else {
                callback(errorCode.FAILED, null);
            }
        });
    } catch (e) {
        logger.error('offline admin login exception: ' + e.message);
        callback(errorCode.FAILED, null);
    }
}

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

exports.applicationSignInWorkUnit = function (appKey, appSecret, callback) {
    let queryParams = new Map();
    let userApp = {
        appKey : appKey,
        appSecret : appSecret,
        appType : enums.APP_TYPE_PRIVATE_CLOUD
    };
    logger.info('app_server address = ' + BACKEND_SERVER_ADDRESS + ":" + BACKEND_SERVER_PORT);
    let requestSender =
        new RequestSender(
            BACKEND_SERVER_ADDRESS,
            BACKEND_SERVER_PORT,
            APP_SIGN_IN_SERVICE,
            queryParams);

    requestSender.sendPostRequest(userApp, function (signInErr, signInResponse) {
        if (errorCode.SUCCESS.code === signInErr &&
            JSON.parse(signInResponse).status.code === errorCode.SUCCESS.code) {
            let registeredApp = JSON.parse(signInResponse).entity;
            let appId = registeredApp.id;

            callback(errorCode.SUCCESS, registeredApp);
        } else {
            logger.error("IRext public site sign in to application server failed");
            callback(errorCode.FAILED, null);
        }
    });
};