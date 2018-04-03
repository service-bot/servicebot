import React from 'react';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Load from '../utilities/load.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import {DashboardWidgets} from "../elements/dashboard/dashboard-widgets.jsx";
import {ServiceOverTimeChart, ServiceStatusChart} from "../elements/dashboard/dashboard-chart.jsx";
import DashboardRequestedServices from "./dashboard-requested-services.jsx";
import DashboardCancellationRequests from "./dashboard-cancellation-requests.jsx";
import ServiceTemplateFormLite from "../elements/forms/service-template-form-lite.jsx";
import StripeSettingsForm from "../elements/forms/stripe-settings-form.jsx";

let _ = require("lodash");
import {connect} from "react-redux";
import OfferingsStatsWidgets from '../elements/dashboard/offerings-stats-widgets.jsx';
import OverallStatsWidgets from '../elements/dashboard/overall-stats-widgets.jsx';

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            analytics: {},
        };

        this.fetchAnalytics = this.fetchAnalytics.bind(this);
        this.updateOfferingStat = this.updateOfferingStat.bind(this);
        this.updateStripeStat = this.updateStripeStat.bind(this);
    }

    componentDidMount() {
        if (!isAuthorized({permissions: ["can_administrate", "can_manage"]})) {
            return browserHistory.push("/login");
        } else {
            this.fetchAnalytics();
        }
    }

    fetchAnalytics() {
        let self = this;
        Fetcher('/api/v1/analytics/data').then(function (response) {
            self.setState({analytics: response});
        }).then(function () {
            self.setState({loading: false});
        });
    }
    //add a function to set state of the analytics after successful submissions
    updateOfferingStat() {
        let self = this;
        let {analytics} = this.state;
        console.log("Dashboard pre state change", analytics);
        analytics.offeringStats.total = 1;
        self.setState({
            analytics: analytics
        })
        console.log("Dashboard State changed", this.state.analytics)
    }
    updateStripeStat() {
        let self = this;
        let {analytics} = this.state;
        analytics.hasStripeKeys = true;
        self.setState({
            analytics: analytics
        })
    }

    render() {
        let pageName = this.props.route.name;
        let {analytics} = this.state;
        //For Shar!, you can add some style logic here
        let step1Style = {'fontWeight':'bold'};
        let step2Style = {};
        if(analytics.offeringStats){
            if(analytics.offeringStats.total > 0) {
                step2Style['fontWeight'] = 'bold';
            }
        }

        if (this.state.loading) {
            return (
                <div className="page-service-instance">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <Content>
                        <div className="row">
                            <Load/>
                        </div>
                    </Content>
                </div>
            );
        } else {
            return (
                <Authorizer permissions={["can_administrate", "can_manage"]}>
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
                        <Content>
                            {(analytics.offeringStats &&
                                analytics.offeringStats.total === 0 ||
                                analytics.hasStripeKeys === false) ?
                                <div>
                                    <div style={step1Style}>Step 1:</div>
                                    <div style={step2Style}>Step 2:</div>
                                    <div>Done:</div>
                                    {analytics.offeringStats.total === 0 &&
                                        <ServiceTemplateFormLite params={{'templateId': null}} postResponse={this.updateOfferingStat}/>
                                    }
                                    {analytics.offeringStats.total > 0 &&
                                        <StripeSettingsForm postResponse={this.updateStripeStat}/>
                                    }
                                </div> :

                                <div>
                                    <ContentTitle title="Welcome to your dashboard"/>
                                    <DashboardWidgets data={this.state.analytics}/>
                                    <OfferingsStatsWidgets data={this.state.analytics} />
                                    <OverallStatsWidgets data={this.state.analytics} />
                                </div>

                            }
                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    return {options: state.options}
};

export default connect(mapStateToProps)(Dashboard);
