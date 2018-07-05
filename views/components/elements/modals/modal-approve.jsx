import React from 'react';
import cookie from 'react-cookie';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';
import ModalPaymentSetup from './modal-payment-setup.jsx';
import {Price} from '../../utilities/price.jsx';
import Alerts from '../alerts.jsx';
import Buttons from '../buttons.jsx';
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import {connect} from 'react-redux';
import getSymbolFromCurrency from 'currency-symbol-map';
let _ = require("lodash");

class ModalApprove extends React.Component {

    constructor(props){
        super(props);
        //if loaded from the approve modal, it should take a prop for the instance's owner's uid and use that instead of current logged in your's uid.
        let uid = cookie.load("uid");
        if(this.props.owner){
            uid = this.props.owner;
        }
        let username = cookie.load("username");
        let serviceInstance = this.props.myInstance;
        this.state = {  loading: false,
                        uid: uid,
                        email: username,
                        serviceInstance: serviceInstance,
                        approve_instance_url: serviceInstance.status === "cancelled" ? `/api/v1/service-instances/${serviceInstance.id}/reactivate` : `/api/v1/service-instances/${serviceInstance.id}/approve`,
                        approved: false,
                        current_modal: 'model_approve',
                        ajaxLoad: false,
                        hasCard: false,
                        fund: {},
                        card: {}
                    };
        this.fetcherUserPaymentInfo = this.fetcherUserPaymentInfo.bind(this);
        this.handlePaymentSetup = this.handlePaymentSetup.bind(this);
        this.onPaymentSetupClose = this.onPaymentSetupClose.bind(this);
        this.onApprove = this.onApprove.bind(this);
    }

    componentWillMount(){
        //checks if user has a card before mount
        this.fetcherUserPaymentInfo();
    }

    fetcherUserPaymentInfo(){
        let self = this;
        //try and fetch user's card info from our database
        //changed so the user being checked is the owner of the instance
        Fetcher(`/api/v1/users/${self.state.serviceInstance.user_id}`).then(function (response) {
            if(!response.error){
                //if user has card on record
                if(_.has(response, 'references.funds[0]') && _.has(response, 'references.funds[0].source.card')){
                    let fund = _.get(response, 'references.funds[0]');
                    let card = _.get(response, 'references.funds[0].source.card');
                    self.setState({ loading: false,
                                    hasCard: true,
                                    paymentSetupModal: false,
                                    current_modal: 'model_approve',
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
        this.setState({current_modal: 'model_approve', paymentSetupModal: false});
    }

    onApprove(event){
        event.preventDefault();
        let self = this;
        let instance = self.state.serviceInstance;
        self.setState({loading:false});
        if(!self.state.hasCard && (instance.payment_plan.trial_period_days === 0 || instance.payment_plan.trial_period_days === null)){
            self.handlePaymentSetup();
        }else {
            self.setState({ajaxLoad: true});
            Fetcher(self.state.approve_instance_url, "POST", {}).then(function (response) {
                if (!response.error) {
                    //check stripe response for error
                    if (response.type == "StripeInvalidRequestError") {
                        //check what error it is
                        self.setState({ajaxLoad: false}, ()=>{
                            //make sure stripe has card and db has card
                            if (response.message == "This customer has no attached payment source") {
                                self.handlePaymentSetup();
                            }else{
                                self.setState({
                                    alerts: {
                                        type: 'danger',
                                        message: response.message || response.err || response.err.err || response.error || response,
                                        icon: 'exclamation-circle'
                                    }
                                })
                            }
                        });
                    } else {
                        self.setState({loading: false, approved: true});
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
        let pageName = "Payment Approval";
        let icon = "fa-credit-card-alt";
        let currentModal = this.state.current_modal;
        let instance = this.state.serviceInstance;
        let name = instance.name;
        let price = instance.payment_plan.amount;
        let interval = instance.payment_plan.interval;
        let charges = instance.references.charge_items;
        let unpaidCharges = _.filter(charges, (item)=> {return (!item.approved)});
        let totalCharges = 0;
        let { options } = this.props;
        let prefix = options.currency ? getSymbolFromCurrency(options.currency.value) : '';
        unpaidCharges.map((charge)=>{ totalCharges+= charge.amount; });

        let getAlerts = ()=>{
            if(self.state.alerts){
                if(isAuthorized({permissions: ["can_administrate","can_manage"]})){
                    return ( <Alerts type={self.state.alerts.type} message={self.state.alerts.message}
                               position={{position: 'fixed', bottom: true}} icon="exclamation-circle" /> );
                }else{
                    return ( <Alerts type={self.state.alerts.type} message={'System Error: Please contact admin for assistance.'}
                               position={{position: 'fixed', bottom: true}} icon="exclamation-circle" /> );
                }
            }
        };

        let getSubscriptionPrice = ()=>{
            if(instance.payment_plan.amount > 0) {
                return (<Price value={price} prefix={prefix}/> / {interval});
            }
        }

        if(currentModal === 'model_approve' && !self.state.approved){
            return(
                <Modal modalTitle={pageName} icon={icon} show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="550px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    {getAlerts()}
                                    <p><strong>You are about to pay for the following item:</strong></p>
                                    <p>Item Name: {name}</p>
                                    <p><strong>Total Charges: &nbsp;
                                        <ul>
                                            <li>{instance.payment_plan.amount > 0 && <span><Price value={price} prefix={prefix}/> / {interval}</span>}</li>
                                            <li>{totalCharges > 0 && <span><Price value={totalCharges} prefix={prefix}/></span>}</li>
                                        </ul>

                                    </strong></p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <Buttons containerClass="inline" btnType="primary" text="Confirm Payment"
                                     onClick={self.onApprove} loading={self.state.ajaxLoad}/>
                            <Buttons containerClass="inline" btnType="default" text="Later" onClick={self.props.hide} />
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal === 'model_approve' && self.state.approved) {
            return(
                <Modal modalTitle={pageName} icon={icon} show={self.props.show} hide={self.props.hide} top="40%" width="550px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>You have successfully approved and paid for this item!</strong></p>
                                    <p>Service Name: {name}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'payment_setup'){
            return( <ModalPaymentSetup modalCallback={self.onPaymentSetupClose} ownerId={instance.user_id} show={self.state.paymentSetupModal} hide={self.onPaymentSetupClose}/> );
        }

    }
}

ModalApprove = connect(state => {
    return {
        options: state.options,
    }
})(ModalApprove);

export default ModalApprove;
