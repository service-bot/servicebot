import React from 'react';
import cookie from 'react-cookie';
import ReactCSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import {Link, browserHistory} from 'react-router';
import Load from '../utilities/load.jsx';
import Fetcher from '../utilities/fetcher.jsx';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ServiceInstanceWaitingCharges from "../elements/service-instance/service-instance-waiting-charges.jsx";
import ServiceInstanceFields from "../elements/service-instance/service-instance-fields.jsx";
import ServiceInstanceApprovedCharges from "../elements/service-instance/service-instance-approved-charges.jsx";
import ServiceInstanceMessage from "../elements/service-instance/service-instance-message.jsx";
import ModalApprove from '../elements/modals/modal-approve.jsx';
import ModalRequestCancellation from '../elements/modals/modal-request-cancellation.jsx';
import ModalManageCancellation from '../elements/modals/modal-manage-cancellation.jsx';
import ModalPaymentHistory from '../elements/modals/modal-payment-history.jsx';
import ModalEditInstance from '../elements/modals/modal-edit-instance.jsx';
import ModalEditPaymentPlan from '../elements/modals/modal-edit-payment-plan.jsx';
import ModalAddChargeItem from '../elements/modals/modal-add-charge-item.jsx';
import ModalPayChargeItem from '../elements/modals/modal-pay-charge-item.jsx';
import ModalCancelChargeItem from '../elements/modals/modal-cancel-charge-item.jsx';
import ModalPayAllCharges from '../elements/modals/modal-pay-all-charges.jsx';
import ModalPaymentSetup from '../elements/modals/modal-payment-setup.jsx';
import {ModalEditProperties} from "../elements/forms/edit-instance-properties-form.jsx"
import DateFormat from "../utilities/date-format.jsx";
import $ from "jquery";
import '../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';
import _ from "lodash";
import ServicebotBillingSettingsEmbed from "servicebot-billing-settings-embed"
import ContentTitle from "../layouts/content-title.jsx";

class ServiceInstance extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        let id = this.props.params.instanceId;
        this.state = {  instanceId: id,
                        instance: false,
                        url: `/api/v1/service-instances/${id}`,
                        fundUrl: `/api/v1/users/${uid}`,
                        userFunds: [],
                        loading:true,
                        approveModal : false,
                        cancelModal: false,
                        undoCancelModal: false,
                        viewPaymentModal: false,
                        editInstanceModal: false,
                        editPaymentModal: false,
                        addChargeItemModal: false,
                        payChargeItemModal: false,
                        cancelChargeItemModal: false,
                        payChargeItemId: false,
                        cancelChargeItemId: false,
                        cancelChargeItem: false,
                        payAllChargesModal: false,
                        fundModal: false,
                        editPropertyModal: false
        };
        this.fetchInstance = this.fetchInstance.bind(this);
        this.handleApprove = this.handleApprove.bind(this);
        this.onApproveClose = this.onApproveClose.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.onCancelClose = this.onCancelClose.bind(this);
        this.handleUndoCancel = this.handleUndoCancel.bind(this);
        this.onUndoCancelClose = this.onUndoCancelClose.bind(this);
        this.handleViewPaymentModal = this.handleViewPaymentModal.bind(this);
        this.onViewPaymentModalClose = this.onViewPaymentModalClose.bind(this);
        this.handleEditInstanceModal = this.handleEditInstanceModal.bind(this);
        this.onEditInstanceModalClose = this.onEditInstanceModalClose.bind(this);
        this.handleEditPaymentModal = this.handleEditPaymentModal.bind(this);
        this.onEditPaymentModalClose = this.onEditPaymentModalClose.bind(this);
        this.getActionButtons = this.getActionButtons.bind(this);
        this.getStatusButtons = this.getStatusButtons.bind(this);
        this.handleAddChargeItemModal = this.handleAddChargeItemModal.bind(this);
        this.onAddChargeItemModalClose = this.onAddChargeItemModalClose.bind(this);
        this.handlePayChargeItemModal = this.handlePayChargeItemModal.bind(this);
        this.onPayChargeItemModalClose = this.onPayChargeItemModalClose.bind(this);
        this.handleCancelChargeItemModal = this.handleCancelChargeItemModal.bind(this);
        this.onCancelChargeItemModalClose = this.onCancelChargeItemModalClose.bind(this);
        this.handlePayAllChargesModal = this.handlePayAllChargesModal.bind(this);
        this.onPayAllChargesModalClose = this.onPayAllChargesModalClose.bind(this);
        this.handleEditPropertiesModal = this.handleEditPropertiesModal.bind(this);
        this.onEditPropertiesModalClose = this.onEditPropertiesModalClose.bind(this);
        this.getAdditionalCharges = this.getAdditionalCharges.bind(this);
        this.handleAddFund = this.handleAddFund.bind(this);
        this.onAddFundClose = this.onAddFundClose.bind(this);
        this.getInitialState = this.getInitialState.bind(this);

    }

    async componentDidMount() {
        if(!isAuthorized({})){
            return browserHistory.push("/login");
        }

        $(this.refs.dropdownToggle3).dropdown();

        let self = this;
        this.getInitialState()

    }

    async getInitialState(){
        this.fetchUserFund();
        let instance = await this.fetchInstance();
        let token = (await this.fetchToken(instance.user_id)).token
        this.setState({instance, loading: false, token})
    }

    componentDidUpdate(){
        $(this.refs.dropdownToggle3).dropdown();
    }

    fetchInstance(){
        let self = this;
        return Fetcher(self.state.url).then(function(response){
            if(response != null){
                if(!response.error){
                    return response;
                }
            }
        }).catch(function(err){
            browserHistory.push("/");
        })
    }
    fetchToken(uid){
      return Fetcher("/api/v1/users/" + uid + "/token", "POST", {});
    }

    fetchUserFund(){
        let self = this;
        Fetcher(self.state.fundUrl).then(function (response) {
            if (!response.error) {
                if (response.references.funds.length > 0) {
                    self.setState({userFunds : response.references.funds});
                }
            }
        });
    }


    handleComponentUpdating(){
        let self = this;
        self.getInitialState();
    }

    handleApprove(event){
        event.preventDefault();
        this.setState({ approveModal : true});
    }
    onApproveClose(){
        this.setState({ approveModal : false});
        this.handleComponentUpdating();
    }

    handleCancel(event){
        event.preventDefault();
        this.setState({ cancelModal : true});
    }
    onCancelClose(){
        this.setState({ cancelModal : false});
        this.handleComponentUpdating();
    }

    handleUndoCancel(event){
        event.preventDefault();
        this.setState({ undoCancelModal : true});
    }
    onUndoCancelClose(){
        this.setState({ undoCancelModal : false});
        this.handleComponentUpdating();
    }

    handleViewPaymentModal(event){
        event.preventDefault();
        this.setState({ viewPaymentModal: true });
    }
    onViewPaymentModalClose(){
        this.setState({ viewPaymentModal: false });
        this.handleComponentUpdating();
    }
    
    handleEditInstanceModal(event){
        event.preventDefault();
        this.setState({ editInstanceModal: true});
    }
    onEditInstanceModalClose(){
        this.setState({ editInstanceModal: false});
        this.handleComponentUpdating();
    }

    handleEditPaymentModal(event){
        event.preventDefault();
        this.setState({ editPaymentModal: true});
    }
    onEditPaymentModalClose(){
        this.setState({ editPaymentModal: false});
        this.handleComponentUpdating();
    }

    handleEditPropertiesModal(event){
        event.preventDefault();
        this.setState({ editPropertyModal: true});
    }
    onEditPropertiesModalClose(){
        this.setState({ editPropertyModal: false});
        this.handleComponentUpdating();
    }

    handleAddChargeItemModal(event){
        event.preventDefault();
        this.setState({ addChargeItemModal: true});
    }
    onAddChargeItemModalClose(){
        this.setState({ addChargeItemModal: false});
        this.handleComponentUpdating();
    }

    handlePayChargeItemModal(chargeId = false){
        if(chargeId !== false){
            this.setState({ payChargeItemModal: true, payChargeItemId: chargeId});
        }
    }
    onPayChargeItemModalClose(){
        this.setState({ payChargeItemModal: false});
        this.handleComponentUpdating();
    }

    handleCancelChargeItemModal(chargeId = false){
        if(chargeId !== false){
            this.setState({ cancelChargeItemModal: true, cancelChargeItemId: chargeId});
        }
    }
    onCancelChargeItemModalClose(){
        this.setState({ cancelChargeItemModal: false});
        this.handleComponentUpdating();
    }

    handlePayAllChargesModal(){
        this.setState({payAllChargesModal: true});
    }
    onPayAllChargesModalClose(){
        this.setState({payAllChargesModal: false});
        this.handleComponentUpdating();
    }
    handleAddFund(event){
        event.preventDefault();
        this.setState({ fundModal : true});
    }
    onAddFundClose(){
        this.setState({ fundModal : false});
        this.fetchUserFund();
        this.props.handleComponentUpdating();
    }

    getStatusButtons(){
        let self = this;
        let status = false;
        if(self.state.instance && self.state.instance.payment_plan){
            status = self.state.instance.status;
            if(status === 'requested'){
                <span className="buttons _primary">Edit Trial</span>
                return (<Link to="#" onClick={self.handleApprove}><span className="buttons _primary _green m-l-5">Approve Service</span></Link>);
            }else if(status === 'running'){
                return (<Link to="#" onClick={self.handleCancel}><span className="buttons _primary _navy m-l-5">Cancel Service</span></Link>);
            }else if(status === 'waiting_cancellation'){
                return (<Link to="#" onClick={self.handleUndoCancel}><span className="buttons _primary m-l-5">View Cancellation Request</span></Link>);
            }else if(status === 'cancelled'){
                return (<Link to="#" onClick={self.handleApprove}><span className="buttons _primary m-l-5">Restart Service</span></Link>);
            }
        }
    }

    getActionButtons(instance, instanceCharges){
        let self = this;
        //Only view actions for non-suspended users
        if(instance.references.users[0].status != "suspended") {
            return (
                <Authorizer permissions="can_administrate">
                    <div className="service-instance-actions action-items">
                        <div className="pull-right">
                            {instanceCharges.false && instanceCharges.false.length > 0 &&
                                <span  onClick={self.handlePayAllChargesModal}><span className="buttons _primary _green m-r-5">Pay Charges</span></span>
                            }
                            <span onClick={self.handleEditInstanceModal}><span className="buttons _primary">Edit Trial</span></span>
                            <span  onClick={self.handleEditPaymentModal}><span className="buttons _primary m-l-5">Edit Payment Plan</span></span>
                            {instance.payment_plan && instance.status !== 'cancelled' &&
                            <span onClick={self.handleAddChargeItemModal}><span className="buttons _primary m-l-5">Add Charge</span></span>
                            }
                            <Link to={`/billing-history/${instance.user_id}`}><span className="buttons _primary m-l-5">View Invoices</span></Link>
                            {self.getStatusButtons()}
                        </div>
                    </div>
                </Authorizer>
            );
        } else {
            return null;
        }
    }

    getAdditionalCharges(myInstance, myInstanceChargeItems) {
        let self = this;
        if(myInstance.status !== 'cancelled') {
            if (myInstanceChargeItems.false && myInstanceChargeItems.false.length > 0) {
                return (
                    <div id="service-instance-waiting" className="row m-b-30">
                        <div className="col-md-12">
                            <ServiceInstanceWaitingCharges handlePayAllCharges={self.handlePayAllChargesModal}
                                                           handlePayChargeItem={self.handlePayChargeItemModal}
                                                           handleCancelChargeItem={self.handleCancelChargeItemModal}
                                                           instanceWaitingItems={myInstanceChargeItems.false}
                                                           serviceInstance={myInstance}
                                                           serviceInstanceCharges={myInstanceChargeItems}
                            />
                        </div>
                    </div>
                );
            } else { return null; }
        }
    }

    render () {
        let self = this;
        let pageName = `My Account > Purchased Item`;
        let subtitle = `Updated: `;

        if(this.state.loading){
            return (
                <Authorizer>
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance white">
                        <Content key={Object.id}>
                            <ReactCSSTransitionGroup component='div' transitionName={'fade'}
                                                     transitionAppear={true} transitionEnter={true} transitionLeave={true}
                                                     transitionAppearTimeout={1000} transitionEnterTimeout={1000} transitionLeaveTimeout={1000}>
                                <Load/>
                            </ReactCSSTransitionGroup>
                        </Content>
                    </div>
                </Authorizer>
            );
        }else{
            const myInstance = this.state.instance;
            const myInstanceChargeItems = _.groupBy(myInstance.references.charge_items, 'approved');
            let id, name, amount, interval, owner, ownerId = null;

            //Gather data first
            if( self.state.instance){
                let service = self.state.instance;
                id = service.id;
                owner = service.references.users[0];
                ownerId = service.user_id;
                name = service.name || "N/A";
                if(service.payment_plan){
                    amount = service.payment_plan.amount;
                    interval = service.payment_plan.interval
                }else{
                    amount = "____";
                    interval = "N/A";
                }
            }

            const currentModal = ()=>{
                if(self.state.approveModal){
                    return( <ModalApprove myInstance={self.state.instance} show={self.state.approveModal} hide={self.onApproveClose}/> );
                }else if(self.state.cancelModal){
                    return( <ModalRequestCancellation myInstance={self.state.instance} show={self.state.cancelModal} hide={self.onCancelClose}/> );
                }else if(self.state.undoCancelModal){
                    return( <ModalManageCancellation myInstance={self.state.instance} show={self.state.undoCancelModal} hide={self.onUndoCancelClose}/> );
                }else if(self.state.viewPaymentModal){
                    return( <ModalPaymentHistory show={self.state.viewPaymentModal} hide={self.onViewPaymentModalClose}/> );
                }else if(self.state.editInstanceModal){
                    return( <ModalEditInstance myInstance={self.state.instance} show={self.state.editInstanceModal} hide={self.onEditInstanceModalClose}/> );
                }else if(self.state.editPaymentModal){
                    return( <ModalEditPaymentPlan myInstance={self.state.instance} show={self.state.editPaymentModal} hide={self.onEditPaymentModalClose}/> );
                }else if(self.state.addChargeItemModal){
                    return( <ModalAddChargeItem myInstance={self.state.instance} show={self.state.editPaymentModal} hide={self.onAddChargeItemModalClose}/> );
                }else if(self.state.payChargeItemModal){
                    return( <ModalPayChargeItem myInstance={self.state.instance} ownerId={ownerId} chargeId={self.state.payChargeItemId} show={self.state.payChargeItemModal} hide={self.onPayChargeItemModalClose}/> );
                } else if(self.state.cancelChargeItemModal){
                    return( <ModalCancelChargeItem myInstance={self.state.instance} ownerId={ownerId} chargeId={self.state.cancelChargeItemId} show={self.state.cancelChargeItemModal} hide={self.onCancelChargeItemModalClose}/> );
                } else if(self.state.payAllChargesModal){
                    return( <ModalPayAllCharges myInstance={self.state.instance} ownerId={ownerId} show={self.state.payAllChargesModal} hide={self.onPayAllChargesModalClose}/> );
                } else if(self.state.fundModal){
                    return( <ModalPaymentSetup justPayment={true} modalCallback={self.onAddFundClose} ownerId={self.state.instance.user_id} show={self.state.handleAddFund} hide={self.onAddFundClose}/> );
                } else if(self.state.editPropertyModal){
                    return( <ModalEditProperties instance={self.state.instance} modalCallback={self.onEditPropertiesModalClose} ownerId={self.state.instance.user_id} show={self.state.editPropertyModal} hide={self.onEditPropertiesModalClose}/> );
                }


            };

            return(
                <Authorizer>
                    <Jumbotron pageName={pageName} subtitle={<span>{subtitle}<strong><DateFormat date={myInstance.updated_at} time /></strong></span>} />
                    {/*<Jumbotron pageName={pageName} subtitle={`${myInstance.description} . ${myInstance.subscription_id || ""}`} />*/}
                    <div className="page-service-instance white-bg">
                        <Content>
                            <ReactCSSTransitionGroup component='div' transitionName={'fade'} transitionAppear={true} transitionEnter={true} transitionLeave={true}
                                                     transitionAppearTimeout={1000} transitionEnterTimeout={1000} transitionLeaveTimeout={1000}>
                                <div className="instance-title">
                                    <ContentTitle title="Subscription Detail"/>
                                    <div className="instance-customer">
                                        <div>Customer Email: <b>{owner.email}</b></div>
                                        <div>Customer Status: <b>{owner.status}</b></div>
                                    </div>
                                    {self.getActionButtons(myInstance, myInstanceChargeItems)}
                                    {this.getAdditionalCharges(myInstance, myInstanceChargeItems)}
                                </div>

                                <div id="service-instance-detail">
                                    <ServicebotBillingSettingsEmbed
                                        useAsComponent={true}
                                        url=""
                                        token={self.state.token}
                                        key={self.state.token}

                                />
                                </div>

                                {(myInstanceChargeItems.true && myInstanceChargeItems.true.length > 0) &&
                                <div id="service-instance-approved-charges" className="row">
                                    <div className="col-md-12">
                                        <ServiceInstanceApprovedCharges instanceApprovedItems={myInstanceChargeItems.true}/>
                                    </div>
                                </div>
                                }

                                {myInstance.references.service_instance_properties.length > 0 &&
                                <div id="service-instance-fields">
                                    <ServiceInstanceFields instanceProperties={myInstance.references.service_instance_properties}/>
                                </div>
                                }

                                <div id="service-instance-message" className="row">
                                    <div className="col-md-12">
                                        <ServiceInstanceMessage instanceId={self.state.instanceId}/>
                                    </div>
                                </div>
                            </ReactCSSTransitionGroup>
                        </Content>
                        {currentModal()}
                    </div>
                </Authorizer>
            );
        }

    }
}

export default ServiceInstance;
