/**
 * Created by strawmanbobi
 * 2020-05-07
 */

// global inclusion
let orm = require('orm');
let dbOrm = require('../mini_poem/db/mysql/mysql_connection').mysqlDB;
let logger = require('../mini_poem/logging/logger4js').helper;

// local inclusion
let ErrorCode = require('../constants/error_code');
let Enums = require('../constants/enums');

let errorCode = new ErrorCode();
let enums = new Enums();

let CollectRemote = dbOrm.define('collect_remote',
    {
        id: Number,
        name: String,
        category_id: Number,
        category_name: String,
        brand_id: Number,
        brand_name: String,
        city_code: String,
        city_name: String,
        operator_id: Number,
        operator_name: String,
        protocol: String,
        remote: String,
        remote_map: String,
        status: Number,
        update_time: String,
        contributor: String,
    },
    {
        cache: true
    }
);

CollectRemote.createCollectRemote = function(collectRemote, callback) {
    let date = dateUtils.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss");
    let newCollectRemote = new CollectRemote({
        name: collectRemote.name,
        category_id: collectRemote.category_id,
        category_name: collectRemote.category_name,
        brand_id: collectRemote.brand_id,
        brand_name: collectRemote.brand_name,
        city_code: collectRemote.city_code,
        city_name: collectRemote.city_name,
        operator_id: collectRemote.operator_id,
        operator_name: collectRemote.operator_name,
        protocol: collectRemote.protocol,
        remote: collectRemote.remote,
        remote_map: collectRemote.remote_map,
        status: enums.COLLECT_REMOTE_STATUS_INIT,
        update_time: date,
        contributor: collectRemote.contributor,
    });
    newCollectRemote.save(function(error, createdCollectRemote) {
        if(error) {
            logger.error('failed to create collectRemote : ' + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, createdCollectRemote);
        }
    });
};

CollectRemote.deleteCollectRemote = function(collectRemoteID, callback) {
    CollectRemote.get(collectRemoteID, function (err, collectRemote) {
        if (null !== collectRemote) {
            collectRemote.remove(function (err) {
                if(err) {
                    logger.error('failed to remove collectRemote ' + collectRemoteID);
                    callback(errorCode.FAILED);
                } else {
                    callback(errorCode.SUCCESS);
                }
            });
        } else {
            logger.error('remove collectRemote successfully ' + collectRemoteID);
            callback(errorCode.SUCCESS);
        }
    });
};

CollectRemote.findCollectRemotesByCondition = function(conditions, callback) {
    CollectRemote.find(conditions)
    .run(function (error, collectRemotes) {
        if (error) {
            logger.error("find collectRemote error : " + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, collectRemotes);
        }
    });
};

CollectRemote.listCollectRemotes = function(conditions, from, count, sortField, callback) {
    if("id" === sortField && 0 !== from) {
        conditions.id = orm.lt(from);
        CollectRemote.find(conditions).limit(parseInt(count)).orderRaw("?? DESC", [sortField])
        .run(function (listCollectRemotesErr, collectRemotes) {
            if (listCollectRemotesErr) {
                logger.error("list collectRemotes error : " + listCollectRemotesErr);
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, collectRemotes);
            }
        });
    } else {
        CollectRemote.find(conditions).limit(parseInt(count)).offset(parseInt(from)).orderRaw("?? ASC", [sortField])
        .run(function (listCollectRemotesErr, collectRemotes) {
            if (listCollectRemotesErr) {
                logger.error("list remoteIndexes error : " + listCollectRemotesErr);
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, collectRemotes);
            }
        });
    }
};

CollectRemote.countCollectRemotes = function(conditions, callback) {
    CollectRemote.count(conditions, function(countCollectRemotesErr, collectRemotesCount) {
        if (countCollectRemotesErr) {
            logger.error("count collectRemotes error : " + countCollectRemotesErr);
            callback(errorCode.FAILED, 0);
        } else {
            callback(errorCode.SUCCESS, collectRemotesCount);
        }
    });
};

CollectRemote.getCollectRemoteByID = function(collectRemoteID, callback) {
    CollectRemote.get(collectRemoteID, function(error, collectRemote) {
        if (error) {
            logger.error("get collectRemote by ID error : " + error);
            callback(errorCode.FAILED, null);
        } else {
            callback(errorCode.SUCCESS, collectRemote);
        }
    });
};

CollectRemote.updateCollectRemote = function(collectRemoteID, newCollectRemote, callback) {
    CollectRemote.get(collectRemoteID, function(error, collectRemote) {
        if (error) {
            logger.error("get collectRemote by ID error in update collectRemote : " + error);
            callback(errorCode.FAILED, null);
        } else {
            logger.info("get collectRemote by ID successfully in update collectRemote");

            for (let prop in collectRemote) {
                if (undefined !== newCollectRemote[prop] && null !== newCollectRemote[prop]) {
                    collectRemote[prop] = newCollectRemote[prop];
                }
            }

            collectRemote.save(function(error, updatedCollectRemote) {
                if(error) {
                    logger.error('failed to update collectRemote : ' + error);
                    callback(errorCode.FAILED, null);
                } else {
                    callback(errorCode.SUCCESS, updatedCollectRemote);
                }
            });
        }
    });
};

module.exports = CollectRemote;