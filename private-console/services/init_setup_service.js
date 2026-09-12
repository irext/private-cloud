/**
 * Created by Strawmanbobi
 * 2026-09-11
 */

// system inclusion

// local inclusion
let ServiceResponse = require('../response/service_response.js');

let initSetupLogic = require('../work_unit/init_setup_logic.js');

let ErrorCode = require('../constants/error_code');

let errorCode = new ErrorCode();

/*
 * function :   Check if the system has been initialized
 * parameter :
 * return :     ServiceResponse with entity { initialized: boolean }
 */
exports.checkInitialized = function(req, res) {
    let serviceResponse = new ServiceResponse();
    initSetupLogic.checkInitializedWorkUnit(function(checkErr, result) {
        serviceResponse.status = checkErr;
        serviceResponse.entity = result;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Verify identity during setup wizard
 * parameter :  mode in request body (hybrid / offline)
 *              user_name and password for hybrid mode
 *              app_secret for offline mode
 * return :     ServiceResponse
 */
exports.verifyIdentity = function(req, res) {
    let body = req.body;
    let mode = body.mode;

    let serviceResponse = new ServiceResponse();
    initSetupLogic.verifyIdentityWorkUnit(mode, body, function(verifyErr, result) {
        serviceResponse.status = verifyErr;
        serviceResponse.entity = result;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Mark setup as completed
 * parameter :
 * return :     ServiceResponse
 */
exports.completeSetup = function(req, res) {
    let serviceResponse = new ServiceResponse();
    initSetupLogic.completeSetupWorkUnit(function(completeErr, result) {
        serviceResponse.status = completeErr;
        serviceResponse.entity = result;
        res.send(serviceResponse);
        res.end();
    });
};
