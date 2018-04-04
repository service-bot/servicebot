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

    //Update customer invoices every hour
    setInterval(async () => {
        let User = require("../../models/user");
        let Invoice = require("../../models/invoice");
        let users = (await User.find());
        users.map(user => {
            //Fetch all invoices
            Invoice.fetchUserInvoices(user).then(function (updated_invoices) {
                console.log(`Invoices Updated for user: ${user.data.email}`);
            }).catch(function (err) {
                console.log(`Invoice Skipped for user: ${user.data.email}`);
                console.log(err);
            });
            Invoice.fetchUpcomingInvoice(user, function (upcoming_invoice) {
                console.log(`Upcoming Invoice Updated for user: ${user.data.email}`);
            });
        })
    }, 3600000);
};

module.exports = {run};