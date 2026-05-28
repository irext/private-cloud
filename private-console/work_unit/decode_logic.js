/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// system inclusion
let fs = require('fs');
let crypto = require('crypto');

// local inclusion
let Enums = require('../constants/enums.js');
let ErrorCode = require('../constants/error_code.js');
let logger = require('../mini_poem/logging/logger4js').helper;

let enums = new Enums();
let errorCode = new ErrorCode();

let RequestSender = require('../mini_poem/http/request.js');
let Map = require('../mini_poem/mem/map.js');

// Decode microservice configuration
let DECODE_SERVICE = "/irext-server/operation/decode";

exports.decodeOnlineWorkUnit = function(decodeRequestBody, callback) {
    
    // Check if decode service is configured
    if (undefined === typeof DECODE_APP_ID || null === DECODE_APP_ID || 0 === DECODE_APP_ID) {
        logger.error("Decode service not configured");
        callback(errorCode.FAILED, null);
    } else {
        let decodeParameters = {};
        decodeParameters.indexId = decodeRequestBody.indexId;
        decodeParameters.keyCode = decodeRequestBody.keyCode;
        decodeParameters.directDecode = decodeRequestBody.directDecode;
        decodeParameters.paraData = decodeRequestBody.paraData;
        decodeParameters.acStatus = {};
        
        // Handle the case where acStatus parameters are passed as flat properties like acStatus[acPower]
        decodeParameters.acStatus.acPower = decodeRequestBody["acStatus[acPower]"] || 
            (decodeRequestBody.acStatus && decodeRequestBody.acStatus["acPower"]) || 0;
        decodeParameters.acStatus.acTemp = decodeRequestBody["acStatus[acTemp]"] || 
            (decodeRequestBody.acStatus && decodeRequestBody.acStatus["acTemp"]) || 8; // Default temp is 8
        decodeParameters.acStatus.acMode = decodeRequestBody["acStatus[acMode]"] || 
            (decodeRequestBody.acStatus && decodeRequestBody.acStatus["acMode"]) || 0;
        decodeParameters.acStatus.acWindDir = decodeRequestBody["acStatus[acWindDir]"] || 
            (decodeRequestBody.acStatus && decodeRequestBody.acStatus["acWindDir"]) || 0;
        decodeParameters.acStatus.acWindSpeed = decodeRequestBody["acStatus[acWindSpeed]"] || 
            (decodeRequestBody.acStatus && decodeRequestBody.acStatus["acWindSpeed"]) || 0;
        decodeParameters.acStatus.acDisplay = decodeRequestBody["acStatus[acDisplay]"] || 0;
        decodeParameters.acStatus.acSleep = decodeRequestBody["acStatus[acSleep]"] || 0;
        decodeParameters.acStatus.acTimer = decodeRequestBody["acStatus[acTimer]"] || 0;
        decodeParameters.acStatus.changeWindDir = decodeRequestBody["acStatus[changeWindDir]"] || 
            (decodeRequestBody.acStatus && decodeRequestBody.acStatus["changeWindDir"]) || 0;

        decodeParameters.id = DECODE_APP_ID;
        decodeParameters.token = DECODE_APP_TOKEN;
        
        let queryParams = new Map();
        let requestSender = new RequestSender(
            BACKEND_SERVER_ADDRESS,
            BACKEND_SERVER_PORT,
            DECODE_SERVICE,
            queryParams
        );

        requestSender.sendPostRequest(decodeParameters, function (decodeErr, decodeResponse) {
            if (errorCode.SUCCESS.code === decodeErr &&
                JSON.parse(decodeResponse).status.code === errorCode.SUCCESS.code) {
                let decoded = JSON.parse(decodeResponse).entity;
                callback(errorCode.SUCCESS, decoded);
            } else {
                logger.error("decode online failed");
                callback(errorCode.FAILED, null);
            }
        });
    }
};
