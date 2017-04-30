
let async = require('async');
let Stripe = require('../config/stripe');
let Fund = require("./base/entity")("funds");

Fund.prototype.renewFund = function (token, callback) {
    let self = this;
    async.waterfall([
        function (callback) {
            //Retrieve the information from the newly created Stripe token.
            Stripe().connection.tokens.retrieve(token, function(err, token_obj) {
                callback(err, token_obj);
            });
        },
        function (token, callback) {
            //Find the user id from the fund object
            let User = require('./user');
            User.findOne('id', self.get('user_id'), function (user) {
                if(user.data){
                    callback(null, token,  user);
                } else {
                    callback('User Not Found!', token, null);
                }
            });
        },
        function (token, user, callback) {
            if(user.get('customer_id')){
                //Update customer fund in Stripe
                Stripe().connection.customers.update(user.get('customer_id'), { source: token.id }, function(err, customer) {
                    callback(err, token, customer);
                });
            } else {
                callback('User does NOT have a Stripe customer id!', null, null);
            }
        },
        function (token, customer, callback) {
            //Update the database record as well
            self.data.source = token;
            self.update(function (result) {
                callback(null, customer);
            });
        }
    ], function(err, results){
        callback(err, results);
    });
}


module.exports = Fund;
