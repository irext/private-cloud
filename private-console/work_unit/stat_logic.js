/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// global inclusion
require('../mini_poem/configuration/constants');
let logger = require('../mini_poem/logging/logger4js').helper;

// local inclusion
let Category = require('../model/category_dao.js');
let Brand = require('../model/brand_dao.js');
let City = require('../model/city_dao.js');
let RemoteIndex = require('../model/remote_index_dao.js');

let Enums = require('../constants/enums.js');
let ErrorCode = require('../constants/error_code.js');

let enums = new Enums();
let errorCode = new ErrorCode();

let async = require('async');

exports.countRemoteWorkUnit = function(callback) {
    let conditions = {
        status: enums.ITEM_VALID
    };

    Category.countCategories(conditions, function(countCategoriesErr, categoriesCount) {
        Brand.countBrands(conditions, function(countBrandsErr, brandsCount) {
            RemoteIndex.countRemoteIndexes(conditions, function(countRemoteIndexesErr, remoteIndexesCount) {
                let statInfo = {};
                statInfo.categories_count = categoriesCount;
                statInfo.brands_count = brandsCount;
                statInfo.remote_indexes_count = remoteIndexesCount;
                callback(errorCode.SUCCESS, statInfo);
            });
        });
    });
};

exports.statCategoriesWorkUnit = function(callback) {
    let conditions = {
        status: enums.ITEM_VALID
    };

    let retCategoriesCount = [];

    Category.listCategories(conditions, 0, 200, "id", function(findCategoriesErr, categories) {
        if (errorCode.FAILED.code === findCategoriesErr.code) {
            logger.error("failed to find categories");
            callback(findCategoriesErr, null);
        } else {
            async.eachSeries(categories, function (category, innerCallback) {
                let categoryName = category.name;
                let categoryID = category.id;
                if (enums.CATEGORY_STB !== categoryID) {
                    let countConditions = {
                        category_id: categoryID,
                        status: enums.ITEM_VALID
                    };
                    Brand.countBrands(countConditions,
                        function(countBrandsErr, brandsCount) {
                            if (errorCode.SUCCESS.code === countBrandsErr.code) {
                                let categoryStat = {};
                                categoryStat.id = categoryID;
                                categoryStat.name = categoryName;
                                categoryStat.brands_count = brandsCount;
                                retCategoriesCount.push(categoryStat);
                            } else {
                                logger.error("failed to count categories");
                            }
                            innerCallback();
                        });
                } else {
                    let countConditions = "code LIKE '__0000';";
                    City.countCities(countConditions,
                        function(countCitiesErr, citiesCount) {
                            if (errorCode.SUCCESS.code === countCitiesErr.code) {
                                let categoryStat = {};
                                categoryStat.id = categoryID;
                                categoryStat.name = categoryName;
                                categoryStat.brands_count = citiesCount[0].number;
                                retCategoriesCount.push(categoryStat);
                            } else {
                                logger.error("failed to count categories");
                            }
                            innerCallback();
                        });
                }

            }, function (err) {
                callback(errorCode.SUCCESS, retCategoriesCount);
            });
        }
    });
};

exports.statBrandsWorkUnit = function (categoryID, callback) {
    let conditions = {
        category_id: categoryID,
        status: enums.ITEM_VALID
    };

    let retBrandsCount = [];

    Brand.listBrands(conditions, 0, 200, "priority", function(findBrandsErr, brands) {
        if (errorCode.FAILED.code === findBrandsErr.code) {
            logger.error("failed to find brands");
            callback(findBrandsErr, null);
        } else {
            async.eachSeries(brands, function (brand, innerCallback) {
                let brandName = brand.name;
                let brandID = brand.id;

                if (enums.CATEGORY_STB !== categoryID) {
                    let countConditions = {
                        brand_id: brandID,
                        status: enums.ITEM_VALID
                    };
                    RemoteIndex.countRemoteIndexes(countConditions,
                        function(countRemoteIndexesErr, remoteIndexesCount) {
                            if (errorCode.SUCCESS.code === countRemoteIndexesErr.code) {
                                let brandStat = {};
                                brandStat.id = brandID;
                                brandStat.name = brandName;
                                brandStat.remote_indexes_count = remoteIndexesCount;
                                retBrandsCount.push(brandStat);
                            } else {
                                logger.error("failed to count remote indexes");
                            }
                            innerCallback();
                        });
                }
            }, function (err) {
                callback(errorCode.SUCCESS, retBrandsCount);
            });
        }
    });
};

exports.statCitiesWorkUnit = function (callback) {
    let retCitiesCount = [];

    City.listProvinces(function(listProvincesErr, provinces) {
        if (errorCode.FAILED.code === listProvincesErr.code) {
            logger.error("failed to find brands");
            callback(listProvincesErr, null);
        } else {
            async.eachSeries(provinces, function (province, innerCallback) {
                let provinceName = province.name;
                let provinceCode = province.code;
                let provincePrefix = provinceCode.substring(0, 2);
                let countConditions = "code LIKE '" + provincePrefix + "__00' AND code <> '" + provincePrefix + "0000';";
                City.countCities(countConditions,
                    function(countCitiesErr, citiesCount) {
                        if (errorCode.SUCCESS.code === countCitiesErr.code) {
                            let cityStat = {};
                            cityStat.name = provinceName;
                            cityStat.city_count = citiesCount[0].number;
                            retCitiesCount.push(cityStat);
                        } else {
                            logger.error("failed to count cities");
                        }
                        innerCallback();
                    });
            }, function (err) {
                callback(errorCode.SUCCESS, retCitiesCount);
            });
        }
    });
};