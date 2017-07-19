import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Load from '../utilities/load.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import DataTable from "../elements/datatable/datatable.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {DashboardWidgets} from "../elements/dashboard/dashboard-widgets.jsx";
import {ServiceOverTimeChart, ServiceStatusChart} from "../elements/dashboard/dashboard-chart.jsx";
import PageSection from "../layouts/page-section.jsx";

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

        if(this.state.loading){
            return(
                <div className="page-service-instance">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <Content>
                        <div className="row">
                            <Load/>
                        </div>
                    </Content>
                </div>
            );
        }else{
            return(
                <Authorizer permissions={["can_administrate", "can_manage"]}>
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
                        <Content>
                            <div>
                                <ContentTitle title="Welcome to your dashboard"/>
                                <DashboardWidgets data={this.state.analytics}/>
                                <div className="row">
                                    <div className="col-md-8">
                                        <DataTable parentState={this.state}
                                                   get={'/api/v1/service-instances/search?key=status&value=waiting_cancellation'}
                                                   col={['references.users.0.name', 'name', 'created_at']}
                                                   colNames={['Customer Name', 'Service Name', 'Created On']}
                                                   statusCol="status"
                                                   headingText="Cancellation Requests"
                                                   descriptionText="Services with cancellation request from customers."
                                                   className="dashboard-charts"
                                                   mod_name={(data, resObj)=>{
                                                       return ( <Link to={`/service-instance/${resObj.id}`}>{data}</Link> );
                                                   }}
                                                   mod_created_at={(data)=>{return <DateFormat date={data}/>}}
                                                   dropdown={[{
                                                       name: 'Actions', direction: 'right', buttons: [
                                                           {id: 1, name: 'View', link: '/service-instance/:id'},
                                                           {
                                                               id: 2, name: 'View Invoices', link: '#',
                                                               onClick: (dataObj)=>{return function(e) {
                                                                   e.preventDefault();
                                                                   browserHistory.push(`/billing-history/${dataObj.user_id}`);
                                                               }}
                                                           }]
                                                   }]}
                                        />
                                        <DataTable parentState={this.state}
                                                   get={'/api/v1/service-instances/search?key=status&value=requested'}
                                                   col={['references.users.0.name', 'name', 'created_at']}
                                                   colNames={['Customer Name', 'Service Name', 'Created On']}
                                                   statusCol="status"
                                                   headingText="Requested Services"
                                                   descriptionText="Services requested for customer and awaiting the customer to approve."
                                                   className="dashboard-charts"
                                                   mod_name={(data, resObj)=>{
                                                       return ( <Link to={`/service-instance/${resObj.id}`}>{data}</Link> );
                                                   }}
                                                   mod_created_at={(data)=>{return <DateFormat date={data}/>}}
                                                   dropdown={[{
                                                       name: 'Actions', direction: 'right', buttons: [
                                                           {id: 1, name: 'View', link: '/service-instance/:id'}]
                                                   }]}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <ServiceStatusChart className="dashboard-charts"/>
                                        <ServiceOverTimeChart className="dashboard-charts"/>
                                    </div>
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
