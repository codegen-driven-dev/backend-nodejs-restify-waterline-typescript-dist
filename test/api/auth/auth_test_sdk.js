"use strict";
var supertest = require("supertest");
var chai = require("chai");
var chai_1 = require("chai");
var async_1 = require("async");
var nodejs_utils_1 = require("nodejs-utils");
var restify_errors_1 = require("restify-errors");
var chaiJsonSchema = require("chai-json-schema");
var user_mocks_1 = require("../user/user_mocks");
var models_1 = require("../../../api/user/models");
var user_schema = nodejs_utils_1.sanitiseSchema(require('./../user/schema.json'), models_1.User._omit);
var auth_schema = require('./schema.json');
chai.use(chaiJsonSchema);
var AuthTestSDK = (function () {
    function AuthTestSDK(app) {
        this.app = app;
    }
    AuthTestSDK.prototype.register = function (user, cb) {
        if (!user)
            return cb(new TypeError('user argument to register must be defined'));
        supertest(this.app)
            .post('/api/user')
            .set('Connection', 'keep-alive')
            .send(user)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(restify_errors_1.fmtError(res.error));
            try {
                chai_1.expect(res.status).to.be.equal(201);
                chai_1.expect(res.body).to.be.an('object');
                chai_1.expect(res.body).to.be.jsonSchema(user_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    AuthTestSDK.prototype.login = function (user, cb) {
        if (!user)
            return cb(new TypeError('user argument to login must be defined'));
        supertest(this.app)
            .post('/api/auth')
            .set('Connection', 'keep-alive')
            .send(user)
            .expect('Content-Type', /json/)
            .expect(201)
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(res.error);
            try {
                chai_1.expect(res.body).to.be.an('object');
                chai_1.expect(res.body).to.have.property('access_token');
                chai_1.expect(res.body).to.be.jsonSchema(auth_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    AuthTestSDK.prototype.get_user = function (access_token, user, cb) {
        if (!access_token)
            return cb(new TypeError('access_token argument to get_user must be defined'));
        supertest(this.app)
            .get('/api/user')
            .set('X-Access-Token', access_token)
            .set('Connection', 'keep-alive')
            .end(function (err, res) {
            if (err)
                return cb(err);
            else if (res.error)
                return cb(res.error);
            try {
                chai_1.expect(res.body).to.be.an('object');
                Object.keys(user).map(function (attr) { return chai_1.expect(user[attr] === res.body[attr]); });
                chai_1.expect(res.body).to.be.jsonSchema(user_schema);
            }
            catch (e) {
                err = e;
            }
            finally {
                cb(err, res);
            }
        });
    };
    AuthTestSDK.prototype.logout = function (access_token, cb) {
        if (!access_token)
            return cb(new TypeError('access_token argument to logout must be defined'));
        supertest(this.app)
            .delete('/api/auth')
            .set('Connection', 'keep-alive')
            .set('X-Access-Token', access_token)
            .expect(204)
            .end(cb);
    };
    AuthTestSDK.prototype.unregister = function (ident, cb) {
        if (!ident)
            return cb(new TypeError('ident argument to unregister must be defined'));
        if (ident.access_token)
            supertest(this.app)
                .delete('/api/user')
                .set('Connection', 'keep-alive')
                .set('X-Access-Token', ident.access_token)
                .expect(204)
                .end(cb);
        else
            supertest(this.app)
                .delete('/api/user')
                .set('Connection', 'keep-alive')
                .send({ email: ident.user_id })
                .expect(204)
                .end(cb);
    };
    AuthTestSDK.prototype.unregister_all = function (users, done) {
        var _this = this;
        async_1.map(users, function (user, callback) {
            return async_1.waterfall([
                function (cb) { return _this.login(user, function (err, res) {
                    return err ? cb(err) : cb(null, res.body.access_token);
                }); },
                function (access_token, cb) {
                    return _this.unregister({ access_token: access_token }, function (err, res) {
                        return cb(err, access_token);
                    });
                },
            ], callback);
        }, done);
    };
    AuthTestSDK.prototype.register_login = function (user, num_or_done, done) {
        var _this = this;
        if (!done) {
            done = num_or_done;
            num_or_done = 0;
        }
        user = user || user_mocks_1.user_mocks.successes[num_or_done];
        async_1.series([
            function (cb) { return _this.register(user, cb); },
            function (cb) { return _this.login(user, cb); }
        ], function (err, results) {
            if (err)
                return done(err);
            return done(err, results[1].get('x-access-token'));
        });
    };
    AuthTestSDK.prototype.logout_unregister = function (user, num_or_done, done) {
        if (!done) {
            done = num_or_done;
            num_or_done = 0;
        }
        user = user || user_mocks_1.user_mocks.successes[num_or_done];
        if (!user)
            return done(new TypeError('user undefined in `logout_unregister`'));
        this.unregister_all([user], done);
    };
    return AuthTestSDK;
}());
exports.AuthTestSDK = AuthTestSDK;
