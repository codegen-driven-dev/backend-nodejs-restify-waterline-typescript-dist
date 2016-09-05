"use strict";
var async_1 = require('async');
var restify_utils_1 = require('restify-utils');
var chai_1 = require('chai');
var main_1 = require('./../../../main');
var auth_test_sdk_1 = require('./../auth/auth_test_sdk');
var models_1 = require('./../../../api/auth/models');
var user_mocks_1 = require('./../user/user_mocks');
var shared_tests_1 = require('../../shared_tests');
var models_and_routes = {
    user: main_1.all_models_and_routes['user'],
    auth: main_1.all_models_and_routes['auth'],
};
process.env.NO_SAMPLE_DATA = true;
var mocks = user_mocks_1.user_mocks.successes.slice(0, 10);
describe('Auth::routes', function () {
    var sdk, app;
    before(function (done) {
        return async_1.series([
            function (cb) { return shared_tests_1.tearDownConnections(main_1.c.connections, cb); },
            function (cb) { return restify_utils_1.strapFramework(Object.assign({}, main_1.strapFrameworkKwargs, {
                models_and_routes: models_and_routes,
                createSampleData: false,
                start_app: false,
                use_redis: true,
                app_name: 'test-auth-api',
                callback: function (err, _app, _connections, _collections) {
                    if (err)
                        return cb(err);
                    main_1.c.connections = _connections;
                    main_1.c.collections = _collections;
                    app = _app;
                    sdk = new auth_test_sdk_1.AuthTestSDK(app);
                    return cb();
                }
            })); }], done);
    });
    after(function (done) { return shared_tests_1.tearDownConnections(main_1.c.connections, done); });
    describe('/api/auth', function () {
        beforeEach(function (done) { return sdk.unregister_all(mocks, function () { return done(); }); });
        afterEach(function (done) { return sdk.unregister_all(mocks, function () { return done(); }); });
        it('POST should login user', function (done) {
            async_1.series([
                function (cb) { return sdk.register(mocks[1], cb); },
                function (cb) { return sdk.login(mocks[1], cb); }
            ], done);
        });
        it('POST should fail to register user', function (done) {
            async_1.series([
                function (cb) { return sdk.register(mocks[2], cb); },
                function (cb) { return sdk.register(mocks[2], cb); }
            ], function (err) {
                if (err) {
                    var expected_err = 'duplicate key value violates unique constraint';
                    try {
                        chai_1.expect(err.message).to.contain(expected_err);
                        err = null;
                    }
                    catch (e) {
                        err = e;
                    }
                    finally {
                        done(err);
                    }
                }
                return done();
            });
        });
        it('DELETE should logout user', function (done) {
            async_1.waterfall([
                function (cb) { return sdk.register(mocks[1], function (err) { return cb(err); }); },
                function (cb) { return sdk.login(mocks[1], function (err, res) {
                    return err ? cb(err) : cb(null, res.body.access_token);
                }); },
                function (access_token, cb) {
                    return sdk.logout(access_token, function (err, res) {
                        return cb(err, access_token);
                    });
                },
                function (access_token, cb) {
                    return models_1.AccessToken().findOne(access_token, function (e, r) {
                        return cb(!e ? new Error("Access token wasn't invalidated/removed") : null);
                    });
                }
            ], done);
        });
    });
});
