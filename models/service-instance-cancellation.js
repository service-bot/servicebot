
let ServiceInstanceCancellation = require("./base/entity")("service_instance_cancellations");

ServiceInstanceCancellation.findOnRelative = function(key, value, callback){
    ServiceInstanceCancellation.findAll(key, value, function(result){
        result = result.filter(function (cancellation) {
            return cancellation.data.status == 'waiting';
        });
        callback(result);
    });
};

module.exports = ServiceInstanceCancellation;