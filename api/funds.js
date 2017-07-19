
let async = require('async');
let auth = require('../middleware/auth');
let validate = require('../middleware/validate');
let Funds = require('../models/fund');

module.exports = function(router) {

    router.post('/funds', auth(), function (req, res) {
        return new Promise(function (resolve, reject) {
            //Always set the user to the current requests user id
            let user_id = req.user.get('id');
            //But if the user is admin, they can create funds for the users
            if(res.locals.permissions.some(p => p.get("permission_name") == "can_administrate" || p.get("permission_name") == "can_manage")){
                if(req.body.user_id){
                    user_id = req.body.user_id;
                }
            }
            return resolve(user_id);
        }).then(function (user_id) {
            return Funds.promiseFundCreateOrUpdate(user_id, req.body.token_id);
        }).then(function (result) {
            res.status(200).json(result);
        }).catch(function (err) {
            res.status(400).json({error: err});
        });
    });

    router.put('/funds/:id(\\d+)', validate(Funds), auth(null, Funds), function (req, res) {
        // let fund = res.locals.valid_object;
        // fund.renewFund(req.body.token_id, function (err, result) {
        //     if(!err){
        //         res.json(result);
        //     } else {
        //         res.json({'err':err});
        //     }
        // });
        //New method has been developed on the POST call. No need for this.
        res.sendStatus(404);
    });

    router.delete(`/funds/:id(\\d+)`, function(req,res){
        res.sendStatus(404);
    });


    require("./entity")(router, Funds, "funds", "user_id");

    return router;
};