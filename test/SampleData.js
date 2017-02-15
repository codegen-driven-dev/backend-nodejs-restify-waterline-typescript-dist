"use strict";
var url = require("url");
var async_1 = require("async");
var http_1 = require("http");
var nodejs_utils_1 = require("nodejs-utils");
var restify_1 = require("restify");
var user_mocks_1 = require("./api/user/user_mocks");
function httpF(method) {
    return function (options, func_name, body_or_cb, cb) {
        if (!cb) {
            cb = body_or_cb;
            body_or_cb = null;
        }
        options['method'] = method;
        if (body_or_cb)
            if (!options)
                options = { 'headers': { 'Content-Length': Buffer.byteLength(body_or_cb) } };
            else if (!options.headers)
                options.headers = { 'Content-Length': Buffer.byteLength(body_or_cb) };
            else if (!options.headers['Content-Length'])
                options.headers['Content-Length'] = Buffer.byteLength(body_or_cb);
        var req = http_1.request(options, function (res) {
            res.func_name = func_name;
            if (!res)
                return cb(res);
            else if ((res.statusCode / 100 | 0) > 3)
                return cb(res);
            return cb(null, res);
        });
        body_or_cb && req.write(body_or_cb);
        req.end();
        return req;
    };
}
var httpHEAD = httpF('HEAD'), httpGET = httpF('GET'), httpPOST = httpF('POST'), httpPUT = httpF('PUT'), httpPATCH = httpF('PATCH'), httpDELETE = httpF('DELETE');
var SampleData = (function () {
    function SampleData(uri) {
        this.userMocks = user_mocks_1.user_mocks.successes;
        this.uri = url.parse(uri);
    }
    SampleData.prototype.mergeOptions = function (options, body) {
        return nodejs_utils_1.trivial_merge({
            host: this.uri.host === "[::]:" + this.uri.port ? 'localhost' :
                "" + this.uri.host.substr(this.uri.host.lastIndexOf(this.uri.port) + this.uri.port.length),
            port: parseInt(this.uri.port),
            headers: nodejs_utils_1.trivial_merge({
                'Content-Type': 'application/json',
                'Content-Length': body ? Buffer.byteLength(body) : 0
            }, this.token ? { 'X-Access-Token': this.token } : {})
        }, options);
    };
    SampleData.prototype.login = function (cb) {
        var _this = this;
        var body = JSON.stringify(this.userMocks[0]);
        httpPOST(this.mergeOptions({ path: '/api/auth' }), 'login::auth', body, function (err, res) {
            if (err)
                return cb(err);
            else if (!res.headers)
                return cb(new restify_1.HttpError('HTTP request failed'));
            _this.token = res.headers['x-access-token'];
            return cb(err, _this.token);
        });
    };
    SampleData.prototype.registerLogin = function (cb) {
        var _this = this;
        var body = JSON.stringify(this.userMocks[0]);
        async_1.series([
            function (callback) { return httpPOST(_this.mergeOptions({ path: '/api/user' }), 'registerLogin::user', body, function () { return callback(); }); },
            function (callback) { return _this.login(callback); },
        ], function (err, res) {
            if (err)
                return cb(err);
            else if (res[1].headers)
                _this.token = res[1].headers['x-access-token'];
            return cb(err, _this.token);
        });
    };
    SampleData.prototype.unregister = function (cb) {
        var _this = this;
        var body = JSON.stringify(this.userMocks[0]);
        var unregisterUser = function () { return httpDELETE(_this.mergeOptions({ path: '/api/user' }), 'unregister::user', body, function (error, result) {
            if (error)
                return cb(error);
            else if (result.statusCode !== 204)
                return cb(new Error("Expected status code of 204 got " + result.statusCode));
            return cb(error, result.statusMessage);
        }); };
        this.token ? unregisterUser() : this.login(function (err, access_token) {
            return err ? cb() : unregisterUser();
        });
    };
    return SampleData;
}());
exports.SampleData = SampleData;
