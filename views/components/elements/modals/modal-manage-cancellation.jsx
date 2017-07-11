import React from 'react';
import cookie from 'react-cookie';
import Fetcher from "../../utilities/fetcher.jsx"
import Authorizer from "../../utilities/authorizer.jsx";
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';
import {Price} from '../../utilities/price.jsx';
let _ = require("lodash");

class ModalManageCancellation extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        let username = cookie.load("username");
        let serviceInstance = this.props.myInstance;
        this.state = {  loading: false,
                        uid: uid,
                        email: username,
                        cancellationRequests: false,
                        serviceInstance: serviceInstance,
                        undo_cancel_url: false,
                        confirm_cancel_url: false,
                        current_modal: 'model_undo_cancel',
        };
        this.onUndoCancel = this.onUndoCancel.bind(this);
        this.onConfirmCancel = this.onConfirmCancel.bind(this);
        this.getInstanceCancellationRequestId = this.getInstanceCancellationRequestId.bind(this);
    }

    componentDidMount(){
        let self = this;
        Fetcher('/api/v1/service-instance-cancellations').then(function (response) {
            if(!response.error){
                console.log("all cancellation requests", response);
                let cancellationID = self.getInstanceCancellationRequestId(response);
                self.setState({cancellationRequests: response,
                    undo_cancel_url: `/api/v1/service-instance-cancellations/${cancellationID}/reject`,
                    confirm_cancel_url: `/api/v1/service-instance-cancellations/${cancellationID}/approve`});
            }else{
                console.log("Error", response);
            }
        })
    }

    getInstanceCancellationRequestId(cancellationRequests){
        let self = this;
        let cancellationID = _.find(cancellationRequests, function(o) { return o.service_instance_id == self.state.serviceInstance.id; }).id
        console.log("found cancellation id", cancellationID);
        return (cancellationID);
    }

    onUndoCancel(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});

        Fetcher(self.state.undo_cancel_url, "POST", {}).then(function (response) {
            if (!response.error) {
                console.log("cancel success", response);
                self.setState({loading: false, current_modal: 'model_undo_cancel_success'});
            }
            self.setState({loading: false});
        })
    }

    onConfirmCancel(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});

        Fetcher(self.state.confirm_cancel_url, "POST", {}).then(function (response) {
            if (!response.error) {
                console.log("cancel success", response);
                self.setState({loading: false, current_modal: 'model_confirm_cancel_success'});
            }
            self.setState({loading: false});
        })
    }

    handleUnauthorized(){
        browserHistory.push("/login");
    }

    render () {
        let self = this;
        let pageName = "Service Undo Cancel Request";
        let currentModal = this.state.current_modal;
        let instance = self.state.serviceInstance;
        let name = instance.name;
        let price = instance.payment_plan.amount;
        let interval = instance.payment_plan.interval;

        if(currentModal == 'model_undo_cancel'){
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="490px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>Are you sure you want to undo the cancel request?</strong></p>
                                    <p>If you are sure, your service will resume and will be put back to
                                        running status and your account will be charged as normal.</p>
                                    <p>Service: {name}, <Price value={price}/>/{interval}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Nevermind</button>
                            <Authorizer permissions="can_administrate">
                                <button className="btn btn-default btn-rounded" onClick={self.onConfirmCancel}>Approve Cancel</button>
                            </Authorizer>
                            <button className="btn btn-primary btn-rounded" onClick={self.onUndoCancel}>Undo Cancel</button>
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'model_undo_cancel_success'){
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide}>
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>Your service, {name}, has been restored and is now running again.</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'model_confirm_cancel_success'){
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide}>
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>Your service, {name}, has been cancelled.</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            );
        }

    }
}

export default ModalManageCancellation;
