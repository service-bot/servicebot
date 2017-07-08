
let SystemOptions = require("../models/system-options");
let NotificationTemplate = require("../models/notification-template");
let transporter = require("../config/transporter");
let User = require("../models/user");



/**
 *
 * @param templateName - takes in a template name and
 * @param userCorrelator - column name of the field holding a user_id to send email to, defaults to user_id
 * @param targetObject - takes in optional target object which will have data pulled from - otherwise default to valid_object
 * @returns {Function}
 */
//youre changing the mailer to promises and Lib function
    //figure out whats going on
    //change to promises
    //simplify
//new one
var mailer = function(template, userId, targetObject){
        return new Promise(function (resolve, reject) {
            let additional_recipients = template.get("additional_recipients") || [];
            //todo this doesn't need to be synchronous
            //Create Notification
            let newNotification = new Notification(notificationAttributes);
            newNotification.create(function (err, notification) {
                if(!err) {
                    console.log("notification created: " + notification.get("id"));
                    return resolve(notification);
                } else {
                    return reject(err);
                }
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                //Attach references
                targetObject.attachReferences(function(updatedObject) {
                    //TODO add global props to the target Object
                    //Object.keys(globalProps).forEach(key => data.set("_" + key, globalProps[key]));
                    //data.set("_hostname", req.hostname);
                    console.log("Attached References")
                    return resolve(updatedObject)
                });
            });
        }).then(function (updatedObject) {
            return new Promise(function (resolve, reject) {
                //Build Message and Subject from template
                template.build(updatedObject, function(message, subject){
                    //TODO add global props to the target Object
                    //Object.keys(globalProps).forEach(key => data.set("_" + key, globalProps[key]));
                    //data.set("_hostname", req.hostname);
                    console.log("Attached References")
                    return resolve(message, subject)
                });
            });
        }).then(function (updatedObject) {
            return new Promise(function (resolve, reject) {
                //Get Email of recipient
                template.build(updatedObject, function(message, subject){
                    //TODO add global props to the target Object
                    //Object.keys(globalProps).forEach(key => data.set("_" + key, globalProps[key]));
                    //data.set("_hostname", req.hostname);
                    console.log("Attached References")
                    return resolve(message, subject)
                });
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                //if send_to_owner send to owner, else Send to people in roles if needed
                if(template.get('send_to_owner')){
                    console.log("Sending mail to Owner now")
                    return resolve();
                }
                else{

                }
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                //Send to additional recipients
                let additional_recipients = template.get("additional_recipients") || [];
                console.log("Gunna saind mail now")
                return resolve(null);
            });
        })

        return function(req,res,next){
            next();
            console.log("Sending Email " + templateName);
            targetObject = targetObject || res.locals.valid_object;
            console.log(targetObject);
            let globalProps = res.locals.sysprops;
            let template;
                //get additional addresses to send emails to
                let additional_recipients = template.get("additional_recipients") || [];
                targetObject.attachReferences(function(data){
                    //attach global props
                    Object.keys(globalProps).forEach(key => data.set("_" + key, globalProps[key]));
                    data.set("_hostname", req.hostname);
                    template.build(data, function(message, subject){
                        console.log(message, subject);
                        //get roles attached to template
                        template.getRoles(function(roles){
                            roles.forEach(role => {
                                //get users with role
                                role.getUsers(function(users){
                                    users.forEach(user => {
                                        //don't double send messages
                                        if(user.get("id") != targetObject.get(userCorrelator) && !additional_recipients.includes(user.get("email"))) {
                                            console.log("1st email method!!")
                                            sendMail(user.get("email"), message, subject)
                                        }
                                    })
                                })
                            })
                        })
                        //if correlator equals id then this is a user object
                        //Todo clean this up, time crunch
                        console.log("correlator: " + userCorrelator)
                        if(userCorrelator != null){
                            if(userCorrelator == 'id'){
                                console.log("2nd email method!!")
                                sendMail(targetObject.get("email"), message, subject);

                                additional_recipients.forEach(address =>{
                                    if(address != targetObject.get("email")) {
                                        console.log("SENDING TO " + address);
                                        console.log("3rd email method!!")
                                        sendMail(address, message, subject);
                                    }
                                })
                            }
                            else {
                                User.findOne("id", targetObject.get(userCorrelator), function (targetUser) {
                                    console.log(targetUser)
                                    sendMail(targetUser.get("email"), message, subject);

                                    additional_recipients.forEach(address => {
                                        if (address != targetUser.get("email")) {
                                            console.log("SENDING TO " + address);
                                            console.log("4th email method!!")
                                            sendMail(address, message, subject);
                                        }
                                    })

                                })
                            }
                        }
                        //send email here!
                    })
                })
        }
    };
//Old one
var mailer = function(templateName, userCorrelator="user_id", targetObject=null){
    return function(req,res,next){
        next();
        console.log("Sending Email " + templateName);
        targetObject = targetObject || res.locals.valid_object;
        console.log(targetObject);
        let globalProps = res.locals.sysprops;
        NotificationTemplate.findOne("name", templateName, function(template){
            //get additional addresses to send emails to
            let additional_recipients = template.get("additional_recipients") || [];
            targetObject.attachReferences(function(data){
                //attach global props
                Object.keys(globalProps).forEach(key => data.set("_" + key, globalProps[key]));
                data.set("_hostname", req.hostname);
                template.build(data, function(message, subject){
                    console.log(message, subject);
                    //get roles attached to template
                    template.getRoles(function(roles){
                        roles.forEach(role => {
                            //get users with role
                            role.getUsers(function(users){
                                users.forEach(user => {
                                    //don't double send messages
                                    if(user.get("id") != targetObject.get(userCorrelator) && !additional_recipients.includes(user.get("email"))) {
                                        console.log("1st email method!!")
                                        sendMail(user.get("email"), message, subject)
                                    }
                                })
                            })
                        })
                    })
                    //if correlator equals id then this is a user object
                    //Todo clean this up, time crunch
                    console.log("correlator: " + userCorrelator)
                    if(userCorrelator != null){
                        if(userCorrelator == 'id'){
                            console.log("2nd email method!!")
                            sendMail(targetObject.get("email"), message, subject);

                            additional_recipients.forEach(address =>{
                                if(address != targetObject.get("email")) {
                                    console.log("SENDING TO " + address);
                                    console.log("3rd email method!!")
                                    sendMail(address, message, subject);
                                }
                            })
                        }
                        else {
                            User.findOne("id", targetObject.get(userCorrelator), function (targetUser) {
                                console.log(targetUser)
                                sendMail(targetUser.get("email"), message, subject);

                                additional_recipients.forEach(address => {
                                    if (address != targetUser.get("email")) {
                                        console.log("SENDING TO " + address);
                                        console.log("4th email method!!")
                                        sendMail(address, message, subject);
                                    }
                                })

                            })
                        }
                    }
                    //send email here!
                })
            })
        })
    }
};

let sendMail = function(address, message, subject){
    SystemOptions.findAll(undefined, undefined, function(result){
        let company_email = result.filter(option => {return option.data.option == 'company_email'})[0].get("value");
        let company_name = result.filter(option => {return option.data.option == 'company_name'})[0].get("value");
        let mailOptions = {
            from: `"${company_name}" <${company_email}>`, // sender address
            to: address, // list of receivers
            subject: subject, // Subject line
            text: message, // plaintext body
            html: message // html body
        };
        console.log("MAILING!");
        console.log(mailOptions)
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
    });
};


mailer.sendMail = sendMail;

module.exports = mailer;
