/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// system inclusion
let logger = require('../mini_poem/logging/logger4js').helper;

// local inclusion
let ServiceResponse = require('../response/service_response.js');
let LoginResponse = require('../response/login_response.js');

let authenticationLogic = require('../work_unit/authentication_logic.js');

let Enums = require('../constants/enums');
let ErrorCode = require('../constants/error_code');


/*
 * function :   Admin Login
 * parameter :  user_name in request body
 *              password in request body
 * return :     ServiceResponse
 */
exports.adminLogin = function (req, res) {
    let admin = req.body;
    let userName = admin.user_name;
    let password = admin.password;

    let loginResponse = new LoginResponse();
    authenticationLogic.adminLoginWorkUnit(userName, password, function (adminLoginErr, admin) {
        loginResponse.status = adminLoginErr;
        loginResponse.entity = admin;
        res.send(loginResponse);
        res.end();
    });
};

/*
 * function :   Verify Token
 * parameter :  id parameter of token KV
 *              token parameter of token KV
 * return :     ServiceResponse
 */
exports.verifyToken = function (req, res) {
    let bodyParam = req.body;
    let id = bodyParam.id;
    let token = bodyParam.token;

    let serviceResponse = new ServiceResponse();
    authenticationLogic.verifyTokenWorkUnit(id, token, function (verifyTokenErr) {
        serviceResponse.status = verifyTokenErr;
        res.send(serviceResponse);
        res.end();
    });
};