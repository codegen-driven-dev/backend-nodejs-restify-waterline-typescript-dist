"use strict";
var models_1 = require('./models');
(function (Roles) {
    Roles[Roles["disabled"] = 0] = "disabled";
    Roles[Roles["login"] = 1] = "login";
    Roles[Roles["admin"] = 21] = "admin";
})(exports.Roles || (exports.Roles = {}));
var Roles = exports.Roles;
function has_auth(scope) {
    if (scope === void 0) { scope = 'login'; }
    return function (req, res, next) {
        if (req.params.access_token)
            req.headers['x-access-token'] = req.params.access_token;
        if (!req.headers['x-access-token']) {
            res.json(403, {
                error: 'NotFound',
                error_message: 'X-Access-Token header must be included'
            });
            return next();
        }
        models_1.AccessToken().findOne(req.headers['x-access-token'], function (err, user_id) {
            if (err)
                res.json(403, err);
            else if (!user_id)
                res.json(403, {
                    error: 'NotFound', error_message: 'Invalid access token used'
                });
            else
                req['user_id'] = user_id;
            return next();
        });
    };
}
exports.has_auth = has_auth;
