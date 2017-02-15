"use strict";
var supertest = require("supertest");
var chai_1 = require("chai");
var restify_utils_1 = require("restify-utils");
var main_1 = require("../../../main");
describe('Root::routes', function () {
    var app;
    before(function (done) {
        return restify_utils_1.strapFramework(Object.assign({}, main_1.strapFrameworkKwargs, {
            models_and_routes: {},
            createSampleData: false,
            skip_db: true,
            use_redis: false,
            start_app: false,
            app_name: 'test-root-api',
            callback: function (err, _app) {
                if (err)
                    return done(err);
                app = _app;
                return done();
            }
        }));
    });
    describe('/', function () {
        return it('should get version', function (done) {
            supertest(app)
                .get('/')
                .expect('Content-Type', /json/)
                .end(function (err, res) {
                if (err)
                    return done(err);
                try {
                    chai_1.expect(res.status).to.be.equal(200);
                    chai_1.expect(res.body).to.be.an.instanceOf(Object);
                    chai_1.expect(res.body).to.have.property('version');
                    chai_1.expect(res.body.version.split('.').length - 1).to.be.equal(2);
                }
                catch (e) {
                    err = e;
                }
                finally {
                    done(err);
                }
            });
        });
    });
});
