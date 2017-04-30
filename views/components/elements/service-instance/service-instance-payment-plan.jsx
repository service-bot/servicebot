import React from 'react';
import Price from '../../utilities/price.jsx';
import Avatar from '../../elements/avatar.jsx';

class ServiceInstancePaymentPlan extends React.Component {

    render () {
        let paymentPlan = this.props.instancePaymentPlan;
        let owner = this.props.owner;

        if(paymentPlan != null){

            return (
                <div className="col-xs-12 col-md-5">

                    <div id="instance-owner">
                        <div>
                            <h5>{owner.email}</h5>
                            <p><i className="fa fa-user"/>{owner.name}</p>
                            <p><i className="fa fa-phone"/>{owner.phone}</p>
                        </div>
                        <div>
                            <Avatar linked={true} size="lg" uid={owner.id}/>
                        </div>
                    </div>

                    <div id="payment-plan-box">
                        <div className="row">
                            <div className="payment-plan-fields col-xs-6 col-md-6">
                                <span className="block color-grey-600 label">Service Type</span>
                                <h5 className="color-grey-700">{paymentPlan.interval_count && paymentPlan.interval_count > 1 ? "Subscription" : "One Time Charge"}</h5>
                            </div>
                            <div className="payment-plan-fields col-xs-6 col-md-6">
                                <span className="block color-grey-600 label">Currency</span>
                                <h5 className="color-grey-700">{paymentPlan.currency ? paymentPlan.currency : "N/A"}</h5>
                            </div>
                            <div className="payment-plan-fields col-xs-6 col-md-6">
                                <span className="block color-grey-600 label">Payment Interval</span>
                                <h5 className="color-grey-700">{paymentPlan.interval ? paymentPlan.interval : "N/A"}</h5>
                            </div>
                            <div className="payment-plan-fields col-xs-6 col-md-6">
                                <span className="block color-grey-600 label">Price</span>
                                <h5 className="color-grey-700">{paymentPlan.amount ? <Price value={paymentPlan.amount}/> : "N/A"}</h5>
                            </div>
                            <div className="payment-plan-fields col-xs-6 col-md-6">
                                <span className="block color-grey-600 label">Trial Days</span>
                                <h5 className="color-grey-700">{paymentPlan.trial_period_days? paymentPlan.trial_period_days : "None"}</h5>
                            </div>
                            <div className="payment-plan-fields col-xs-6 col-md-6">
                                <span className="block color-grey-600 label">Service Status</span>
                                <h5 className="color-grey-700">{this.props.status ? this.props.status : "No Status"}</h5>
                            </div>
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
