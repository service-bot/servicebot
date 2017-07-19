
let System = require('../models/system-options');
let Stripe = require('../config/stripe');
let store = require("../config/redux/store");
let _ = require("lodash")
let injectProperties = function () {
    return function (req, res, next) {
        let options = store.getState().options;

        Object.defineProperty(res.locals, 'sysprops', { get: function() { return store.getState().options } });
        res.cookie("spk", options.stripe_publishable_key);
        Stripe.setKeys(options);
        next()
    }
}

module.exports = injectProperties;