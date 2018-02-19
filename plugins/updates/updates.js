let consume = require("pluginbot/effects/consume");

let run = function* (config, provide, services) {
    let database = yield consume(services.database);
    let analytics = yield consume(services.analytics);
    let request = require("request");
    let semver = require("semver");
    let _ = require("lodash");
    let master = config.master;
    let interval = config.interval; //24 hours
    let Notification = require("../../models/notifications");
    let dispatchEvent = require("../../config/redux/store").dispatchEvent;
    let salt = process.env.INSTANCE_SALT
    // let hash = require("bcryptjs").hashSync(salt, 10).toString("hex");
    let checkMaster = async function () {
        console.log("CHECKIN WITH BIG PAPA FOR BIG ANNOUNCEMENTS")
        let version = process.env.npm_package_version;

        let data = await analytics.getAnalyticsData();
        let statsToGet = ["totalCustomers", "totalFlaggedCustomers", "totalServiceInstances", "totalServiceInstanceCancellations", "totalPublishedTemplates", "totalUnpublishedTemplates"];
        let stats = _.pick(data, statsToGet);
        //for each metricName metricValue pair (entries) create a string of metricName=metricValue and join all by & to create query string for url
        let query = Object.entries(stats).map(metric => {
            return metric[0] + "=" + metric[1];
        }).join("&");
        let url = master + "?instance_hash=" + salt + "&version=" + version + "&" + query;
        console.log(url);

        request(url, function (error, response, body) {
            //console.log(response);
            if (error) {
                console.log("error");
                console.log(error);
            } else {
                try {
                    return Promise.all(JSON.parse(body).notifications.map((notification) => {
                        let data = notification.data;
                        return Notification.createPromise(data)
                            .then((result) => {
                                store.dispatchEvent("master_notification_created", result);
                                return result;
                            })
                            .catch((err) => {
                                if (err.code != '23505') {
                                    console.error(`Error inserting notification`, notification, err);
                                }
                            })
                    }))

                } catch (e) {
                    console.error("error connecting to hub: " + e);
                }
            }
        })


        setTimeout(checkMaster, interval);

    }


    checkMaster();
};

module.exports = {run};