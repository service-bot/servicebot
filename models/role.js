
var knex = require('../config/db');

/**
 *
 * @param data
 * @constructor
 *
 *
 */

let Role = require("./base/entity")("user_roles");
let Permission = require("./permission");
Role.prototype.delete = function (callback) {
    var id = this.get('id');
    if(!id){
        throw "cannot update non existant"
    }
    knex('roles_to_permissions').where('role_id', id).del()
        .then(callback())
        .catch(function(err){
            console.error(err);
        });
    knex('user_roles').where('id', id).del()
        .then(callback())
        .catch(function(err){
            console.error(err);
        });
};

/**
 *
 * @param permissions array of permission objects
 * @param callback
 */
Role.prototype.assignPermission = function (permissions, callback) {
    var self = this;
    var insert = permissions.map(function(permission){
        return {
            role_id : self.get("id"),
            permission_id : permission.get('id')
        };
    });
    // insert.role_id = this.data.id;
    // insert.permission_id = permission.get('id');
    knex('roles_to_permissions').returning('id').insert(insert)
        .then(function(result){
            self.set("id", result[0]);
            callback(self);
        })
        .catch(function(err){
            console.log("error creating : " + err);
        });
};


//todo: improve to not delete
Role.prototype.setPermissions = function(permissions, callback){
    let self = this;
    knex('roles_to_permissions').where("role_id", self.get("id")).delete()
        .then(function(result){
            let roles_to_permission = permissions.map(function(perm){
                return {"permission_id" : perm, "role_id" : self.get("id")};
            })
            knex('roles_to_permissions').returning("*").insert(roles_to_permission)
                .then(function(result){

                    callback(result);
                })
        })

}
let promiseProxy = require("../lib/promiseProxy");

let getPermissions = function(callback){
    let roleId = this.get('id');
    knex(Permission.table).whereIn("id", function(){
      this.select("permission_id").from("roles_to_permissions").where("role_id", roleId)
    }).then(function(result){
      callback(result.map(p => new Permission(p)));
    }).catch(function(err){
        console.log(err);
    })
};

Role.prototype.getPermissions = promiseProxy(getPermissions);


Role.prototype.getUsers = function(callback){
    require("./user").findAll("role_id", this.get("id"), function(result){
        callback(result);
    })
};

Role.prototype.hasPermission = function (permission, callback) {
    if(permission == null){
        callback(true);

    }else {
        let roleId = this.get('id');
        Permission.findOne("permission_name", permission, function (permissionEntity) {
            //console.log(permissionEntity);
            //TODO FIX THIS SHIT, it's broken if you pass a permission not in db
            if(permissionEntity.data == null) {
                return callback(false);

            }
            let permissionId = permissionEntity.get('id');
            console.log("roleid: " + roleId + "  permissionId :" + permissionId);

            knex('roles_to_permissions').where('role_id', roleId).andWhere('permission_id', permissionId)
                .then(function (result) {
                    //console.log(result);
                    if (result.length > 0) {
                        callback(true);
                    }
                    else {
                        callback(false);
                    }
                })
                .catch(function (err) {
                    console.log(err);
                });

        });
    }
};






Role.findByName = function (name, callback) {
    knex('user_roles').where('role_name', name)
        .then(function(result){
            if(!result){
                result = [];
            }
            callback(new Role(result[0]))
        })
        .catch(function(err){
            console.log(err);
        });

};





module.exports = Role;
