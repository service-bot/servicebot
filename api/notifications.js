
let Notification = require("../models/notifications");


//Notification.createFromTemplate()

module.exports = function(router){
    //get system notifications
    router.get("/notifications/system", function(req, res, next){
        Notification.findAll("user_id", null, (notifications) => {
            res.locals.json = notifications.map(notification => notification.data);
            next();
        })
    });
    require("./entity")(router, Notification, "notifications", "user_id");
    return router;
};