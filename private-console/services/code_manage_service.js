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

