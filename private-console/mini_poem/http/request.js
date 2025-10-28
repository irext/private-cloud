/**
 * Created by Strawmanbobi
 * 2014-08-30
 */

// system inclusion
let queryString = require('querystring');
let http = require('http');
let request = require('axios');

// local inclusion
let Map = require('../mem/map.js');
let ErrorCode = require('../configuration/error_code.js');

let errorCode = new ErrorCode();

let logger = require('../logging/logger4js').helper;

/**
 *
 * @param _host : host of service server
 * @param _port : port of service server
 * @param _service : service URL parameter
 * @param _queryParams : map of query parameters
 * @constructor
 */
let Request = function(_host, _port, _service, _queryParams) {
    this.host = _host;
    this.port = _port;
    this.service = _service;
    this.queryParams = _queryParams;
};

Request.prototype.urlizeQueryParams = function() {
    let i = 0;
    let urlParams = '';
    let paramElement = null;
    if(undefined == this.queryParams || null == this.queryParams) {
        return  '';
    }
    if(this.queryParams instanceof Map) {
        for(i = 0; i < this.queryParams.size(); i++) {
            paramElement = this.queryParams.element(i);
            if(0 == i) {
                urlParams += '?';
            } else {
                urlParams += '&';
            }
            urlParams += paramElement.key + '=' + paramElement.value;
        }
        return urlParams;
    }
    return '';
};

Request.prototype.sendGetRequest = function(options, callback) {
    let data = '';
    let httpTag = options.https ? 'https://' : 'http://';
    let url = httpTag + this.host + ':' + this.port + this.service +
        this.urlizeQueryParams();

    if(options.https) {
        request(
            {
                method: 'GET',
                uri: url
            }, function (error, response, body) {
                if(!error && response.statusCode == '200') {
                    callback(errorCode.SUCCESS, JSON.parse(body));
                } else {
                    callback(errorCode.FAILED, null);
                }
            }
        )
    } else {
        http.get(url, function(res) {
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function() {
                if('200' == res.statusCode) {
                    callback(errorCode.SUCCESS, data);
                } else {
                    console.error('HTTP request fault !!');
                    callback(errorCode.FAILED, null);
                }
            });
            res.on('error', function(e) {
                console.error('error occurred when handling response : ' + e);
                callback(errorCode.FAILED, null);
            });
        });
    }
};

Request.prototype.sendPostRequest = function(bodyData, callback) {
    let requestData = JSON.stringify(bodyData);
    let url = this.service +
        this.urlizeQueryParams();
    let options = {
        host: this.host,
        port: this.port,
        path: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    let req = http.request(options, function(res) {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function() {
            if('200' == res.statusCode) {
                callback(errorCode.SUCCESS, data);
            } else {
                callback(errorCode.FAILED, null);
            }
        });
    });
    try {
        req.write(requestData);
        req.end();
    } catch(e) {
        console.error('exception occurred in http request : ' + e);
    }
};

Request.prototype.postMultipartForm = function(formData, callback) {
    let url = this.service +
        this.urlizeQueryParams();
    let req = request.post({url: url, formData: formData}, function optionalCallback(err, res, body) {
        if (err) {
            console.error('exception occured in http request : ' + e);
            callback(errorCode.FAILED, null);
        } else {
            if ('200' == res.statusCode) {
                callback(errorCode.SUCCESS, body);
            } else {
                callback(errorCode.FAILED, null);
            }
        }
    });
};

// post simple file to HTTP server
Request.prototype.postSimpleFile = function(fileName, fileContent, contentType, options, callback) {
    let httpTag = options.https ? 'https://' : 'http://';
    let url = httpTag + this.host + ':' + this.port + this.service +
        this.urlizeQueryParams();

    let req = request.post(url, function (err, resp, body) {
        if (err) {
            callback(errorCode.FAILED, resp);
        } else {
            callback(errorCode.SUCCESS, resp);
        }
    });
    let form = req.form();
    form.append('file', fileContent, {
        filename: fileName,
        contentType: contentType
    });
};

module.exports = Request;
