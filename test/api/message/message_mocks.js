"use strict";
var user_mocks_1 = require('../user/user_mocks');
exports.message_mocks = function (users) { return ({
    "failures": [
        {},
        { "email": "foo@bar.com " },
        { "password": "foo " },
        { "email": "foo@bar.com", "password": "foo", "bad_prop": true }
    ],
    "successes": (function (ob) {
        if (ob === void 0) { ob = []; }
        return [
            ("can " + Math.random() + " count"), ("can " + Math.random() + " count")
        ].forEach(function (msg) { return (function (date) {
            return users.forEach(function (user, idx) { return ob.push({
                uuid: users[idx === 0 ? 1 : 0].email + "::" + user.email + "::" + date.toISOString(),
                createdAt: date, updatedAt: date,
                to: user.email, from: users[idx === 0 ? 1 : 0].email, message: msg
            }); });
        })(new Date()); }) || ob;
    })()
}); };
if (require.main === module) {
    console.info(exports.message_mocks(user_mocks_1.user_mocks.successes.slice(20, 30)));
}
