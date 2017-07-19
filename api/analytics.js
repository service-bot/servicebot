
let analytics = require("../lib/analytics");
let validate = require('../middleware/validate');
let ServiceTemplate = require('../models/service-template');
let serviceInstanceProperty = require("../models/service-instance-property");
let auth = require('../middleware/auth');

module.exports = function(router) {
    router.get(`/analytics/version`, function(req,res,next){
        console.log(res.locals.sysprops);
        res.locals.json = {"version" : res.locals.sysprops.app_version}
        next();
    })
    router.get(`/analytics/data`, auth(), function(req, res, next){
        analytics.getAnalyticsData(function(data){
            res.json(data);
        });
    });

    router.get('/analytics/properties/:id', validate(ServiceTemplate), auth(), function (req, res, next) {
        serviceInstanceProperty.getByTemplateId(req.params.id, function(properties){
            res.json(properties.map(entity => entity.data));
        });
    });

    return router;
};