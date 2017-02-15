"use strict";
var supertest = require("supertest");
var chai = require("chai");
var chai_1 = require("chai");
var nodejs_utils_1 = require("nodejs-utils");
var restify_errors_1 = require("restify-errors");
var chaiJsonSchema = require("chai-json-schema");
var models_1 = require("../../../api/user/models");
var user_schema = nodejs_utils_1.sanitiseSchema(require('./../user/schema.json'), models_1.User._omit);
var contact_schema = require('./schema.json');
chai.use(chaiJsonSchema);
var AddressBookTestSDK = (function () {
    function AddressBookTestSDK(app) {
        this.app = app;
    }
    AddressBookTestSDK.prototype.create = function (access_token, contact, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `create` must be defined'));
        else if (!contact)
            return cb(new TypeError('`contact` argument to `create` must be defined'));
        supertest(this.app)
            .post('/api/contact')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(contact)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(restify_errors_1.fmtError(res.error));
            try {
                chai_1.expect(res.status).to.be.equal(201);
                chai_1.expect(res.body).to.be.an('object');
                chai_1.expect(res.body).to.be.jsonSchema(contact_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    AddressBookTestSDK.prototype.getAll = function (access_token, contact, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (!contact)
            return cb(new TypeError('`contact` argument to `getAll` must be defined'));
        supertest(this.app)
            .get('/api/contact')
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
                chai_1.expect(res.body).to.have.property('owner');
                chai_1.expect(res.body).to.have.property('contacts');
                chai_1.expect(res.body.contacts).to.be.instanceOf(Array);
                res.body.contacts.map(function (contact) {
                    chai_1.expect(contact).to.be.an('object');
                    chai_1.expect(contact).to.be.jsonSchema(contact_schema);
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
    AddressBookTestSDK.prototype.retrieve = function (access_token, contact, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `getAll` must be defined'));
        else if (!contact)
            return cb(new TypeError('`contact` argument to `getAll` must be defined'));
        supertest(this.app)
            .get("/api/contact/" + contact.email)
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
                chai_1.expect(res.body).to.be.an('object');
                chai_1.expect(res.body).to.be.jsonSchema(contact_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    AddressBookTestSDK.prototype.update = function (access_token, initial_contact, updated_contact, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `update` must be defined'));
        else if (!initial_contact)
            return cb(new TypeError('`initial_contact` argument to `update` must be defined'));
        else if (!updated_contact)
            return cb(new TypeError('`updated_contact` argument to `update` must be defined'));
        else if (initial_contact.owner !== updated_contact.owner)
            return cb(new ReferenceError(initial_contact.owner + " != " + updated_contact.owner + " (`owner`s between contacts)"));
        supertest(this.app)
            .put("/api/contact/" + initial_contact.email)
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .send(updated_contact)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(res.error);
            try {
                chai_1.expect(res.body).to.be.an('object');
                Object.keys(updated_contact).map(function (attr) { return chai_1.expect(updated_contact[attr]).to.be.equal(res.body[attr]); });
                chai_1.expect(res.body).to.be.jsonSchema(contact_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    AddressBookTestSDK.prototype.destroy = function (access_token, contact, cb) {
        if (!access_token)
            return cb(new TypeError('`access_token` argument to `destroy` must be defined'));
        else if (!contact)
            return cb(new TypeError('`contact` argument to `destroy` must be defined'));
        supertest(this.app)
            .del("/api/contact/" + contact.email)
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
    return AddressBookTestSDK;
}());
exports.AddressBookTestSDK = AddressBookTestSDK;
