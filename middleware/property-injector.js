
let System = require('../models/system-options');
let Stripe = require('../config/stripe');
let _ = require("lodash")
let injectProperties = function () {
    return function (req, res, next) {
        let store = require("../config/redux/store");
        let options = store.getState().options;
        Object.defineProperty(res.locals, 'sysprops', { get: function() { return store.getState().options } });
        if(options.stripe_publishable_key) {
            res.cookie("spk", options.stripe_publishable_key);
        }else{
            res.clearCookie("spk", {path: '/'});
        }
        Stripe.setKeys(options);
        next()
    }
}

module.exports = injectProperties;