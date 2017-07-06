
let _ = require("lodash")

let Template = require("./base/entity")("email_templates");
let Role = require("./role");
let knex = require('../config/db');

/**
 *
 * @param map -
 * @param callback
 */
Template.prototype.getRoles = function(callback){
        let templateId = this.get('id');
        knex(Role.table).whereIn("id", function(){
            this.select("role_id").from("email_templates_to_roles").where("email_template_id", templateId)
        }).then(function(result){
            callback(result.map(p => new Role(p)));
        }).catch(function(err){
            console.log(err);
        })
};

Template.prototype.setRoles = function(roleIds, callback){
    let templateId = this.get("id")
    let links = []
    knex("email_templates_to_roles").where("email_template_id", templateId).delete().then(function(result){
        roleIds.forEach(id => {
            let emailToRole = {"role_id" : id, email_template_id : templateId}
            links.push(emailToRole);

        })
        knex("email_templates_to_roles").insert(links).then(callback);
    })
}
Template.prototype.build = function(map, callback){
    let parseTemplate = function(match, replaceString, offset, string){
        console.log(map);
        console.log(replaceString);
        console.log(_.get(map.data, replaceString));
        let splitStr = replaceString.split(".");
        if(splitStr.length > 1){
            splitStr[1] += "[0]";
            replaceString = splitStr.join(".");
        }
        return _.get(map.data, replaceString);
    };

    const regex = /\[\[([\w, \.]+)]]/gm;
    let message = this.get("email_body").replace(regex, parseTemplate);
    let subject = this.get("email_subject").replace(regex, parseTemplate);

    callback(message, subject);


};

Template.prototype.createNotification = function(data){
    let self = this;
    console.log(`NOTIFICATION ${this.data.name} on ${this.data.event_name}`);
    return new Promise((resolve, reject) => {
        return resolve("YEA!");
        }
    )
}


module.exports = Template;