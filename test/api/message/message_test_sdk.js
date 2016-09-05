"use strict";
var supertest = require('supertest');
var chai = require('chai');
var chai_1 = require('chai');
var nodejs_utils_1 = require('nodejs-utils');
var restify_errors_1 = require('restify-errors');
var chaiJsonSchema = require('chai-json-schema');
var models_1 = require('../../../api/user/models');
var user_schema = nodejs_utils_1.sanitiseSchema(require('./../user/schema.json'), models_1.User._omit);
var message_schema = require('./schema.json');
chai.use(chaiJsonSchema);
var MessageTestSDK = (function () {
    function MessageTestSDK(app) {
        this.app = app;
    }
    MessageTestSDK.prototype.create = function (access_token, msg, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `create` must be defined'));
        else if (!msg)
            return cb(new TypeError('`msg` argument to `create` must be defined'));
        supertest(this.app)
            .post("/api/message/" + msg.to)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(msg)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(restify_errors_1.fmtError(res.error));
            try {
                chai_1.expect(res.status).to.be.equal(201);
                chai_1.expect(res.body).to.be.an('object');
                chai_1.expect(res.body).to.be.jsonSchema(message_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    MessageTestSDK.prototype.getAll = function (access_token, msg, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (!msg)
            return cb(new TypeError('`msg` argument to `getAll` must be defined'));
        supertest(this.app)
            .get("/api/message/" + msg.to)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(res.error);
            try {
                chai_1.expect(res.body).to.have.property('from');
                chai_1.expect(res.body).to.have.property('to');
                chai_1.expect(res.body).to.have.property('messages');
                chai_1.expect(res.body.messages).to.be.instanceOf(Array);
                res.body.messages.map(function (msg) {
                    chai_1.expect(msg).to.be.an('object');
                    chai_1.expect(msg).to.be.jsonSchema(message_schema);
                });
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    MessageTestSDK.prototype.retrieve = function (access_token, msg, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `retrieve` must be defined'));
        else if (!msg)
            return cb(new TypeError('`msg` argument to `retrieve` must be defined'));
        supertest(this.app)
            .get("/api/message/" + msg.to + "/" + msg.uuid)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(res.error);
            try {
                chai_1.expect(res.body).to.be.an('object');
                chai_1.expect(res.body).to.be.jsonSchema(message_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    MessageTestSDK.prototype.update = function (access_token, initial_msg, updated_msg, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `update` must be defined'));
        else if (!initial_msg)
            return cb(new TypeError('`initial_msg` argument to `update` must be defined'));
        else if (!updated_msg)
            return cb(new TypeError('`updated_msg` argument to `update` must be defined'));
        else if (updated_msg.uuid !== initial_msg.uuid)
            return cb(new ReferenceError(initial_msg.uuid + " != " + updated_msg.uuid + " (`uuid`s between msgs)"));
        else if (updated_msg.to !== undefined && updated_msg.to !== initial_msg.to)
            return cb(new ReferenceError(initial_msg.to + " != " + updated_msg.to + " (`to` between msgs)"));
        supertest(this.app)
            .put("/api/message/" + initial_msg.to + "/" + initial_msg.uuid)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_msg)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(res.error);
            try {
                chai_1.expect(res.body).to.be.an('object');
                Object.keys(updated_msg).map(function (attr) { return chai_1.expect(updated_msg[attr]).to.be.equal(res.body[attr]); });
                chai_1.expect(res.body).to.be.jsonSchema(message_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    MessageTestSDK.prototype.destroy = function (access_token, msg, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (!msg)
            return cb(new TypeError('`msg` argument to `destroy` must be defined'));
        supertest(this.app)
            .del("/api/message/" + msg.to + "/" + msg.uuid)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(res.error);
            try {
                chai_1.expect(res.status).to.be.equal(204);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    return MessageTestSDK;
}());
exports.MessageTestSDK = MessageTestSDK;
