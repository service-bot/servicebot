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
//import SubscriptionStatsWidgets from '../elements/dashboard/subscription-widgets.jsx';
//import UnSubscriptionStatsWidgets from '../elements/dashboard/un-subscription-widgets.jsx';

class Dashboard extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            analytics: {},
        };

        this.fetchAnalytics = this.fetchAnalytics.bind(this);
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

    render() {
        let pageName = this.props.route.name;
        let {options} = this.props;
        let {analytics} = this.state;
        console.log("whoel condiftion!----:", (analytics.offeringStats &&
            analytics.offeringStats.total === 0 ||
            analytics.hasStripeKeys === false));
        console.log("analytics:", analytics);
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
                                    <div>Step 1:</div>
                                    <div>Step 2:</div>
                                    <div>Done:</div>
                                    {analytics.offeringStats.total === 0 &&
                                        <ServiceTemplateFormLite params = {{'templateId': null}}/>
                                    }
                                    {analytics.offeringStats.total > 0 &&
                                        <StripeSettingsForm/>
                                    }
                                </div> :

                                <div>
                                    <ContentTitle title="Welcome to your dashboard"/>
                                    <DashboardWidgets data={this.state.analytics}/>
                                    <OfferingsStatsWidgets data={this.state.analytics}/>
                                    <OverallStatsWidgets data={this.state.analytics}/>
                                    {/*<SubscriptionStatsWidgets data={this.state.analytics} />*/}
                                    {/*<UnSubscriptionStatsWidgets data={this.state.analytics} />*/}
                                    <div className="row">
                                        <div className="col-md-8 dashboard-charts">


                                        </div>
                                        <div className="col-md-4">
                                            <ServiceStatusChart className="dashboard-charts"/>
                                            <ServiceOverTimeChart className="dashboard-charts"/>
                                        </div>

                                    </div>
                                    <div>
                                        <DashboardRequestedServices/>
                                        <DashboardCancellationRequests/>
                                    </div>
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
