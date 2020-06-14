/**
 * Created by Strawmanbobi
 * 2016-11-27
 */

// system inclusion

// local inclusion
let StatResponse = require('../response/stat_response.js');

let statLogic = require('../work_unit/stat_logic.js');

let Enums = require('../constants/enums');
let ErrorCode = require('../constants/error_code');

/*
 * function :   Count supported categories, brands and remote indexes
 * parameter :  stat_type
 * return :     Customized statistics response
 */
exports.genericCount = function(req, res) {
    let statResponse = new StatResponse();
    statLogic.countRemoteWorkUnit(function(countRemoteErr, statContent) {
        statResponse.status = countRemoteErr;
        statResponse.entity = statContent;
        res.send(statResponse);
        res.end();
    });
};

/*
 * function :   Stat categories
 * parameter :
 * return :     Customized statistics response
 */
exports.statCategories = function(req, res) {
    let statResponse = new StatResponse();
    statLogic.statCategoriesWorkUnit(function(statCategoriesErr, statCategories) {
        statResponse.status = statCategoriesErr;
        statResponse.entity = statCategories;
        res.send(statResponse);
        res.end();
    });
};

/*
 * function :   Stat brands
 * parameter :
 * return :     Customized statistics response
 */
exports.statBrands = function(req, res) {
    let categoryID = req.body.category_id;

    let statResponse = new StatResponse();
    statLogic.statBrandsWorkUnit(categoryID, function(statBrandsErr, statBrands) {
        statResponse.status = statBrandsErr;
        statResponse.entity = statBrands;
        res.send(statResponse);
        res.end();
    });
};

/*
 * function :   Stat cities
 * parameter :
 * return :     Customized statistics response
 */
exports.statCities = function(req, res) {
    let statResponse = new StatResponse();
    statLogic.statCitiesWorkUnit(function(statCitiesErr, statCities) {
        statResponse.status = statCitiesErr;
        statResponse.entity = statCities;
        res.send(statResponse);
        res.end();
    });
};