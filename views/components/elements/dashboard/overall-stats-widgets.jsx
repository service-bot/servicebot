import React from 'react';
import './css/style.css';
import {Widget} from "../../elements/dashboard/dashboard-widgets.jsx";
import {BuildChart, ServiceOverTimeChart, SalesOverTimeChart} from "../../elements/dashboard/dashboard-chart.jsx";

class OverallStatsWidgets extends React.Component {


    constructor(props){
        super(props);
    }

    render(){
        let self = this;
        let analytics = self.props.data;
        //Customer Chart
        let customerStatusLabels = ['Active Customers', 'Customers with Fund', 'Flagged Customers', 'Invited Customers'];
        let customerStatusData = [analytics.customerStats.active, analytics.customerStats.fundsTotal, analytics.customerStats.flagged, analytics.customerStats.invited]
        let chartData = {
            labels: customerStatusLabels,
            datasets: [{
                data: customerStatusData,
                backgroundColor: [ "#cccccc", "#b9b7b7", "#929292", "#ffffff" ],
                hoverBackgroundColor: [ "#FF6384", "#36A2EB", "#FFCE56", "#B388FF" ] }]
        };
        let chartOption = {
            animation: {
                animateRotate: true,
                animateScale: true
            }
        };

        return (
            <div className="dashboard-widgets __churn-widgets">
                {/*<div className="dashboard-widget">*/}
                    {/*<Widget data={{label: 'Customer Stats', chart: BuildChart, chartData: chartData, chartOption: chartOption}} bodyClass="full-height p-b-15" wcolor="navy-rev"/>*/}
                {/*</div>*/}
                <Widget data={{label: 'Number of Sales vs. Churned Subscriptions', component: ServiceOverTimeChart}} bodyClass="full-height" wcolor="navy-grey"/>
                <Widget data={{label: 'Amount of Sales vs. Churned Subscriptions', component: SalesOverTimeChart}} bodyClass="full-height" wcolor="navy-grey"/>
            </div>
        );
    }

}

export default OverallStatsWidgets;