
let async = require("async");
let charge = require("../../models/charge");
let serviceInstance = require("../../models/service-instance");
let serviceInstanceCancellation = require("../../models/service-instance-cancellation");
let serviceInstanceProperty = require("../../models/service-instance-property");
let serviceTemplate = require("../../models/service-template");
let transaction = require("../../models/transaction");
let invoice = require("../../models/invoice");
let user = require("../../models/user");
let fund = require("../../models/fund");
let webhook = require("../../models/base/entity")("webhooks");

let properties = require("../../models/system-options");


//Reusable functions
let getARR = function (payPlan) {
    let arr = 0;
    //Build the logic for ARR & MRR
    if(payPlan) {
        if(payPlan.interval === 'day') {
            arr += (payPlan.amount * (365/payPlan.interval_count));
        } else if(payPlan.interval === 'week') {
            arr += (payPlan.amount * (52/payPlan.interval_count));
        } else if(payPlan.interval === 'month') {
            arr += (payPlan.amount * (12/payPlan.interval_count));
        } else if(payPlan.interval === 'year') {
            arr += (payPlan.amount / (payPlan.interval_count));
        }
    }
    return arr;
};
let getFunding = function (users, funds, instance) {
    let fundingData = {
        hasFunding : false,
        fundingCount : 0,
        flagged : false,
        flagCount : 0
    };
    //Check if account is paid
    let fundAvailable = funds.filter(card => card.data.user_id === instance.data.user_id);
    let user = users.filter(user => user.data.id === instance.data.user_id);
    if(fundAvailable.length > 0){
        //if(user.length > 0 && user[0].data.status !== 'flagged') {
        if(user.length > 0) {
            fundingData.hasFunding = true;
            fundingData.fundingCount++;
        }
        if(user.length > 0 && user[0].data.status === 'flagged') {
            fundingData.flagged = true;
            fundingData.flagCount++;
        }
    }
    return fundingData;
}

module.exports = {
    getAnalyticsData: () => {
        return new Promise(async (resolve, reject) => {
            let props = (await properties.find()).reduce((acc, prop) => {acc[prop.data.option] = prop.data.value; return acc;}, {});
            let users = (await user.find());
            let funds = (await fund.find());
            let templates = (await serviceTemplate.find());
            let instances = (await serviceInstance.find());
            let charges = (await charge.find());
            let transactions = (await transaction.find());
            let invoices = (await invoice.find());
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
                    stats.total = templates.length;
                    callback(null, stats);
                },
                salesStats: function (callback) {
                    let stats = {};
                    let activeSales = requested = waitingCancellation  = cancelled = subCancelled = 0;
                    let usersWithActiveOffering = [];
                    let arr = arrForecast = 0;
                    let inTrial = inTrialPaying = inPaying =  inFlagged = inPayingCancelled = 0;
                    let subActive = subAnnual  = subTotalCharges = subPaidCharges = 0;
                    let singleActive = singleAllCharges = singleApproved = singleWaiting = 0;
                    let customActive = customTotalAmt = customTotalPaidAmt = 0;
                    let allCharges = allChargesApproved = 0;
                    instances.map(instance => {
                        //Currently most analytical data is from the active instances.
                        if(instance.data.subscription_id !== null) {
                            activeSales++;
                            usersWithActiveOffering.push(instance.data.user_id);
                            if(instance.data.type === 'subscription') {
                                subActive++;
                                let payPlan = instance.data.payment_plan;
                                let trial = instance.data.payment_plan.trial_period_days;
                                let trialEnd = instance.data.trial_end;
                                //Get forecast ARR
                                arrForecast += getARR(payPlan);
                                let currentDate = new Date();
                                let trialEndDate = new Date(trialEnd * 1000);
                                let userFunding = getFunding(users, funds, instance);
                                //If user is paying, then add to ARR
                                if(userFunding.fundingCount > 0) {
                                    arr += getARR(payPlan);
                                }
                                //Service is trialing if the expiration is after current date
                                if(trial > 0 && currentDate < trialEndDate) {
                                    inTrial++;
                                    inTrialPaying += userFunding.fundingCount;
                                }
                                //Check if account is paid
                                inPaying += userFunding.fundingCount;
                                inFlagged += userFunding.flagCount;
                            }
                            else if(instance.data.type === 'one_time') { singleActive++; }
                            else if(instance.data.type === 'custom') { customActive++; }
                        }
                        //Check for types
                        if(instance.data.status === 'requested') { requested++; }
                        else if(instance.data.status === 'waiting_cancellation') { waitingCancellation++; }
                        else if(instance.data.status === 'cancelled') {
                            cancelled++;
                            if(instance.data.type === 'subscription') {
                                subCancelled++;
                            }
                            //Find the paying cancelled accounts
                            inPayingCancelled += (getFunding(users, funds, instance)).fundingCount;
                        }
                    });
                    charges.map(charge => {
                        allCharges += charge.data.amount;
                        if(charge.data.item_id !== null) {
                            allChargesApproved += charge.data.amount;
                        }
                    });
                    //Calculate multi-level metrics
                    let averageConversion = 0;
                    if(inPaying > 0) {
                        averageConversion = inPaying/(subActive + subCancelled);
                    }
                    //Calculate ARPA & Churn
                    let arpa = 0;
                    let churn = 0;
                    if(inPaying > 0) {
                        arpa = ((Math.ceil(arr/12))/inPaying).toFixed(2);
                        churn = ((inPayingCancelled / (inPaying + inPayingCancelled))*100).toFixed(2);
                    }

                    stats.overall = {};
                    stats.overall.total = instances.length;
                    stats.overall.activeSales = activeSales;
                    stats.overall.requested = requested;
                    stats.overall.waitingCancellation = waitingCancellation;
                    stats.overall.cancelled = cancelled;
                    stats.overall.customersWithOfferings = (Array.from(new Set(usersWithActiveOffering))).length;
                    stats.overall.remainingCharges = ((subTotalCharges - subPaidCharges)+(singleWaiting)+(customTotalAmt - customTotalPaidAmt));
                    stats.subscriptionStats = {};
                    stats.subscriptionStats.all = subActive + subCancelled;
                    stats.subscriptionStats.running = subActive;
                    stats.subscriptionStats.active = subActive - inTrial;
                    stats.subscriptionStats.cancelled = subCancelled;
                    stats.subscriptionStats.paying = inPaying;
                    stats.subscriptionStats.trials = inTrial;
                    stats.subscriptionStats.trialPaying = inTrialPaying;
                    stats.subscriptionStats.flagged = inFlagged;
                    stats.subscriptionStats.payingCancelled = inPayingCancelled;
                    stats.subscriptionStats.arrForecast = Math.ceil(((arrForecast-arr)*averageConversion)+arr);
                    stats.subscriptionStats.mrrForecast = Math.ceil(arrForecast/12);
                    stats.subscriptionStats.arr = Math.ceil(arr);
                    stats.subscriptionStats.mrr = Math.ceil(arr/12);
                    stats.subscriptionStats.arpa = arpa;
                    stats.subscriptionStats.churn = churn;
                    stats.subscriptionStats.averageConversion = (averageConversion * 100).toFixed(2);
                    stats.subscriptionStats.totalCharges = subTotalCharges;
                    stats.subscriptionStats.totaPaidCharges = subPaidCharges;
                    stats.subscriptionStats.totalRemainingCharges = subTotalCharges - subPaidCharges;
                    stats.oneTimeStats = {};
                    stats.oneTimeStats.allCharges = allCharges;
                    stats.oneTimeStats.approvedCharges = allChargesApproved;
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
                totalInvoiced: function (callback) {
                    let total = 0;
                    invoices.map(inv => {
                        total += inv.data.total;
                    });
                    callback(null, total);
                },
                totalSales: function (callback) {
                    let total = 0;
                    transactions.map(payment => {
                        if(payment.data.paid === true) {
                            total += payment.data.amount;
                        }
                    })
                    callback(null, total);
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