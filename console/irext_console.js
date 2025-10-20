/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

// system inclusion
let express= require('express');
let app = module.exports = express();
let http = require('http').Server(app);
let bodyParser = require('body-parser');
let methodOverride = require('method-override');

// global inclusion
require('./mini_poem/configuration/constants');
let System = require('./mini_poem/utils/system_utils');
let dbConn = require('./mini_poem/db/mysql/mysql_connection');

// local inclusion
let systemConfig = require('./configuration/system_configs');
let Enums = require('./constants/enums');
let ErrorCode = require('./constants/error_code');
let enums = new Enums();
let errorCode = new ErrorCode();

SERVER = enums.SERVER_MAIN;

console.log('Configuring Infrastructure...');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
// authentication middleware
app.use(tokenValidation);
app.use("/", express.static(__dirname + '/web/'));
systemConfig.setupEnvironment();
let serverListenPort = LISTEN_PORT;

console.log("initializing MySQL connection to : " + MYSQL_DB_SERVER_ADDRESS + ":" + MYSQL_DB_NAME);
dbConn.setMySQLParameter(MYSQL_DB_SERVER_ADDRESS, MYSQL_DB_NAME, MYSQL_DB_USER, MYSQL_DB_PASSWORD);

require('./routes');

let certificateLogic = require('./work_unit/authentication_logic.js');

// kickstart the engine
System.startupHttp(http, serverListenPort, "irext Console V1.5.0");

////////////////// authentication middleware //////////////////
function tokenValidation (req, res, next) {
    let bodyParam;
    let adminID = null;
    let token = null;
    bodyParam = req.body;

    if (null != bodyParam) {
        adminID = bodyParam.admin_id;
        token = bodyParam.token;
    }

    if (req.url.indexOf("/irext/int/list_remote_indexes") !== -1) {
        // override for get method
        adminID = req.query.admin_id;
        token = req.query.token;
    }
    if (req.url.indexOf("/irext/int/search_remote_indexes") !== -1) {
        // override for get method
        adminID = req.query.admin_id;
        token = req.query.token;
    }
    if (req.url.indexOf("/irext/int/download_remote_index") !== -1) {
        // override for get method
        adminID = req.query.admin_id;
        token = req.query.token;
    }
    if (req.url.indexOf("/irext/int") !== -1) {
        let contentType = req.get("content-type");
        if (null != contentType && contentType.indexOf("multipart/form-data") != -1) {
            // request of content type of multipart/form-data would be validated inside each service
            next();
        } else {
            certificateLogic.verifyTokenWorkUnit(adminID, token, function(validateTokenErr) {
                if(errorCode.SUCCESS.code !== validateTokenErr.code) {
                    let fakeResponse = {
                        status: validateTokenErr,
                        entity: null
                    };
                    res.send(fakeResponse);
                    res.end();
                } else {
                    next();
                }
            });
        }
    } else if (req.url.indexOf("/irext/nav/nav_to_url") !== -1) {
        let page = bodyParam.page;
        let pageCode = page.indexOf("code");
        let pageDoc = page.indexOf("doc");
        let pageStat = page.indexOf("stat");

        let permissions = "";

        if (-1 !== pageCode) {
            permissions = ",0";
        } else if (-1 !== pageDoc) {
            permissions = ",1";
        } else if (-1 !== pageStat) {
            permissions = ",2";
        }

        certificateLogic.verifyTokenWithPermissionWorkUnit(adminID, token, permissions, function(validateTokenErr) {
            if(errorCode.SUCCESS.code !== validateTokenErr.code) {
                res.redirect("/error/auth_error.html");
            } else {
                next();
            }
        });
    } else {
        next();
    }
}
