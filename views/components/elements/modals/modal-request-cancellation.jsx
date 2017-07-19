import React from 'react';
import cookie from 'react-cookie';
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
            cancel_request_url: `/api/v1/service-instances/${serviceInstance.id}/request-cancellation`,
            current_modal: 'model_cancel_request',
        };
        this.onCancel = this.onCancel.bind(this);
    }

    onCancel(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});

        Fetcher(self.state.cancel_request_url, "POST", {}).then(function (response) {
            if (!response.error) {
                console.log("cancel success", response);
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
        let pageName = "Service Cancel Request";
        let currentModal = this.state.current_modal;
        // let id = this.state.service_id;
        let instance = self.state.serviceInstance;
        let name = instance.name;
        let price = instance.payment_plan.amount;
        let interval = instance.payment_plan.interval;

        if(currentModal == 'model_cancel_request'){
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="490px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>You are about to send a cancel request for the following service.</strong></p>
                                    <p>Service: {name}, <Price value={price}/>/{interval}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <button className="btn btn-primary btn-rounded" onClick={self.onCancel}>Request Cancel</button>
                            <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Nevermind</button>
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'model_cancel_request_success'){
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide}>
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>Your request to cancel service, {name}, has been sent successfully.</strong></p>
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
