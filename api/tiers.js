

module.exports = function(router) {
    let Tier = require('../models/tier');
    // router.get("/service-categories", function(req, res, next){
    //     if (!req.isAuthenticated()) {
    //         let key = req.query.key;
    //         let value = req.query.value;
    //         if (!key || !value) {
    //             key = undefined;
    //             value = undefined;
    //         }
    //         ServiceCategories.findAll(key, value, function (templates) {
    //             res.json(templates.map(entity => entity.data))
    //         });
    //     }
    //     else {
    //         console.log("authorized person, go on");
    //         next();
    //     }
    // });
    require("./entity")(router, Tier, "tiers");

    return router;
};