
let Template = require("../models/email-template");
let validate = require('../middleware/validate');
let auth = require('../middleware/auth');

module.exports = function(router) {

    router.get("/email-templates/:id(\\d+)", validate(Template), auth(), function(req, res, next){
        let modelName = res.locals.valid_object.get("model");
        let model =  require("../models/" + modelName);
        model.getSchema(true, false, function(result){
            let template = res.locals.valid_object;
            template["schema"] = result;
            console.log(template);
            res.json(template);
        });
    });

    router.get("/email-templates/:id(\\d+)/roles", validate(Template), auth(), function(req, res, next){
        res.locals.valid_object.getRoles(function(roles){
            console.log(roles);
            res.locals.json = roles;
            next();
        })
    });

    router.put("/email-templates/:id(\\d+)/roles", validate(Template), auth(), function(req, res, next) {
        res.locals.valid_object.setRoles(req.body, function(result){
            console.log(result);
            res.locals.json = result;
            next();
        })

    });

    require("./entity")(router, Template, "email-templates");


    return router;
};