
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

var notifier = function(templateName, userCorrelator="user_id", targetObject=null){
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




module.exports = mailer;
