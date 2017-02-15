"use strict";
exports.Contact = {
    identity: 'contact_tbl',
    connection: 'postgres',
    _omit: [],
    attributes: {
        name: {
            type: 'string'
        },
        email: {
            type: 'string',
            primaryKey: true
        },
        owner: {
            type: 'string',
            required: true
        },
        toJSON: function toJSON() {
            var contact = this.toObject();
            exports.Contact._omit.map(function (k) { return delete contact[k]; });
            for (var key in contact)
                if (contact.hasOwnProperty(key) && !contact[key])
                    delete contact[key];
            return contact;
        }
    }
};
