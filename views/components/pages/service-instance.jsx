import React from 'react';
import cookie from 'react-cookie';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Link, browserHistory} from 'react-router';
import Load from '../utilities/load.jsx';
import Fetcher from '../utilities/fetcher.jsx';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import ServiceInstanceDescription from "../elements/service-instance/service-instance-description.jsx";
import ServiceInstancePaymentPlan from "../elements/service-instance/service-instance-payment-plan.jsx";
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
import ServiceInstanceFiles from '../elements/service-instance/service-instance-files.jsx';
import DateFormat from "../utilities/date-format.jsx";
import $ from "jquery";
import '../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';
import _ from "lodash";

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
    }

    componentDidMount() {
        if(!isAuthorized({})){
            return browserHistory.push("/login");
        }

        $(this.refs.dropdownToggle3).dropdown();

        let self = this;
        self.fetchInstance();
        self.fetchUserFund();
    }


    componentDidUpdate(){
        $(this.refs.dropdownToggle3).dropdown();
    }

    fetchInstance(){
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(response != null){
                if(!response.error){
                    self.setState({instance : response});
                }
            }
            self.setState({loading:false});
        }).catch(function(err){
            browserHistory.push("/");
        })
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
        self.fetchInstance();
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
            if(status == 'requested'){
                return (<li><Link to="#" onClick={self.handleApprove}>Approve Service</Link></li>);
            }else if(status == 'running'){
                return (<li><Link to="#" onClick={self.handleCancel}>Request Cancellation</Link></li>);
            }else if(status == 'waiting_cancellation'){
                return (<li><Link to="#" onClick={self.handleUndoCancel}>View Cancellation Request</Link></li>);
            }else if(status == 'cancelled'){
                return (<li><Link to="#" onClick={self.handleApprove}>Restart Service</Link></li>);
            }
        }
    }

    getActionButtons(instance){
        let self = this;
        //Only view actions for non-suspended users
        if(instance.references.users[0].status != "suspended") {
            return (
                <Authorizer permissions="can_administrate">
                    <div className="btn-group pull-right">
                        <button type="button" ref="dropdownToggle3" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Actions <span className="caret"/>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-right">
                            <li><Link to="#" onClick={self.handleEditInstanceModal}>Edit Instance</Link></li>
                            <li><Link to="#" onClick={self.handleEditPropertiesModal}>Edit Properties</Link></li>
                            <li><Link to="#" onClick={self.handleEditPaymentModal}>Edit Payment Plan</Link></li>
                            {instance.payment_plan && instance.status !== 'cancelled' &&
                            <li><Link to="#" onClick={self.handleAddChargeItemModal}>Add Charge</Link></li>
                            }
                            <li role="separator" className="divider"/>
                            {self.getStatusButtons()}
                        </ul>
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
                    <div id="service-instance-waiting" className="row">
                        <div className="col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
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
                    <div className="page-service-instance">
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
                    <div className="page-service-instance">
                        <Content>
                            <ReactCSSTransitionGroup component='div' transitionName={'fade'} transitionAppear={true} transitionEnter={true} transitionLeave={true}
                                                     transitionAppearTimeout={1000} transitionEnterTimeout={1000} transitionLeaveTimeout={1000}>
                                <div className="row">
                                    <div className="col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2 m-b-20">
                                        {self.getActionButtons(myInstance)}
                                    </div>
                                </div>

                                <div id="service-instance-detail" className="row">
                                    <div className="col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
                                        <ServiceInstancePaymentPlan key={Object.id}
                                                                    owner={owner}
                                                                    service={myInstance}
                                                                    instancePaymentPlan={myInstance.payment_plan}
                                                                    status={myInstance.status}
                                                                    approval={self.handleApprove}
                                                                    cancel={self.handleCancel}
                                                                    cancelUndo={self.handleUndoCancel}
                                                                    allCharges={myInstanceChargeItems}
                                                                    handleAllCharges={self.handlePayAllChargesModal}
                                                                    userFunds={self.state.userFunds}
                                                                    fundModal={self.handleAddFund}
                                        />
                                    </div>
                                </div>

                                {this.getAdditionalCharges(myInstance, myInstanceChargeItems)}

                                {(myInstanceChargeItems.true && myInstanceChargeItems.true.length > 0) &&
                                <div id="service-instance-approved-charges" className="row">
                                    <div className="col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
                                        <ServiceInstanceApprovedCharges instanceApprovedItems={myInstanceChargeItems.true}/>
                                    </div>
                                </div>
                                }

                                {myInstance.references.service_instance_properties.length > 0 &&
                                <div id="service-instance-fields" className="row">
                                    <div className="col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
                                        <ServiceInstanceFields instanceProperties={myInstance.references.service_instance_properties}/>
                                    </div>
                                </div>
                                }

                                <div id="service-instance-files" className="row">
                                    <div className="col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
                                        <ServiceInstanceFiles instanceId={self.state.instanceId}/>
                                    </div>
                                </div>

                                <div id="service-instance-message" className="row">
                                    <div className="col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2">
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
