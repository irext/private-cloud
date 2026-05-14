/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// system inclusion
fs = require('fs');
let crypto = require('crypto');

// global inclusion
require('../mini_poem/configuration/constants');
let orm = require('orm');
let AdminAuth = require('../authentication/admin_auth.js');
let PythonCaller = require('../mini_poem/external/python_caller');

let Category = require('../model/category_dao.js');
let Brand = require('../model/brand_dao.js');
let IRProtocol = require('../model/ir_protocol_dao.js');
let City = require('../model/city_dao.js');
let RemoteIndex = require('../model/remote_index_dao.js');
let StbOperator = require('../model/stb_operator_dao.js');
let CollectRemote = require('../model/collect_remote_dao.js');

let RequestSender = require('../mini_poem/http/request.js');
let Map = require('../mini_poem/mem/map.js');

let Enums = require('../constants/enums.js');
let ErrorCode = require('../constants/error_code.js');
let Categories = require('../constants/remote_categories');

let logger = require('../mini_poem/logging/logger4js').helper;

let async = require('async');

let enums = new Enums();
let errorCode = new ErrorCode();

let adminAuth = new AdminAuth(REDIS_HOST, REDIS_PORT, null, REDIS_PASSWORD);

// relative XML file path
let PROTOCOL_PATH = "protocol";

let contributeProtocolService = "/irext-server/contribution/contribute_protocol";
let contributeBrandsService = "/irext-server/contribution/contribute_brands";
let contributeRemoteIndexesService = "/irext-server/contribution/contribute_remote_indexes";
let createRemoteRefService = "/irext-server/remote_ref/create_remote_ref";

exports.listCategoriesWorkUnit = function (lang, from, count, callback) {
    let conditions = {
        status: enums.ITEM_VALID
    };

    let language = "en-US";
    if (undefined !== lang && null !== lang && -1 !== lang.indexOf("zh-CN")) {
        language = "zh-CN";
    }
    Category.listRemoteCategories(conditions, from, count, "id", function (listCategoriesErr, categories) {
        if (language === "en-US" && listCategoriesErr.code === errorCode.SUCCESS.code && null !== categories) {
            // cover field 'name' with 'name_en'
            for (let i = 0; i < categories.length; i++) {
                if (parseInt(categories[i].id) === enums.CATEGORY_STB) {
                    categories.splice(i, 1);
                    i--;
                    continue;
                }
                categories[i].name = categories[i].name_en;
            }
        }
        callback(listCategoriesErr, categories);
    });
};

exports.listBrandsWorkUnit = function (lang, categoryID, from, count, callback) {
    let conditions = {
        status: orm.gt(parseInt(enums.ITEM_INVALID)),
        category_id: categoryID
    };

    let language = "en-US";
    if (undefined !== lang && null !== lang && -1 !== lang.indexOf("zh-CN")) {
        language = "zh-CN";
    }
    Brand.listBrands(conditions, from, count, "priority", function (listBrandsErr, brands) {
        if (language === "en-US" && listBrandsErr.code === errorCode.SUCCESS.code && null !== brands) {
            // cover field 'name' with 'name_en'
            for (let i = 0; i < brands.length; i++) {
                brands[i].name = brands[i].name_en;
            }
        }
        callback(listBrandsErr, brands);
    });
};

exports.listUnpublishedBrandsWorkUnit = function (callback) {
    let conditions = {
        status: enums.ITEM_VERIFY
    };
    Brand.listBrands(conditions, 0, 100, "priority", function (getBrandByIDErr, brands) {
        callback(getBrandByIDErr, brands);
    });
};

exports.listProvincesWorkUnit = function (lang, callback) {
    let language = "en-US";
    if (undefined !== lang && null !== lang && -1 !== lang.indexOf("zh-CN")) {
        language = "zh-CN";
    }
    City.listProvinces(function (listProvincesErr, provinces) {
        if (language !== "zh-CN") {
            provinces = [];
        }
        callback(listProvincesErr, provinces);
    });
};

exports.listCitiesWorkUnit = function (lang, provincePrefix, callback) {
    let language = "en-US";
    if (undefined !== lang && null !== lang && -1 !== lang.indexOf("zh-CN")) {
        language = "zh-CN";
    }
    City.listCities(provincePrefix, function (listCitiesErr, cities) {
        if (language !== "zh-CN") {
            cities = [];
        }
        callback(listCitiesErr, cities);
    });
};

exports.listOperatorsWorkUnit = function (lang, cityCode, from, count, callback) {
    let language = "en-US";
    if (undefined !== lang && null !== lang && -1 !== lang.indexOf("zh-CN")) {
        language = "zh-CN";
    }
    let conditions = {
        city_code: cityCode,
        status: enums.ITEM_VALID
    };
    StbOperator.listStbOperators(conditions, from, count, "id", function (listOperatorsErr, operators) {
        if (language !== "zh-CN") {
            operators = [];
        }
        callback(listOperatorsErr, operators);
    });
};

exports.listRemoteIndexesWorkUnit = function (lang, categoryID, brandID, cityCode, operatorID, from, count, callback) {
    let language = "en-US";
    let categoryNameEn = "";
    let brandNameEn = "";
    let conditions;
    let listCollectRemotesConditions;

    if (undefined !== lang && null !== lang && -1 !== lang.indexOf("zh-CN")) {
        language = "zh-CN";
    }
    Category.getCategoryByID(categoryID, function(getCategoryByIDErr, category) {
        if (null != category) {
            categoryNameEn = category.name_en;
            if (parseInt(categoryID) === enums.CATEGORY_AC ||
                parseInt(categoryID) === enums.CATEGORY_TV ||
                parseInt(categoryID) === enums.CATEGORY_NW ||
                parseInt(categoryID) === enums.CATEGORY_IPTV ||
                parseInt(categoryID) === enums.CATEGORY_DVD ||
                parseInt(categoryID) === enums.CATEGORY_FAN ||
                parseInt(categoryID) === enums.CATEGORY_PROJECTOR ||
                parseInt(categoryID) === enums.CATEGORY_STEREO ||
                parseInt(categoryID) === enums.CATEGORY_LIGHT_BULB ||
                parseInt(categoryID) === enums.CATEGORY_BSTB ||
                parseInt(categoryID) === enums.CATEGORY_CLEANING_ROBOT ||
                parseInt(categoryID) === enums.CATEGORY_AIR_CLEANER ||
                parseInt(categoryID) === enums.CATEGORY_DYSON) {
                Brand.getBrandByID(brandID, function (getBrandByIDErr, brand) {
                    if (null != brand) {
                        brandNameEn = brand.name_en;
                        conditions = {
                            category_id: categoryID,
                            brand_id: brandID,
                            status: orm.gt(enums.ITEM_INVALID)
                        };
                        RemoteIndex.listRemoteIndexes(conditions, from, count, "priority",
                            function(listRemoteIndexesErr, remoteIndexes) {
                                if (listRemoteIndexesErr.code === errorCode.SUCCESS.code &&
                                    null !== remoteIndexes) {
                                    for (let i = 0; i < remoteIndexes.length; i++) {
                                        if (language === "en-US") {
                                            // cover field 'name' with 'name_en'
                                            remoteIndexes[i].category_name = categoryNameEn;
                                            remoteIndexes[i].brand_name = brandNameEn;
                                        }
                                        remoteIndexes[i].para = 0;
                                    }
                                }
                                // append IRIS indexes
                                listCollectRemotesConditions = {
                                    category_id: parseInt(categoryID),
                                    brand_id: parseInt(brandID),
                                    status: parseInt(enums.COLLECT_REMOTE_STATUS_CONFIRMED)
                                }
                                CollectRemote.listCollectRemotes(listCollectRemotesConditions,
                                    from, count, "update_time", function(listCollectRemotesErr, collectRemotes) {
                                        if (null != collectRemotes && collectRemotes.length > 0) {
                                            for (let i = 0; i < collectRemotes.length; i++) {
                                                collectRemotes[i].para = 1;
                                            }
                                        }
                                        remoteIndexes.push.apply(remoteIndexes, collectRemotes);
                                        callback(listRemoteIndexesErr, remoteIndexes);
                                    });
                            });
                    } else {
                        logger.error("brand is invalid : " + brandID);
                        callback(errorCode.INVALID_BRAND, null);
                    }
                });
            } else if (parseInt(categoryID) === enums.CATEGORY_STB) {
                if (!operatorID) {
                    conditions = {
                        category_id: categoryID,
                        city_code: cityCode,
                        status: orm.gt(enums.ITEM_INVALID)
                    };
                } else {
                    conditions = {
                        category_id: categoryID,
                        city_code: cityCode,
                        operator_id: operatorID,
                        status: orm.gt(enums.ITEM_INVALID)
                    };
                }
                RemoteIndex.listRemoteIndexes(conditions, from, count, "priority",
                    function(listRemoteIndexesErr, remoteIndexes) {
                        for (let i = 0; i < remoteIndexes.length; i++) {
                            if (language === "en-US") {
                                // cover field 'name' with 'name_en'
                                remoteIndexes[i].category_name = categoryNameEn;
                                remoteIndexes[i].brand_name = brandNameEn;
                            }
                            remoteIndexes[i].para = 0;
                        }
                        // append IRIS indexes
                        if (!operatorID) {
                            listCollectRemotesConditions = {
                                category_id: parseInt(categoryID),
                                city_code: cityCode,
                                status: parseInt(enums.COLLECT_REMOTE_STATUS_CONFIRMED)
                            };
                        } else {
                            listCollectRemotesConditions = {
                                category_id: parseInt(categoryID),
                                city_code: cityCode,
                                operator_id: operatorID,
                                status: parseInt(enums.COLLECT_REMOTE_STATUS_CONFIRMED)
                            };
                        }
                        CollectRemote.listCollectRemotes(listCollectRemotesConditions,
                            from, count, "update_time", function(listCollectRemotesErr, collectRemotes) {
                                if (null != collectRemotes && collectRemotes.length > 0) {
                                    for (let i = 0; i < collectRemotes.length; i++) {
                                        collectRemotes[i].para = 0;
                                    }
                                }
                                remoteIndexes.push.apply(remoteIndexes, collectRemotes);
                                callback(listRemoteIndexesErr, remoteIndexes);
                            });
                    });
            } else {
                callback(errorCode.INVALID_CATEGORY, null);
            }
        } else {
            callback(errorCode.INVALID_CATEGORY, null);
        }
    });
};

exports.searchRemoteIndexesWorkUnit = function (lang, remoteMap, from, count, callback) {
    let language = "en-US";
    if (undefined !== lang && null !== lang && -1 !== lang.indexOf("zh-CN")) {
        language = "zh-CN";
    }
    let remoteIndexCollection = [];

    let conditions = {
        remote_map: orm.like("%" + remoteMap + "%")
    };

    RemoteIndex.listRemoteIndexes(conditions, from, count, "priority",
        function(listRemoteIndexesErr, remoteIndexes) {
            if (language === "en-US") {
                async.eachSeries(remoteIndexes, function (remoteIndex, innerCallback) {
                    // handle i18n for en-US
                    let categoryID = remoteIndex.category_id;
                    Category.getCategoryByID(categoryID, function(getCategoryErr, category) {
                        if (errorCode.SUCCESS.code === getCategoryErr.code && null != category) {
                            if (parseInt(categoryID) === enums.CATEGORY_AC ||
                                parseInt(categoryID) === enums.CATEGORY_TV ||
                                parseInt(categoryID) === enums.CATEGORY_NW ||
                                parseInt(categoryID) === enums.CATEGORY_IPTV ||
                                parseInt(categoryID) === enums.CATEGORY_DVD ||
                                parseInt(categoryID) === enums.CATEGORY_FAN ||
                                parseInt(categoryID) === enums.CATEGORY_PROJECTOR ||
                                parseInt(categoryID) === enums.CATEGORY_STEREO ||
                                parseInt(categoryID) === enums.CATEGORY_LIGHT_BULB ||
                                parseInt(categoryID) === enums.CATEGORY_BSTB ||
                                parseInt(categoryID) === enums.CATEGORY_CLEANING_ROBOT ||
                                parseInt(categoryID) === enums.CATEGORY_AIR_CLEANER ||
                                parseInt(categoryID) === enums.CATEGORY_DYSON) {
                                remoteIndex.category_name = category.name_en;
                                let brandID = remoteIndex.brand_id;
                                Brand.getBrandByID(brandID, function(getBrandErr, brand) {
                                    if (errorCode.SUCCESS.code === getBrandErr.code && null != brand) {
                                        remoteIndex.brand_name = brand.name_en;
                                        remoteIndexCollection.push(remoteIndex);
                                        innerCallback();
                                    } else {
                                        remoteIndexCollection.push(remoteIndex);
                                        innerCallback();
                                    }
                                });
                            } else if (parseInt(categoryID) === enums.CATEGORY_STB) {
                                // do not add STB in en-US language case
                            }
                        } else {
                            innerCallback();
                        }
                    });
                }, function (err) {
                    callback(listRemoteIndexesErr, remoteIndexCollection);
                });
            } else {
                callback(listRemoteIndexesErr, remoteIndexes);
            }
        });
};

exports.downloadRemoteBinCachedWorkUnit = function (adminId, token, remoteIndexID, callback) {
    RemoteIndex.getRemoteIndexByID(remoteIndexID, function (getRemoteIndexErr, remoteIndex) {
        if (errorCode.SUCCESS.code === getRemoteIndexErr.code && null != remoteIndex) {
            let fileName = "irda_" + remoteIndex.protocol + "_" + remoteIndex.remote + ".bin";
            let localBinFileName = FILE_TEMP_PATH + "/" + fileName;

            let error = errorCode.SUCCESS;

            fs.exists(localBinFileName, function (exists) {
                if (exists) {
                    logger.info("file " + localBinFileName + " already exists, serve directly");
                    // create remote reference of this remote index
                    let categoryId = 0;
                    let categoryName = '';
                    let brandId = 0;
                    let brandName = '';
                    let name = '';
                    let remoteRef = null;
                    RemoteIndex.getRemoteIndexByID(remoteIndexID, function (getRemoteIndexErr, remoteIndex) {
                        if (errorCode.SUCCESS.code === getRemoteIndexErr.code) {
                            categoryId = remoteIndex.category_id;
                            brandId = remoteIndex.brand_id;
                            Category.getCategoryByID(categoryId, function (getCategoryErr, category) {
                                if (errorCode.SUCCESS.code === getCategoryErr.code) {
                                    categoryName = category.name;
                                    if (enums.CATEGORY_STB !== categoryId) {
                                        Brand.getBrandByID(brandId, function (getBrandErr, brand) {
                                            if (errorCode.SUCCESS.code === getBrandErr.code) {
                                                brandName = brand.name;
                                                name = brandName + categoryName;
                                                remoteRef = {
                                                    "name": name,
                                                    "categoryId": categoryId,
                                                    "categoryName": categoryName,
                                                    "brandId": brandId,
                                                    "brandName": brandName,
                                                    "cityCode": "",
                                                    "operatorId": 0,
                                                    "remoteCode": "",
                                                    "subCate": remoteIndex.sub_cate,
                                                    "protocol": remoteIndex.protocol,
                                                    "remote": remoteIndex.remote,
                                                    "remoteMap": remoteIndex.remote_map,
                                                }
                                                let queryParams = new Map();
                                                let requestSender =
                                                    new RequestSender(EXTERNAL_SERVER_ADDRESS,
                                                        EXTERNAL_SERVER_PORT,
                                                        createRemoteRefService,
                                                        queryParams);
                                                let createRemoteRefRequest = {
                                                    "id": adminId,
                                                    "token": token,
                                                    "remoteRef": remoteRef,
                                                };
                                                requestSender.sendPostRequest(createRemoteRefRequest,
                                                    function (createRemoteRefErr, createRemoteRefResponse) {
                                                        logger.info(createRemoteRefErr);
                                                    });
                                            }
                                        });
                                    } else {
                                        name = categoryName + "-" + remoteIndex.city_code + "-" + remoteIndex.operator_id;
                                        remoteRef = {
                                            "name": name,
                                            "categoryId": categoryId,
                                            "categoryName": categoryName,
                                            "brandId": 0,
                                            "brandName": "",
                                            "cityCode": remoteIndex.city_code,
                                            "operatorId": remoteIndex.operator_id,
                                            "remoteCode": "",
                                            "subCate": remoteIndex.sub_cate,
                                            "protocol": remoteIndex.protocol,
                                            "remote": remoteIndex.remote,
                                            "remoteMap": remoteIndex.remote_map,
                                        }
                                        let queryParams = new Map();
                                        let requestSender =
                                            new RequestSender(EXTERNAL_SERVER_ADDRESS,
                                                EXTERNAL_SERVER_PORT,
                                                createRemoteRefService,
                                                queryParams);
                                        let createRemoteRefRequest = {
                                            "id": adminId,
                                            "token": token,
                                            "remoteRef": remoteRef,
                                        };
                                        requestSender.sendPostRequest(createRemoteRefRequest,
                                            function (createRemoteRefErr, createRemoteRefResponse) {
                                                logger.info(createRemoteRefErr);
                                            });
                                    }
                                }
                            });
                        }
                    });

                    callback(error, localBinFileName);
                } else {
                    logger.info("file " + localBinFileName + " does not exist");
                    error = errorCode.FAILED;
                    callback(error, null);
                }
            });
        } else {
            logger.error("no valid remote index found by ID " + remoteIndexID);
            callback(errorCode.FAILED, null);
        }
    });
};

exports.listIRProtocolsWorkUnit = function (from, count, callback) {
    let conditions = {
        status: orm.gt(enums.ITEM_INVALID)
    };
    IRProtocol.listIRProtocols(conditions, from, count, "name", function (listIRProtocolsErr, IRProtocols) {
        callback(listIRProtocolsErr, IRProtocols);
    });
};



// Ultilities
function checksum(str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}
