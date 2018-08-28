let consume = require("pluginbot/effects/consume");
let {call} = require("redux-saga/effects");
let PluginOption = require("../../models/services/pluginOption");
let run = function* (config, provide, services) {
    let database = yield consume(services.database);
    //todo: move this to some installation script when it's more fleshed out


    let routeDefinition = [
        require("./api/webhook")(database),
        ...require("./api/reconfigure")(database),
        require("./api/import")(database),
    ];

    yield call(database.createTableIfNotExist, "stripe_event_logs", function (table) {
        table.inherits('event_logs');
        table.string('event_id');
        console.log("Created 'stripe_event_logs' table.");

    });


    yield provide({routeDefinition});
    let updateCustomers = async () => {
        console.log("Updating customers");
        const delay = time => new Promise(res=>setTimeout(()=>res(),time));
        let User = require("../../models/user");
        let Invoice = require("../../models/invoice");
        let users = (await User.find());
        await delay(50000);
        for(let user of users){
            await Invoice.fetchUserInvoices(user).then(function (updated_invoices) {
                // console.log(`Invoices Updated for user: ${user.data.email}`);
            }).catch(function (err) {
                // console.log(`Invoice Skipped for user: ${user.data.email}`);
                console.log(err);
            });
            await delay(200)
            Invoice.fetchUpcomingInvoice(user, function (upcoming_invoice) {
                // console.log(`Upcoming Invoice Updated for user: ${user.data.email}`);
            });

        }
        console.log("Fetching invoices done");
    };
    //Update customer invoices every hour
    setInterval(updateCustomers, 18000000);
    updateCustomers();
};

module.exports = {run};