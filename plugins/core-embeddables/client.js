let consume = require("pluginbot/effects/consume");
import Billing from "./embeddables/billing-settings";
import Checkout from "./embeddables/checkout";
module.exports = {
    run: function* (config, provide, services) {
        yield provide({embeddable : [Checkout, Billing]});
    }

};