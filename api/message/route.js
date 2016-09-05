"use strict";
var async_1 = require('async');
var restify_validators_1 = require('restify-validators');
var restify_errors_1 = require('restify-errors');
var middleware_1 = require('./../auth/middleware');
var main_1 = require('../../main');
var message_schema = require('./../../test/api/message/schema');
function read(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.get(namespace + "/:to/:uuid", middleware_1.has_auth(), function (req, res, next) {
        var Message = main_1.c.collections['message_tbl'];
        Message.findOne({ from: req['user_id'], to: req.params.to }, function (error, message) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            else if (!message)
                return next(new restify_errors_1.NotFoundError('Message'));
            res.json(message);
            return next();
        });
    });
}
exports.read = read;
function update(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.put(namespace + "/:to/:uuid", restify_validators_1.has_body, restify_validators_1.mk_valid_body_mw(message_schema, false), restify_validators_1.mk_valid_body_mw_ignore(message_schema, ['Missing required property']), middleware_1.has_auth(), function (req, res, next) {
        var Message = main_1.c.collections['message_tbl'];
        async_1.waterfall([
            function (cb) { return Message.findOne({ to: req.params.to, from: req['user_id'], uuid: req.params.uuid }, function (err, msg) {
                if (err)
                    return cb(err);
                else if (!msg)
                    return cb(new restify_errors_1.NotFoundError('Message'));
                return cb(err, msg);
            }); },
            function (msg, cb) {
                return Message.update(msg, req.body, function (e, messages) { return cb(e, messages[0]); });
            }
        ], function (error, message) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            res.json(200, message);
            return next();
        });
    });
}
exports.update = update;
function del(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.del(namespace + "/:to/:uuid", middleware_1.has_auth(), function (req, res, next) {
        var Message = main_1.c.collections['message_tbl'];
        Message.destroy({ to: req.params.to, from: req['user_id'], uuid: req.params.uuid }).exec(function (error) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            res.send(204);
            return next();
        });
    });
}
exports.del = del;
