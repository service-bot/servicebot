import React from 'react';
import './css/style.css';

class OfferingsStatsWidgets extends React.Component {

    constructor(props){
        super(props);
    }

    render(){
        let self = this;
        let analytics = self.props.data;
        return (
            <div className="offerings-widgets row">
                <div className="offerings-widget master col-md-2">Total Offerings: <b>{analytics.offeringStats.total}</b></div>
                <div className="offerings-widget col-md-3">Subscriptions: <span className="status-badge green"><b>{analytics.offeringStats.totalSubscription}</b></span></div>
                <div className="offerings-widget col-md-3">Scheduled Payments: <span className="status-badge green"><b>{analytics.offeringStats.totalSplit}</b></span></div>
                <div className="offerings-widget col-md-2">One Times: <span className="status-badge green"><b>{analytics.offeringStats.totalOneTime}</b></span></div>
                <div className="offerings-widget col-md-2">Quotes: <span className="status-badge green"><b>{analytics.offeringStats.totalQuote}</b></span></div>
            </div>
        );
    }

}

export default OfferingsStatsWidgets;