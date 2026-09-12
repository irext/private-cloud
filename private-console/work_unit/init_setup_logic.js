/**
 * Created by Strawmanbobi
 * 2026-09-11
 */

let fs = require('fs');
let logger = require('../mini_poem/logging/logger4js').helper;
let RequestSender = require('../mini_poem/http/request.js');
let Map = require('../mini_poem/mem/map.js');

let ErrorCode = require('../constants/error_code');

let errorCode = new ErrorCode();

let INITIALIZED_FLAG_PATH = '/data/irext/config/initialized.flag';
let ADMIN_SIGN_IN_SERVICE = '/irext-server/app/private_cloud_admin_login';

exports.checkInitializedWorkUnit = function(callback) {
    let initialized = fs.existsSync(INITIALIZED_FLAG_PATH);
    callback(errorCode.SUCCESS, { initialized: initialized });
};

exports.verifyIdentityWorkUnit = function(mode, params, callback) {
    if (mode === 'hybrid') {
        let queryParams = new Map();
        let requestSender = new RequestSender(
            EXTERNAL_SERVER_ADDRESS,
            EXTERNAL_SERVER_PORT,
            ADMIN_SIGN_IN_SERVICE,
            queryParams
        );
        let signinInfo = {
            userName: params.user_name,
            password: params.password,
            appKey: process.env.APP_KEY,
            appSecret: process.env.APP_SECRET
        };
        requestSender.sendPostRequest(signinInfo, function(signInErr, signInResponse) {
            if (signInErr === errorCode.SUCCESS.code && null !== signInResponse) {
                let resp = JSON.parse(signInResponse);
                if (resp.entity) {
                    logger.info('init setup identity verification (hybrid) success for: ' + params.user_name);
                    callback(errorCode.SUCCESS, resp.entity);
                } else {
                    callback(errorCode.AUTHENTICATION_FAILURE, null);
                }
            } else {
                logger.error('init setup identity verification (hybrid) request failed');
                callback(errorCode.AUTHENTICATION_FAILURE, null);
            }
        });
    } else if (mode === 'offline') {
        if (params.app_secret && process.env.APP_SECRET &&
            params.app_secret === process.env.APP_SECRET) {
            logger.info('init setup identity verification (offline) success');
            callback(errorCode.SUCCESS, null);
        } else {
            logger.info('init setup identity verification (offline) failed');
            callback(errorCode.AUTHENTICATION_FAILURE, null);
        }
    } else {
        callback(errorCode.INVALID_PARAMETER, null);
    }
};

exports.completeSetupWorkUnit = function(callback) {
    try {
        let configDir = '/data/irext/config';
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        fs.writeFileSync(INITIALIZED_FLAG_PATH, new Date().toISOString());
        logger.info('init setup completed, flag written to: ' + INITIALIZED_FLAG_PATH);
        callback(errorCode.SUCCESS, null);
    } catch (e) {
        logger.error('failed to write init setup flag: ' + e.message);
        callback(errorCode.FAILED, null);
    }
};
