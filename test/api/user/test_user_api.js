"use strict";
var supertest = require("supertest");
var chai_1 = require("chai");
var async_1 = require("async");
var restify_utils_1 = require("restify-utils");
var main_1 = require("../../../main");
var auth_test_sdk_1 = require("./../auth/auth_test_sdk");
var models_1 = require("./../../../api/auth/models");
var shared_tests_1 = require("../../shared_tests");
var user_mocks_1 = require("./user_mocks");
var models_and_routes = {
    user: main_1.all_models_and_routes['user'],
    auth: main_1.all_models_and_routes['auth'],
};
process.env['NO_SAMPLE_DATA'] = 'true';
var mocks = user_mocks_1.user_mocks.successes.slice(10, 20);
describe('User::routes', function () {
    var sdk, app;
    before(function (done) {
        return async_1.series([
            function (cb) { return shared_tests_1.tearDownConnections(main_1.c.connections, cb); },
            function (cb) { return restify_utils_1.strapFramework(Object.assign({}, main_1.strapFrameworkKwargs, {
                models_and_routes: models_and_routes,
                createSampleData: false,
                start_app: false,
                use_redis: true,
                app_name: 'test-user-api',
                callback: function (err, _app, _connections, _collections) {
                    if (err)
                        return cb(err);
                    main_1.c.connections = _connections;
                    main_1.c.collections = _collections;
                    app = _app;
                    sdk = new auth_test_sdk_1.AuthTestSDK(app);
                    return cb();
                }
            })); }
        ], done);
    });
    after(function (done) { return shared_tests_1.tearDownConnections(main_1.c.connections, done); });
    describe('/api/user', function () {
        beforeEach(function (done) { return sdk.unregister_all(mocks, function () { return done(); }); });
        afterEach(function (done) { return sdk.unregister_all(mocks, function () { return done(); }); });
        it('POST should create user', function (done) {
            return sdk.register(mocks[0], done);
        });
        it('GET should retrieve user', function (done) {
            return async_1.waterfall([
                function (cb) { return sdk.register(mocks[1], function (err) { return cb(err); }); },
                function (cb) { return sdk.login(mocks[1], function (err, res) {
                    return err ? cb(err) : cb(null, res.body.access_token);
                }); },
                function (access_token, cb) {
                    return sdk.get_user(access_token, mocks[1], cb);
                }
            ], done);
        });
        it('PUT should edit user', function (done) {
            return async_1.waterfall([
                function (cb) { return sdk.register(mocks[2], function (err) { return cb(err); }); },
                function (cb) { return sdk.login(mocks[2], function (err, res) {
                    return err ? cb(err) : cb(null, res.body.access_token);
                }); },
                function (access_token, cb) {
                    return supertest(app)
                        .put('/api/user')
                        .set('X-Access-Token', access_token)
                        .set('Connection', 'keep-alive')
                        .send({ title: 'Mr' })
                        .end(cb);
                },
                function (r, cb) {
                    if (r.statusCode / 100 >= 3)
                        return cb(new Error(JSON.stringify(r.text, null, 4)));
                    chai_1.expect(r.body).to.have.all.keys(['createdAt', 'email', 'title', 'updatedAt']);
                    chai_1.expect(r.body.title).equals('Mr');
                    return cb();
                }
            ], done);
        });
        it('DELETE should unregister user', function (done) {
            return async_1.waterfall([
                function (cb) { return sdk.register(mocks[3], function (err) { return cb(err); }); },
                function (cb) { return sdk.login(mocks[3], function (err, res) {
                    return err ? cb(err) : cb(null, res.body.access_token);
                }); },
                function (access_token, cb) {
                    return sdk.unregister({ access_token: access_token }, function (err) {
                        return cb(err, access_token);
                    });
                },
                function (access_token, cb) { return models_1.AccessToken().findOne(access_token, function (e) {
                    return cb(!e ? new Error('Access token wasn\'t invalidated/removed') : null);
                }); },
                function (cb) { return sdk.login(mocks[3], function (e) {
                    return cb(!e ? new Error('User can login after unregister') : null);
                }); }
            ], done);
        });
    });
});
