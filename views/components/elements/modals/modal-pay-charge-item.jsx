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
            pay_charge_url: `/api/v1/charge/${this.props.chargeId}/approve`,
            user_url: user_url,
            charge_item: charge_item,
            charge_id: charge,
            service_id: service.id,
            service_name: service.name,
            service_price: service.payment_plan.amount,
            service_interval: service.payment_plan.interval,
            paid: false,
            current_modal: 'model_pay_charge',
            hasCard: false,
            fund: {},
            card: {}
        };
        this.fetcherUserPaymentInfo = this.fetcherUserPaymentInfo.bind(this);
        this.handlePaymentSetup = this.handlePaymentSetup.bind(this);
        this.onPaymentSetupClose = this.onPaymentSetupClose.bind(this);
        this.onPay = this.onPay.bind(this);
    }

    componentWillMount(){
        //checks if user has a card before mount
        this.fetcherUserPaymentInfo();
    }

    fetcherUserPaymentInfo(){
        let self = this;
        //try and fetch user's card info from our database
        Fetcher(`${self.state.user_url}`).then(function (response) {
            if(!response.error){
                if(!response[0]){ //if calling /api/v1/user/:uid
                    if(response.references.funds.length > 0){
                        let funds = _.get(response, 'references.funds');
                        if(funds.length > 0){
                            let fund = funds[0];
                            let card = funds[0].source.card;
                            self.setState({ loading: false,
                                hasCard: true,
                                paymentSetupModal: false,
                                current_modal: 'model_pay_charge',
                                fund: fund,
                                card: card
                            });
                        }
                    }
                }else{ //if calling /api/v1/user/own
                    if(response[0].references.funds.length > 0){
                        let funds = _.get(response, '[0]references.funds');
                        if(funds.length > 0){
                            let fund = funds[0];
                            let card = funds[0].source.card;
                            self.setState({ loading: false,
                                hasCard: true,
                                paymentSetupModal: false,
                                current_modal: 'model_pay_charge',
                                fund: fund,
                                card: card
                            });
                        }
                    }
                }
            }else{
                self.setState({loading: false, hasCard: false});
            }
        });
    }

    handlePaymentSetup(){
        this.setState({current_modal: 'payment_setup', paymentSetupModal: true});
    }
    onPaymentSetupClose(){
        this.fetcherUserPaymentInfo();
        this.setState({current_modal: 'model_pay_charge', paymentSetupModal: false});
    }

    onPay(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});
        if(!self.state.hasCard){
            self.handlePaymentSetup();
        }else {
            Fetcher(self.state.pay_charge_url, "POST", {}).then(function (response) {
                if (!response.error) {
                    //check stripe response for error
                    if (response.type == "StripeInvalidRequestError") {
                        //check what error it is
                        //make sure stripe has card and db has card
                        if (response.message == "This customer has no attached payment source") {
                            self.handlePaymentSetup();
                        }
                    } else {
                        self.setState({loading: false, paid: true});
                    }
                }
                self.setState({loading: false});
            })
        }
    }

    handleUnauthorized(){
        browserHistory.push("/login");
    }

    render () {
        let self = this;
        let pageName = "Pay Line Item";
        let currentModal = this.state.current_modal;
        let chargeId = this.state.charge_id;
        let chargeDescription = this.state.charge_item.description;
        let chargeAmount = this.state.charge_item.amount;
        let serviceName = this.state.service_name;

        if(currentModal == 'model_pay_charge' && !self.state.paid){
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="490px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>You are about to pay for the following line item.</strong></p>
                                    <p>Service: {serviceName}</p>
                                    <p>Line Item: {chargeDescription}</p>
                                    <p>Price: <Price value={chargeAmount}/></p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <button className="btn btn-primary btn-rounded" onClick={self.onPay}>Pay Now</button>
                            <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Later</button>
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'model_pay_charge' && self.state.paid) {
            return(
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="490px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>Thank you, you have paid this line item!</strong></p>
                                    <p>Service: {serviceName}</p>
                                    <p>Line Item: {chargeDescription}</p>
                                    <p>Price: <Price value={chargeAmount}/></p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Close</button>
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'payment_setup'){
            return( <ModalPaymentSetup ownerId={self.state.uid} modalCallback={self.onPaymentSetupClose} show={self.state.paymentSetupModal} hide={self.onPaymentSetupClose}/> );
        }

    }
}

export default ModalPayChargeItem;
