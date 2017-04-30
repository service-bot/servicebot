
let EventLog = require("./base/entity")("event_logs");

EventLog.getLogObj = function (userId, logMessage, logType, logLevel) {
    eventData = {
        'user_id':userId,
        'log_type':logType,
        'log':logMessage,
        'log_level':logLevel
    };
    return eventData;
}

EventLog.logEvent = function (userId, logMessage, logType = 'CORE', logLevel = 'INFO') {
    let eventData = EventLog.getLogObj(userId, logMessage, logType, logLevel);
    let newEvent = new EventLog(eventData);
    newEvent.create(function(err, result){
        console.log("log created: ");
        console.log(result.data);
    });

};

module.exports = EventLog;