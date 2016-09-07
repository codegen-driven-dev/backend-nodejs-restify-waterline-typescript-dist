"use strict";
var node_uuid_1 = require('node-uuid');
var main_1 = require('./../../main');
var restify_errors_1 = require('restify-errors');
exports.AccessToken = function () {
    var redis = main_1.redis_cursors.redis;
    return {
        _type: 'redis',
        findOne: function (access_token, cb) { return redis.get(access_token, function (err, user_id) {
            if (err)
                return cb(err);
            else if (!user_id)
                return cb(new restify_errors_1.NotFoundError('AccessToken'));
            return cb(void 0, user_id);
        }); },
        deleteOne: function (access_token) { return redis.del(access_token); },
        add: function (user_id, scope) {
            var new_key = scope + "::" + node_uuid_1.v4();
            var t = redis.multi();
            t.set(new_key, user_id);
            t.sadd(user_id, new_key);
            t.exec();
            return new_key;
        },
        logout: function logout(redis) {
            return function (id, cb) {
                if (id.user_id)
                    redis.smembers(id.user_id, function (err, res) {
                        if (err)
                            return cb(err);
                        var errors = Array();
                        var t = redis.multi();
                        res.forEach(function (token) { return t.del(token, function (e, r) {
                            if (e)
                                errors.push(e);
                        }); });
                        if (errors.length)
                            return cb(new restify_errors_1.GenericError({
                                statusCode: 400,
                                error: 'LogoutErrors',
                                error_message: JSON.stringify(errors)
                            }));
                        t.del(id.user_id, function (e, r) {
                            if (e)
                                errors.push(e);
                        });
                        t.exec();
                        if (errors.length)
                            return cb(new restify_errors_1.GenericError({
                                statusCode: 400,
                                error: 'LogoutErrors',
                                error_message: JSON.stringify(errors)
                            }));
                        return cb(null);
                    });
                else if (id.access_token)
                    redis.get(id.access_token, function (err, user_id) {
                        if (err)
                            return cb(err);
                        else if (!user_id)
                            return cb(new restify_errors_1.GenericError({
                                statusCode: 410,
                                error: 'AlreadyDone',
                                error_message: 'User already logged out'
                            }));
                        return logout(redis)({ user_id: user_id }, cb);
                    });
                else
                    return cb(new restify_errors_1.GenericError({
                        statusCode: 400,
                        error: 'ConstraintError',
                        error_message: "Can't logout without user_id or access token"
                    }));
            };
        }(redis)
    };
};
