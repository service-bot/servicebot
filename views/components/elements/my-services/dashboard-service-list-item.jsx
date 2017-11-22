import React from 'react';
import {Link, browserHistory} from 'react-router';
import ModalApprove from '../modals/modal-approve.jsx';
import ModalRequestCancellation from '../modals/modal-request-cancellation.jsx';
import ModalManageCancellation from '../modals/modal-manage-cancellation.jsx';
import ModalPayAllCharges from '../modals/modal-pay-all-charges.jsx';
import {Price} from '../../utilities/price.jsx';
import ApplicationLauncher from '../../elements/my-services/application-launcher.jsx';
import TrialActionButton from '../../elements/my-services/trial-action-button.jsx';
import ModalPaymentSetup from '../modals/modal-payment-setup.jsx';
import Fetcher from '../../utilities/fetcher.jsx';

class DashboardServiceListItem extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            approveModal : false,
            cancelModal: false,
            undoCancelModal: false,
            payChargeModal: false,
            fundModal : false
        };

        this.mapIntervalString = this.mapIntervalString.bind(this);
        this.handleApprove = this.handleApprove.bind(this);
        this.onApproveClose = this.onApproveClose.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.onCancelClose = this.onCancelClose.bind(this);
        this.handleUndoCancel = this.handleUndoCancel.bind(this);
        this.onUndoCancelClose = this.onUndoCancelClose.bind(this);
        this.handlePayCharges = this.handlePayCharges.bind(this);
        this.onPayChargesClose = this.onPayChargesClose.bind(this);
        this.handleAddFund = this.handleAddFund.bind(this);
        this.onAddFundClose = this.onAddFundClose.bind(this);
    }

    mapIntervalString(string){
        switch(string){
            case 'day'      : return 'Daily';   break;
            case 'week'     : return 'Weekly';  break;
            case 'month'    : return 'Monthly'; break;
            case 'year'     : return 'Yearly';  break;
            default         : return string;    break;
        }
    }

    handleApprove(event){
        event.preventDefault();
        this.setState({ approveModal : true});
    }
    onApproveClose(){
        this.setState({ approveModal : false});
        this.props.handleComponentUpdating();
    }

    handleCancel(event){
        event.preventDefault();
        this.setState({ cancelModal : true});
    }
    onCancelClose(){
        this.setState({ cancelModal : false});
        this.props.handleComponentUpdating();
    }

    handleUndoCancel(event){
        event.preventDefault();
        this.setState({ undoCancelModal : true});
    }
    onUndoCancelClose(){
        this.setState({ undoCancelModal : false});
        this.props.handleComponentUpdating();
    }

    handlePayCharges(event){
        event.preventDefault();
        this.setState({ payChargeModal : true});
    }
    onPayChargesClose(){
        this.setState({ payChargeModal : false});
        this.props.handleComponentUpdating();
    }
    handleAddFund(event){
        event.preventDefault();
        this.setState({ fundModal : true});
    }
    onAddFundClose(){
        this.setState({ fundModal : false});
        this.props.fetchFunds();
        this.props.handleComponentUpdating();
    }


    render () {
        let self = this;
        let id, name, amount, interval, status, service= null;

        //Gather data first
        if( self.props.service){
            service = self.props.service;
            id = service.id;
            name = service.name || "N/A";
            status = service.status || "N/A";
            if(service.payment_plan){
                amount = service.payment_plan.amount;
                interval = service.payment_plan.interval
            }else{
                amount = false;
                interval = "N/A";
            }
        }

        const currentModal = ()=>{

            if(self.state.approveModal){
                return(
                    <ModalApprove myInstance={service} show={self.state.approveModal} hide={self.onApproveClose}/>
                );
            }else if(self.state.cancelModal){
                return(
                    <ModalRequestCancellation myInstance={service} show={self.state.cancelModal} hide={self.onCancelClose}/>
                );
            }else if(self.state.undoCancelModal){
                return(
                    <ModalManageCancellation myInstance={service} show={self.state.undoCancelModal} hide={self.onUndoCancelClose}/>
                );
            } else if(self.state.payChargeModal) {
                return(
                    <ModalPayAllCharges myInstance={service} ownerId={service.user_id} show={self.state.payChargeModal} hide={self.onPayChargesClose}/>
                )
            } else if(self.state.fundModal){
                return( <ModalPaymentSetup justPayment={true} modalCallback={self.onAddFundClose} ownerId={service.user_id} show={self.state.handleAddFund} hide={self.onAddFundClose}/> );
            }
        };

        if(self.props.service && self.props.service != null){
            let myService = self.props.service;
            let serType = myService.type;

            let getTotalCharges = ()=>{
                if(myService.outstanding_charges_total) {
                    return (<Price value={myService.outstanding_charges_total}/>);
                }
            };

            let getSubscriptionPrice = ()=>{
                if (serType == "subscription"){
                    return (
                        <span>
                            <Price value={myService.payment_plan.amount}/>
                            {myService.payment_plan.interval_count == 1 ? '/' : '/' + myService.payment_plan.interval_count}{myService.payment_plan.interval}
                        </span>
                    );
                }
            };

            let getPrice = ()=>{
                if(myService.status === "requested" && myService.payment_plan.amount > 0 && myService.outstanding_charges_total) {
                    return (
                        <div>
                            {serType == "subscription" && <div className="xaas-price red">{getSubscriptionPrice()}</div>}
                            {getTotalCharges() && <div className="xaas-price red m-l-5">{getTotalCharges()}</div>}
                        </div>
                    )
                } else {
                    return (
                        <div>{getTotalCharges() && <div className="xaas-price red m-l-5"><span> {getTotalCharges()}</span></div>}</div>
                    )
                }
            };

            let getActionButton = ()=>{
                if(status === "requested" && (myService.payment_plan.amount > 0 || myService.outstanding_charges_total)) {
                    return (<button className="btn btn-default btn-rounded btn-sm" onClick={self.handleApprove}><i className="fa fa-credit-card" /> Pay Now</button>);
                } else if(myService.outstanding_charges_total) {
                    return (<button className="btn btn-default btn-rounded btn-sm" onClick={self.handlePayCharges}><i className="fa fa-credit-card" /> Pay Now</button>);
                } else if(status === "requested" && myService.payment_plan.amount === 0 && !myService.outstanding_charges_total) {
                    return (null);
                } else if(status === "waiting_cancellation") {
                    return (<button to="" className="btn btn-default btn-rounded btn-sm" onClick={self.handleUndoCancel}>Undo Cancellation</button>);
                } else if(status === "cancelled") {
                    return (null);
                } else {
                    //Taking out the cancellation request for now.
                    //return (<button to="" className="btn btn-default btn-rounded btn-sm" onClick={self.handleCancel}>Request Cancellation</button>);
                    return (null);
                }
            };

            let getLinkActionButton = ()=>{
                let websiteLink = (myService.references.service_instance_properties.filter(link => link.name === "url"))[0];
                if(status!== "cancelled" && websiteLink) {
                    return (<ApplicationLauncher serviceInstance={myService} instanceLink={websiteLink} />);
                }
            };

            let getTrialActionButton = ()=>{
                if(self.props.userFunds) {
                    return (<TrialActionButton userFunds={self.props.userFunds} serviceInstance={myService} modalCallback={this.handleAddFund} />);
                } else {
                    return (null);
                }
            };


            return (
                <div className={`xaas-row ${self.props.service.status}`}>
                    <Link to={self.props.viewPath}>
                        <div className="xaas-title">
                            <div className="xaas-data xaas-status"><span className="status"><i className={myService.icon}/></span></div>
                            <div className="xaas-data xaas-service"><h5>{name}</h5></div>
                            {getPrice()}
                            {/*<div className="xaas-data xaas-interval"><h5>{interval}</h5></div>*/}
                            <div className="xaas-data xaas-action">
                                {getLinkActionButton()}
                                {getActionButton()}
                                {getTrialActionButton()}
                            </div>
                        </div>
                        {self.props.children}
                    </Link>
                    {currentModal()}
                </div>
            );
        }else{
            return <p className="help-block">service not defined</p>;
        }

    }
}

export default DashboardServiceListItem;
