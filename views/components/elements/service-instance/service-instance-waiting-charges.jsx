import React from 'react';
import ServiceInstanceWaitingChargesItem from './service-instance-waiting-charges-item.jsx';
import Buttons from "../../elements/buttons.jsx";
import {Price} from '../../utilities/price.jsx';
import {connect} from 'react-redux';
import getSymbolFromCurrency from 'currency-symbol-map';


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
        let { options } = this.props;
        let prefix = options.currency ? getSymbolFromCurrency(options.currency.value) : '';

        let getTotalCharges = ()=>{
            let totalCharges = 0;
            this.props.instanceWaitingItems.map((charge)=>{ totalCharges+= charge.amount; });
            return totalCharges;
        };

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
                                    <ServiceInstanceWaitingChargesItem key={"item-" + item.id} handleCancelChargeItem={self.onCancelCharge} chargeItem={item} prefix={prefix}/>
                                ))}
                                <div className="xaas-body-row additional-charges-total">
                                    <div className="xaas-data xaas-charge"><span><strong>Total:</strong></span></div>
                                    <div className="xaas-data xaas-price"><span><strong><Price value={getTotalCharges()} prefix={prefix}/></strong></span></div>
                                </div>

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

ServiceInstanceWaitingCharges = connect(state => {
    return {
        options: state.options,
    }
})(ServiceInstanceWaitingCharges);

export default ServiceInstanceWaitingCharges;
