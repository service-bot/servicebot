import React from 'react';
import {Price, getPrice, getBillingType} from '../../utilities/price.jsx';
import Buttons from '../../elements/buttons.jsx';
import Avatar from '../../elements/avatar.jsx';
import {Authorizer} from '../../utilities/authorizer.jsx';
import InfoToolTip from "../../elements/tooltips/info-tooltip.jsx";

class ServiceInstancePaymentPlan extends React.Component {

    render () {
        let paymentPlan = this.props.instancePaymentPlan;
        let owner = this.props.owner;

        console.log("rendering", this.props.service);

        if(paymentPlan != null){

            return (
                <div className="">

                    <Authorizer permissions={['can_administrate']}>
                    <div className="service-instance-section">
                        <span className="service-instance-section-label">Customer Information</span>
                        <div id="instance-owner">
                            <div>
                                <span><i className="fa fa-envelope"/>{owner.email}</span><br/>
                                <span><i className="fa fa-user"/>{owner.name}</span><br/>
                                <span><i className="fa fa-phone"/>{owner.phone}</span>
                            </div>
                            <div>
                                <Avatar linked={true} size="md" uid={owner.id}/>
                            </div>
                        </div>
                    </div>
                    </Authorizer>

                    <div id="payment-plan-box" className="service-instance-section">
                        <span className="service-instance-section-label">Payment Information</span>
                        <div className="row">
                            <div className="payment-plan-fields col-xs-6 col-md-4">
                                <span className="block color-grey-600 label">Status</span>
                                <div>
                                    <span className="payment-plan-field-text">{this.props.status ? this.props.status : "No Status"}</span>
                                    {this.props.status == "requested" && <InfoToolTip title="You service will start running and charges will only be posted after you approve the request. You can approve it using the approve button below." text="i" placement="right"/>}
                                </div>
                                {this.props.status == "requested" && <Buttons text="Approve Now" position="left" btnType="info" size="md" onClick={this.props.approval}/>}
                            </div>
                            <div className="payment-plan-fields col-xs-6 col-md-4">
                                <span className="block color-grey-600 label">Billing Type</span>
                                <div>
                                    <span className="payment-plan-field-text">{getBillingType(this.props.service)}</span>
                                </div>
                            </div>
                            <div className="payment-plan-fields col-xs-6 col-md-4">
                                <span className="block color-grey-600 label">Price</span>
                                <div>
                                    <span className="payment-plan-field-text">{getPrice(this.props.service.payment_plan, this.props.service.type)}</span>
                                </div>
                            </div>
                            {/*<div className="payment-plan-fields col-xs-6 col-md-4">*/}
                                {/*<span className="block color-grey-600 label">Currency</span>*/}
                                {/*<h5 className="color-grey-700">{paymentPlan.currency ? paymentPlan.currency : "N/A"}</h5>*/}
                            {/*</div>*/}
                            {/*<div className="payment-plan-fields col-xs-6 col-md-4">*/}
                                {/*<span className="block color-grey-600 label">Payment Interval</span>*/}
                                {/*<h5 className="color-grey-700">{paymentPlan.interval ? paymentPlan.interval : "N/A"}</h5>*/}
                            {/*</div>*/}

                            {/*<div className="payment-plan-fields col-xs-6 col-md-4">*/}
                                {/*<span className="block color-grey-600 label">Trial Days</span>*/}
                                {/*<h5 className="color-grey-700">{paymentPlan.trial_period_days? paymentPlan.trial_period_days : "None"}</h5>*/}
                            {/*</div>*/}
                        </div>
                    </div>
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
