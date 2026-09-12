/**
 * Created by Strawmanbobi
 * 2026-09-08
 */

// system inclusion

// local inclusion
let ErrorCode = require('../constants/error_code');
let RequestSender = require('../mini_poem/http/request.js');
let Map = require('../mini_poem/mem/map.js');
let packageInfo = require('../package.json');

let errorCode = new ErrorCode();

// cached backend offline status
let backendOffline = null;
let BACKEND_OFFLINE_MODE_ERROR = 5;

// detect backend offline status from env or by probing Java backend
function detectBackendOfflineStatus() {
    // priority 1: environment variable
    if (process.env.OFFLINE === '1') {
        backendOffline = true;
        return;
    }
    if (process.env.OFFLINE === '0') {
        backendOffline = false;
        return;
    }

    // priority 2: probe Java backend
    try {
        let queryParams = new Map();
        let probeRequest = {
            appKey: '',
            appSecret: ''
        };
        let requestSender = new RequestSender(
            BACKEND_SERVER_ADDRESS,
            BACKEND_SERVER_PORT,
            '/irext-server/publish/prepare_private_data',
            queryParams
        );
        requestSender.sendPostRequest(probeRequest, function(probeErr, probeResponse) {
            if (probeErr.code !== errorCode.SUCCESS.code || null === probeResponse) {
                // backend unreachable, assume offline
                backendOffline = true;
            } else {
                let resp = JSON.parse(probeResponse);
                // error code 5 = offline mode
                backendOffline = (resp.status && resp.status.code === BACKEND_OFFLINE_MODE_ERROR);
            }
        });
    } catch (e) {
        // probe failed, assume offline for safety
        backendOffline = true;
    }
}

// run detection at startup
detectBackendOfflineStatus();

/*
 * function :   Get system configuration
 * parameter :
 * return :     System config response
 */
exports.getConfig = function(req, res) {
    let defaultMode = (process.env.OFFLINE === '1') ? 'offline' : 'hybrid';
    let config = {
        offline: backendOffline === true,
        default_mode: defaultMode,
        version: packageInfo.version
    };

    res.send({
        status: errorCode.SUCCESS,
        entity: config
    });
    res.end();
};
