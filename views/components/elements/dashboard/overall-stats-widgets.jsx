import React from 'react';
import './css/style.css';
import {Widget} from "../../elements/dashboard/dashboard-widgets.jsx";
import {CustomerStatusChart} from "../../elements/dashboard/dashboard-chart.jsx";

class OverallStatsWidgets extends React.Component {


    constructor(props){
        super(props);
    }

    render(){
        let self = this;
        let analytics = self.props.data;
        let saleStat = [];
        saleStat.push({label:'Total Sales', value: analytics.salesStats.overall.total});
        saleStat.push({label:'Customers who Purchased', value: analytics.salesStats.overall.customersWithOfferings});
        saleStat.push({label:'Active Sales', value: analytics.salesStats.overall.activeSales});
        saleStat.push({label:'Requested Sales', value: analytics.salesStats.overall.requested});
        saleStat.push({label:'Waiting Cancellations', value: analytics.salesStats.overall.waitingCancellation});
        saleStat.push({label:'Cancelled Sales', value: analytics.salesStats.overall.cancelled});
        return (
            <div className="row m-0">
                <div className="dashboard-widgets p-0 col-md-4">
                    <Widget data={{label: 'Sales Stat', list: saleStat}} postFix="/yr" purple={true}/>
                </div>
                <div className="customer-chart-widget col-md-8">
                    <CustomerStatusChart className="dashboard-charts"/>
                </div>
            </div>
        );
    }

}

export default OverallStatsWidgets;