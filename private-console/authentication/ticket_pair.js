/**
 * Created by strawmanbobi
 * 2016-12-24 (Xmax eve)
 */

require('../mini_poem/configuration/constants');

let Cache = require('../mini_poem/cache/redis.js');
let logger = require('../mini_poem/logging/logger4js').helper;

let Enums = require('../constants/enums');
let ErrorCode = require('../constants/error_code');

let enums = new Enums();
let errorCode = new ErrorCode();

let TicketPair = function(_cacheHost, _cachePort, _cacheAdmin, _cachePassword) {
    if (!this.cache) {
        this.cache = new Cache(_cacheHost, _cachePort, _cacheAdmin, _cachePassword);
    }
};

TicketPair.prototype.setTicketPair = function(id, ticket, ttl, callback) {
    this.cache.set(id, ticket, ttl, function(setTicketPairErr, data) {
        let error = errorCode.SUCCESS;
        if(setTicketPairErr !== errorCode.SUCCESS.code) {
            error = errorCode.FAILED;
        }
        callback(error, data);
    });
};


TicketPair.prototype.getTicketPair = function(id, callback) {
    let error = errorCode.SUCCESS;
    this.cache.get(id, false, function(getTicketPairErr, result) {
        if(errorCode.SUCCESS.code !== getTicketPairErr) {
            error = errorCode.FAILED;
        }
        callback(error, result);
    });
};

TicketPair.prototype.deleteTicketPair = function(id, callback) {
    let error = errorCode.SUCCESS;
    this.cache.delete(id, function(deleteTicketPairErr) {
        if(deleteTicketPairErr !== errorCode.SUCCESS.code) {
            error = errorCode.FAILED;
        }
        callback(error);
    });
};

module.exports = TicketPair;