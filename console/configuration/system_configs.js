//noinspection JSUnresolvedFunction
/**
 * Created by strawmanbobi
 * 2014-10-17
 */

//noinspection JSUnresolvedFunction
require('../mini_poem/configuration/constants');
//noinspection JSUnresolvedFunction
let Enums = require('./../constants/enums');
let enums = new Enums();

//noinspection JSUnresolvedVariable
exports.setupEnvironment = function () {
    MYSQL_DB_SERVER_ADDRESS = "127.0.0.1";
    MYSQL_DB_NAME = "irext";
    MYSQL_DB_USER = "root";
    MYSQL_DB_PASSWORD = "421aWill.";
    REDIS_HOST = "localhost";
    REDIS_PORT = "6379";
    REDIS_PASSWORD = null;
    FILE_TEMP_PATH = "/data/irext/database/binaries/irext-binaries";
    PYTHON_PATH = "/usr/bin/python";
    LISTEN_PORT = "8301";
    SERVER_ADDRESS = "localhost";
    EXTERNAL_SERVER_ADDRESS = "srv.irext.net";
    EXTERNAL_SERVER_PORT = "80";
};