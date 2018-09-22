let references =    [ {"model": require("./base/entity")("tiers"), "referenceField": "tier_id", "direction": "to", "readOnly": true}];

let PaymentStructureTemplate = require("./base/entity")("payment_structure_templates",references);


//Notification.createFromTemplate()

module.exports = PaymentStructureTemplate;