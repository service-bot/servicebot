
let async = require("async");
let charge = require("../../models/charge");
let serviceInstance = require("../../models/service-instance");
let serviceInstanceCancellation = require("../../models/service-instance-cancellation");
let serviceInstanceProperty = require("../../models/service-instance-property");
let serviceTemplate = require("../../models/service-template");
let transaction = require("../../models/transaction");
let user = require("../../models/user");
let fund = require("../../models/fund");
let properties = require("../../models/system-options");
module.exports = {
    getAnalyticsData: () => {
        return new Promise(async (resolve, reject) => {
            let props = (await properties.find()).reduce((acc, prop) => {acc[prop.data.option] = prop.data.value; return acc;}, {});
            let users = (await user.find());
            let templates = (await serviceTemplate.find());
            let instances = (await serviceInstance.find());
            async.parallel({
                customerStats: function (callback) {
                    let stats = {};
                    stats.total = users.length;
                    stats.active = (users.filter(user => { return user.data.status === 'active'; })).length;
                    stats.invited = (users.filter(user => { return user.data.status === 'invited'; })).length;
                    stats.flagged = (users.filter(user => { return user.data.status === 'flagged'; })).length;
                    stats.fundsTotal = 0;
                    users.map(user => {
                        fund.getRowCountByKey('user_id', user.data.id, hasFund => { if(hasFund > 0) stats.fundsTotal++; });
                    });
                    callback(null,stats);
                },
                offeringStats: function (callback) {
                    let stats = {};
                    stats.total = templates.length;
                    stats.totalSubscription = (templates.filter(template => { return template.data.type === 'subscription' })).length;
                    stats.totalOnetime = (templates.filter(template => { return template.data.type === 'one_time' })).length;
                    stats.totalSplit = (templates.filter(template => { return template.data.type === 'split' })).length;
                    stats.totalQuote = (templates.filter(template => { return template.data.type === 'custom' })).length;
                    callback(null, stats);
                },
                salesStats: function (callback) {
                    let stats = {};
                    stats.overall = {};
                    stats.overall.total = instances.length;
                    let activeInstances = instances.filter(instance => { return instance.data.subscription_id !== null });
                    stats.overall.activeSales = activeInstances.length;
                    stats.overall.requested = (instances.filter(instance => { return instance.data.status === 'requested' })).length;
                    stats.overall.waitingCancellation = (instances.filter(instance => { return instance.data.status === 'waiting_cancellation' })).length;
                    stats.overall.cancelled = (instances.filter(instance => { return instance.data.status === 'cancelled' })).length;
                    let usersWithActiveOffering = activeInstances.map(instance => { if(instance.data.subscription_id !== null) return instance.data.user_id; });
                    stats.overall.customersWithOfferings = (Array.from(new Set(usersWithActiveOffering))).length;
                    stats.subscriptionStats = {};
                    stats.subscriptionStats.active = (instances.filter(instance => { return (instance.data.subscription_id !== null && instance.data.type === 'subscription') })).length;
                    stats.subscriptionStats.annual = (instances.filter(instance => { return (instance.data.subscription_id !== null && instance.data.type === 'subscription' && instance.data.payment_plan && instance.data.payment_plan.interval === 'year') })).length;
                    stats.subscriptionStats.annualRatio = (stats.subscriptionStats.annual/stats.subscriptionStats.active)*100;
                    stats.subscriptionStats.month = (instances.filter(instance => { return (instance.data.subscription_id !== null && instance.data.type === 'subscription' && instance.data.payment_plan && instance.data.payment_plan.interval === 'month') })).length;
                    stats.subscriptionStats.monthlyRatio = (stats.subscriptionStats.month/stats.subscriptionStats.active)*100;
                    stats.subscriptionStats.customInterval = stats.subscriptionStats.active - (stats.subscriptionStats.annual + stats.subscriptionStats.month);
                    stats.subscriptionStats.customIntervalRatio = 100 - (stats.subscriptionStats.annualRatio + stats.subscriptionStats.monthlyRatio);
                    callback(null, stats);
                },
                hasStripeKeys:function(callback){
                    callback(null, props.stripe_publishable_key != null && props.stripe_secret_key != null)

                },
                hasChangedHeader:function(callback){
                    callback(null, props.home_featured_heading !== "Welcome To ServiceBot!");
                },
                totalCustomers: function (callback) {
                    user.getRowCountByKey(null, null, function (totalCustomers) {
                        callback(null, totalCustomers);
                    });
                },
                totalFlaggedCustomers: function (callback) {
                    fund.getRowCountByKey('flagged', 'true', function (totalUsers) {
                        callback(null, totalUsers);
                    });
                },
                totalServiceInstances: function (callback) {
                    serviceInstance.getRowCountByKey(null, null, function (totalInstances) {
                        callback(null, totalInstances);
                    });
                },
                totalRequestedServiceInstances: function (callback) {
                    serviceInstance.getRowCountByKey('status', 'requested', function (totalInstances) {
                        callback(null, totalInstances);
                    });
                },
                totalRunningServiceInstances: function (callback) {
                    serviceInstance.getRowCountByKey('status', 'running', function (totalInstances) {
                        callback(null, totalInstances);
                    });
                },
                totalWaitingServiceInstances: function (callback) {
                    serviceInstance.getRowCountByKey('status', 'waiting', function (totalInstances) {
                        callback(null, totalInstances);
                    });
                },
                totalMissingPaymentServiceInstances: function (callback) {
                    serviceInstance.getRowCountByKey('status', 'missing-payment', function (totalInstances) {
                        callback(null, totalInstances);
                    });
                },
                totalCancelledServiceInstances: function (callback) {
                    serviceInstance.getRowCountByKey('status', 'cancelled', function (totalInstances) {
                        callback(null, totalInstances);
                    });
                },
                totalRejectedServiceInstances: function (callback) {
                    serviceInstance.getRowCountByKey('status', 'rejected', function (totalInstances) {
                        callback(null, totalInstances);
                    });
                },
                totalWaitingCancellationServiceInstances: function (callback) {
                    serviceInstance.getRowCountByKey('status', 'waiting_cancellation', function (totalInstances) {
                        callback(null, totalInstances);
                    });
                },
                totalChargeItems: function (callback) {
                    charge.getRowCountByKey(null, null, function (totalCharges) {
                        callback(null, totalCharges);
                    });
                },
                totalPaidChargeItems: function (callback) {
                    charge.getRowCountByKey('approved', 'true', function (totalSuccessfulCharges) {
                        callback(null, totalSuccessfulCharges);
                    });
                },
                totalUnpaidChargeItems: function (callback) {
                    charge.getRowCountByKey('approved', 'false', function (totalUnsuccessfulCharges) {
                        callback(null, totalUnsuccessfulCharges);
                    });
                },
                totalApprovedChargeItems: function (callback) {
                    charge.getRowCountByKey('approved', 'true', function (totalApprovedCharges) {
                        callback(null, totalApprovedCharges);
                    });
                },
                totalRefunds: function (callback) {
                    transaction.getRowCountByKey('refunded', 'true', function (totalRefunds) {
                        callback(null, totalRefunds);
                    });
                },
                totalRefundAmount: function (callback) {
                    transaction.getSumOfColumnFiltered('amount_refunded', null, null, function (totalRefundAmount) {
                        let total = (totalRefundAmount == null ? 0 : totalRefundAmount);
                        callback(null, total);
                    });
                },
                totalSales: function (callback) {
                    transaction.getSumOfColumnFiltered('amount', 'paid', 'true', function (totalSales) {
                        let total = (totalSales == null ? 0 : totalSales);
                        console.log("TOTAL SALES:")
                        console.log(totalSales)
                        callback(null, total);
                    });
                },
                totalServiceInstanceCancellations: function (callback) {
                    serviceInstanceCancellation.getRowCountByKey(null, null, function (totalCancellations) {
                        callback(null, totalCancellations);
                    });
                },
                totalPublishedTemplates: function (callback) {
                    serviceTemplate.getRowCountByKey('published', 'true', function (totalPublishedTemplates) {
                        callback(null, totalPublishedTemplates);
                    });
                },
                totalUnpublishedTemplates: function (callback) {
                    serviceTemplate.getRowCountByKey('published', 'false', function (totalUnpublishedTemplates) {
                        callback(null, totalUnpublishedTemplates);
                    });
                }

            }, function (err, results) {
                if (err) {
                    console.error(err);
                    return reject(err);
                }
                console.log(results);
                resolve(results);
            });
            // whatever
        })
    }
};