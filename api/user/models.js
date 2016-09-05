"use strict";
exports.User = {
    identity: 'user_tbl',
    connection: 'postgres',
    _omit: ['password'],
    attributes: {
        title: {
            type: 'string'
        },
        email: {
            type: 'string',
            required: true,
            primaryKey: true
        },
        password: {
            type: 'string',
            required: true
        },
        toJSON: function toJSON() {
            var user = this.toObject();
            exports.User._omit.map(function (k) { return delete user[k]; });
            for (var key in user)
                if (user.hasOwnProperty(key) && !user[key])
                    delete user[key];
            return user;
        }
    }
};
