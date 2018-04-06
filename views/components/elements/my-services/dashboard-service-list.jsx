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
        this.state = {
            services: this.props.services,
            url: `/api/v1/service-instances/own`,
            fundUrl: `/api/v1/users/${uid}`,
            userFunds: [],
            loading:false
        };
        this.handleComponentUpdating = this.handleComponentUpdating.bind(this);
        this.fetchUserFund = this.fetchUserFund.bind(this);
    }

    componentDidMount() {
        let self = this;
        self.fetchUserFund();
    }

    componentWillReceiveProps(nextProps){
        if(this.props.services === nextProps.services){
            this.setState({services: nextProps.services});
        }
    }

    handleComponentUpdating(){
        // this.fetchServiceInstances()
        this.props.handleComponentUpdating();
    }

    fetchUserFund(){
        let self = this;
        Fetcher(self.state.fundUrl).then(function (response) {
            if (!response.error) {
                if (response.references.funds.length > 0) {
                    self.setState({userFunds : response.references.funds});
                }
            }
        });
    }

    getTrigger(icon, title) {
        icon = `fa ${icon}`;
        return (
            <div>
                <i className={icon} />
                <span> {title}</span>
            </div>
        );
    };

    getUserServices() {
        let services = this.state.services;
        let purchasedItems = {};
            purchasedItems.actionItems = [],
            purchasedItems.quoteItems = [],
            purchasedItems.pendingItems = [],
            purchasedItems.activeItems = [],
            purchasedItems.archivedItems = [];
            purchasedItems.trialItems = [];

        services.forEach(service => {
            //Get service outstanding charges
            if(service.references.charge_items.length > 0) {
                let charges = service.references.charge_items.filter(charge => {
                    return !charge.approved;
                });
                if(charges.length > 0) {
                    let allCharges = 0;
                    charges.map(charge => {
                        allCharges += charge.amount;
                    });
                    service.outstanding_charges_total = allCharges;
                    service.outstanding_charges = charges;
                }
            }
            //Get service trial status
            let trial = service.payment_plan.trial_period_days;
            if(service.status === "running" && trial > 0) {
                let currentDate = new Date(service.subscribed_at * 1000);
                let trialEnd = new Date(service.trial_end * 1000);
                //Service is trialing if the expiration is after current date
                if(currentDate < trialEnd) {
                    service.intrial = true;
                }
            } else {
                service.intrial = false;
            }
            //If a service has a charge item, its an action item
            if(((service.status !== "waiting_cancellation" && service.status !== "cancelled") && service.outstanding_charges) || (service.status === "requested" && service.payment_plan.amount > 0)) {
                purchasedItems.actionItems.push(service);
                service.icon = "fa fa-flag";
            } else if (service.status === "requested" && service.payment_plan.amount === 0) {
                purchasedItems.quoteItems.push(service);
                service.icon = "fa fa-refresh";
            } else if (service.status === "waiting_cancellation") {
                purchasedItems.pendingItems.push(service);
                service.icon = "fa fa-hourglass-end";
            } else if (service.status === "cancelled") {
                purchasedItems.archivedItems.push(service);
                service.icon = "fa fa-times";
            } else if (service.intrial) {
                purchasedItems.trialItems.push(service);
                service.icon = "fa fa-clock-o";
            } else {
                purchasedItems.activeItems.push(service);
                service.icon = "fa fa-check";
            }
        });

        return (
            <div>
                {purchasedItems.actionItems.length > 0 &&
                    <Collapsible triggerWhenOpen={this.getTrigger("fa-chevron-down", "Items Waiting for Payment Approval")} trigger={this.getTrigger("fa-chevron-right", "View Items Waiting for Payment Approval")} open={true} openedClassName="red" className="red">
                        <div className="service-instance-box-content">
                            <p>These services need your attention, please approve the item or pay the charges as soon as possible.</p>
                            {purchasedItems.actionItems.map(service => (
                                <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                            ))}
                        </div>
                    </Collapsible>
                }

                {purchasedItems.trialItems.length > 0 &&
                <Collapsible triggerWhenOpen={this.getTrigger("fa-chevron-down", "Items in Trial")} trigger={this.getTrigger("fa-chevron-right", "View Items in Trial")} open={true} openedClassName="navy" className="navy">
                    <div className="service-instance-box-content">
                        <p>These services are currently in trial. If the fund is not added prior to the trial expiration, the service will be automatically cancelled.</p>
                        {purchasedItems.trialItems.map(service => (
                            <DashboardServiceListItem userFunds={this.state.userFunds} fetchFunds={this.fetchUserFund} key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                        ))}
                    </div>
                </Collapsible>
                }

                {purchasedItems.quoteItems.length > 0 &&
                <Collapsible triggerWhenOpen={this.getTrigger("fa-chevron-down", "Pending Quotes")} trigger={this.getTrigger("fa-chevron-right", "View Pending Quotes")} open={true} openedClassName="blue" className="blue">
                    <div className="service-instance-box-content">
                        <p>These services are waiting to be scoped out. Make sure to add the necessary details so we can provide you with the most accurate quote.</p>
                        {purchasedItems.quoteItems.map(service => (
                            <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                        ))}
                    </div>
                </Collapsible>
                }

                {purchasedItems.pendingItems.length > 0 &&
                <Collapsible triggerWhenOpen={this.getTrigger("fa-chevron-down", "Pending Cancellations")} trigger={this.getTrigger("fa-chevron-right", "View Pending Cancellations")} open={true} openedClassName="yellow" className="yellow">
                    <div className="service-instance-box-content">
                        <p>Following items are pending cancellation by the store staff.</p>
                        {purchasedItems.pendingItems.map(service => (
                            <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                        ))}
                    </div>
                </Collapsible>
                }

                {purchasedItems.activeItems.length > 0 &&
                <Collapsible triggerWhenOpen={this.getTrigger("fa-chevron-down", "Active Items")} trigger={this.getTrigger("fa-chevron-right", "View Active Items")} open={true} openedClassName="green" className="green">
                    <div className="service-instance-box-content">
                        <p>These services need your attention, please approve the item or pay the charges as soon as possible.</p>
                        {purchasedItems.activeItems.map(service => (
                            <DashboardServiceListItem key={"service-" + service.id} service={service} viewPath={`/service-instance/${service.id}`} handleComponentUpdating={this.handleComponentUpdating}/>
                        ))}
                    </div>
                </Collapsible>
                }

                {purchasedItems.archivedItems.length > 0 &&
                <Collapsible triggerWhenOpen={this.getTrigger("fa-chevron-down", "Cancelled and Completed Items")} trigger={this.getTrigger("fa-chevron-right", "View Cancelled and Completed Items")} openedClassName="black" className="black">
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
                <div className="col-md-10 col-lg-8 col-sm-12 col-md-offset-1 col-lg-offset-2">
                    <Load/>
                </div>
            );
        }
        if(this.state.services.length<1) {
            return (
                <div className="col-md-10 col-lg-8 col-sm-12 col-md-offset-1 col-lg-offset-2">
                    <p className="help-block center-align">You don't have any services.</p>
                </div>
            );
        }
        else {
            //grouping services by their status for displaying in groups
            const grouped = _.groupBy(this.state.services, 'status');
            return (
                <div className="col-md-10 col-lg-8 col-sm-12 col-md-offset-1 col-lg-offset-2">
                    {this.getUserServices()}
                </div>

            );
        }
    }
}

export default DashboardServiceList;
