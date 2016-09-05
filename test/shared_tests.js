"use strict";
var async_1 = require('async');
function tearDownConnections(connections, cb) {
    return connections ? async_1.parallel(Object.keys(connections).map(function (connection) { return connections[connection]._adapter.teardown; }), function () {
        Object.keys(connections).forEach(function (connection) {
            connections[connection]._adapter.connections.delete(connection);
        });
        cb();
    }) : cb();
}
exports.tearDownConnections = tearDownConnections;
