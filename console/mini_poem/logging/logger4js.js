/**
 * Created by donna
 * 2014-08-30
 */

let constants = require('../configuration/constants');
let Enums = require('../configuration/enums');
let log4js = require('log4js');
let enums = new Enums();
let dateUtils = require('../utils/date_utils');

var helper = helper || {};
exports.helper = helper;

let logRoot = "./logs/";
let userDebugLogFolder = "user_debug/";
let devLogFolder = "dev/";
let productionLogFolder = "production/";

let logFile = "common.log";

log4js.configure({
    appenders: {
        default: {
            type: "dateFile",
            filename: logRoot + devLogFolder + logFile,
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: false
        },
        userProductionLog: {
            type: "file",
            filename: logRoot + productionLogFolder + logFile,
            maxLogSize: 104857600,
            backups: 10,
            compress: true
        },
        userDebugLog: {
            type: "file",
            filename: logRoot + userDebugLogFolder + logFile,
            maxLogSize: 104857600,
            backups: 10,
            compress: true
        },
        userDevelopmentLog: {
            type: "dateFile",
            filename: logRoot + devLogFolder + logFile,
            pattern: "-yyyy-MM-dd",
            alwaysIncludePattern: false
        }
    },
    categories: {
        default: {appenders: ['userProductionLog', 'default'], level: 'info'},
        userProductionLog: {appenders: ['userProductionLog'], level: 'info'},
        userDebugLog: {appenders: ['userDebugLog'], level: 'info'},
        userDevelopmentLog: {appenders: ['userDevelopmentLog'], level: 'info'}
    },
    replaceConsole: true
});

let userProductionLog = log4js.getLogger('userProductionLog');
let userDebugLog = log4js.getLogger('userDebugLog');
let userDevelopmentLog = log4js.getLogger('userDevelopmentLog');

helper.info = function (msg) {
    let date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss S");
    if (enums.APP_DEVELOPMENT_MODE === ENV) {
        console.log(date + ": " + msg);
    } else if (enums.APP_PRODUCTION_MODE === ENV) {
        userProductionLog.info(date + ": " + msg);
    } else {
        console.log(date + ": " + msg);
        userDebugLog.info(date + ": " + msg);
    }
};

helper.error = function (msg) {
    let date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss S");
    if (enums.APP_DEVELOPMENT_MODE === ENV) {
        console.log(date + ": " + msg);
    } else if (enums.APP_PRODUCTION_MODE === ENV) {
        userProductionLog.error(date + ": " + msg);
    } else {
        userDebugLog.error(date + ": " + msg);
    }
};

helper.warn = function (msg) {
    let date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss S");
    if (enums.APP_DEVELOPMENT_MODE === ENV) {
        console.log(date + ": " + msg);
    } else if (enums.APP_PRODUCTION_MODE === ENV) {
        userProductionLog.warn(date + ": " + msg);
    } else {
        userDebugLog.warn(date + ": " + msg);
    }
};

helper.debug = function (msg) {
    let date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss S");
    if (enums.APP_DEVELOPMENT_MODE === ENV) {
        console.log(date + ": " + msg);
    } else if (enums.APP_PRODUCTION_MODE === ENV) {
        userProductionLog.debug(date + ": " + msg);
    } else {
        userDebugLog.debug(date + ": " + msg);
    }
};

helper.trace = function (msg) {
    let date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss S");
    if (enums.APP_DEVELOPMENT_MODE === ENV) {
        console.log(date + ": " + msg);
    } else if (enums.APP_PRODUCTION_MODE === ENV) {
        userProductionLog.trace(date + ": " + msg);
    } else {
        userDebugLog.trace(date + ": " + msg);
    }
};

helper.fatal = function (msg) {
    let date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss S");
    if (enums.APP_DEVELOPMENT_MODE === ENV) {
        console.log(date + ": " + msg);
    } else if (enums.APP_PRODUCTION_MODE === ENV) {
        userProductionLog.fatal(date + ": " + msg);
    } else {
        userDebugLog.fatal(date + ": " + msg);
    }
};
