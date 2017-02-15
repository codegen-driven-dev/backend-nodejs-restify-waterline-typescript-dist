"use strict";
var user_mocks_1 = require("../user/user_mocks");
exports.contact_mocks = function (users) { return ({
    "failures": [
        {},
        { "email": "foo@bar.com " },
        { "password": "foo " },
        { "email": "foo@bar.com", "password": "foo", "bad_prop": true }
    ],
    "successes": (function (ob) {
        if (ob === void 0) { ob = []; }
        return [
            "can " + Math.random() + " count", "can " + Math.random() + " count"
        ].forEach(function (msg) { return (function (date) {
            return users.forEach(function (user, idx) { return ob.push({
                email: user.email,
                owner: users[idx === 0 ? 1 : 0].email
            }); });
        })(new Date()); }) || ob;
    })()
}); };
if (require.main === module) {
    console.info(exports.contact_mocks(user_mocks_1.user_mocks.successes.slice(20, 30)));
}
