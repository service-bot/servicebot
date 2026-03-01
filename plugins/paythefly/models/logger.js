/**
 * PayTheFly event logger
 * Follows the same pattern as plugins/stripe/models/logger.js
 */
let EventLog = require("../../../models/base/entity")("paythefly_event_logs");

let Logger = {
    log: function (eventId, description) {
        let logEntry = new EventLog({
            event_id: eventId,
            description: description,
            created_at: new Date(),
        });
        logEntry.create(function (err, result) {
            if (err) {
                console.error("[PayTheFly Logger] Failed to log event:", err);
            }
        });
    },

    findOne: function (key, value, callback) {
        EventLog.findOne(key, value, callback);
    },
};

module.exports = Logger;
