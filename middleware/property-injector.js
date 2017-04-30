
let System = require('../models/system-options');
let Stripe = require('../config/stripe');

let _ = require("lodash")
let injectProperties = function () {
    return function (req, res, next) {
        System.findAll(true, true, function(properties){
            res.locals.sysprops = properties.reduce(function(acc, val){
                acc[val.get("option")] = val.get("value");
                //Set the Stripe API keys
                Stripe.setKeys(acc);

                //todo: move this to redux store
                res.cookie("spk", acc.stripe_publishable_key);
                return acc;
            },{});
            next();
        })
    }
}

module.exports = injectProperties;