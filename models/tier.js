let PaymentStructureTemplate = require("./payment-structure-template");
let references = [
    {"model" :PaymentStructureTemplate, "referenceField": "tier_id", "direction" : "from", "readOnly" : false}
];

let Tier = require("./base/entity")("tiers", references);


module.exports = Tier;