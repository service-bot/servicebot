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
                        approve_instance_url: `/api/v1/service-instances/${serviceInstance.id}/approve`,
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
        self.setState({loading:false});
        if(!self.state.hasCard){
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
        let pageName = "Service Approval";
        let icon = "fa-thumbs-up";
        let currentModal = this.state.current_modal;
        let instance = this.state.serviceInstance;
        let name = instance.name;
        let price = instance.payment_plan.amount;
        let interval = instance.payment_plan.interval;

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

        if(currentModal == 'model_approve' && !self.state.approved){
            return(
                <Modal modalTitle={pageName} icon={icon} show={self.props.show} hide={self.props.hide} hideFooter={true} top="40%" width="490px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    {getAlerts()}
                                    <p><strong>You are about to approve the following service:</strong></p>
                                    <p>Service Name: {name}</p>
                                    <p>Service Type: {instance.type} - <Price value={price}/>/{interval}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`modal-footer text-right p-b-20`}>
                            <Buttons containerClass="inline" btnType="primary" text="Approve"
                                     onClick={self.onApprove} loading={self.state.ajaxLoad}/>
                            <Buttons containerClass="inline" btnType="default" text="Later" onClick={self.props.hide} />
                        </div>
                    </div>
                </Modal>
            );
        }else if(currentModal == 'model_approve' && self.state.approved) {
            return(
                <Modal modalTitle={pageName} icon={icon} show={self.props.show} hide={self.props.hide}>
                    <div className="table-responsive">
                        <div className="p-20">
                            <div className="row">
                                <div className="col-xs-12">
                                    <p><strong>You have successfully approved this service!</strong></p>
                                    <p>Service Name: {name}</p>
                                    <p>Service Type: {instance.type} - <Price value={price}/>/{interval}</p>
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

export default ModalApprove;
