
let EventLogs = require('../models/event-log');

module.exports = function(router) {

    require("./entity")(router, EventLogs, "event-logs");

    return router;
};