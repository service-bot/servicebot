
var knex = require('../config/db.js');

/**
 *
 * @param data
 * @constructor
 *
 *
 */

let Permission = require("./base/entity")("user_permissions");

Permission.prototype.delete = function (callback) {
    var id = this.get('id');
    if(!id){
        throw "cannot update non existant"
    }
    knex('roles_to_permissions').where('permission_id', id).del()
        .then(callback())
        .catch(function(err){
            console.log(err);
        });
    knex('user_permissions').where('id', id).del()
        .then(callback())
        .catch(function(err){
            console.log(err);
        });
};


Permission.findByName = function (name, callback) {
    knex(Permission.table).where('permission_name', name)
        .then(function(result){
            if(!result){
                result = [];
            }
            console.log(result);
            callback(new Permission(result[0]))
        })
        .catch(function(err){
            console.log(err);
        });

};


module.exports = Permission;
