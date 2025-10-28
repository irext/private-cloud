/**
 * Created by Strawmanbobi
 * 2016-12-02
 */

let dateUtils = require('./date_utils');
let platform = require('platform');
let UAParser = require('ua-parser-js');

function startup(expressApp, port, serverName) {
    if(expressApp && expressApp.listen && typeof(expressApp.listen) == "function") {
        expressApp.listen(port);

        console.log(serverName +' restful webservice server is listening at port : ' +
        port + " //" +  dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss"));
        console.log("driven by " + ICODE);
    }
}

function startupHttp(http, port, serverName) {
    if(http) {
        http.listen(port);

        console.log(serverName +' restful webservice server is listening at port : ' +
            port + " //" +  dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss"));
        console.log("driven by " + ICODE);
    }
}

function getOS() {
    return platform.os;
}

function getUAInfo(ua) {
    let parser = new UAParser();
    let result = parser.setUA(ua).getResult();
    return result;
}

exports.startup = startup;
exports.startupHttp = startupHttp;
exports.getOS = getOS;
exports.getUAInfo = getUAInfo;