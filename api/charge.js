let auth = require('../middleware/auth');
let validate = require('../middleware/validate');
let Charge = require('../models/charge');
let EventLogs = require('../models/event-log');

module.exports = function(router) {
    /**
     * Approve a Charge Item from a service instance (Subscription)
     */
    router.post("/charge/:id/approve", validate(Charge, "id"), auth(null, Charge), function(req, res) {
        let charge_item = res.locals.valid_object;
        charge_item.approve(function (err, result) {
            if(!err) {
                EventLogs.logEvent(req.user.get('id'), `charge ${req.params.id} was approved by user ${req.user.get('email')}`);
                res.json(result);
            } else {
                res.json({error: err})
            }
        });
    });

    /**
     * Cancel a Charge Item from a service instance (Subscription)
     */
    router.post("/charge/:id/cancel", validate(Charge, "id"), auth(null, Charge), function(req, res) {
        let charge_item = res.locals.valid_object;
        charge_item.cancel(function (result) {
            EventLogs.logEvent(req.user.get('id'), `charge ${req.params.id} was canceled by user ${req.user.get('email')}`);
            res.json(result);
        });
    });

    return router;
};