"use strict";
var async_1 = require('async');
var restify_validators_1 = require('restify-validators');
var nodejs_utils_1 = require('nodejs-utils');
var restify_errors_1 = require('restify-errors');
var middleware_1 = require('./../auth/middleware');
var models_1 = require('./../auth/models');
var main_1 = require('../../main');
var user_schema = require('./../../test/api/user/schema');
function create(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.post(namespace, restify_validators_1.has_body, restify_validators_1.mk_valid_body_mw(user_schema), function (req, res, next) {
        var User = main_1.c.collections['user_tbl'];
        User.create(req.body).exec(function (error, user) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            else if (!user)
                return next(restify_errors_1.NotFoundError('User'));
            models_1.AccessToken().add(req.body.email, 'login', function (err, access_token) {
                if (err)
                    return next(restify_errors_1.fmtError(err));
                res.setHeader('X-Access-Token', access_token);
                res.json(201, user);
                return next();
            });
        });
    });
}
exports.create = create;
function read(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.get(namespace, middleware_1.has_auth(), function (req, res, next) {
        var User = main_1.c.collections['user_tbl'];
        User.findOne({ email: req['user_id'] }, function (error, user) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            else if (!user)
                return next(new restify_errors_1.NotFoundError('User'));
            res.json(user);
            return next();
        });
    });
}
exports.read = read;
function update(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.put(namespace, restify_validators_1.remove_from_body(['email']), restify_validators_1.has_body, restify_validators_1.mk_valid_body_mw(user_schema, false), restify_validators_1.mk_valid_body_mw_ignore(user_schema, ['Missing required property']), middleware_1.has_auth(), function (req, res, next) {
        if (!nodejs_utils_1.isShallowSubset(req.body, user_schema.properties))
            return res.json(400, {
                error: 'ValidationError',
                error_message: 'Invalid keys detected in body'
            }) && next();
        else if (!req.body || !Object.keys(req.body).length)
            return res.json(400, { error: 'ValidationError', error_message: 'Body required' }) && next();
        var User = main_1.c.collections['user_tbl'];
        async_1.waterfall([
            function (cb) { return User.findOne({ email: req['user_id'] }, function (err, user) {
                if (err)
                    cb(err);
                else if (!user)
                    cb(new restify_errors_1.NotFoundError('User'));
                return cb(err, user);
            }); },
            function (user, cb) {
                return User.update(user, req.body, function (e, r) { return cb(e, r[0]); });
            }
        ], function (error, result) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            res.json(200, result);
            return next();
        });
    });
}
exports.update = update;
function del(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.del(namespace, middleware_1.has_auth(), function (req, res, next) {
        var User = main_1.c.collections['user_tbl'];
        async_1.waterfall([
            function (cb) { return models_1.AccessToken().logout({ user_id: req['user_id'] }, cb); },
            function (cb) { return User.destroy({ email: req['user_id'] }, cb); }
        ], function (error) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            res.send(204);
            return next();
        });
    });
}
exports.del = del;
