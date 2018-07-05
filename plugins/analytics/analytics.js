
let async = require("async");
let charge = require("../../models/charge");
let serviceInstance = require("../../models/service-instance");
let serviceInstanceCancellation = require("../../models/service-instance-cancellation");
let serviceInstanceProperty = require("../../models/service-instance-property");
let serviceTemplate = require("../../models/service-template");
let transaction = require("../../models/transaction");
let invoice = require("../../models/invoice")
let user = require("../../models/user");
let fund = require("../../models/fund");
let webhook = require("../../models/base/entity")("webhooks");

let properties = require("../../models/system-options");
module.exports = {
    getAnalyticsData: () => {
        return new Promise(async (resolve, reject) => {
            let props = (await properties.find()).reduce((acc, prop) => {acc[prop.data.option] = prop.data.value; return acc;}, {});
            let users = (await user.find());
            let templates = (await serviceTemplate.find());
            let instances = (await serviceInstance.find());
            let charges = (await charge.find());
            async.parallel({
                customerStats: function (callback) {
                    let stats = {};
                    stats.total = users.length;
                    stats.active = stats.invited = stats.flagged = stats.fundsTotal = 0;
                    users.map(user => {
                        if(user.data.status === 'active') { stats.active++; }
                        else if(user.data.status === 'invited') { stats.invited++; }
                        else if(user.data.status === 'flagged') { stats.flagged++; }
                        fund.getRowCountByKey('user_id', user.data.id, hasFund => { if(hasFund > 0) stats.fundsTotal++; });
                    });
                    callback(null,stats);
                },
                offeringStats: function (callback) {
                    let stats = {};
                    stats.totalSubscription = stats.totalOneTime = stats.totalSplit = stats.totalQuote = 0;
                    stats.total = templates.length;
                    templates.map(template => {
                        if(template.data.type === 'subscription') { stats.totalSubscription++; }
                        else if(template.data.type === 'one_time') { stats.totalOneTime++; }
                        else if(template.data.type === 'split') { stats.totalSplit++; }
                        else if(template.data.type === 'custom') { stats.totalQuote++; }
                    });
                    callback(null, stats);
                },
                salesStats: function (callback) {
                    let stats = {};
                    let activeSales = requested = waitingCancellation  = cancelled = 0;
                    let usersWithActiveOffering = [];
                    let subActive = subAnnual = subMonth  = subTotalCharges = subPaidCharges = subPayAnnually = subPayMonthly = subPayWeekly = subPayDaily = 0;
                    let singleActive = singleAllCharges = singleApproved = singleWaiting = 0;
                    let splitActive = splitTotalNum = splitTotalAmt = splitPaidNum = splitPaidAmt = 0;
                    let customActive = customTotalAmt = customTotalPaidAmt = 0;
                    instances.map(instance => {
                        //Currently most analytical data is from the active instances.
                        if(instance.data.subscription_id !== null) {
                            activeSales++;
                            usersWithActiveOffering.push(instance.data.user_id);
                            if(instance.data.type === 'subscription') {
                                subActive++;
                                let payPlan = instance.data.payment_plan;
                                //Build the logic for ARR & MRR
                                if(payPlan) {
                                    if(payPlan.interval === 'day') {
                                        subPayDaily++;
                                        subAnnual += (payPlan.amount * (365/payPlan.interval_count));
                                    } else if(payPlan.interval === 'week') {
                                        subPayWeekly++;
                                        subAnnual += (payPlan.amount * (52/payPlan.interval_count));
                                    } else if(payPlan.interval === 'month') {
                                        subPayMonthly++;
                                        subAnnual += (payPlan.amount * (12/payPlan.interval_count));
                                    } else if(payPlan.interval === 'year') {
                                        subPayAnnually++;
                                        subAnnual += (payPlan.amount / (payPlan.interval_count));
                                    }
                                }
                            }
                            else if(instance.data.type === 'one_time') { singleActive++; }
                            else if(instance.data.type === 'split') {
                                splitActive++;
                                if(instance.data.split_configuration && instance.data.split_configuration.splits.length > 0) {
                                    splitTotalNum += instance.data.split_configuration.splits.length;
                                    instance.data.split_configuration.splits.map(split => {
                                        splitTotalAmt += split.amount;
                                    });
                                }
                            }
                            else if(instance.data.type === 'custom') { customActive++; }
                        }
                        charges.map(charge => {
                            if(instance.data.id === charge.data.service_instance_id) {
                                if(instance.data.type === 'one_time') {
                                    singleAllCharges += charge.data.amount;
                                    if(charge.data.item_id !== null) { singleApproved += charge.data.amount; }
                                    else { singleWaiting += charge.data.amount; }
                                } else if(instance.data.subscription_id !== null && instance.data.type === 'split') {
                                    splitPaidNum ++;
                                    splitPaidAmt += charge.data.amount;
                                } else if(instance.data.subscription_id !== null && instance.data.type === 'custom') {
                                    customTotalAmt += charge.data.amount;
                                    if(charge.data.item_id !== null) { customTotalPaidAmt += charge.data.amount; }
                                } else if(instance.data.subscription_id !== null && instance.data.type === 'subscription') {
                                    subTotalCharges += charge.data.amount;
                                    if(charge.data.item_id !== null) { subPaidCharges += charge.data.amount; }
                                }
                            }
                        });
                        //Check for types
                        if(instance.data.status === 'requested') { requested++; }
                        else if(instance.data.status === 'waiting_cancellation') { waitingCancellation++; }
                        else if(instance.data.status === 'cancelled') { cancelled++; }
                    });
                    stats.overall = {};
                    stats.overall.total = instances.length;
                    stats.overall.activeSales = activeSales;
                    stats.overall.requested = requested;
                    stats.overall.waitingCancellation = waitingCancellation;
                    stats.overall.cancelled = cancelled;
                    stats.overall.customersWithOfferings = (Array.from(new Set(usersWithActiveOffering))).length;
                    stats.overall.remainingCharges = ((subTotalCharges - subPaidCharges)+(singleWaiting)+(splitTotalAmt - splitPaidAmt)+(customTotalAmt - customTotalPaidAmt));
                    stats.subscriptionStats = {};
                    stats.subscriptionStats.active = subActive;
                    stats.subscriptionStats.annual = Math.ceil(subAnnual);
                    stats.subscriptionStats.month = Math.ceil(subAnnual/12);
                    stats.subscriptionStats.totalCharges = subTotalCharges;
                    stats.subscriptionStats.totaPaidCharges = subPaidCharges;
                    stats.subscriptionStats.totalRemainingCharges = subTotalCharges - subPaidCharges;
                    stats.subscriptionStats.payAnnually = subPayAnnually;
                    stats.subscriptionStats.payMonthly = subPayMonthly;
                    stats.subscriptionStats.payWeekly = subPayWeekly;
                    stats.subscriptionStats.payDaily = subPayDaily;
                    stats.oneTimeStats = {};
                    stats.oneTimeStats.active = singleActive;
                    stats.oneTimeStats.allCharges = singleAllCharges;
                    stats.oneTimeStats.singleApprove = singleApproved;
                    stats.oneTimeStats.singleWaiting = singleWaiting;
                    stats.split = {};
                    stats.split.active = splitActive;
                    stats.split.splitTotalNum = splitTotalNum;
                    stats.split.splitTotalAmt = splitTotalAmt;
                    stats.split.splitPaidNum = splitPaidNum;
                    stats.split.splotPaidAmt = splitPaidAmt;
                    stats.split.splitRemainingNum = splitTotalNum - splitPaidNum;
                    stats.split.splitRemainingAmt = splitTotalAmt - splitPaidAmt;
                    stats.quote = {};
                    stats.quote.active = customActive;
                    stats.quote.customTotalAmt = customTotalAmt;
                    stats.quote.customTotalPaidAmt = customTotalPaidAmt;
                    stats.quote.customTotalRemaining = customTotalAmt - customTotalPaidAmt;
                    callback(null, stats);
                },
                hasStripeKeys:function(callback){
                    callback(null, props.stripe_publishable_key != null && props.stripe_secret_key != null)

                },
                isLive: function(callback){
                    callback(null, props.stripe_publishable_key && props.stripe_publishable_key.substring(3, 7).toUpperCase() === "LIVE");
                },
                hasChangedHeader:function(callback){
                    callback(null, props.home_featured_heading !== "Start selling your offerings in minutes!");
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
                totalWebhooks: function(callback){
                    webhook.getRowCountByKey(null, null, (total) => {
                        callback(null, total);
                    })
                },
                totalSales: function (callback) {
                    transaction.getSumOfColumnFiltered('amount', 'paid', 'true', function (totalSales) {
                        let total = (totalSales == null ? 0 : totalSales);
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
                resolve(results);
            });
            // whatever
        })
    }
};