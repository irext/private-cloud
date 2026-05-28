/**
 * Created by Strawmanbobi
 * 2016-12-24 (Xmas eve)
 */

// system inclusion
let constants = require('../mini_poem/configuration/constants.js');
let logger = require('../mini_poem/logging/logger4js').helper;

// local inclusion
let StringResponse = require('../response/string_response.js');

let decodeLogic = require('../work_unit/decode_logic.js');

let Enums = require('../constants/enums');
let ErrorCode = require('../constants/error_code');

let enums = new Enums();
let errorCode = new ErrorCode();


/*
 * function :   Decode online
 * parameter :  decode parameter body
 * return :     String response
 */
exports.decodeOnline = function (req, res) {
    let decodeRequestBody = req.body;

    let stringResponse = new StringResponse();

    decodeLogic.decodeOnlineWorkUnit(decodeRequestBody, function (decodeErr, decoded) {
        stringResponse.status = decodeErr;
        stringResponse.entity = JSON.stringify(decoded);
        res.send(stringResponse);
        res.end();
    });
};
