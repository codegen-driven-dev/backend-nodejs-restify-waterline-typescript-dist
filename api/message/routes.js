"use strict";
var restify_validators_1 = require("restify-validators");
var restify_errors_1 = require("restify-errors");
var main_1 = require("../../main");
var middleware_1 = require("../auth/middleware");
var message_schema = require('./../../test/api/message/schema');
function create(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.post(namespace + "/:to", middleware_1.has_auth(), restify_validators_1.has_body, restify_validators_1.mk_valid_body_mw(message_schema), function (req, res, next) {
        var Message = main_1.c.collections['message_tbl'];
        req.body.from = req['user_id'];
        req.body.to = req.params.to;
        Message.create(req.body).exec(function (error, msg) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            else if (!msg)
                return next(new restify_errors_1.NotFoundError('Message'));
            res.json(201, msg);
            return next();
        });
    });
}
exports.create = create;
function read(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.get(namespace + "/:to", middleware_1.has_auth(), function (req, res, next) {
        var Message = main_1.c.collections['message_tbl'];
        Message.find({ from: req['user_id'], to: req.params.to }, function (error, messages) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            else if (!messages)
                return next(new restify_errors_1.NotFoundError('Message'));
            res.json({ messages: messages, from: req['user_id'], to: req.params.to });
            return next();
        });
    });
}
exports.read = read;
