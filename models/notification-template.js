let _ = require("lodash")

let NotificationTemplate = require("./base/entity")("notification_templates");
let Notification = require("./notifications");
let Role = require("./role");
let knex = require('../config/db');

/**
 *
 * @param map -
 * @param callback
 */
NotificationTemplate.prototype.getRoles = function (callback) {
    let templateId = this.get('id');
    knex(Role.table).whereIn("id", function () {
        this.select("role_id").from("notification_templates_to_roles").where("notification_template_id", templateId)
    }).then(function (result) {
        callback(result.map(p => new Role(p)));
    }).catch(function (err) {
        console.log(err);
    })
};

NotificationTemplate.prototype.setRoles = function (roleIds, callback) {
    let templateId = this.get("id");
    let links = [];
    knex("notification_templates_to_roles").where("notification_template_id", templateId).delete().then(function (result) {
        roleIds.forEach(id => {
            let notificationToRole = {"role_id": id, notification_template_id: templateId}
            links.push(notificationToRole);
        });
        knex("notification_templates_to_roles").insert(links).then(callback);
    })
};
NotificationTemplate.prototype.build = function (map, callback) {
    let parseTemplate = function (match, replaceString, offset, string) {
        console.log(map);
        console.log(replaceString);
        console.log(_.get(map.data, replaceString));
        let splitStr = replaceString.split(".");
        if (splitStr.length > 1) {
            splitStr[1] += "[0]";
            replaceString = splitStr.join(".");
        }
        return _.get(map.data, replaceString);
    };

    const regex = /\[\[([\w, \.]+)]]/gm;
    let message = this.get("message").replace(regex, parseTemplate);
    let subject = this.get("subject").replace(regex, parseTemplate);

    callback(message, subject);


};

NotificationTemplate.prototype.createNotification = function (data) {
    let self = this;

    console.log(`NOTIFICATION ${this.data.name} on ${this.data.event_name}`);
    return new Promise((resolve, reject) => {
        return new Promise(function (resolve, reject) {
            let notificationAttributes = {
                message: self.get("message"),
                user_id: 1,
                subject: self.get("subject")
            };
            //Create Notification
            let newNotification = new Notification(notificationAttributes);
            newNotification.create(function (err, notification) {
                if(!err) {
                    console.log("notification created: " + notification.get("id"));
                    return resolve(notification);
                } else {
                    return reject(err);
                }
            });
        }).then(function () {
            return new Promise(function (resolve, reject) {
                //Send Mail
                console.log("Gunna saind mail now")
                return resolve(null);
            });
        })
    })

};


module.exports = NotificationTemplate;