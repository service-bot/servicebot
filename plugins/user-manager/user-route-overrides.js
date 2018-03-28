module.exports = function(userManager) {

    return function (User) {
        let putUser =  async function (req, res) {
            let oldUser = res.locals.valid_object;
            let newUserData = req.body;
            if (oldUser.get("id") === req.user.get("id")) {
                delete oldUser.data.role_id;
                delete newUserData.role_id;
                delete newUserData.status;
            } else if (newUserData.password && oldUser.get("status") === "invited") {
                newUserData.status = "active";
            }

            let updatedUser = await userManager.update(oldUser, newUserData);
            res.json(updatedUser);
        };

        let deleteUser = function (req, res) {
            let user = res.locals.valid_object;
            user.deleteWithStripe(function (err, completed_msg) {
                if (!err) {
                    res.status(200).json({message: completed_msg});
                } else {
                    res.status(400).json({error: err});
                }
            });
        };

        return [
            {
                endpoint: "/:id(\\d+)",
                method: "delete",
                middleware: [validate(User), deleteUser],
                description: "Delete User - Overridden to delete stripe user as well (Dangerous)"
            },
            {
                endpoint: "/",
                method: "post",
                middleware: null,
                permissions: [],
                description: "Disabled Post api, use Register instead for user creation"

            },
            {
                endpoint: "/:id(\\d+)",
                method: "put",
                middleware: [validate(User), putUser],
                description: "Update User - Overridden so users can't change their own role or status"

            }
        ]
    };
};