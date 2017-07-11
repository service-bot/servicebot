import React from 'react';
import ServiceInstanceWaitingChargesItem from './service-instance-waiting-charges-item.jsx';
import Buttons from "../../elements/buttons.jsx";

class ServiceInstanceWaitingCharges extends React.Component {

    constructor(props){
        super(props);
        this.onPayCharge = this.onPayCharge.bind(this);
        this.onPayAllCharges = this.onPayAllCharges.bind(this);
    }

    onPayCharge(id){
        this.props.handlePayChargeItem(id);
    }
    onPayAllCharges(){
        this.props.handlePayAllCharges();
    }

    render () {
        let self = this;
        return (
            <div className="service-block service-action-block">
                <div className="xaas-dashboard">
                    <div className="xaas-row waiting">
                        <div className="xaas-title xaas-has-child">
                            <div className="xaas-data xaas-service">
                                <span>Action Required!</span>
                            </div>
                            <div className="xaas-data xaas-action">
                                <Buttons btnType="primary" text="Pay All" onClick={self.onPayAllCharges}/>
                            </div>
                        </div>
                        <div className="xaas-body">
                            {this.props.instanceWaitingItems.map(item => (
                                <ServiceInstanceWaitingChargesItem key={"item-" + item.id} handlePayChargeItem={self.onPayCharge} chargeItem={item}/>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ServiceInstanceWaitingCharges;
