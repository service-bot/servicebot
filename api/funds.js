
let async = require('async');
let auth = require('../middleware/auth');
let validate = require('../middleware/validate');
let Funds = require('../models/fund');

module.exports = function(router) {

    router.post('/funds', auth(), function (req, res) {
        return new Promise(function (resolve, reject) {
            let user_id = req.user.get('id');
            //If the user is admin, they can create funds for the users
            //todo: Better check the permission. make sure the permission name is correct
            if(res.locals.permissions.some(p => p.get("permission_name") == "can_administrate" || p.get("permission_name") == "can_manage")){
                if(req.body.user_id){
                    user_id = req.body.user_id;
                }
            }
            return resolve(user_id);
        }).then(function (user_id) {
            return new Promise(function (resolve, reject) {
                //Check if the user already has a funding source
                Funds.findOne('user_id', user_id, function (result) {
                    if(!result.data){
                        return resolve(user_id);
                    } else {
                        return reject('User already has a fund account!');
                    }
                });
            });
        }).then(function (user_id) {
            //Make sure the user is validated with Stripe prior to adding fund
            return new Promise(function (resolve, reject) {
                let User = require('../models/user');
                User.findOne('id', user_id, function (user) {
                    if(user.data) {
                        user.promiseValid().then(function () {
                            return resolve(user_id);
                        }).catch(function (err) {
                            return reject(err);
                        });
                    } else {
                        return reject('No user was found!');
                    }
                })
            })
        }).then(function (user_id) {
            //Ensure that Token is passed and create the fund record
            return new Promise(function (resolve, reject) {
                if(req.body.token_id){
                    let fund_obj = {};
                    fund_obj.user_id = user_id;
                    let fund = new Funds(fund_obj);
                    fund.create(function (err, result) {
                        if(!err) {
                            return resolve(result);
                        } else {
                            return reject(err);
                        }
                    });
                } else {
                    return reject({'err':'token_id is required for this call!'});
                }
            });
        }).then(function (fund) {
            return new Promise(function (resolve, reject) {
                fund.renewFund(req.body.token_id, function (err, result) {
                    if(!err) {
                        return resolve(result);
                    } else {
                        return reject(err);
                    }
                });
            });
        }).then(function (result) {
            res.status(200).json(result);
        }).catch(function (err) {
            res.status(400).json({error: err, created: false});
        });
    });

    router.put('/funds/:id(\\d+)', validate(Funds), auth(null, Funds), function (req, res) {
        let fund = res.locals.valid_object;
        fund.renewFund(req.body.token_id, function (err, result) {
            if(!err){
                res.json(result);
            } else {
                res.json({'err':err});
            }
        });
    });

    router.delete(`/funds/:id(\\d+)`, function(req,res){
        res.sendStatus(404);
    });


    require("./entity")(router, Funds, "funds", "user_id");

    return router;
};