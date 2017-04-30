let User = require('./user');

let references = [
    {"model":User, "referenceField": "user_id", "direction":"to", "readOnly": true}
];

var InstanceMessage = require("./base/entity")("service_instance_messages", references);


module.exports = InstanceMessage;