let Invitation = require('../models/invitation');

module.exports = function (router) {
    router.get('/invitation/:invitation_id', function (req, res, next) {
        Invitation.findOne("token", req.params.invitation_id, function (result) {
            if (result.data) {
                return res.json({"status": "valid token"});
            } else {
                return res.status(404).json({status: "bad token"});
            }
        });
    })
}
