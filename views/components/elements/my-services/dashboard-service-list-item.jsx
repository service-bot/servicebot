import React from 'react';
import {Link} from 'react-router';
import ModalApprove from '../modals/modal-approve.jsx';
import ModalRequestCancellation from '../modals/modal-request-cancellation.jsx';
import ModalManageCancellation from '../modals/modal-manage-cancellation.jsx';
import Price from '../../utilities/price.jsx';

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

            let getPrice = ()=>{
                let serType = myService.type;
                console.log("the ser type", serType);
                if (serType == "subscription"){
                    return (
                        <span>
                        <Price value={myService.payment_plan.amount}/>
                            {myService.payment_plan.interval_count == 1 ? ' /' : ' / ' + myService.payment_plan.interval_count} {' '+myService.payment_plan.interval}
                    </span>
                    );
                }else if (serType == "one_time"){
                    return (<span><Price value={myService.payment_plan.amount}/></span>);
                }else if (serType == "custom"){
                    return (<span/>);
                }else{
                    console.log("here", serType);
                    return (<span><Price value={myService.payment_plan.amount}/></span>)
                }
            };

            return (
                <div className={`xaas-row ${self.props.service.status}`}>
                    <Link to={self.props.viewPath}>
                        <div className="xaas-title">
                            <div className="xaas-data xaas-status"><span className="status"><i className="fa fa-circle"/></span></div>
                            <div className="xaas-data xaas-category"><img className="xaas-service-icon" src="assets/service-icons/dark/aws.png"/></div>
                            <div className="xaas-data xaas-service"><h5>{name}</h5></div>
                            <div className="xaas-data xaas-price"><h5>{getPrice()}</h5></div>
                            {/*<div className="xaas-data xaas-interval"><h5>{interval}</h5></div>*/}
                            <div className="xaas-data xaas-action">
                                {/*<buttom to="" className="btn btn-flat btn-info btn-rounded btn-sm">View <i className="fa fa-expand"/></buttom>*/}
                                {status == "requested" &&
                                <buttom className="btn btn-outline btn-white btn-rounded btn-sm" onClick={self.handleApprove}>Approve</buttom>
                                }
                                {status == "waiting" &&
                                <buttom to="" className="btn btn-outline btn-white btn-rounded btn-sm">Pay All</buttom>
                                }
                                {status == "running" &&
                                <buttom to="" className="btn btn-default btn-rounded btn-sm" onClick={self.handleCancel}>Cancel Request</buttom>
                                }
                                {status == "waiting_cancellation" &&
                                <buttom to="" className="btn btn-default btn-rounded btn-sm" onClick={self.handleUndoCancel}>Undo Cancel Request</buttom>
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
