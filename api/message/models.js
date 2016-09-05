"use strict";
exports.Message = {
    identity: 'message_tbl',
    connection: 'postgres',
    _omit: [],
    beforeCreate: function (msg, next) {
        if (msg.createdAt === undefined || msg.uuid === undefined) {
            msg.createdAt = new Date();
            msg.uuid = msg.from + "::" + msg.to + "::" + msg.createdAt.toISOString();
        }
        next();
    },
    attributes: {
        uuid: {
            type: 'string',
            primaryKey: true
        },
        message: {
            type: 'string',
            required: true
        },
        to: {
            type: 'string',
            required: true
        },
        from: {
            type: 'string',
            required: true
        },
        toJSON: function toJSON() {
            var msg = this.toObject();
            exports.Message._omit.map(function (k) { return delete msg[k]; });
            for (var key in msg)
                if (msg.hasOwnProperty(key) && !msg[key])
                    delete msg[key];
            return msg;
        }
    }
};
