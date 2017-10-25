import React from 'react';
import cookie from 'react-cookie';
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';
import {Price} from '../../utilities/price.jsx';

class ModalRequestCancellation extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        let username = cookie.load("username");
        let serviceInstance = this.props.myInstance;
        this.state = {  loading: false,
            uid: uid,
            email: username,
            serviceInstance: serviceInstance,
            cancel_url: `/api/v1/service-instances/${serviceInstance.id}/cancel`,
            cancel_request_url: `/api/v1/service-instances/${serviceInstance.id}/request-cancellation`,
            current_modal: 'model_cancel_request',
        };
        this.onCancel = this.onCancel.bind(this);
        this.onCancelRequest = this.onCancelRequest.bind(this);
    }

    onCancel(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});

        Fetcher(self.state.cancel_url, "POST", {}).then(function (response) {
            if (!response.error) {
                self.setState({loading: false, current_modal: 'model_cancel_success'});
            }
            self.setState({loading: false});
        })
    }

    onCancelRequest(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});

        Fetcher(self.state.cancel_request_url, "POST", {}).then(function (response) {
            if (!response.error) {
                self.setState({loading: false, current_modal: 'model_cancel_request_success'});
            }
            self.setState({loading: false});
        })
    }

    handleUnauthorized(){
        browserHistory.push("/login");
    }

    render () {
        let self = this;
        let currentModal = this.state.current_modal;
        // let id = this.state.service_id;
        let instance = self.state.serviceInstance;
        let name = instance.name;
        let price = instance.payment_plan.amount;
        let interval = instance.payment_plan.interval;

        if(currentModal == 'model_cancel_request'){
            if(isAuthorized({permissions: ['can_administrate','can_manage']})) {
                return(
                    <Modal modalTitle="Cancel Service" icon="fa-ban" show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="490px">
                        <div className="table-responsive">
                            <div className="p-20">
                                <div className="row">
                                    <div className="col-xs-12">
                                        <p><strong>Are you sure you want to cancel this service?</strong></p>
                                        <p>Cancelling the service will stop all future payments.</p>
                                        <p>Service Name: <b>{name}</b></p>
                                    </div>
                                </div>
                            </div>
                            <div className={`modal-footer text-right p-b-20`}>
                                <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Nevermind</button>
                                <button className="btn btn-danger btn-rounded" onClick={self.onCancel}>Cancel Service</button>
                            </div>
                        </div>
                    </Modal>
                );
            } else {
                return(
                    <Modal modalTitle="Request Service Cancellation" icon="fa-ban" show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="650px">
                        <div className="table-responsive">
                            <div className="p-20">
                                <div className="row">
                                    <div className="col-xs-12">
                                        <p><strong>Are you sure you would like to cancel your service?</strong></p>
                                        <p>After requesting a cancellation, a staff member will review and complete your cancellation.
                                            <i>Your payment will stop after the cancellation has been approved.</i></p>
                                        <p>Service Name: <b>{name}</b></p>
                                    </div>
                                </div>
                            </div>
                            <div className={`modal-footer text-right p-b-20`}>
                                <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Nevermind</button>
                                <button className="btn btn-danger btn-rounded" onClick={self.onCancelRequest}>Request Cancellation</button>
                            </div>
                        </div>
                    </Modal>
                );
            }
        } else if(currentModal == 'model_cancel_request_success'){
            return(
                <Modal modalTitle="Cancellation Request Sent" icon="fa-check" show={self.props.show} hide={self.props.hide}>
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>Your cancellation request to cancel {name} has been sent successfully.</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            );
        } else if(currentModal == 'model_cancel_success'){
            return(
                <Modal modalTitle="Service Cancellation Successful" icon="fa-check" show={self.props.show} hide={self.props.hide}>
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>Service {name}, has been successfully cancelled.</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            );
        }

    }
}

export default ModalRequestCancellation;
