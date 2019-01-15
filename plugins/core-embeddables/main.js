let {call, put, all, select, fork, spawn, take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume");
let path = require("path")
function* run(config, provide, channels) {
    let database = yield consume(channels.database);
    let pages = [
        {
            name: "payment",
            path: path.join(__dirname, "./pages/payment.handlebars")
        },
        {
            name: "billing",
            needsToken: true,
            path: path.join(__dirname, "./pages/billing.handlebars")
        },
        {
            name: "checkout",
            path: path.join(__dirname, "./pages/checkout.handlebars")
        },
    ]
    yield provide({hostedPage: pages});
}
module.exports = {run};