
let auth = require('../middleware/auth');
let validate = require('../middleware/validate');
let Invoice = require('../models/invoice');
let User = require('../models/user');

module.exports = function(router) {

    /**
     * Pre-check before the Entity Route
     * Update the user invoices prior to rendering it
     */
    router.get("/invoices/own", auth(), function(req, res, next) {
        user = req.user;
        Invoice.fetchUserInvoices(user).then(function (result) {
            next();
        }).catch(function (err) {
            console.error(err);
            next();
            //res.status(400).json({error: err});
        });
    });

    /**
     * Pre-check before the Entity Route
     * Update the user invoices prior to rendering it if the request has user_id
     */
    router.get("/invoices", auth(), function(req, res, next) {
        let key = req.query.key;
        //Only update the user invoices
        if(key == 'user_id'){
            let value = req.query.value;
            User.findOne('id', value, function (user) {
                Invoice.fetchUserInvoices(user).then(function (result) {
                    next();
                }).catch(function (err) {
                    console.error(err);
                    next();
                    //res.status(400).json({error: err});
                });
            });
        } else {
            next();
        }
    });

    /**
     * User GET User Upcoming Invoice API call
     */
    router.get("/invoices/upcoming/:id", validate(User, "id"), auth(null, User, "id"), function(req, res) {
        let user = res.locals.valid_object;
        Invoice.getUpcomingInvoice(user, function (upcoming_invoice) {
            res.json(upcoming_invoice);
        });
    });

    /**
     * Apply a refund to an invoice
     */
    router.post("/invoices/:id/refund", validate(Invoice), auth(), function(req, res) {
        let amount = req.body.amount;
        let reason = req.body.reason;
        let invoice = res.locals.valid_object;
        invoice.refund(amount, reason, function (err, refund) {
            if(!err) {
                res.status(200).json(refund);
            } else {
                res.status(400).json({error: err});
            }
        });
    });

    //Override post route to hide adding invoices
    router.post(`/invoices`, function(req,res,next){
        res.sendStatus(404);
    });

    //Override post route to hide deleting invoices
    router.delete(`/invoices/:id(\\d+)`, function(req,res,next){
        res.sendStatus(404);
    });

    //Override post route to hide updating invoices
    router.put(`/invoices/:id(\\d+)`, function(req,res,next){
        res.sendStatus(404);
    });

    // Extend Entity
    require("./entity")(router, Invoice, "invoices", "user_id");

    return router;
};