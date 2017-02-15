"use strict";
var restify_errors_1 = require("restify-errors");
var restify_validators_1 = require("restify-validators");
var main_1 = require("../../main");
var middleware_1 = require("../auth/middleware");
var contact_schema = require('./../../test/api/contact/schema');
function create(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    function add_owner_mw(req, res, next) {
        req.body.owner = req['user_id'];
        return next();
    }
    app.post(namespace, middleware_1.has_auth(), restify_validators_1.has_body, add_owner_mw, restify_validators_1.mk_valid_body_mw(contact_schema), function (req, res, next) {
        var Contact = main_1.c.collections['contact_tbl'];
        Contact.create(req.body).exec(function (error, contact) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            else if (!contact)
                return next(new restify_errors_1.NotFoundError('Contact'));
            res.json(201, contact);
            return next();
        });
    });
}
exports.create = create;
function read(app, namespace) {
    if (namespace === void 0) { namespace = ""; }
    app.get(namespace, middleware_1.has_auth(), function (req, res, next) {
        var Contact = main_1.c.collections['contact_tbl'];
        Contact.find({ owner: req['user_id'] }, function (error, contacts) {
            if (error)
                return next(restify_errors_1.fmtError(error));
            else if (!contacts)
                return next(new restify_errors_1.NotFoundError('Contact'));
            res.json({ contacts: contacts, owner: req['user_id'] });
            return next();
        });
    });
}
exports.read = read;
