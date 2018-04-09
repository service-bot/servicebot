import React from 'react';
import './css/style.css';
import {Widget} from "../../elements/dashboard/dashboard-widgets.jsx";
import {BuildChart, ServiceOverTimeChart} from "../../elements/dashboard/dashboard-chart.jsx";

class OverallStatsWidgets extends React.Component {


    constructor(props){
        super(props);
    }

    render(){
        let self = this;
        let analytics = self.props.data;
        //Sales Stats
        let saleStat = [];
        saleStat.push({label:'Total Sales', value: analytics.salesStats.overall.total});
        saleStat.push({label:'Users who Purchased', value: analytics.salesStats.overall.customersWithOfferings});
        saleStat.push({label:'Active Sales', value: analytics.salesStats.overall.activeSales});
        saleStat.push({label:'Requested Sales', value: analytics.salesStats.overall.requested});
        saleStat.push({label:'Waiting Cancellations', value: analytics.salesStats.overall.waitingCancellation});
        saleStat.push({label:'Cancelled Sales', value: analytics.salesStats.overall.cancelled});
        //Subscription Stats
        let subStat = [];
        subStat.push({label:'Active Subscriptions', value: analytics.salesStats.subscriptionStats.active});
        subStat.push({label:'Annual Recurring Revenue', value: analytics.salesStats.subscriptionStats.annual, type: 'price'});
        subStat.push({label:'Monthly Recurring Revenue', value: analytics.salesStats.subscriptionStats.month, type: 'price'});
        subStat.push({label:'Total Additional Charges', value: analytics.salesStats.subscriptionStats.totalCharges, type: 'price'});
        subStat.push({label:'Paid Additional Charges', value: analytics.salesStats.subscriptionStats.totaPaidCharges, type: 'price'});
        subStat.push({label:'Unpaid Additional Charges', value: analytics.salesStats.subscriptionStats.totalRemainingCharges, type: 'price'});
        //Scheduled Payments Stats
        let scheduledStat = [];
        scheduledStat.push({label:'Active Schedules', value: analytics.salesStats.split.active});
        scheduledStat.push({label:'Total Schedules', value: analytics.salesStats.split.splitTotalAmt, type: 'price'});
        scheduledStat.push({label:'Paid Schedules', value: analytics.salesStats.split.splotPaidAmt, type: 'price'});
        scheduledStat.push({label:'Unpaid Schedules', value: analytics.salesStats.split.splitRemainingAmt, type: 'price'});
        //One Time Stats
        let onetimeStat = [];
        onetimeStat.push({label:'Active One Times', value: analytics.salesStats.oneTimeStats.active});
        onetimeStat.push({label:'Total Charges', value: analytics.salesStats.oneTimeStats.allCharges, type: 'price'});
        onetimeStat.push({label:'Approved Charges', value: analytics.salesStats.oneTimeStats.singleApprove, type: 'price'});
        onetimeStat.push({label:'Waiting Approvals', value: analytics.salesStats.oneTimeStats.singleWaiting, type: 'price'});
        //Quote Stats
        let quoteStat = [];
        quoteStat.push({label:'Active Quotes', value: analytics.salesStats.quote.active});
        quoteStat.push({label:'Total Charges', value: analytics.salesStats.quote.customTotalAmt, type: 'price'});
        quoteStat.push({label:'Approved Charges', value: analytics.salesStats.quote.customTotalPaidAmt, type: 'price'});
        quoteStat.push({label:'Waiting Approvals', value: analytics.salesStats.quote.customTotalRemaining, type: 'price'});
        //System Stats
        let systemStat = [];
        let stripeConnection = 'No';
        let themeChanged = 'No';
        let hadOfferings = 'No';
        let hadSales = 'No';
        if(analytics.hasStripeKeys) stripeConnection = 'Yes';
        if(analytics.hasChangedHeader) themeChanged = 'Yes';
        if(parseInt(analytics.totalUnpublishedTemplates) !== 0 && parseInt(analytics.totalPublishedTemplates) !== 0) hadOfferings = 'Yes';
        if(parseInt(analytics.totalServiceInstances) !== 0) hadSales = 'Yes';
        systemStat.push({label:'Connected to Stripe', value: stripeConnection});
        systemStat.push({label:'Customized Theme', value: themeChanged});
        systemStat.push({label:'Created Offering', value: hadOfferings});
        systemStat.push({label:'Had Sales', value: hadSales});
        //Customer Chart
        let customerStatusLabels = ['Active Customers', 'Customers with Fund', 'Flagged Customers', 'Invited Customers'];
        let customerStatusData = [analytics.customerStats.active, analytics.customerStats.fundsTotal, analytics.customerStats.flagged, analytics.customerStats.invited]
        let chartData = {
            labels: customerStatusLabels,
            datasets: [{
                data: customerStatusData,
                backgroundColor: [ "#FF6384", "#36A2EB", "#FFCE56", "#B388FF" ],
                hoverBackgroundColor: [ "#FF6384", "#36A2EB", "#FFCE56", "#B388FF" ] }]
        };
        let chartOption = {
            animation: {
                animateRotate: true,
                animateScale: true
            }
        };

        return (
            <div>
                <div className="row m-0">
                    <div className="dashboard-widgets">
                        <div className="dashboard-widget">
                            <Widget data={{label: 'Sales Stat', list: saleStat}} bodyClass="full-height" wcolor="grey"/>
                        </div>
                        <div className="dashboard-widget">
                            <Widget data={{label: 'Customer Stats', chart: BuildChart, chartData: chartData, chartOption: chartOption}} bodyClass="full-height p-b-15" wcolor="grey"/>
                        </div>
                        <div className="dashboard-widget">
                            <Widget data={{label: 'System Status', list: systemStat}} bodyClass="full-height"/>
                        </div>
                    </div>
                </div>
                <div className="row m-0">
                    <div className="dashboard-widgets">
                        <div className="dashboard-widget">
                            <Widget data={{label: 'Subscription Stat', list: subStat}} bodyClass="full-height" wcolor="purple"/>
                        </div>
                        <div className="dashboard-widget">
                            <Widget data={{label: 'Sales vs. Churn Rate', component: ServiceOverTimeChart}} bodyClass="full-height" wcolor="grey"/>
                        </div>
                    </div>
                </div>
                <div className="row m-0">
                    <div className="dashboard-widgets">
                        <div className="dashboard-widget">
                            <Widget data={{label: 'Scheduled Payment Sales', list: scheduledStat}} bodyClass="full-height" wcolor="theme-clear"/>
                        </div>
                        <div className="dashboard-widget">
                            <Widget data={{label: 'One Time Charge Sales', list: onetimeStat}} bodyClass="full-height" wcolor="theme-clear"/>
                        </div>
                        <div className="dashboard-widget">
                            <Widget data={{label: 'Quote Stats', list: quoteStat}} bodyClass="full-height" wcolor="theme-clear"/>
                        </div>
                    </div>
                </div>
            </div>

        );
    }

}

export default OverallStatsWidgets;