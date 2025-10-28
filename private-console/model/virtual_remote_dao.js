/**
 * Created by strawmanbobi
 * 2016-11-27
 */

// global inclusion
let kvConn = require('../mini_poem/db/mongodb/mongodb_connection');
let logger = require('../mini_poem/logging/logger4js').helper;
let Map = require('../mini_poem/mem/map');

// local inclusion
let ErrorCode = require('../constants/error_code');
let errorCode = new ErrorCode();

let VirtualRemote = function() {
};

let remoteMap = new Map();

VirtualRemote.prototype.findRemoteByKey = function(protocol, remote, remoteKey, code, callback) {
    // traverse all collections per remote
    let collectionName = remote + "_" + protocol;
    let vRemote = remoteMap.get(collectionName);
    if(null == vRemote) {
        try {
            vRemote = kvConn.defineByCollection(collectionName, {
                    key_name: String,
                    key_value: String,
                    key_codes: String
                },
                collectionName);
            logger.info("this is a new remote collection, add it to remote map");
            remoteMap.set(collectionName, vRemote);
        } catch(e) {
            logger.error(e);
        }
    }

    vRemote.findOne({
            $or:[ {key_name : remoteKey}, {key_name : remoteKey.toUpperCase()} ]
        }, function(findOneRemoteByKeyErr, remote) {
            if(findOneRemoteByKeyErr) {
                logger.error("find one remote by key error : " + findOneRemoteByKeyErr);
                callback(errorCode.FAILED, null);
            } else {
                callback(errorCode.SUCCESS, remote);
            }
        }
    );
};

module.exports = VirtualRemote;