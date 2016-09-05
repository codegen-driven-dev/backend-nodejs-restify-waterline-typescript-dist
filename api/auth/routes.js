"use strict";
var async_1 = require('async');
var restify_validators_1 = require('restify-validators');
var restify_errors_1 = require('restify-errors');
var middleware_1 = require('./middleware');
var models_1 = require('./models');
var main_1 = require('../../main');
var user_schema = require('./../../test/api/user/schema');
function login(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.post(namespace, restify_validators_1.has_body, restify_validators_1.mk_valid_body_mw(user_schema), function (req, res, next) {
        var User = main_1.c.collections['user_tbl'];
        async_1.waterfall([
            function (cb) { return User.findOne({
                email: req.body.email,
                password: req.body.password
            }, function (err, user) {
                return cb(err ? err : !user ? new restify_errors_1.NotFoundError('User') : null);
            }); },
            function (cb) { return cb(null, models_1.AccessToken().add(req.body.email, 'login')); }
        ], function (error, access_token) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            res.setHeader('X-Access-Token', access_token);
            res.json(201, { access_token: access_token });
            return next();
        });
    });
}
exports.login = login;
function logout(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.del(namespace, middleware_1.has_auth('login'), function (req, res, next) {
        models_1.AccessToken().logout({ access_token: req.headers['x-access-token'] }, function (error) {
            if (error)
                res.json(400, error);
            else
                res.send(204);
            return next();
        });
    });
}
exports.logout = logout;
