let async = require('async');
let auth = require('../middleware/auth');
let validate = require('../middleware/validate');
let ServiceInstance = require('../models/service-instance');
let Charge = require('../models/charge');
let EventLogs = require('../models/event-log');
let File = require("../models/file");
let mkdirp = require("mkdirp");
let path = require("path");
let multer= require("multer");
let _ = require('lodash');
let dispatchEvent = require("../config/redux/store").dispatchEvent;
let store = require("../config/redux/store");
//todo - entity posting should have correct error handling, response should tell user what is wrong like if missing column

let serviceFilePath = "uploads/services/files";
let fileManager = store.getState(true).pluginbot.services.fileManager[0];

let uploadLimit = function(){

    return store.getState().options.upload_limit * 1000000;

}

let upload = () => {
    return multer({storage: fileManager.storage(serviceFilePath), limits : {fileSize : uploadLimit()}})
}


module.exports = function(router) {

    /**
     * Remove the payment plan information for the instance update requests
     */
    router.put(`/service-instances/:id(\\d+)`, validate(ServiceInstance), auth(), function(req,res,next){
        delete req.body.user_id;
        delete req.body.payment_plan;
        delete req.body.subscription_id;
        next();
    });

    router.delete(`/service-instances/:id(\\d+)`, validate(ServiceInstance), auth(), function(req,res,next){
        let instance_object = res.locals.valid_object;
        //Only allow removal if the instance is cancelled.
        if(instance_object.data.status === 'cancelled' || !instance_object.data.payment_plan) {
            next();
        } else {
            res.json({error: 'Deleting services is not permitted for security reasons!'});
        }
    });

    router.post('/service-instances/:id/approve', validate(ServiceInstance), auth(), async function(req, res, next) {
        let instance_object = res.locals.valid_object;
        let updatedInstance = await instance_object.subscribe();
        res.json(updatedInstance);
    });


    router.post('/service-instances/:id/reactivate', validate(ServiceInstance), auth(), async function(req, res, next) {
        let instance_object = res.locals.valid_object;
        if(instance_object.get("status") === "cancelled") {
            let lifecycleManager = store.getState(true).pluginbot.services.lifecycleManager;
            instance_object = await instance_object.attachReferences();
            if(lifecycleManager) {
                lifecycleManager = lifecycleManager[0];
                await lifecycleManager.preReactivate({
                    instance: instance_object
                });
            }
            try {
                let paymentPlan = instance_object.get("payment_plan");
                paymentPlan.trial_period_days = 0;
                let updatedInstance = await instance_object.subscribe(paymentPlan);
                res.json(updatedInstance);
                if(lifecycleManager) {
                    lifecycleManager.postReactivate({
                        instance: instance_object
                    });
                }
            }catch(error){
                res.status(500).json({error});
            }
        }else{
            res.status(400).json({"error" : "Instance is not cancelled, cannot be reactivated"})
        }
    });


    router.post('/service-instances/:id/change-price', validate(ServiceInstance), auth(), function(req, res, next) {
        let instance_object = res.locals.valid_object;
        instance_object.changePaymentPlan(req.body).then(function (updated_subscription) {
            res.json(updated_subscription);
            store.dispatchEvent("service_instance_updated", updated_subscription);
        }).catch(function (error) {
            res.json({error});
        });
    });

    router.post('/service-instances/:id/change-properties', validate(ServiceInstance),auth(), async function(req, res, next) {
        let instance_object = res.locals.valid_object;
        try {
            let updatedInstance = await instance_object.changeProperties(req.body.service_instance_properties);
            let attached = await updatedInstance.attachReferences()
            res.json(attached.data);
            store.dispatchEvent("service_instance_updated", updatedInstance);
        }catch(error){
            console.error(error);
            res.status(500).json(error)
        }
    });

    router.post('/service-instances/:id/cancel', validate(ServiceInstance), auth(), async function(req, res, next) {
        let instance_object = res.locals.valid_object;
        try {
            let result = await instance_object.unsubscribe();
            res.json(result);

        } catch (err) {
            console.error(err);
            res.json(err);
        }

    });


    router.post('/service-instances/:id/request-cancellation', validate(ServiceInstance), auth(), function(req, res, next) {
        let instance_object = res.locals.valid_object;
        instance_object.requestCancellation(function(result){
            res.locals.json = result;
            next();
            store.dispatchEvent("service_instance_cancellation_requested", instance_object);
        });
    });


    router.post('/service-instances/:id/add-charge', validate(ServiceInstance), auth(), function(req, res, next) {
        let instance_object = res.locals.valid_object;
        let default_charge = {
            'user_id': instance_object.get('user_id'),
            'service_instance_id': instance_object.get('id'),
            'subscription_id': instance_object.get('subscription_id'),
            'currency': instance_object.data.payment_plan.currency
        };
        let charge_obj = _.assign(default_charge, req.body);
        let charge = new Charge(charge_obj);
        charge.create(function (err, charge_item) {
            res.json(charge_item);
            store.dispatchEvent("service_instance_charge_added", instance_object);
        });
    });

    router.get('/service-instances/:id/awaiting-charges', validate(ServiceInstance), auth(null, ServiceInstance), function(req, res, next) {
        let instance_object = res.locals.valid_object;
        instance_object.getAllAwaitingCharges(function(charges){
            res.json(charges);
        });
    });

    router.post('/service-instances/:id/approve-charges', validate(ServiceInstance), auth(null, ServiceInstance), function(req, res, next) {
        let instance_object = res.locals.valid_object;
        if(instance_object.get('subscription_id')) {
            instance_object.approveAllCharges(function(charges){
                EventLogs.logEvent(req.user.get('id'), `service-instances ${req.params.id} had charges approved by user ${req.user.get('email')}`);
                res.json(charges);
            });
        } else {
            res.json({'error':'Service approval is required prior to paying charges!'});
        }
    });

    router.post('/service-instances/:id/files', validate(ServiceInstance), auth(null, ServiceInstance), upload().array('files'), function(req, res, next) {
        let filesToInsert = req.files.map(function(file){
            if(req.user) {
                file.user_id = req.user.data.id;
            }else{
                file.user_id = res.locals.valid_object.get("user_id");
            }
            file.name = file.originalname;
            return file
        });
        File.batchCreate(filesToInsert, function(files){
            EventLogs.logEvent(req.user.get('id'), `service-instances ${req.params.id} had files added by user ${req.user.get('email')}`);
            res.json(files);
        });
    });

    router.get('/service-instances/:id/files',auth(null, ServiceInstance), function(req, res, next) {
        File.findFile(serviceFilePath, req.params.id, function(files){
            res.json(files);
        })
    });

    router.delete("/service-instances/:id/files/:fid", validate(File, 'fid'), auth(), function(req, res, next){
        File.findOne("id", req.params.fid, function(file) {
            fileManager.deleteFile(file).then(() => {
                res.json({message: "File Deleted!"});
            })
        })
    });


    router.get("/service-instances/:id/files/:fid", validate(File, 'fid'), auth(null, ServiceInstance), function(req, res, next){
        File.findOne("id", req.params.fid, function(file){
            fileManager.sendFile(file, res);
        })
    });

    //Override post route to hide adding instances
    router.post(`/service-instances`, function(req,res,next){
        res.sendStatus(404);
    });


    require("./entity")(router, ServiceInstance, "service-instances", "user_id");

    /**
     * Used to send mail for instance update
     */
    // router.put(`/service-instances/:id(\\d+)`, (req, res, next) => {
    //     dispatchEvent(`${model.table}_created`)
    // });
    //
    return router;
};