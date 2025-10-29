/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// system inclusion
let logger = require('../mini_poem/logging/logger4js').helper;

let formidable = require('formidable');
let fs = require('fs');

// local inclusion
let ServiceResponse = require('../response/service_response.js');
let CategoryResponse = require('../response/category_response.js');
let BrandResponse = require('../response/brand_response.js');
let ProtocolResponse = require('../response/protocol_response.js');
let CityResponse = require('../response/city_response.js');
let OperatorResponse = require('../response/operator_response.js');
let RemoteIndexResponse = require('../response/remote_index_response.js');

let internalLogic = require('../work_unit/code_manage_logic.js');

let Enums = require('../constants/enums');
let ErrorCode = require('../constants/error_code');

let enums = new Enums();
let errorCode = new ErrorCode();

/*
 * function :   List Categories
 * parameter :  from
 *              count
 * return :     CategoryResponse
 */
exports.listCategories = function (req, res) {
    let from = req.body.from;
    let count = req.body.count;
    let lang = req.body.lang || req.headers["accept-language"];

    let categoryResponse = new CategoryResponse();
    internalLogic.listCategoriesWorkUnit(lang, from, count, function (listCategoriesErr, categories) {
        categoryResponse.status = listCategoriesErr;
        categoryResponse.entity = categories;
        res.send(categoryResponse);
        res.end();
    });
};

/*
 * function :   List Brands
 * parameter :  from
 *              count
 *              categoryID
 * return :     BrandResponse
 */
exports.listBrands = function (req, res) {
    let categoryID = req.body.category_id;
    let from = req.body.from;
    let count = req.body.count;
    let lang = req.body.lang || req.headers["accept-language"];

    let brandResponse = new BrandResponse();
    internalLogic.listBrandsWorkUnit(lang, categoryID, from, count, function (listBrandsErr, brands) {
        brandResponse.status = listBrandsErr;
        brandResponse.entity = brands;
        res.send(brandResponse);
        res.end();
    });
};

/*
 * function :   List Unpublished Brands
 * parameter :  from
 *              count
 *              categoryID
 * return :     BrandResponse
 */
exports.listUnpublishedBrands = function (req, res) {
    let brandResponse = new BrandResponse();
    internalLogic.listUnpublishedBrandsWorkUnit(function (listBrandsErr, brands) {
        brandResponse.status = listBrandsErr;
        brandResponse.entity = brands;
        res.send(brandResponse);
        res.end();
    });
};

/*
 * function :   List Protocols
 * parameter :  from
 *              countc
 * return :     ProtocolResponse
 */
exports.listIRProtocols = function (req, res) {
    let from = req.body.from;
    let count = req.body.count;

    let protocolResponse = new ProtocolResponse();
    internalLogic.listIRProtocolsWorkUnit(from, count, function (listProtocolsErr, protocols) {
        protocolResponse.status = listProtocolsErr;
        protocolResponse.entity = protocols;
        res.send(protocolResponse);
        res.end();
    });
};

/*
 * function :   List provinces
 * parameter :
 * return :     ProvinceResponse
 */
exports.listProvinces = function (req, res) {
    let cityResponse = new CityResponse();
    let lang = req.body.lang || req.headers["accept-language"];

    internalLogic.listProvincesWorkUnit(lang, function (listProvincesErr, provinces) {
        cityResponse.status = listProvincesErr;
        cityResponse.entity = provinces;
        res.send(cityResponse);
        res.end();
    });
};

/*
 * function :   List Cities
 * parameter :  province code prefix
 * return :     CityResponse
 */
exports.listCities = function (req, res) {
    let provincePrefix = req.body.province_prefix;
    let lang = req.body.lang || req.headers["accept-language"];

    let cityResponse = new CityResponse();
    internalLogic.listCitiesWorkUnit(lang, provincePrefix, function (listCitiesErr, cities) {
        cityResponse.status = listCitiesErr;
        cityResponse.entity = cities;
        res.send(cityResponse);
        res.end();
    });
};

/*
 * function :   List operators
 * parameter :  city code
 * return :     OperatorResponse
 */
exports.listOperators = function (req, res) {
    let cityCode = req.body.city_code;
    let from = req.body.from;
    let count = req.body.count;
    let lang = req.body.lang || req.headers["accept-language"];

    let operatorResponse = new OperatorResponse();
    internalLogic.listOperatorsWorkUnit(lang, cityCode, from, count, function (listOperatorsErr, operators) {
        operatorResponse.status = listOperatorsErr;
        operatorResponse.entity = operators;
        res.send(operatorResponse);
        res.end();
    });
};

/*
 * function :   List indexes
 * parameter :  category_id
 *              brand_id/city_code
 *              operator_id
 *              from
 *              count
 * return :     Remote Index List
 */
exports.listIndexes = function (req, res) {
    let categoryID = req.body.category_id;
    let brandID = req.body.brand_id;
    let cityCode = req.body.city_code;
    let operatorID = req.body.operator_id;
    let from = req.body.from;
    let count = req.body.count;
    let lang = req.body.lang || req.headers["accept-language"];

    let remoteIndexResponse = new RemoteIndexResponse();
    internalLogic.listRemoteIndexesWorkUnit(lang, categoryID, brandID, cityCode, operatorID, from, count,
        function (listRemoteIndexesErr, remoteIndexes) {
            remoteIndexResponse.status = listRemoteIndexesErr;
            remoteIndexResponse.entity = remoteIndexes;
            res.send(remoteIndexResponse);
            res.end();
        });
};

/*
 * function :   List remote indexes
 * parameter :  category_id
 *              brand_id/city_code
 *              from
 *              count
 * return :     Remote Index List
 */
exports.listRemoteIndexes = function (req, res) {
    let categoryID = req.query.category_id;
    let brandID = req.query.brand_id;
    let cityCode = req.query.city_code;
    let operatorID = req.query.operator_id;
    let from = req.query.from;
    let count = req.query.count;
    let lang = req.body.lang || req.headers["accept-language"];

    internalLogic.listRemoteIndexesWorkUnit(lang, categoryID, brandID, cityCode, operatorID, from, count,
        function (listRemoteIndexesErr, remoteIndexes) {
            res.send(remoteIndexes);
            res.end();
    });
};

/*
 * function :   Search remotes
 * parameter :  remoteMap
 *              from
 *              count
 * return :     Remote Index List
 */
exports.searchRemoteIndexes = function (req, res) {
    let remoteMap = req.query.remote_map;
    let from = req.query.from;
    let count = req.query.count;
    let lang = req.query.lang || req.headers["accept-language"];

    internalLogic.searchRemoteIndexesWorkUnit(lang, remoteMap, from, count,
        function (listRemoteIndexesErr, remoteIndexes) {
            // remoteIndexResponse.status = listRemoteIndexesErr;
            //remoteIndexResponse = remoteIndexes;
            res.send(remoteIndexes);
            res.end();
        });
};

/*
 * function :   Download remote binary
 * parameter :  remote index ID
 * return :     Redirect to binary download
 */
exports.downloadRemoteIndex = function (req, res) {
    let remoteIndexID = req.query.remote_index_id;
    let adminId = req.query.admin_id;
    let token = req.query.token;

    internalLogic.downloadRemoteBinCachedWorkUnit(adminId, token, remoteIndexID, function (serveBinErr, filePath) {
        if (errorCode.SUCCESS.code === serveBinErr.code) {
            logger.info("download file located at " + filePath);
            res.download(filePath, "");
        } else {
            logger.info("download file failed");
            res.write('');
            res.end();
        }
    });
};

/*
 * function :   List unpublished remote indexes
 * parameter :  category_id
 *              brand_id/city_code
 *              from
 *              count
 * return :     Remote Index List
 */
exports.listUnpublishedRemoteIndexes = function (req, res) {
    let remoteIndexResponse = new RemoteIndexResponse();
    internalLogic.listUnpublishedRemoteIndexesWorkUnit(function (listRemoteIndexesErr, remoteIndexes) {
            remoteIndexResponse.status = listRemoteIndexesErr;
            remoteIndexResponse.entity = remoteIndexes;
            res.send(remoteIndexResponse);
            res.end();
        });
};

/*
 * function :   Create remote index accordingly
 * parameter :  remote body parameter
 * return :     None
 */
exports.createRemoteIndex = function (req, res) {
    let form = new formidable.IncomingForm({
        uploadDir: FILE_TEMP_PATH
    });
    let remoteIndex;
    let filePath;
    let contentType;
    let adminID;

    form.on('file', function(field, file) {
        // rename the incoming file to the file's name
        logger.info("on file in formidable, change file name according to remote name");

        fs.rename(file.path, form.uploadDir + "/" + file.name, null);
    }).on('error', function(err) {
        logger.error("formidable parse form error : " + err);
        res.send("<html lang='en-US'>" +
            "<body> " +
            "<div style='width: 100%; text-align: center; color: #FF0000'>编码文件提交失败</div>" +
            "</body>" +
            "</html>");
        res.end();
    });

    form.parse(req, function(err, fields, files) {
        if(err) {
            logger.error("failed to submit remote index form");
        } else {
            logger.info("remote index form submitted successfully");
            remoteIndex = fields;
            adminID = remoteIndex.admin_id;
            filePath = files.remote_file.path;
            // set MIME to octet-stream as there might not be any contentType passed from the front-end form
            contentType = files.type || "application/octet-stream";
            internalLogic.createRemoteIndexWorkUnit(remoteIndex, filePath, contentType, adminID,
                function (createRemoteIndexErr) {
                if(errorCode.SUCCESS.code === createRemoteIndexErr.code) {
                    res.send("<html lang='en-US'>" +
                        "<body> " +
                        "<div style='width: 100%; text-align: center;'>编码文件提交成功</div>" +
                        "</body>" +
                        "</html>");
                } else if (errorCode.DUPLICATED_REMOTE_CODE.code === createRemoteIndexErr.code) {
                    res.send("<html lang='en-US'>" +
                        "<body> " +
                        "<div style='width: 100%; text-align: center; color: #FF7777'>编码重复，无需新增</div>" +
                        "</body>" +
                        "</html>");
                } else {
                    res.send("<html lang='en-US'>" +
                        "<body> " +
                        "<div style='width: 100%; text-align: center; color: #FF0000'>编码文件提交失败</div>" +
                        "</body>" +
                        "</html>");
                }
                res.end();
            });
        }
    });
};

/*
 * function :   Delete remote index accordingly
 * parameter :  remote_id
 * return :     ServiceResponse
 */
exports.deleteRemoteIndex = function (req, res) {
    let remoteIndex = req.body;
    let adminID = req.body.admin_id;

    let serviceResponse = new ServiceResponse();
    internalLogic.deleteRemoteIndexWorkUnit(remoteIndex, adminID, function (deleteRemoteErr) {
        serviceResponse.status = deleteRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Verify remote index accordingly
 * parameter :  remote_id
 *              is_pass
 * return :     ServiceResponse
 */
exports.verifyRemoteIndex = function (req, res) {
    let remoteIndex = req.body;
    let pass = req.body.pass;
    let adminID = req.body.admin_id;

    let serviceResponse = new ServiceResponse();
    internalLogic.verifyRemoteIndexWorkUnit(remoteIndex, pass, adminID, function (verifyRemoteErr) {
        serviceResponse.status = verifyRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Fallback remote index accordingly
 * parameter :  remote_id
 * return :     ServiceResponse
 */
exports.fallbackRemoteIndex = function (req, res) {
    let remoteIndex = req.body;
    let adminID = req.body.admin_id;

    let serviceResponse = new ServiceResponse();
    internalLogic.fallbackRemoteIndexWorkUnit(remoteIndex, adminID, function (fallbackRemoteErr) {
        serviceResponse.status = fallbackRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Publish remote index
 * parameter :  none
 * return :     ServiceResponse
 */
exports.publishRemoteIndex = function (req, res) {
    let adminID = req.body.admin_id;

    let serviceResponse = new ServiceResponse();
    internalLogic.publishRemoteIndexWorkUnit(adminID, function (publishRemoteErr) {
        serviceResponse.status = publishRemoteErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Create new brand
 * parameter :  brand body parameter
 * return :     Service response
 */
exports.createBrand = function (req, res) {
    let brand = req.body;
    let adminID = req.body.admin_id;

    let serviceResponse = new ServiceResponse();
    internalLogic.createBrandWorkUnit(brand, adminID, function (createBrandErr) {
        serviceResponse.status = createBrandErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Publish brand
 * parameter :  Brand body parameter
 * return :     Service response
 */
exports.publishBrands = function (req, res) {
    let adminID = req.body.admin_id;

    let serviceResponse = new ServiceResponse();
    internalLogic.publishBrandsWorkUnit(adminID, function (publishBrandsErr) {
        serviceResponse.status = publishBrandsErr;
        res.send(serviceResponse);
        res.end();
    });
};

/*
 * function :   Create protocol accordingly
 * parameter :  protocol body parameter
 * return :     None
 */
exports.createProtocol = function (req, res) {
    let form = new formidable.IncomingForm({
        uploadDir: FILE_TEMP_PATH + "/protocol"
    });
    let protocol;
    let filePath;
    let contentType;
    let adminID;

    form.on('file', function(field, file) {
        fs.rename(file.path, form.uploadDir + "/" + file.name, null);
    }).on('error', function(err) {
        logger.error("formidable parse form error : " + err);
        res.send("<html lang='en-US'>" +
            "<body>" +
            "<div style='width: 100%; text-align: center; color: #FF0000'>协议文件提交失败</div>" +
            "</body>" +
            "</html>");
        res.end();
    });

    form.parse(req, function(err, fields, files) {
        if(err) {
            logger.error("failed to submit protocol form");
        } else {
            logger.info("protocol form submitted successfully");
            protocol = fields;
            adminID = protocol.admin_id;
            filePath = files.protocol_file.path;
            // set MIME to octet-stream as there might not be any contentType passed from the front-end form
            contentType = files.type || "application/octet-stream";
            console.log("filePath = " + filePath + ", contentType = " + contentType);
            internalLogic.createProtocolWorkUnit(protocol, filePath, contentType, adminID, function (createProtocolErr) {
                if(errorCode.SUCCESS.code === createProtocolErr.code) {
                    res.send("<html lang='en-US'>" +
                        "<body>" +
                        "<div style='width: 100%; text-align: center;'>协议文件提交成功</div>" +
                        "</body>" +
                        "</html>");
                    res.end();
                } else {
                    res.send("<html lang='en-US'>" +
                        "<body>" +
                        "<div style='width: 100%; text-align: center; color: #FF0000'>协议文件提交失败</div>" +
                        "</body>" +
                        "</html>");
                    res.end();
                }
            });
        }
    });
};