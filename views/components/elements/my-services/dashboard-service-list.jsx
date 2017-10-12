import React from 'react';
import Load from '../../utilities/load.jsx';
import cookie from 'react-cookie';
import Fetcher from '../../utilities/fetcher.jsx';
import DashboardPageHeading from './dashboard-page-heading.jsx';
import DashboardServiceListItem from './dashboard-service-list-item.jsx';
import DashboardServiceListItemCharge from './dashboard-service-list-item-charge.jsx';
import _ from "lodash";


class DashboardServiceList extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        this.state = { services: this.props.services, url: `/api/v1/service-instances/own`, loading:false};
        this.handleComponentUpdating = this.handleComponentUpdating.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(this.props.services == nextProps.services){
            this.setState({services: nextProps.services});
        }
    }

    handleComponentUpdating(){
        // this.fetchServiceInstances()
        this.props.handleComponentUpdating();
    }

    render () {
        if(this.state.loading){
            return (
                <div className="col-xs-12 xaas-dashboard">
                    <Load/>
                </div>
            );
        }
        if(this.state.services.length<1) {
            return (
                <div className="col-xs-12 xaas-dashboard">
                    <p className="help-block center-align">You don't have any services.</p>
                </div>
            );
        }
        else {
            //grouping services by their status for displaying in groups
            const grouped = _.groupBy(this.state.services, 'status');
            return (
                <div className="col-xs-12 xaas-dashboard">

                    {/* Services that are in progress status */}
                    {grouped.in_progress !== undefined &&
                    <div className="row m-b-10">
                        <DashboardPageHeading pageTitle="Services In progress"
                                              pageDescription="These services are in progress."/>
                    </div>
                    }
                    {grouped.in_progress !== undefined && grouped.in_progress.map(service => (
                        <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                    ))}

                    {/* Services that have pending charges need to be approved / paid */}
                    {grouped.waiting !== undefined &&
                        <div className="row m-b-10">
                            <DashboardPageHeading pageTitle="Services Need Attention"
                                                  pageDescription="These services need your attention, please approve the service charge items as soon as possible."/>
                        </div>
                    }
                    {grouped.waiting !== undefined && grouped.waiting.map(service => (
                        <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}>
                            <DashboardServiceListItemCharge serviceInstanceId={service.id} />
                        </DashboardServiceListItem>
                    ))}

                    {/* Services that were requested and waiting to be approved by user */}
                    {grouped.requested !== undefined &&
                    <div className="row m-b-10">
                        <DashboardPageHeading pageTitle="Services Need Approval"
                                              pageDescription="These services need your approval, please approve the services as soon as possible."/>
                    </div>
                    }
                    {grouped.requested !== undefined && grouped.requested.map(service => (
                        <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                    ))}

                    {/* Services that are running */}
                    {grouped.running !== undefined &&
                    <div className="purchases-header row m-b-10">
                        <DashboardPageHeading pageTitle="Purchased Subscriptions / One Time Services / Custom Orders"
                                              pageDescription="All services including active, unpaid and stopped services."/>
                    </div>
                    }
                    {grouped.running !== undefined && grouped.running.map(service => (
                        <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                    ))}

                    {/* Services that are waiting for cancellation approval by admins */}
                    {grouped.waiting_cancellation !== undefined &&
                    <div className="row m-b-10">
                        <DashboardPageHeading pageTitle="Services in cancellation queue"
                                              pageDescription="These services are waiting for admin to finish cancellation process."/>
                    </div>
                    }
                    {grouped.waiting_cancellation !== undefined && grouped.waiting_cancellation.map(service => (
                        <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                    ))}

                    {/* Services that are cancelled */}
                    {grouped.cancelled !== undefined && grouped.cancelled.map(service => (
                        <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`}/>
                    ))}
                </div>

            );
        }
    }
}

export default DashboardServiceList;
