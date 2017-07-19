let async = require('async');
let auth = require('../middleware/auth');
let validate = require('../middleware/validate');
let EventLogs = require('../models/event-log');
let File = require("../models/file");
let Fund = require('../models/fund');
let Invitation = require('../models/invitation');
let ServiceCategory = require('../models/service-category');
let ServiceTemplate = require('../models/service-template');
let ServiceInstance = require("../models/service-instance");
let ServiceTemplateProperty = require("../models/service-template-property");
let Role = require('../models/role');
let User = require('../models/user');
let multer = require("multer");
let mkdirp = require("mkdirp");
let path = require("path");
let _ = require("lodash");
let xss = require('xss');
let dispatchEvent = require("../config/redux/store").dispatchEvent;

//todo: generify single file upload for icon, image, avatar, right now duplicate code
let iconFilePath = ServiceTemplate.iconFilePath;
let imageFilePath = ServiceTemplate.imageFilePath;


let iconStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        mkdirp(iconFilePath, err => cb(err, iconFilePath))
    },
    filename: function (req, file, cb) {
        require('crypto').pseudoRandomBytes(8, function (err, raw) {
            cb(err, err ? undefined : req.params.id + "-" + raw.toString('hex'))
        })
    }
});

let imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        mkdirp(imageFilePath, err => cb(err, imageFilePath))
    },
    filename: function (req, file, cb) {
        require('crypto').pseudoRandomBytes(8, function (err, raw) {
            cb(err, err ? undefined : req.params.id + "-" + raw.toString('hex'))
        })
    }
});

//todo - entity posting should have correct error handling, response should tell user what is wrong like if missing column


module.exports = function (router) {

    //strips out possible xss
    router.post(function (req, res, next) {
        if (req.body && req.body.details != null) {
            req.body.details = xss(req.body.details);
        }
        next();
    })

    router.get('/service-templates/:id/icon', validate(ServiceTemplate), function (req, res, next) {
        let id = req.params.id;
        File.findFile(iconFilePath, id, function (icon) {
            if (icon.length > 0) {
                let file = icon[0];
                let options = {
                    headers: {
                        'Content-Disposition': "inline; filename=" + file.get("name")
                    }
                };
                let abs = path.resolve(__dirname, "../" + file.get("path"));

                res.sendFile(abs, options)
            } else {
                //todo: default icon logic goes here
                res.status("400").send("no avatar");
            }
        })

    });
    router.put('/service-templates/:id/icon', auth(null, ServiceTemplate, 'created_by'), multer({storage: iconStorage}).single("template-icon"), function (req, res, next) {
        let file = req.file;
        file.user_id = req.user.get('id');
        file.name = file.originalname;
        File.findFile(iconFilePath, req.params.id, function (templateIcon) {
            console.log(templateIcon)
            if (templateIcon.length > 0) {
                let iconToDelete = templateIcon[0];
                iconToDelete.delete(function () {
                });
            }
            let icon = new File(file);
            icon.create(function (err, result) {
                console.log(result);
                result.message = "Icon Uploaded"
                res.json(result);
            })
        })

    });


    router.get('/service-templates/:id/image', validate(ServiceTemplate), function (req, res, next) {
        let id = req.params.id;
        File.findFile(imageFilePath, id, function (image) {
            if (image.length > 0) {
                let file = image[0];
                let options = {
                    headers: {
                        'Content-Disposition': "inline; filename=" + file.get("name")
                    }
                };
                let abs = path.resolve(__dirname, "../" + file.get("path"));

                res.sendFile(abs, options)
            } else {
                //todo: default image logic goes here
                res.status("400").send("no template image");
            }
        })

    });

    router.put('/service-templates/:id/image', auth(null, ServiceTemplate, 'created_by'), multer({storage: imageStorage}).single('template-image'), function (req, res, next) {
        let file = req.file;
        file.user_id = req.user.get('id');
        file.name = file.originalname;
        File.findFile(imageFilePath, req.params.id, function (image) {
            console.log(image)
            if (image.length > 0) {
                let imageToDelete = image[0];
                imageToDelete.delete(function () {
                });
            }
            let imageToCreate = new File(file);
            imageToCreate.create(function (err, result) {
                console.log(result);
                result.message = "Image Uploaded"
                res.json(result);
            })
        })

    });

    router.get('/service-templates/:id/request', validate(ServiceTemplate), function (req, res, next) {
        let serviceTemplate = res.locals.valid_object;
        serviceTemplate.data.references = {};
        serviceTemplate.getRelated(ServiceTemplateProperty, function (props) {
            //this object for authenticated call
            res.locals.valid_object.data.references[ServiceTemplateProperty.table] = props.map(entity => entity.data);
            console.log(res.locals.valid_object);
            if (!req.isAuthenticated()) {
                let publicProps = _.filter(props, (prop => !prop.data.private));
                serviceTemplate.data.references[ServiceTemplateProperty.table] = publicProps.map(entity => entity.data);
                delete serviceTemplate.data.overhead;
                res.json(serviceTemplate.data);
            }
            else {
                next();
            }
        });
    });
    router.get('/service-templates/:id/request', auth(), function (req, res, next) {
        console.log("authenticated user");
        res.json(res.locals.valid_object.data);
    });


    /**
     * The request function will request a new service instance for an unauthenticated user
     * Creates a new user and adds payment information
     * Requires:
     * user email
     * service template request details
     *
     */
    router.post("/service-templates/:id/request", validate(ServiceTemplate), function (req, res, next) {
        if (!req.isAuthenticated()) {
            let serviceTemplate = res.locals.valid_object;
            let req_body = req.body;
            let permission_array = res.locals.permissions;
            let req_body_email, req_body_token_id;
            if (req_body.hasOwnProperty("email")) {
                let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (req_body.email.match(mailFormat)) {
                    req_body_email = req_body.email;
                }
                else {
                    res.status(400).json({error: 'Invalid email format'});
                }
            } else {
                res.status(400).json({error: 'Must have property: email'});
            }

            if (req_body.hasOwnProperty("token_id")) {
                if (req_body.token_id != '') {
                    req_body_token_id = req_body.token_id;
                }
                else {
                    res.status(400).json({error: 'token_id can not be empty'});
                }
            } else {
                res.status(400).json({error: 'Must have property: token_id'});
            }
            //get default_user_role
            let store = require('../config/redux/store');
            let globalProps = store.getState().options;
            let roleId = globalProps['default_user_role'];
            let newUser = new User({"email": req_body_email, "role_id": roleId, "status": "invited"});
            new Promise((resolve, reject) => {
                //Check for existing user email
                User.findOne("email", req_body_email, foundUser => {
                    if(foundUser.data) {
                        let userId = foundUser.get('id');
                        Invitation.findOne("user_id", userId, foundInvitation => {
                            if(foundInvitation.data){
                                reject('Invitation already exists for this user')
                            }
                            else{
                                reject('This email already exists in the system')
                            }
                        })
                    }
                    else{
                        resolve()
                    }
                });
            })
                .then(() => {
                    //create new user
                    return new Promise((resolve, reject) => {
                        newUser.createWithStripe((err, resultUser) => {
                            if (!err) {
                                req.logIn(resultUser, {session:true}, function(err) {
                                    if(!err){
                                        console.log("user logged in!");
                                        resolve(resultUser);
                                    }else{
                                        console.error("Issue logging in: ", err)
                                        resolve(resultUser);
                                    }

                                });
                            }
                            else {
                                reject(err);
                            }
                        });
                    });
                })
                .then(resultUser => {
                    //create invitation
                    return new Promise((resolve, reject) => {
                        let invite = new Invitation({"user_id": resultUser.get("id")});
                        invite.create((err, result) => {
                            if (!err) {
                                res.locals.apiUrl = req.protocol + '://' + req.get('host') + "/api/v1/users/register?token=" + result.get("token");
                                res.locals.frontEndUrl = req.protocol + '://' + req.get('host') + "/invitation/" + result.get("token");
                                EventLogs.logEvent(resultUser.get('id'), `user ${resultUser.get('email')} was created by self request`);
                                resolve(resultUser);
                            } else {
                                reject(err);
                            }
                        });
                    });
                })
                .then(resultUser => {
                    //create fund
                    console.log("TOKEN", req_body_token_id);
                    return Fund.promiseFundCreateOrUpdate(resultUser.get('id'), req_body_token_id);
                })
                .then(fund => {
                    //create service instance
                    return serviceTemplate.requestPromise(fund.get('user_id'), req_body, permission_array);
                })
                .then(service => {
                    //Send the mail based on the requester
                    return new Promise((resolve, reject) => {
                        service.set('api', res.locals.apiUrl);
                        service.set('url', res.locals.frontEndUrl);
                        dispatchEvent("service_instance_requested_new_user", service);
                        // mailer('request_service_instance_new_user', 'user_id', service)(req, res, next);
                        //TODO whats going on here @bsears?
                        let user_role = new Role({"id" : 3});
                        user_role.getPermissions(function(perms){
                            let permission_names = perms.map(perm => perm.data.permission_name);
                            service.set("permissions", permission_names);
                            return resolve(service);
                        });
                    });
                })
                .then(service => {
                    //create event log
                    return new Promise((resolve, reject) => {
                        EventLogs.logEvent(service.get('user_id'), `service-templates ${service.get('service_id')} was requested by user ${service.get('user_id')} and service-instance was created`);
                        res.status(200).json(service.data);
                        return resolve(service);
                    });
                })
                .catch(err => {
                    console.error('Service template request from new user error: ', err);
                    res.status(400).json({error: err});
                });
        }
        else {
            next();
        }
    });


    /**
     * The request function will request a new service instance for an authenticated user
     */
    router.post("/service-templates/:id/request", validate(ServiceTemplate), auth(), function (req, res, next) {
        let serviceTemplate = res.locals.valid_object;
        let req_uid = req.user.get("id");
        let req_body = req.body;
        let permission_array = res.locals.permissions;
        new Promise((resolve, reject) => {
            if (req_body.hasOwnProperty("token_id")) {
                if (req_body.token_id != '') {
                    return resolve(Fund.promiseFundCreateOrUpdate(req_uid, req_body.token_id))
                }
                else {
                    return resolve();
                }
            } else {
                return resolve();
            }
        })
            .then(() => serviceTemplate.requestPromise(req_uid, req_body, permission_array))
            .then(function (service) {

                //Send the main based on the requester
                return new Promise(function (resolve, reject) {
                    console.log(service);
                    if (service.data.user_id == req_uid) {
                        dispatchEvent("service_instance_requested_by_user", service);
                    } else {
                        dispatchEvent("service_instance_requested_for_user", service);
                    }
                    return resolve(service);
                });
            })
            .then(function (service) {
                return new Promise(function (resolve, reject) {
                    // EventLogs.logEvent(req.user.get('id'), `service-templates ${req.params.id} was requested by user ${req.user.get('email')} and service-instance was created`);
                    res.status(200).json(service.data);
                    return resolve(service);
                });
            }).catch(function (err) {
                console.log(err);
            res.status(400).json({error: err});
        });
    });


    router.post("/service-templates", auth(), function (req, res, next) {
        req.body.created_by = req.user.get("id");
        next();
    });

    router.get("/service-templates/public", function (req, res, next) {
        let key = "published";
        let value = true;

        new Promise((resolve, reject) => {
            //Get the list of templates and apply order from query if requested
            if (req.query.order_by) {
                console.log(`Query sent with order by ${req.query.order_by}`);
                let order = 'ASC';
                if (req.query.order) {
                    console.log(`Query sent with order ${req.query.order}`);
                    if (req.query.order.toUpperCase() === 'DESC') {
                        order = 'DESC';
                    }
                }
                ServiceTemplate.findAllByOrder(key, value, req.query.order_by, order, templates => {
                    if (templates.length == 0) {
                        reject('No published templates found')
                    }
                    else {
                        resolve(templates);
                    }
                })
            }
            else {
                ServiceTemplate.findAll(key, value, templates => {
                    if (templates.length == 0) {
                        reject('No published templates found')
                    }
                    else {
                        resolve(templates);
                    }
                })
            }
        })
            .then((templates) => {
                //Apply the query limit to the array of templates
                return new Promise((resolve, reject) => {
                    if (req.query.limit) {
                        console.log(`Query sent with limit ${req.query.limit}`);
                        if (isNaN(req.query.limit)) {
                            console.log(`limit ${req.query.limit} is not a number`);
                            reject(`limit ${req.query.limit} must be a number`)
                        }
                        else {
                            resolve(templates.slice(0, req.query.limit));
                        }
                    }
                    else {
                        resolve(templates);
                    }
                });
            })
            .then(templates => {
                //Attach references to templates
                return Promise.all(templates.map(template => {
                    return new Promise((resolve, reject) => {
                        template.attachReferences(updatedParent => {
                            resolve(updatedParent);
                        })
                    })
                }))
            })
            .then(templates => {
                //send response
                res.json(templates.map(function (entity) {
                    delete entity.data.overhead;
                    return entity.data
                }))
            })
            .catch(err => {
                //send error response
                console.error('Error with Get public templates request: ', err);
                res.status(400).json({error: err});
            });
    });


    router.get(`/service-templates/search`, function (req, res, next) {
        function getPublicSearch() {
            new Promise((resolve, reject) => {
                ServiceTemplate.search(req.query.key, req.query.value, function (templates) {
                    if (templates.length == 0) {
                        reject('No published templates found with search criteria')
                    }
                    else {
                        resolve(templates);
                    }
                })
            })
                .then(templates => {
                    //filter for published templates
                    return new Promise((resolve, reject) => {
                        resolve(_.filter(templates, 'data.published'));
                    });
                })
                .then(templates => {
                    //Attach references to templates
                    return Promise.all(templates.map(template => {
                        return new Promise((resolve, reject) => {
                            template.attachReferences(updatedParent => {
                                resolve(updatedParent);
                            })
                        })
                    }))
                })
                .then(templates => {
                    //send response
                    res.json(templates.map(function (entity) {
                        delete entity.data.overhead;
                        return entity.data
                    }))
                })
                .catch(err => {
                    //send error response
                    console.error('Error with Get public templates request: ', err);
                    res.status(400).json({error: err});
                });
        }

        if (!req.isAuthenticated()) {
            getPublicSearch();
        }
        else {
            //If the user is authenticated and has the role 'user' allow to see public templates
            new Promise((resolve, reject) => {
                Role.findOne("id", req.user.get("role_id"), function (role) {
                    resolve(role.get('role_name') === 'user');
                })
            })
                .then(function (isUser) {
                    if (isUser) {
                        getPublicSearch();
                    }
                    else {
                        //admin or staff go to entity route
                        next();
                    }
                });
        }

    });

    //before generics
    require("./entity")(router, ServiceTemplate, "service-templates");
    //after generics

    //Todo: service template files need to be removed upon template removal
    // router.delete("/service-templates/:id(\\d+)", validate(ServiceTemplate), auth(), function(req, res, next){
    //     res.locals.valid_object.deleteFiles(function(){
    //         next();
    //     })
    // });

    return router;
};