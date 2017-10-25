import React from 'react';
import ServiceInstanceWaitingChargesItem from './service-instance-waiting-charges-item.jsx';
import Buttons from "../../elements/buttons.jsx";

class ServiceInstanceWaitingCharges extends React.Component {

    constructor(props){
        super(props);
        this.onPayCharge = this.onPayCharge.bind(this);
        this.onCancelCharge = this.onCancelCharge.bind(this);
        this.onPayAllCharges = this.onPayAllCharges.bind(this);
    }

    onPayCharge(id){
        this.props.handlePayChargeItem(id);
    }
    onCancelCharge(id){
        this.props.handleCancelChargeItem(id);
    }
    onPayAllCharges(){
        this.props.handlePayAllCharges();
    }

    render () {
        let self = this;
        let title = "Outstanding charges to be paid";
        if (self.props.serviceInstanceCharges.false && self.props.serviceInstanceCharges.false.length > 0) {
            return (
                <div className="service-block service-action-block">
                    <div className="xaas-dashboard">
                        <div className="service-instance-box red">
                            <div className="service-instance-box-title">
                                <div className="xaas-data xaas-service">
                                    <span>{title}</span>
                                </div>
                            </div>
                            <div className="service-instance-box-content">
                                {this.props.instanceWaitingItems.map(item => (
                                    <ServiceInstanceWaitingChargesItem key={"item-" + item.id} handleCancelChargeItem={self.onCancelCharge} chargeItem={item}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return (null);
        }
    }
}

export default ServiceInstanceWaitingCharges;
