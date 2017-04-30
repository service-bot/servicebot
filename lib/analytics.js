
let async = require("async");
let charge = require("../models/charge");
let serviceInstance = require("../models/service-instance");
let serviceInstanceCancellation = require("../models/service-instance-cancellation");
let serviceInstanceProperty = require("../models/service-instance-property");
let serviceTemplate = require("../models/service-template");
let transaction = require("../models/transaction");
let user = require("../models/user");
let fund = require("../models/fund");

module.exports = {
    getAnalyticsData: function (analyticsData) {
        async.parallel({
            totalCustomers: function(callback) {
                user.getRowCountByKey(null, null, function(totalCustomers) {
                    callback(null, totalCustomers);
                });
            },
            totalFlaggedCustomers: function(callback) {
                fund.getRowCountByKey('flagged', 'true', function(totalUsers){
                    callback(null, totalUsers);
                });
            },
            totalServiceInstances: function(callback) {
                serviceInstance.getRowCountByKey(null, null, function(totalInstances) {
                    callback(null, totalInstances);
                });
            },
            totalRequestedServiceInstances: function(callback) {
                serviceInstance.getRowCountByKey('status','requested', function(totalInstances) {
                    callback(null, totalInstances);
                });
            },
            totalRunningServiceInstances: function(callback) {
                serviceInstance.getRowCountByKey('status','running', function(totalInstances) {
                    callback(null, totalInstances);
                });
            },
            totalWaitingServiceInstances: function(callback) {
                serviceInstance.getRowCountByKey('status','waiting', function(totalInstances) {
                    callback(null, totalInstances);
                });
            },
            totalMissingPaymentServiceInstances: function(callback) {
                serviceInstance.getRowCountByKey('status','missing-payment', function(totalInstances) {
                    callback(null, totalInstances);
                });
            },
            totalCancelledServiceInstances: function(callback) {
                serviceInstance.getRowCountByKey('status','cancelled', function(totalInstances) {
                    callback(null, totalInstances);
                });
            },
            totalRejectedServiceInstances: function(callback) {
                serviceInstance.getRowCountByKey('status','rejected', function(totalInstances) {
                    callback(null, totalInstances);
                });
            },
            totalWaitingCancellationServiceInstances: function(callback) {
                serviceInstance.getRowCountByKey('status','waiting_cancellation', function(totalInstances) {
                    callback(null, totalInstances);
                });
            },
            totalChargeItems: function(callback) {
                charge.getRowCountByKey(null, null, function(totalCharges) {
                    callback(null, totalCharges);
                });
            },
            totalPaidChargeItems: function(callback) {
                charge.getRowCountByKey('approved','true',function(totalSuccessfulCharges) {
                    callback(null, totalSuccessfulCharges);
                });
            },
            totalUnpaidChargeItems: function(callback) {
                charge.getRowCountByKey('approved','false',function(totalUnsuccessfulCharges) {
                    callback(null, totalUnsuccessfulCharges);
                });
            },
            totalApprovedChargeItems: function(callback) {
                charge.getRowCountByKey('approved', 'true', function(totalApprovedCharges) {
                    callback(null, totalApprovedCharges);
                });
            },
            totalRefunds: function(callback) {
                transaction.getRowCountByKey('refunded', 'true', function(totalRefunds) {
                    callback(null, totalRefunds);
                });
            },
            totalRefundAmount: function(callback) {
                transaction.getSumOfColumnFiltered('amount_refunded', null, null, function(totalRefundAmount) {
                    let total = (totalRefundAmount == null ? 0 : totalRefundAmount);
                    callback(null, total);
                });
            },
            totalSales: function(callback) {
                transaction.getSumOfColumnFiltered('amount', 'paid', 'true', function(totalSales) {
                    let total = (totalSales == null ? 0 : totalSales);
                    callback(null, total);
                });
            },
            totalServiceInstanceCancellations: function(callback) {
                serviceInstanceCancellation.getRowCountByKey(null, null, function(totalCancellations) {
                    callback(null, totalCancellations);
                });
            },
            totalPublishedTemplates: function(callback) {
                serviceTemplate.getRowCountByKey('published', 'true', function(totalPublishedTemplates) {
                    callback(null, totalPublishedTemplates);
                });
            },
            totalUnpublishedTemplates: function(callback) {
                serviceTemplate.getRowCountByKey('published', 'false', function(totalUnpublishedTemplates) {
                    callback(null, totalUnpublishedTemplates);
                });
            }

        }, function(err, results) {
            analyticsData(results);
        });
        // whatever
    }
};