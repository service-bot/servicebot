import React from 'react';
import {Price, getPrice, getBillingType} from '../../utilities/price.jsx';
import Buttons from '../../elements/buttons.jsx';
import Avatar from '../../elements/avatar.jsx';
import {Authorizer} from '../../utilities/authorizer.jsx';
import InfoToolTip from "../../elements/tooltips/info-tooltip.jsx";
import DashboardWidget from "../../elements/my-services/dashboard-widget.jsx";

class ServiceInstancePaymentPlan extends React.Component {

    getServiceStatus(){
        let self = this;
        let owner = this.props.owner;
        if(owner.status !== "suspended") {
            let charges = self.props.service.references.charge_items;
            let unpaidCharges = _.filter(charges, (item)=> {return (!item.approved)});
            let totalCharges = 0;
            unpaidCharges.map((charge)=>{ totalCharges+= charge.amount; });
            console.log("SHAR 3")
            console.log(self.props.service)
            console.log(totalCharges)
            if(self.props.status === "requested" && totalCharges === 0 && self.props.service.payment_plan.amount === 0) {
                return (<DashboardWidget widgetColor="#7f04bb" widgetIcon="undo" widgetData="Pending Quote" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="pending-quote" />);
            } else if(self.props.status === "requested") {
                return (<DashboardWidget widgetColor="#0d9e6a" clickAction={this.props.approval} widgetIcon="usd" widgetData="Pay Now" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="widget-hover" />);
            } else if(self.props.status === "waiting_cancellation") {
                return (<DashboardWidget widgetColor="#ffa000" clickAction={this.props.cancelUndo} widgetIcon="hourglass-end" widgetData="Cancel Pending" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="cancel-pending" />);
            } else if(self.props.status === "cancelled") {
                return (<DashboardWidget widgetColor="#000000" clickAction={this.props.approval} widgetIcon="times" widgetData="Cancelled" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="restart" />);
            } else if(this.props.allCharges.false && this.props.allCharges.false.length > 0) {
                return(<DashboardWidget widgetColor="#0d9e6a" clickAction={this.props.handleAllCharges} widgetIcon="usd" widgetData="Pay Now" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="widget-hover" />)
            } else if(self.props.status === "running") {
                return (<DashboardWidget widgetColor="#0069ff" clickAction={this.props.cancel} widgetIcon="check" widgetData="Active Item" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="cancel" />);
            } else {
                return (null);
            }
        } else {
            return (<DashboardWidget widgetColor="#da0304" widgetIcon="ban" widgetData="Suspended" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5"/>);
        }
    }

    getServiceType(){
        if(this.props.service.type === "subscription") {
            return (
                <div>
                    <DashboardWidget plain={true} widgetIcon="circle" widgetData={this.props.service.name} widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-l-5 p-r-5" />
                    <DashboardWidget plain={true} widgetIcon="circle" widgetData={getPrice(this.props.service.payment_plan, this.props.service.type)} widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-l-5 p-l-5" />
                </div>
            );
        } else {
            return (<DashboardWidget plain={true} widgetIcon="circle" widgetData={this.props.service.name} widgetClass="col-xs-12 col-sm-6 col-md-8 col-xl-8 p-l-5" />)
        }
    }

    getCustomerInfo(){
        let owner = this.props.owner;
        if(owner.status != "suspended") {
            return (
                <Authorizer permissions={['can_administrate']}>
                    <div className="service-instance-box black">
                        <div className="service-instance-box-title black">
                            <span>Customer Information</span>
                        </div>
                        <div id="instance-owner" className="service-instance-box-content">
                            <div>
                                {owner.status && <div><span><i className="fa fa-check"/>Status: {owner.status}</span><br/></div>}
                                {owner.email && <div><span><i className="fa fa-envelope"/>Email: {owner.email}</span><br/></div>}
                                {owner.name &&  <div><span><i className="fa fa-user"/>Name: {owner.name}</span><br/></div>}
                                {owner.phone && <span><i className="fa fa-phone"/>Phone #: {owner.phone}</span>}
                            </div>
                            <div>
                                <Avatar key={`owner-avatar-${owner.id}`} linked={true} size="lg" uid={owner.id}/>
                            </div>
                        </div>
                    </div>
                </Authorizer>
            );
        } else {
            return (
                <Authorizer permissions={['can_administrate']}>
                    <div className="service-instance-box red">
                        <div className="service-instance-box-title red">
                            <span>Customer is Suspended</span>
                        </div>
                        <div id="instance-owner" className="service-instance-box-content">
                            <div>
                                {owner.status && <div><span><i className="fa fa-ban"/>Status: {owner.status}</span><br/></div>}
                                {owner.email && <div><span><i className="fa fa-envelope"/>Email: {owner.email}</span><br/></div>}
                                {owner.name &&  <div><span><i className="fa fa-user"/>Name: {owner.name}</span><br/></div>}
                                {owner.phone && <span><i className="fa fa-phone"/>Phone #: {owner.phone}</span>}
                            </div>
                            <div>
                                <Avatar key={`owner-avatar-${owner.id}`} linked={true} size="lg" uid={owner.id}/>
                            </div>
                        </div>
                    </div>
                </Authorizer>
            );
        }
    }

    render () {
        let paymentPlan = this.props.instancePaymentPlan;

        if(paymentPlan != null){

            return (
                <div className="">
                    <div className="row">
                        {this.getServiceStatus()}
                        {this.getServiceType()}

                    </div>
                    {this.getCustomerInfo()}
                </div>
            );
        }else{
            return (
                <div>Error: Payment Plan not set.</div>
            );
        }
    }
}

export default ServiceInstancePaymentPlan;
