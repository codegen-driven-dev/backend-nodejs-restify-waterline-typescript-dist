"use strict";
var restify_errors_1 = require("restify-errors");
var models_1 = require("./models");
function has_auth(scope) {
    if (scope === void 0) { scope = 'login'; }
    return function (req, res, next) {
        if (req.params.access_token)
            req.headers['x-access-token'] = req.params.access_token;
        if (!req.headers['x-access-token'])
            return next(new restify_errors_1.GenericError({
                statusCode: 403,
                error: 'NotFound',
                error_message: 'X-Access-Token header must be included'
            }));
        models_1.AccessToken().findOne(req.headers['x-access-token'], function (err, user_id) {
            if (err)
                return next(err);
            else if (!user_id)
                return next(new restify_errors_1.GenericError({
                    statusCode: 403,
                    error: 'NotFound',
                    error_message: 'Invalid access token used'
                }));
            req['user_id'] = user_id;
            return next();
        });
    };
}
exports.has_auth = has_auth;
