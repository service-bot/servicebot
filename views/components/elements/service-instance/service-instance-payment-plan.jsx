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
        console.log("ffofoo")
        console.log(this.props.allCharges)
        if(self.props.status == "requested") {
            return (
                <DashboardWidget widgetColor="#0d9e6a" clickAction={this.props.approval} widgetIcon="mouse-pointer" widgetData="Pay Now" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="widget-hover" />);
        } else if(this.props.allCharges.false && this.props.allCharges.false.length > 0) {
            return(<DashboardWidget widgetColor="#0d9e6a" clickAction={this.props.handleAllCharges} widgetIcon="mouse-pointer" widgetData="Pay Now" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="widget-hover" />)
        } else if(self.props.status == "running") {
            return (<DashboardWidget widgetColor="#0069ff" clickAction={this.props.cancel} widgetIcon="check" widgetData="Active Item" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="cancel" />);
        }  else if(self.props.status == "waiting_cancellation") {
            return (<DashboardWidget widgetColor="#ffa000" clickAction={this.props.cancelUndo} widgetIcon="hourglass-end" widgetData="Cancel Pending" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="cancel-pending" />);
        } else if(self.props.status == "cancelled") {
            return (<DashboardWidget widgetColor="#000000" clickAction={this.props.approval} widgetIcon="times" widgetData="Cancel Pending" widgetClass="col-xs-12 col-sm-6 col-md-4 col-xl-4 p-r-5" widgetHoverClass="restart" />);
        } else {
            return (null);
        }
    }

    getServiceType(){
        if(this.props.service.type == "subscription") {
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

    render () {
        let paymentPlan = this.props.instancePaymentPlan;
        let owner = this.props.owner;

        if(paymentPlan != null){

            return (
                <div className="">
                    <div className="row">
                        {this.getServiceStatus()}
                        {this.getServiceType()}
                    </div>
                    <Authorizer permissions={['can_administrate']}>
                        <div className="service-instance-box black">
                            <div className="service-instance-box-title black">
                                <span>Customer Information</span>
                            </div>
                            <div id="instance-owner" className="service-instance-box-content">
                                <div>
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
