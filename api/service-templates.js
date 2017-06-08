
let async = require('async');
let auth = require('../middleware/auth');
let mailer = require('../middleware/mailer');
let validate = require('../middleware/validate');
let ServiceCategory = require('../models/service-category');
let ServiceTemplate = require('../models/service-template');
let ServiceInstance = require("../models/service-instance");
let ServiceTemplateProperty = require("../models/service-template-property");
let EventLogs = require('../models/event-log');
let multer = require("multer");
let File = require("../models/file");
let mkdirp = require("mkdirp");
let path = require("path");
let _ = require("lodash");
let xss = require('xss');

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
    router.post(function(req, res, next){
        if(req.body && req.body.details != null){
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
     * The request function will request a new service instance
     */
    router.post("/service-templates/:id/request", validate(ServiceTemplate), auth(), function (req, res, next) {
        let serviceTemplate = res.locals.valid_object;
        let req_uid = req.user.get("id");
        let req_body = req.body;
        let permission_array = res.locals.permissions;

        serviceTemplate.requestPromise(req_uid, req_body, permission_array)
            .then(function (service) {
                //Send the main based on the requester
                return new Promise(function (resolve, reject) {
                    if(service.data.user_id == req_uid) {
                        mailer('request_service_instance_user','user_id', service)(req,res,next);
                    } else {
                        mailer('request_service_instance_admin','user_id', service)(req,res,next);
                    }
                    return resolve(service);
                });
            }).then(function (service) {
                return new Promise(function (resolve, reject) {
                    EventLogs.logEvent(req.user.get('id'), `service-templates ${req.params.id} was requested by user ${req.user.get('email')} and service-instance was created`);
                    res.status(200).json(service);
                    return resolve(service);
                });
            }).catch(function (err) {
                res.status(400).json({error: err});
            });
    });

    router.post("/service-templates", auth(), function (req, res, next) {
        req.body.created_by = req.user.get("id");
        next();
    });

    router.get("/service-templates/public", function (req, res, next) {
        console.log("getting service templates")
        let key = "published";
        let value = true;
        let updatedTemplates = [];
        ServiceTemplate.findAll(key, value, function (templates) {
            if(templates.length == 0){
                return res.json([]);
            }
            templates.forEach(template => {
                template.data.references = {};
                template.getRelated(ServiceCategory, function (props) {
                    template.data.references[ServiceCategory.table] = props.map(entity => entity.data);
                    updatedTemplates.push(template);
                    if (updatedTemplates.length == templates.length) {
                        res.json(updatedTemplates.map(function (entity) {
                            delete entity.data.overhead;
                            return entity.data
                        }))
                    }
                });
            });

        });
    });

    router.get(`/service-templates/search`, function (req, res, next) {
        if (!req.isAuthenticated()) {
            let updatedTemplates = [];
            ServiceTemplate.search(req.query.key, req.query.value, function (templates) {
                templates.forEach(template => {
                    template.data.references = {};
                    template.getRelated(ServiceCategory, function (props) {
                        template.data.references[ServiceCategory.table] = props.map(entity => entity.data);
                        updatedTemplates.push(template);
                        if (updatedTemplates.length == templates.length) {
                            res.json(updatedTemplates.map(function (entity) {
                                delete entity.data.overhead;
                                return entity.data
                            }))
                        }
                    });
                });
            });

        }
        else {
            console.log("authorized person, go on");
            next();
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