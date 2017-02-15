"use strict";
var faker = require("faker");
exports.user_mocks = {
    "failures": [
        {},
        { "email": "foo@bar.com " },
        { "password": "foo " },
        { "email": "foo@bar.com", "password": "foo", "bad_prop": true }
    ],
    "successes": (function () {
        var a = [];
        for (var i = 0; i < 50; i++)
            a.push({ "email": faker.internet.email(), "password": faker.internet.password() });
        return a;
    })()
};
if (require.main === module) {
    console.info(exports.user_mocks.successes);
}
