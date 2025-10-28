/*
 * Created by Strawmanbobi
 * 2014-09-22
 */

require('../../configuration/constants');
let orm = require('orm');
let logger = require('../../logging/logger4js').helper;

let ormOpt;

exports.setMySQLParameter = function (dbHost, dbName, dbUser, dbPassword) {
    logger.info("initialize mysql connection, user = " + dbUser);
    ormOpt = {
        protocol: "mysql",
        hostname: dbHost,
        database: dbName,
        user: dbUser,
        password: dbPassword,
        charset: 'utf8',
        query: {pool: false}
    };
    exports.mysqlDB = orm.connect(ormOpt);
};