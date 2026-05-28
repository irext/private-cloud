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
    let env = process.env.NODE_ENV || 'development';
    if (undefined === typeof env || null === env || "" === env || enums.APP_PRODUCTION_MODE === env) {
        MYSQL_DB_SERVER_ADDRESS = "127.0.0.1";
        MYSQL_DB_NAME = "irext";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "root";
        REDIS_HOST = "127.0.0.1";
        REDIS_PORT = "6379";
        REDIS_PASSWORD = null;
        FILE_TEMP_PATH = "/data/irext/database/binaries/irext-binaries";
        PYTHON_PATH = "/usr/bin/python";
        LISTEN_PORT = "8080";
        BACKEND_SERVER_ADDRESS = "127.0.0.1";
        BACKEDN_SERVER_PORT = "8082";
        EXTERNAL_SERVER_ADDRESS = "srv.irext.net";
        EXTERNAL_SERVER_PORT = "80";
    }  else if (enums.APP_DEVELOPMENT_MODE === env) {
        MYSQL_DB_SERVER_ADDRESS = "127.0.0.1";
        MYSQL_DB_NAME = "irext";
        MYSQL_DB_USER = "root";
        MYSQL_DB_PASSWORD = "421aWill.";
        REDIS_HOST = "127.0.0.1";
        REDIS_PORT = "6379";
        REDIS_PASSWORD = null;
        FILE_TEMP_PATH = "/data/irext/database/binaries/irext-binaries";
        PYTHON_PATH = "/usr/bin/python";
        LISTEN_PORT = "8080";
        BACKEND_SERVER_ADDRESS = "127.0.0.1";
        BACKEDN_SERVER_PORT = "8082";
        EXTERNAL_SERVER_ADDRESS = "127.0.0.1";
        EXTERNAL_SERVER_PORT = "8083";
    }

};