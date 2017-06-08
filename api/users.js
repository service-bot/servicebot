let auth = require('../middleware/auth');
let validate = require('../middleware/validate');
let mailer = require('../middleware/mailer');
let User = require('../models/user');
let Invitation = require('../models/invitation');
let EventLogs = require('../models/event-log');
let multer  = require('multer');
let File = require("../models/file");
let path = require("path");
let mkdirp = require("mkdirp");
let bcrypt = require("bcryptjs");
let Role = require("../models/role");
//todo - entity posting should have correct error handling, response should tell user what is wrong like if missing column
let avatarFilePath = "uploads/avatars";

let avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        mkdirp(avatarFilePath, err => cb(err, avatarFilePath))
    },
    filename: function (req, file, cb) {
        require('crypto').pseudoRandomBytes(8, function (err, raw) {
            cb(err, err ? undefined : req.params.id + "-" + raw.toString('hex'))
        })
    }
});

module.exports = function(router, passport) {
    router.get('/invitation/:invitation_id', function (req, res, next) {
        Invitation.findOne("token", req.params.invitation_id, function(result){
            if(result.data){
                return res.json({"status" :  "valid token"});
            }else{
                return res.status(404).json({status: "bad token"});
            }
        });
    })

    router.get('/users/:id/avatar', validate(), auth(), function(req, res, next){
        let id = req.params.id;
        File.findFile(avatarFilePath, id, function(avatar){
            if(avatar.length > 0){
                let file = avatar[0];
                //todo: fix problem with file name containing a comma
                let options = {
                    headers:{
                        'Content-Disposition': "inline; filename="+file.get("name")
                    }
                };
                let abs = path.resolve(__dirname, "../" + file.get("path"));

                res.sendFile(abs, options)
            }else{
                //todo: default avatar logic goes here
                let defaultAvatar = path.resolve(__dirname, "../public/assets/default/avatar-" + (id % 4)+ ".png");
                res.sendFile(defaultAvatar);
            }
        })

    });
    router.put('/users/:id/avatar', auth(), multer({ storage:avatarStorage }).single('avatar'), function(req, res, next){
        let file = req.file;
        file.user_id = req.params.id;
        file.name = file.originalname;
        File.findFile(avatarFilePath, req.params.id, function(avatar){
            if(avatar.length > 0) {
                let avatarToDelete = avatar[0];
                avatarToDelete.delete(function () {
                });
            }
            let avatarToCreate = new File(file);
            avatarToCreate.create(function(err, result){
                result.message = "Avatar Upload!";
                res.json(result);
            })
        })

    });
    //TODO better error handling
    //TODO use next
    router.post("/users/register", function(req, res, next){
        let token = req.query.token;
        if(token) {
            Invitation.findOne("token", token, function(foundInvitation){
                console.log(foundInvitation);
                if(!foundInvitation.data) {
                    res.status(500).send({ error: "invalid token specified" })
                } else {
                    User.findById(foundInvitation.get("user_id"),function(newUser){
                        req.body.id = newUser.get("id");
                        req.body.password = bcrypt.hashSync(req.body.password, 10);
                        Object.assign(newUser.data, req.body);
                        newUser.set("status", "active");
                        newUser.update(function(err, updatedUser){
                            foundInvitation.delete(function(response){
                                console.log("invitation deleted");
                                EventLogs.logEvent(updatedUser.get('id'), `user ${updatedUser.get('id')} ${updatedUser.get('email')} registered`);
                                res.locals.json = updatedUser.data;
                                res.locals.valid_object = updatedUser;
                                next();
                            })
                        })

                    });
                }
            });
        } else if(res.locals.sysprops.allow_registration == "true") {
            if(req.body.name && req.body.email && req.body.password) {
                let newUser = new User(req.body);
                newUser.set("password",bcrypt.hashSync(req.body.password, 10));
                newUser.createWithStripe(function(err, result){
                    if(err) {
                        res.status(403).json({error : err});
                    } else {
                        res.locals.json = result.data;
                        res.locals.valid_object = result;
                        next();
                    }
                });
            } else {
                res.status(403).json({error : "Name, email, and password are all required!"});
            }
        }else{
            res.status(403).json({error : "Registration disabled"})
        }
    },function(req, res, next){
        req.logIn(res.locals.valid_object, {session:true}, function(err) {
            if(!err){
                console.log("usa logged in!");
                next();
            }else{
                console.error("Issue logging in: ", err)
                next();
            }

        });

    },require("../middleware/role-session")(), function(req, res, next){
        let user_role = new Role({"id" : req.user.data.role_id});
        user_role.getPermissions(function(perms){
            let permission_names = perms.map(perm => perm.data.permission_name);
            res.locals.json = {"message" : "successful signup", "permissions" : permission_names };
            next();
        });
    }, mailer('registration_user', 'id'), mailer('registration_admin', null));





    //TODO add the registration url to the email
    router.post('/users/invite', auth(), function(req, res, next){
        //todo: no hardcoded role
        let newUser = new User({"email" : req.body.email,"role_id":3, "status":"invited"});
        User.findAll("email", req.body.email, function(foundUsers){
            if(foundUsers.length != 0){
                res.status(400).json({error: 'This email already exists in the system'});
            }
            else{
                newUser.createWithStripe(function(err, resultUser){
                    if(!err) {
                        let invite = new Invitation({"user_id" : resultUser.get("id")});
                        invite.create(function(err, result){
                            if(!err) {
                                let apiUrl = req.protocol + '://' + req.get('host') + "/api/v1/users/register?token=" + result.get("token");
                                let frontEndUrl = req.protocol + '://' + req.get('host') + "/invitation/" + result.get("token");
                                EventLogs.logEvent(req.user.get('id'), `users ${req.body.email} was invited by user ${req.user.get('email')}`);
                                res.locals.json = {url: frontEndUrl, api:apiUrl};
                                result.set('url', frontEndUrl);
                                result.set('api', apiUrl);
                                res.locals.valid_object = result;
                                next();
                            } else {
                                res.status(403).json({error : err});
                            }
                        });
                    } else {
                        res.status(403).json({error : err});
                    }
                });
            }
        })
    }, mailer('invitation', 'user_id'));

    //Override post route to hide adding users
    router.post(`/users`, function(req,res,next){
        res.sendStatus(404);
    });


    router.put("/users/:id(\\d+)", validate(User), auth(null, User, "id"), function(req, res, next){
        let user = res.locals.valid_object;
        if(user.get("id") == req.user.get("id")){
            delete user.data.role_id;
        }
        req.body.id = req.params.id;
        if(req.body.password) {
            req.body.password = bcrypt.hashSync(req.body.password, 10);
        }
        Object.assign(user.data, req.body);
        console.log("updating the user");
        user.updateWithStripe(function (err, result) {
            if(!err) {
                delete result.password;
                let out = {
                    message: 'User is successfully updated',
                    results: result
                }
                res.json(out);
            } else {
                res.json({message: `Error updating the user ${err}`});
            }
        });
    });

    router.post("/users/:id(\\d+)/suspend", validate(User), auth(null, User, "id"), function (req, res) {
        let user = res.locals.valid_object;
        user.suspend(function (err, updated_user) {
            if(!err) {
                res.status(200).json(updated_user);
                mailer('user_suspension', 'id')(req, res, next);
            } else {
                res.status(400).json({error: err});
            }
        });
    });

    router.delete(`/users/:id(\\d+)`, validate(User), auth(null, User, "id"), function (req, res, next) {
        let user = res.locals.valid_object;
        user.deleteWithStripe(function (err, completed_msg) {
            if(!err) {
                res.status(200).json({message: completed_msg});
                mailer('user_deletion', 'id')(req, res, next);
            } else {
                res.status(400).json({error: err});
            }
        });
    });

    //Extend Entity
    require("./entity")(router, User, "users", "id");



    //Strip passwords from all user things
    router.all("*", function(req, res, next){
        if(res.locals.json){
            if(res.locals.json.password){
                delete res.locals.json.password;

            }else if(Array.isArray(res.locals.json)){
                res.locals.json = res.locals.json.map(user => {
                    delete user.password;
                    return user;
                } )
            }
        }
        next();
    });

    return router;
};