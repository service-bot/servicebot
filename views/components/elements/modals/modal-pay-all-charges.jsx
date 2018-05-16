import React from 'react';
import cookie from 'react-cookie';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';
import ModalPaymentSetup from './modal-payment-setup.jsx';
import {Price} from '../../utilities/price.jsx';
import {connect} from 'react-redux';
import getSymbolFromCurrency from 'currency-symbol-map';
let _ = require("lodash");

class ModalPayAllCharges extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        if(this.props.ownerId){
            uid = this.props.ownerId;
        }

        let username = cookie.load("username");
        let service = this.props.myInstance;

        this.state = {  loading: false,
            uid: uid,
            email: username,
            pay_all_charges_url: `/api/v1/service-instances/${service.id}/approve-charges`,
            service: service,
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
        Fetcher(`/api/v1/users/${self.state.uid}`).then(function (response) {
            if(!response.error){
                //if user has card on record
                if(_.has(response, 'references.funds[0]') && _.has(response, 'references.funds[0].source.card')){
                    let fund = _.get(response, 'references.funds[0]');
                    let card = _.get(response, 'references.funds[0].source.card');
                    self.setState({ loading: false,
                        hasCard: true,
                        paymentSetupModal: false,
                        current_modal: 'model_pay_charge',
                        fund: fund,
                        card: card
                    });
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
            Fetcher(self.state.pay_all_charges_url, "POST", {}).then(function (response) {
                if (!response.error) {
                    //check stripe response for error
                    if (response.type == "StripeInvalidRequestError") {
                        //check what error it is
                        console.error("Strip Error", response);
                        //make sure stripe has card and db has card
                        if (response.message == "This customer has no attached payment source") {
                            console.error("Send user to setup payment method first.");
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
        let pageName = "Pay Charges";
        let currentModal = this.state.current_modal;
        let serviceName = this.state.service.name;
        let charges = this.state.service.references.charge_items;
        let unpaidCharges = _.filter(charges, (item)=> {return (!item.approved)});
        let totalCharges = 0;
        let { options } = this.props;
        let prefix = options.currency ? getSymbolFromCurrency(options.currency.value) : '';
        unpaidCharges.map((charge)=>{ totalCharges+= charge.amount; });

        if(currentModal == 'model_pay_charge' && !self.state.paid){
            return(
                <Modal modalTitle={pageName} icon="fa-credit-card-alt" show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="550px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>You are about to pay the outstanding charges for your item:</strong></p>
                                    <p>Item Name: {serviceName}</p>
                                    <p><strong>Total Charges: <Price value={totalCharges} prefix={prefix}/></strong></p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Later</button>
                            <button className="btn btn-primary btn-rounded" onClick={self.onPay}><i className="fa fa-credit-card" /> Confirm Payment</button>
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'model_pay_charge' && self.state.paid) {
            return(
                <Modal modalTitle={pageName} icon="fa-credit-card-alt" show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="550px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>Thank you! You have paid <Price value={totalCharges} prefix={prefix}/>.</strong></p>
                                    <p>This charge will appear in your billing history shortly.</p>
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
ModalPayAllCharges = connect(state => {
    return {
        options: state.options,
    }
})(ModalPayAllCharges);

export default ModalPayAllCharges;
