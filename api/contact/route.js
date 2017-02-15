"use strict";
var async_1 = require("async");
var restify_validators_1 = require("restify-validators");
var restify_errors_1 = require("restify-errors");
var main_1 = require("../../main");
var middleware_1 = require("./../auth/middleware");
var contact_schema = require('./../../test/api/contact/schema');
function read(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.get(namespace + "/:email", middleware_1.has_auth(), function (req, res, next) {
        var Contact = main_1.c.collections['contact_tbl'];
        Contact.findOne({ owner: req['user_id'], email: req.params.email }).exec(function (error, contact) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            else if (!contact)
                return next(new restify_errors_1.NotFoundError('Contact'));
            res.json(contact);
            return next();
        });
    });
}
exports.read = read;
function update(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.put(namespace + "/:email", restify_validators_1.has_body, restify_validators_1.mk_valid_body_mw(contact_schema, false), restify_validators_1.mk_valid_body_mw_ignore(contact_schema, ['Missing required property']), middleware_1.has_auth(), function (req, res, next) {
        var Contact = main_1.c.collections['contact_tbl'];
        async_1.waterfall([
            function (cb) { return Contact.findOne({ owner: req['user_id'], email: req.params.email }).exec(function (err, contact) {
                if (err)
                    return cb(err);
                else if (!contact)
                    return cb(new restify_errors_1.NotFoundError('Contact'));
                return cb(err, contact);
            }); },
            function (contact, cb) {
                return Contact.update(contact, req.body, function (e, contacts) { return cb(e, contacts[0]); });
            }
        ], function (error, contact) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            res.json(200, contact);
            return next();
        });
    });
}
exports.update = update;
function del(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.del(namespace + "/:email", middleware_1.has_auth(), function (req, res, next) {
        var Contact = main_1.c.collections['contact_tbl'];
        Contact.destroy({ owner: req['user_id'], email: req.params.email }).exec(function (error) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            res.send(204);
            return next();
        });
    });
}
exports.del = del;
