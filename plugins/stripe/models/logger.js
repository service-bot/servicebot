
let EventLogs = require('../../../models/event-log');
let StripeLogs = require('../../../models/base/entity')('stripe_event_logs');

StripeLogs.log = function (event_id, logMessage, userId = null, logType = 'STRIPE', logLevel = 'INFO') {
    let eventObj = EventLogs.getLogObj(userId, logMessage, logType, logLevel);
    eventObj.event_id = event_id;

    let newEvent = new StripeLogs(eventObj);

    newEvent.create(function(result){
        console.log("Stripe log created.");
    });
};

module.exports = StripeLogs;