
let auth = require('../middleware/auth');
let validate = require('../middleware/validate');
let async = require("async")
let jwt = require('jsonwebtoken');
let bcrypt = require("bcryptjs");
let NotificationTemplate = require("../models/notification-template");
let Role = require("../models/role");
let ResetRequest = require("../models/password-reset-request")
let User = require("../models/user");
let Alert = require("react-s-alert").default;
let store = require("../config/redux/store");

module.exports = function(app, passport) {

    //TODO: buff up security so each user has their own secret key
    //TODO: security key..... no hardcoded strings plzzzz (along with the comment above)
    app.post('/api/v1/auth/token', passport.authenticate('local-login', {session:false}), function(req, res) {
        console.log(req.user);
        let token = jwt.sign({  uid: req.user.data.id }, process.env.SECRET_KEY, { expiresIn: '3h' });
        console.log(token);
        console.log(jwt.verify(token, process.env.SECRET_KEY));
        res.json({token:token});
    });

    app.get('/api/v1/auth/session/clear', function(req, res) {
        res.clearCookie("permissions", {path: "/"});
        res.clearCookie("username", {path: "/"});
        res.clearCookie("uid", {path: "/"});
        req.logout();
        res.json({"message" : "successful logout"});
    });

    app.post("/api/v1/auth/reset-password", function(req, res, next){
        User.findOne("email", req.body.email, function(user){
            if(user.data){
                ResetRequest.findAll("user_id", user.get("id"), function(requests){
                    async.each(requests, function(request, callback){
                        request.delete(function(result){
                            callback();
                        })
                    }, function(err){
                        require('crypto').randomBytes(20, function(err, buffer) {
                            let token = buffer.toString("hex");
                            let reset = new ResetRequest({
                                user_id: user.get("id"),
                                hash: bcrypt.hashSync(token, 10)
                            });
                            reset.create(function(err, newReset){
                                let frontEndUrl = `${req.protocol}://${req.get('host')}/reset-password/${user.get("id")}/${token}`;
                                res.json({message: "Success"});
                                user.set("token", token);
                                user.set("url", frontEndUrl);
                                store.dispatchEvent("password_reset_request_created", user);
                                next();
                                // mailer('password_reset', 'user_id', newReset)(req, res, next);
                            })
                        });
                    });
                });
            }else{
                res.json({"message" : "Reset link sent"});
            }
        });
    });

    app.get("/api/v1/auth/reset-password/:uid/:token",  function(req, res, next){
        console.log(bcrypt.hashSync(req.params.token, 10));
        ResetRequest.findOne("user_id", req.params.uid, function(result){
            if(result.data && bcrypt.compareSync(req.params.token, result.get("hash"))){
                res.status(200).json({isValid: true});
            }else{
                res.status(400).json({isValid: false, error: "Invalid Reset Link"})
            }
        });
    });

    //todo -- token expiration
    app.post("/api/v1/auth/reset-password/:uid/:token", function(req, res, next){
        ResetRequest.findOne("user_id", req.params.uid , function(result){
            if(result.data && bcrypt.compareSync(req.params.token, result.get("hash"))){
                User.findOne("id", result.get("user_id"), function(user){
                    let password = bcrypt.hashSync(req.body.password, 10);
                    user.set("password", password);
                    user.update(function(err, updated){
                        res.json({"message" : "Password successfully reset"});
                        result.delete(function(r){
                           console.log("reset request deleted");
                        });
                    })
                })
            }else{
                res.status(400).json({error: "Invalid Reset Link"})
            }
        })

    });

    app.post('/api/v1/auth/session', function(req,res,next){
        passport.authenticate('local-login', function(err, user, info) {
            if (err) { return res.json({"error" : "Invalid username or password"}); }
            if (!user) { return res.json({"error" : "Invalid username or password"}) }
            req.logIn(user, {session:true}, function(err) {
                if (err) { return next(err); }
                user.set("last_login", new Date());
                user.update(function(err, result){
                    if(err){return next(err);}
                    return next();
                })
            });
        })(req, res, next);
    },require("../middleware/role-session")(), function(req, res, next){
        let user_role = new Role({"id" : req.user.data.role_id});
        user_role.getPermissions(function(perms){
            let permission_names = perms.map(perm => perm.data.permission_name);
            res.json({"message" : "successful login", "permissions" : permission_names })
        });
    });


    };