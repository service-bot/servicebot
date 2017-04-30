import React from 'react';
import ServiceInstanceWaitingChargesItem from './service-instance-waiting-charges-item.jsx';

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
            <div id="service-instance-waiting" className="row">
                <div className="service-block service-action-block">
                    <div className="xaas-dashboard">
                        <div className="xaas-row waiting">
                            <div className="xaas-title xaas-has-child">
                                <div className="xaas-data xaas-service"><h5>Action Required!</h5></div>
                                <div className="xaas-data xaas-action">
                                    <button className="btn btn-primary btn-rounded" onClick={self.onPayAllCharges}>
                                        Pay All
                                    </button>
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
            </div>
        );
    }
}

export default ServiceInstanceWaitingCharges;
