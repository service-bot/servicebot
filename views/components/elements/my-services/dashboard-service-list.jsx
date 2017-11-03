import React from 'react';
import Load from '../../utilities/load.jsx';
import cookie from 'react-cookie';
import Fetcher from '../../utilities/fetcher.jsx';
import DashboardPageHeading from './dashboard-page-heading.jsx';
import DashboardServiceListItem from './dashboard-service-list-item.jsx';
import DashboardServiceListItemCharge from './dashboard-service-list-item-charge.jsx';
import _ from "lodash";
import Collapsible from 'react-collapsible';

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

    getActionItems() {
        let services = this.state.services;
        let purchasedItems = {};
        purchasedItems.actionItems = [], purchasedItems.quoteItems = [], purchasedItems.pendingItems = [],
            purchasedItems.activeItems = [], purchasedItems.archivedItems = [];

        services.forEach(service => {
            //Get service outstanding charges
            if(service.references.charge_items.length > 0) {
                let charges = service.references.charge_items.filter(charge => {
                    return !charge.approved;
                });
                if(charges.length > 0) {
                    service.outstanding_charges = charges;
                }
            }
            //If a service has a charge item, its an action item
            if(((service.status !== "waiting_cancellation" && service.status !== "cancelled") && service.outstanding_charges) || (service.status === "requested" && service.payment_plan.amount > 0)) {
                purchasedItems.actionItems.push(service);
            } else if (service.status === "requested" && service.payment_plan.amount === 0) {
                purchasedItems.quoteItems.push(service);
            } else if (service.status === "waiting_cancellation") {
                purchasedItems.pendingItems.push(service);
            } else if (service.status === "cancelled") {
                purchasedItems.archivedItems.push(service);
            } else {
                purchasedItems.activeItems.push(service);
            }
        });

        return (
            <div>
                {purchasedItems.actionItems.length > 0 &&
                    <Collapsible trigger="Items Waiting for Payment Approval" open={true} openedClassName="red" className="red">
                        <div className="service-instance-box-content">
                            <p>These services need your attention, please approve the item or pay the charges as soon as possible.</p>
                            {purchasedItems.actionItems.map(service => (
                                <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                            ))}
                        </div>
                    </Collapsible>
                }

                {purchasedItems.quoteItems.length > 0 &&
                <Collapsible trigger="Pending Quote" open={true} openedClassName="blue" className="blue">
                    <div className="service-instance-box-content">
                        <p>These services are waiting to be scoped out. Make sure to add the necessary details so we can provide you with the most accurate quote.</p>
                        {purchasedItems.quoteItems.map(service => (
                            <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                        ))}
                    </div>
                </Collapsible>
                }

                {purchasedItems.pendingItems.length > 0 &&
                <Collapsible trigger="Pending Cancellation" open={true} openedClassName="yellow" className="yellow">
                    <div className="service-instance-box-content">
                        <p>Following items are pending cancellation by the store staff.</p>
                        {purchasedItems.pendingItems.map(service => (
                            <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                        ))}
                    </div>
                </Collapsible>
                }

                {purchasedItems.activeItems.length > 0 &&
                <Collapsible trigger="Items waiting for payment or approval" open={true} openedClassName="green" className="green">
                    <div className="service-instance-box-content">
                        <p>These services need your attention, please approve the item or pay the charges as soon as possible.</p>
                        {purchasedItems.activeItems.map(service => (
                            <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                        ))}
                    </div>
                </Collapsible>
                }

                {purchasedItems.archivedItems.length > 0 &&
                <Collapsible trigger="Items waiting for payment or approval" openedClassName="black" className="black">
                    <div className="service-instance-box-content">
                        <p>These are your completed and cancelled services.</p>
                        {purchasedItems.archivedItems.map(service => (
                            <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} />
                        ))}
                    </div>
                </Collapsible>
                }
            </div>
        );
    }

    getActiveItems() {
        let services = this.state.services;

    }

    getArchiveItems() {

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
                    {this.getActionItems()}
                </div>

            );
        }
    }
}

export default DashboardServiceList;
