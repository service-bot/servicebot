
module.exports = function setup(options, imports, register) {
    let analytics = require("../../lib/analytics");
    let request = require("request");
    let semver = require("semver");
    let _ = require("lodash");
    console.log(process.env.npm_package_version);
    //logic for creating tables
    let knex = imports.knex;
    let master = options.master;
    let interval = options.interval; //24 hours


    let salt = process.env.INSTANCE_SALT
    // let hash = require("bcryptjs").hashSync(salt, 10).toString("hex");
    let checkMaster = function(){
        console.log("CHECKIN WITH BIG PAPA FOR BIG ANNOUNCEMENTS")
        let version = process.env.npm_package_version;

        analytics.getAnalyticsData(function(data){
            let statsToGet = ["totalCustomers", "totalFlaggedCustomers", "totalServiceInstances", "totalServiceInstanceCancellations", "totalPublishedTemplates", "totalUnpublishedTemplates"];
            let stats = _.pick(data, statsToGet);
            //for each metricName metricValue pair (entries) create a string of metricName=metricValue and join all by & to create query string for url
            let query = Object.entries(stats).map(metric => {
                return metric[0] + "=" + metric[1];
            }).join("&");
            let url = master + "?instance_hash=" + salt + "&version=" + version + "&" + query;
            console.log(url);
            request(url, function(error, response, body){
                //console.log(response);
                if(error){
                    console.log("error");
                    console.log(error);
                }else{
                    console.log(body);
                    imports.store.dispatchEvent("master_notifications_received", body);


                }
            })

        })

        setTimeout(checkMaster, interval);

    }


    checkMaster();




    register(null, {
        //define services this plugin provides...
    });
};
