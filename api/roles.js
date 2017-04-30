
let Roles = require('../models/role');
let auth = require('../middleware/auth');
let async = require("async");
module.exports = function(router) {

    router.get("/roles/manage-permissions", auth(), function(req, res, next){
        Roles.findAll(true, true, function(result){
            async.map(result,
                function(role, callback){
                    role.getPermissions(function(permissions){
                        callback(null, {role_id: role.get("id"), permission_ids: permissions.map(perm => perm.get("id"))});
                    })
            },
                function(e, r){

                    if(e){
                        res.locals.json = {error: e};
                        return next();
                    }
                    res.locals.json = r;
                    next();
                })
        })
    });

    router.post("/roles/manage-permissions", auth(), function(req, res, next){
        async.mapSeries(req.body, function(role, callback) {
            let roleObj = new Roles({id: role.role_id});
            roleObj.setPermissions(role.permission_ids, function (result) {
                callback(null, result);
            });
        },function(err, result){
            if(err){
                console.error(err);
            }else {
                res.json(result);
            }
        });
    });
    require("./entity")(router, Roles, "roles");
    return router;
};