import React from 'react';
import cookie from 'react-cookie';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';
import ModalPaymentSetup from './modal-payment-setup.jsx';
import {Price} from '../../utilities/price.jsx';
let _ = require("lodash");

class ModalPayChargeItem extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        if(this.props.ownerId){
            uid = this.props.ownerId;
        }

        let username = cookie.load("username");
        let service = this.props.myInstance;
        let charge = this.props.chargeId;
        let charge_item = false;

        if(_.has(service, 'references.charge_items') && _.filter(_.get(service, 'references.charge_items'), (item) => {return item.id==charge;}).length > 0 ){
            charge_item = _.filter(_.get(service, 'references.charge_items'), (item) => {return item.id==charge;})[0];
        }

        let user_url = '/api/v1/users/own';
        if(cookie.load("uid") != this.props.ownerId){
            user_url = `/api/v1/users/${this.props.ownerId}`;
        }

        this.state = {  loading: false,
            uid: uid,
            email: username,
            cancel_charge_url: `/api/v1/charge/${this.props.chargeId}/cancel`,
            user_url: user_url,
            charge_item: charge_item,
            charge_id: charge,
            service_id: service.id,
            service_name: service.name,
            service_price: service.payment_plan.amount,
            service_interval: service.payment_plan.interval,
            paid: false,
            cancelled: false,
            current_modal: 'model_cancel_charge',
            hasCard: false,
            fund: {},
            card: {}
        };
        this.handlePaymentSetup = this.handlePaymentSetup.bind(this);
        this.onCancel = this.onCancel.bind(this);
    }

    handlePaymentSetup(){
        this.setState({current_modal: 'payment_setup', paymentSetupModal: true});
    }

    onCancel(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});
        Fetcher(self.state.cancel_charge_url, "POST", {}).then(function (response) {
            if (!response.error) {
                self.setState({loading: false, cancelled: true});
            }
            self.setState({loading: false});
        });
    }

    handleUnauthorized(){
        browserHistory.push("/login");
    }

    render () {
        let self = this;
        let pageName = "Cancel Charge item";
        let currentModal = this.state.current_modal;
        let chargeId = this.state.charge_id;
        let chargeDescription = this.state.charge_item.description;
        let chargeAmount = this.state.charge_item.amount;
        let serviceName = this.state.service_name;

        if(currentModal == 'model_cancel_charge' && !self.state.cancelled){
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="490px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>You are about to cancel the following charge item:</strong></p>
                                    <p>Charge Description: {chargeDescription}</p>
                                    <p>Charge Amount: <Price value={chargeAmount}/></p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <button className="btn btn-primary btn-rounded" onClick={self.onCancel}>Cancel Charge</button>
                            <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Later</button>
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'model_cancel_charge' && self.state.cancelled) {
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="490px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>You have removed the charge!</strong></p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Close</button>
                        </div>
                    </div>
                </Modal>
            );
        }
    }
}

export default ModalPayChargeItem;
