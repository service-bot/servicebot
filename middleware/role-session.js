let Role = require("../models/role");
let role_session = function(){

    return function(req, res, next) {
        if (req.isAuthenticated()) {
            console.log("set cookie")
            let user_role = new Role({"id": req.user.data.role_id});
            user_role.getPermissions(function (perms) {
                // let permission_names = perms.map(perm => perm.data.permission_name);
                res.cookie("username", req.user.get("email"));
                res.cookie("uid", req.user.get("id"));
                next();
            });
        }
        else{
            console.log("unset cookie");
            res.clearCookie("username", {path: '/'});
            res.clearCookie("uid", {path: '/'});

            next();

        }
    }
};

module.exports = role_session;