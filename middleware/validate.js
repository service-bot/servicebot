/**
 * ValidateRequest function will validate the page requested by the user. If the request is valid, the system will
 * view the page to the user. Otherwise, the system will redirect the user to the 404 page.
 * @param model - The model to check against. by default most validation happens in the User model.
 * @param params_name - The req.params.<NAME> to check the validation for. default is :id.
 * @param correlation_id - Is the field to check the req.params.<NAME> against. Default to id.
 * @returns - Returns the found object, otherwise it will redirect to 404 page.
 */
var User = require('../models/user.js');

var validateRequest = function (model=User, correlation_id="id", params_name="id") {
    return function (req, res, next) {
        let id;
        if(req.params[correlation_id]) {
            id = req.params[correlation_id];
        }
        else{
            id = correlation_id;
        }
        model.findOne(params_name, id, function(result){
            if(result.data){
                //If the object exist, return it as well as continuing the process:
                res.locals.valid_object = result;
                return next();
            } else {
                return res.status(404).send('Sorry, we cannot find that!');
            }
        });
    }
}

module.exports = validateRequest;