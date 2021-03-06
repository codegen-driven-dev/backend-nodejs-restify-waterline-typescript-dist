"use strict";
var async_1 = require("async");
var restify_utils_1 = require("restify-utils");
var main_1 = require("./../../../main");
var shared_tests_1 = require("../../shared_tests");
var contact_test_sdk_1 = require("./contact_test_sdk");
var user_mocks_1 = require("../user/user_mocks");
var auth_test_sdk_1 = require("../auth/auth_test_sdk");
var contact_mocks_1 = require("./contact_mocks");
var models_and_routes = {
    user: main_1.all_models_and_routes['user'],
    auth: main_1.all_models_and_routes['auth'],
    contact: main_1.all_models_and_routes['contact']
};
process.env['NO_SAMPLE_DATA'] = 'true';
var user_mocks_subset = user_mocks_1.user_mocks.successes.slice(20, 30);
describe('Message::routes', function () {
    var sdk, auth_sdk, app, mocks;
    before('tearDownConnections', function (done) { return shared_tests_1.tearDownConnections(main_1.c.connections, done); });
    before('strapFramework', function (done) { return restify_utils_1.strapFramework(Object.assign({}, main_1.strapFrameworkKwargs, {
        models_and_routes: models_and_routes,
        createSampleData: false,
        start_app: false,
        use_redis: true,
        app_name: 'test-contact-api',
        callback: function (err, _app, _connections, _collections) {
            if (err)
                return done(err);
            main_1.c.connections = _connections;
            main_1.c.collections = _collections;
            app = _app;
            sdk = new contact_test_sdk_1.AddressBookTestSDK(app);
            auth_sdk = new auth_test_sdk_1.AuthTestSDK(app);
            mocks = contact_mocks_1.contact_mocks(user_mocks_subset);
            return done();
        }
    })); });
    before('Create & auth users', function (done) { return async_1.forEachOf(user_mocks_subset, function (user, idx, callback) { return async_1.series([
        function (cb) { return auth_sdk.register(user, cb); },
        function (cb) { return auth_sdk.login(user, cb); }
    ], function (err, results) {
        if (err)
            return callback(err);
        user['access_token'] = results[1].body.access_token;
        user_mocks_subset[idx] = user;
        return callback();
    }); }, done); });
    after('unregister all users', function (done) { return auth_sdk.unregister_all(user_mocks_subset, done); });
    after('tearDownConnections', function (done) { return shared_tests_1.tearDownConnections(main_1.c.connections, done); });
    describe('/api/contact', function () {
        afterEach('deleteContact', function (done) { return sdk.destroy(user_mocks_subset[0].access_token, mocks.successes[0], done); });
        it('POST should create contact', function (done) {
            return sdk.create(user_mocks_subset[0].access_token, mocks.successes[0], done);
        });
        it('GET should get all contacts', function (done) { return async_1.series([
            function (cb) { return sdk.create(user_mocks_subset[0].access_token, mocks.successes[0], cb); },
            function (cb) { return sdk.getAll(user_mocks_subset[0].access_token, mocks.successes[0], cb); }
        ], done); });
    });
    describe('/api/contact/:email', function () {
        before('createContact', function (done) { return sdk.create(user_mocks_subset[0].access_token, mocks.successes[1], function (_) { return done(); }); });
        after('deleteContact', function (done) { return sdk.destroy(user_mocks_subset[0].access_token, mocks.successes[1], done); });
        it('GET should retrieve contact', function (done) {
            return sdk.retrieve(user_mocks_subset[0].access_token, mocks.successes[1], done);
        });
        it('PUT should update contact', function (done) {
            return sdk.update(user_mocks_subset[0].access_token, mocks.successes[1], {
                owner: mocks.successes[1].owner,
                email: mocks.successes[1].email,
                name: "NAME: " + mocks.successes[1].email
            }, done);
        });
        it('DELETE should destroy contact', function (done) {
            return sdk.destroy(user_mocks_subset[0].access_token, mocks.successes[1], done);
        });
    });
});
