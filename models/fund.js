
let Stripe = require('../config/stripe');
let Fund = require("./base/entity")("funds");

Fund.prototype.renewFund = function (token, callback) {
    let self = this;
    return new Promise(function (resolve, reject) {
        //Retrieve the information from the newly created Stripe token.
        Stripe().connection.tokens.retrieve(token, function(err, token_obj) {
            if(!err) {
                return resolve(token_obj);
            } else {
                return reject(err.message);
            }
        });
    }).then(function (token_obj) {
        return new Promise(function (resolve, reject) {
            //Find the user id from the fund object
            let User = require('./user');
            User.findOne('id', self.get('user_id'), function (user) {
                if(user.data && user.data.customer_id){
                        //Update customer fund in Stripe
                        Stripe().connection.customers.update(user.get('customer_id'), { source: token_obj.id }, function(err, customer) {
                            if(!err) {
                                return resolve(token_obj);
                            } else {
                                return reject(err.message);
                            }
                        });
                } else {
                    return reject('No user or Stripe customer_id Found!');
                }
            });
        });
    }).then(function (token_obj) {
        return new Promise(function (resolve, reject) {
            //Update the database record as well
            self.data.source = token_obj;
            self.data.flagged = false;
            self.update(function (err, result) {
                if(!err) {
                    return resolve(result);
                } else {
                    return reject(err);
                }
            });
        });
    }).then(function (result) {
        callback(null, result);
    }).catch(function (err) {
        callback(err);
    });
};

Fund.promiseFundCreateOrUpdate = function (user_id, token_id) {
    //Make sure the user is validated with Stripe prior to adding fund
    let tmpUser;
    return new Promise(function (resolve, reject) {
        let User = require('../models/user');
        User.findOne('id', user_id, function (user) {
            if(user.data) {
                user.promiseValid().then(function () {
                    tmpUser = user;
                    return resolve(user_id);
                }).catch(function (err) {
                    return reject(err);
                });
            } else {
                return reject('No user was found!');
            }
        })
    }).then(function (user_id) {
        //Check if the user already has a funding source
        return new Promise(function (resolve, reject) {
            Fund.findOne('user_id', user_id, function (result) {
                if(!result.data){
                    return resolve(false);
                } else {
                    return resolve(result);
                }
            });
        });
    }).then(function (fund) {
        //Create the fund object for the user if doesnt already exist
        return new Promise(function (resolve, reject) {
            if(!fund) {
                let fund_obj = {};
                fund_obj.user_id = user_id;
                fund_obj.flagged = false;
                let fund = new Fund(fund_obj);
                fund.create(function (err, new_fund) {
                    if(!err) {
                        return resolve(new_fund);
                    } else {
                        return reject(err);
                    }
                });
            } else {
                return resolve(fund);
            }
        });
    }).then(function (fund) {
        //Ensure that Token is passed and create the fund record
        return new Promise(function (resolve, reject) {
            if(token_id){
                fund.renewFund(token_id, function (err, result) {
                    if(!err) {
                        return resolve(result);
                    } else {
                        return reject(err);
                    }
                });
            } else {
                return reject('token_id is not passed!');
            }
        });
    }).then(function (fund) {
        //Set the user to active if user was flagged
        return new Promise(function (resolve, reject) {
            let userStatus = tmpUser.get('status');
            if(userStatus == 'flagged'){
                tmpUser.set('status', 'active');
                tmpUser.update((err, result)=>{
                    if(!err) {
                        return resolve(fund);
                    } else {
                        return reject(err);
                    }
                });
            }
            else{
                resolve(fund);
            }
        });
    });
};


module.exports = Fund;
