import React from 'react';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Load from '../utilities/load.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import {DashboardWidgets} from "../elements/dashboard/dashboard-widgets.jsx";
import ServiceTemplateFormLite from "../elements/forms/service-template-form-lite.jsx";
import StripeSettingsForm from "../elements/forms/stripe-settings-form.jsx";
import {connect} from "react-redux";
import OfferingsStatsWidgets from '../elements/dashboard/offerings-stats-widgets.jsx';
import OverallStatsWidgets from '../elements/dashboard/overall-stats-widgets.jsx';
import { setupComplete } from '../utilities/actions';

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

    updateOfferingStat() {
        let self = this;
        let {analytics} = this.state;
        analytics.offeringStats.total = 1;
        self.setState({
            analytics: analytics
        });
    }

    updateStripeStat() {
        let self = this;
        let {analytics} = this.state;
        analytics.hasStripeKeys = true;
        self.setState({
            analytics: analytics
        });
        //After Stripe keys have been entered, set-up is complete so dispatching action
        this.props.setupComplete(true);
    }

    render() {
        let pageName = this.props.route.name;
        let sub = '';
        let {analytics} = this.state;
        let showSteps = false;
        let step1 = '';
        let step2 = '';
        if((analytics.offeringStats && analytics.offeringStats.total === 0) || analytics.hasStripeKeys === false) {
            showSteps = true;
            step1 = 'active';
            pageName = 'Setup Your Servicebot';
            sub = 'Start selling your offerings in minutes';
            if(analytics.offeringStats.total > 0) {
                step2 = 'active';
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
                    <Jumbotron pageName={pageName} subtitle={sub}/>
                    <div className="page-service-instance">
                        <Content>
                            {showSteps ?
                                    <div>
                                        <div>
                                            <div className="col-xs-12 col-sm-12 col-md-8 col-lg-6 col-xl-6 col-md-offset-2 col-lg-offset-3 col-xl-offset-3">
                                                <ul className="progressbar">
                                                    <li className={step1}>Create an Offering</li>
                                                    <li className={step2}>Connect to Stripe</li>
                                                    <li>Done!</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div className="dash-tour col-xs-12 col-sm-12 col-md-8 col-lg-6 col-xl-6 col-md-offset-2 col-lg-offset-3 col-xl-offset-3">
                                            {analytics.offeringStats.total === 0 &&
                                            <ServiceTemplateFormLite params={{'templateId': null}} postResponse={this.updateOfferingStat}/>
                                            }
                                            {analytics.offeringStats.total > 0 &&
                                            <StripeSettingsForm postResponse={this.updateStripeStat} initialize={true}/>
                                            }
                                        </div>
                                    </div>
                                :

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

const mapDispatchToProps = {
    setupComplete,
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
