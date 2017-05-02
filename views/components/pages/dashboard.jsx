import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Load from '../utilities/load.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import {DashboardWidgets} from "../elements/dashboard/dashboard-widgets.jsx";
import {ServiceOverTimeChart, ServiceStatusChart} from "../elements/dashboard/dashboard-chart.jsx";

class Dashboard extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            loading: true,
            analytics: {}
        };

        this.fetchAnalytics = this.fetchAnalytics.bind(this);
    }

    componentDidMount(){
        if(!isAuthorized({permissions:["can_administrate", "can_manage"]})){
            return browserHistory.push("/login");
        }else{
            this.fetchAnalytics();
        }
    }

    fetchAnalytics(){
        let self = this;
        Fetcher('/api/v1/analytics/data').then(function (response) {
            self.setState({loading: false, analytics: response});
        })
    }

    render () {
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'Dashboard', link: null}];

        if(this.state.loading){
            return(
                <div className="page-service-instance">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <Content>
                        <div className="row m-b-20">
                            <Load/>
                        </div>
                    </Content>
                </div>
            );
        }else{
            return(
                <Authorizer permissions={["can_administrate", "can_manage"]}>
                    <div className="page-service-instance">
                        <Jumbotron pageName={pageName} location={this.props.location}/>
                        <Content>
                            <div className="row m-b-20">
                                <ContentTitle title="Welcome to your dashboard"/>
                                <DashboardWidgets data={this.state.analytics}/>
                                <div id="dashboard-charts">
                                    <ServiceOverTimeChart/>
                                    <ServiceStatusChart/>
                                </div>
                            </div>
                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default Dashboard;
