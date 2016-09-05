"use strict";
var waterline_postgres = require('waterline-postgresql');
var bunyan_1 = require('bunyan');
var nodejs_utils_1 = require('nodejs-utils');
var SampleData_1 = require('./test/SampleData');
var restify_utils_1 = require('restify-utils');
exports.package_ = require('./package');
exports.logger = bunyan_1.createLogger({
    name: 'main'
});
process.env.NO_DEBUG || exports.logger.info(Object.keys(process.env).sort().map(function (k) { return ((_a = {}, _a[k] = process.env[k], _a)); var _a; }));
var db_uri = process.env.RDBMS_URI || process.env.DATABASE_URL || process.env.POSTGRES_URL;
exports.waterline_config = Object.freeze({
    adapters: {
        url: db_uri,
        postgres: waterline_postgres
    },
    defaults: {
        migrate: 'create'
    },
    connections: {
        postgres: {
            adapter: 'postgres',
            connection: nodejs_utils_1.uri_to_config(db_uri),
            pool: {
                min: 2,
                max: 20
            }
        }
    }
});
exports.all_models_and_routes = nodejs_utils_1.populateModelRoutes('.');
exports.redis_cursors = {
    redis: null
};
exports.c = { collections: [], connections: [] };
var _cache = {};
exports.logger.info('waterline_config =', exports.waterline_config);
exports.strapFrameworkKwargs = Object.freeze({
    app_name: exports.package_.name,
    models_and_routes: exports.all_models_and_routes,
    logger: exports.logger,
    _cache: _cache,
    package_: exports.package_,
    root: '/api',
    skip_db: false,
    collections: exports.c.collections,
    waterline_config: exports.waterline_config,
    use_redis: true,
    redis_cursors: exports.redis_cursors,
    createSampleData: true,
    SampleData: SampleData_1.SampleData,
    sampleDataToCreate: function (sampleData) { return [
        function (cb) { return sampleData.unregister(cb); },
        function (cb) { return sampleData.registerLogin(cb); }
    ]; }
});
if (require.main === module) {
    restify_utils_1.strapFramework(Object.assign({
        start_app: true, callback: function (err, _app, _connections, _collections) {
            if (err)
                throw err;
            exports.c.collections = _collections;
        }
    }, exports.strapFrameworkKwargs));
}
