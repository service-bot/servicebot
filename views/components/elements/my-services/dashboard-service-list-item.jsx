import React from 'react';
import {Link} from 'react-router';
import ModalApprove from '../modals/modal-approve.jsx';
import ModalRequestCancellation from '../modals/modal-request-cancellation.jsx';
import ModalManageCancellation from '../modals/modal-manage-cancellation.jsx';
import {Price} from '../../utilities/price.jsx';

class DashboardServiceListItem extends React.Component {

    constructor(props){
        super(props);
        this.state = {  approveModal : false,
            cancelModal: false,
            undoCancelModal: false};

        this.mapIntervalString = this.mapIntervalString.bind(this);
        this.handleApprove = this.handleApprove.bind(this);
        this.onApproveClose = this.onApproveClose.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.onCancelClose = this.onCancelClose.bind(this);
        this.handleUndoCancel = this.handleUndoCancel.bind(this);
        this.onUndoCancelClose = this.onUndoCancelClose.bind(this);
    }

    mapIntervalString(string){
        switch(string){
            case 'day'      : return 'Daily';   break;
            case 'week'     : return 'Weekly';  break;
            case 'month'    : return 'Monthly'; break;
            case 'year'     : return 'Yearly';  break;
            default         : return 'N/A';     break;
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
                            {myService.payment_plan.interval_count == 1 ? ' /' : ' / ' + myService.payment_plan.interval_count} {' '+myService.payment_plan.interval}
                        </span>
                    );
                }
            };

            let getPrice = ()=>{
                if(myService.status === "requested" && myService.payment_plan.amount > 0 && !myService.outstanding_charges_total) {
                    return (
                        <div className="xaas-price red">
                            Due: &nbsp;
                            {serType == "subscription" &&
                                <span>
                                    {getSubscriptionPrice()}
                                    {getTotalCharges() && <span> + </span>}
                                </span>
                            }
                            {getTotalCharges() && <span>{getTotalCharges()}</span>}
                        </div>
                    )
                } else {
                    return (
                        <div>
                            {serType == "subscription" && <div className="xaas-price">{getSubscriptionPrice()}</div>}
                            {getTotalCharges() && <div className="xaas-price red m-l-5"><span>Due: {getTotalCharges()}</span></div>}
                        </div>
                    )
                }
                // if(getSubscriptionPrice()) {
                //     return (
                //         <div className="xaas-data xaas-price">
                //             {getSubscriptionPrice()} DUE:
                //         </div>
                //     )
                // }
                // if (serType == "subscription"){
                //     return (
                //         <span>
                //         <Price value={myService.payment_plan.amount}/>
                //             {myService.payment_plan.interval_count == 1 ? ' /' : ' / ' + myService.payment_plan.interval_count} {' '+myService.payment_plan.interval}
                //     </span>
                //     );
                // }else if (serType == "one_time"){
                //     return (<span><Price value={myService.payment_plan.amount}/></span>);
                // }else if (serType == "custom"){
                //     return (<span/>);
                // }else{
                //     return (<span><Price value={myService.payment_plan.amount}/></span>)
                // }
            };

            console.log("SHAR: 1")
            console.log(myService)

            return (
                <div className={`xaas-row ${self.props.service.status}`}>
                    <Link to={self.props.viewPath}>
                        <div className="xaas-title">
                            <div className="xaas-data xaas-status"><span className="status"><i className={myService.icon}/></span></div>
                            <div className="xaas-data xaas-category"><img className="xaas-service-icon" src="assets/service-icons/dark/aws.png"/></div>
                            <div className="xaas-data xaas-service"><h5>{name}</h5></div>
                            {getPrice()}
                            {/*<div className="xaas-data xaas-interval"><h5>{interval}</h5></div>*/}
                            <div className="xaas-data xaas-action">
                                {/*<buttom to="" className="btn btn-flat btn-info btn-rounded btn-sm">View <i className="fa fa-expand"/></buttom>*/}
                                {status == "requested" &&
                                <button className="btn btn-outline btn-white btn-rounded btn-sm" onClick={self.handleApprove}>
                                    <i className="fa fa-credit-card" />
                                     Pay Now
                                </button>
                                }
                                {status == "waiting" &&
                                <button to="" className="btn btn-outline btn-white btn-rounded btn-sm">Pay All</button>
                                }
                                {status == "running" &&
                                <button to="" className="btn btn-default btn-rounded btn-sm" onClick={self.handleCancel}>Request Cancellation</button>
                                }
                                {status == "waiting_cancellation" &&
                                <button to="" className="btn btn-default btn-rounded btn-sm" onClick={self.handleUndoCancel}>Undo Cancellation</button>
                                }
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
