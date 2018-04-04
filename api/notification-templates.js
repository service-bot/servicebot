
let NotificationTemplate = require("../models/notification-template");
let validate = require('../middleware/validate');
let auth = require('../middleware/auth');

module.exports = function(router) {

    router.get("/notification-templates/:id(\\d+)", validate(NotificationTemplate), auth(), function(req, res, next){
        let modelName = res.locals.valid_object.get("model");
        let model =  require("../models/" + modelName);
        model.getSchema(true, false, function(result){
            let template = res.locals.valid_object;
            template["schema"] = result;
            res.json(template);
        });
    });

    router.get("/notification-templates/:id(\\d+)/roles", validate(NotificationTemplate), auth(), function(req, res, next){
        res.locals.valid_object.getRoles(function(roles){
            res.locals.json = roles;
            next();
        })
    });

    router.put("/notification-templates/:id(\\d+)/roles", validate(NotificationTemplate), auth(), function(req, res, next) {
        res.locals.valid_object.setRoles(req.body, function(result){
            res.locals.json = result;
            next();
        })

    });

    require("./entity")(router, NotificationTemplate, "notification-templates");


    return router;
};