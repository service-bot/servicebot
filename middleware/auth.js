let Role = require("../models/role.js");
let _ = require("lodash");
let swaggerJSON = {...require("../api-docs/api-entity-paths.json"), ...require("../api-docs/api-paths.json")};


//todo:  allow for multiple permissions


/**
 *
 * @param user - User object from the request
 * @param permission - Permission being checked
 * @param bypassPermissions - permissions that will also be authenticated (used for ownership situations)
 * @param callback - callback function with true if authorized false otherwise as param
 *
 */
let isAuthorized = function (user, permission, bypassPermissions, callback){

    //TODO: clean this up so hasPermission can be passed multiple roles
    Role.findOne("id", user.get("role_id"), function(role){
        role.getPermissions(function(permissions){
            let status = permissions.some(p => p.data.permission_name == permission || !permission);
            let shouldBypass = permissions.some(p => bypassPermissions.includes(p.data.permission_name));
            console.log("userName: " + user.get('email') + " has permission: " + permission + ". Ability to make api call: " + status);
            callback(status, shouldBypass, permissions)
        })
    })
}



/**
 *
 * @param permission
 * @param model - if model is defined the auth function will check for ownership, assumes there is user_id existing
 * @param correlation_id - string representing the field you want to check the params.id against
 *ip
 * @param bypassPermissions - permissions that will also be authenticated (used for ownership situations)
 * @returns {Function}
 */

//todo: move parameters into a config json... icky icky!
let auth = function(permission=null, model=null, correlation_id="user_id", bypassPermissions=["can_administrate"]) {
    return function (req, res, next, reject=(err)=>{}) {
        // if user is authenticated in the session, call the next() to call the next request handler
        // Passport adds this method to request object. A middleware is allowed to add properties to
        // request and response object


        let permissionToCheck = permission;

        if (!req.isAuthenticated()) {
            return reject(res.status(401).json({"error": "Unauthenticated"}));
        }

        if(req.user.data.status == "suspended"){
            return reject(res.status(401).json({"error" : "Account suspended"}));
        }

        try {
            if (!permissionToCheck) {
                let tempReq = req.route.path.replace(/:/g, "{");
                let replacement = tempReq.replace("(\\d+)", "");
                let route = replacement.replace(/\{[^\/]*/g, '$&}');
                let finalRoute = route.replace(/\/$/g, '');
                let method = req.method.toLowerCase();
                permissionToCheck = swaggerJSON[finalRoute][method].operationId;
                console.log("permission for " + req.route.path + " is " + permissionToCheck);
            }
        }catch(e){
            console.error(e);
        }
        isAuthorized(req.user, permissionToCheck, bypassPermissions,  function (status, shouldBypass, permissions) {
            res.locals.permissions = permissions;
            if(shouldBypass){
                return next();
            }
            else{
                if(status){
                    if (model) {
                        //TODO be able to handle other ids, not just 'id'
                        let id = req.params.id;
                        model.findOne("id", id, function (result) {
                            console.log("correlation id: " + correlation_id + " " + req.user.get("id"));
                            if (result.get(correlation_id) == req.user.get("id") || permissions.some(p => p.data.permission_name === 'can_manage')) {
                                console.log("user owns id " + id + "or has can_manage")
                                return next();
                            }
                            return reject(res.status(401).json({error: "Unauthorized user"}));

                        });
                        return;
                    }
                    else{
                        return next();
                    }
                }
                else{
                    return reject(res.status(401).json({error: "Unauthorized user"}));
                }
            }
        });

    };
};

auth.isAuthorized = isAuthorized;

module.exports = auth;


