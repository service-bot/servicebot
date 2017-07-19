/**
 * Stripe configuration file. This file loads Stripe's API using the API key entered by the user.
 *
 */
let _ = require('lodash');
let Stripe = function () {
    let store = require("./redux/store");
    let options = store.getState().options;
    // let secret_key = Stripe.keys.stripe_secret_key;
    // let publishable_key = Stripe.keys.stripe_publishable_key;
    //Require the correct secret key
    let stripe_obj = require('stripe')(options.stripe_secret_key);
    stripe_connection = {
        stripe_secret_key: options.stripe_secret_key,
        stripe_publishable_key: options.stripe_publishable_key,
        connection: stripe_obj
    };
    return stripe_connection;
}
/**
 * Stipe API keys passed from the database System options
 * @param sysoptions - System options from the database
 * @returns {Stripe}
 */
Stripe.setKeys = function (sysoptions) {
    let keys = [
        'stripe_secret_key',
        'stripe_publishable_key'
    ];
    Stripe.keys = _.pick(sysoptions, keys);
    return Stripe;
}

module.exports = Stripe;