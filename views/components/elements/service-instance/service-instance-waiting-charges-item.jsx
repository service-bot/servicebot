import React from 'react';
import {Price} from '../../utilities/price.jsx';
import Buttons from "../../elements/buttons.jsx";

class ServiceInstanceWaitingChargesItem extends React.Component {

    constructor(props){
        super(props);
        let item = this.props.chargeItem;
        this.state = { chargeId: item.id, chargeItem: item };
        this.onPayCharge = this.onPayCharge.bind(this);
    }

    onPayCharge(event){
        let self = this;
        event.preventDefault();
        this.props.handlePayChargeItem(self.state.chargeId);
    }

    render () {
        let self = this;
        return (
            <div className="xaas-body-row">
                <div className="xaas-data xaas-charge"><span>{self.state.chargeItem.description}</span></div>
                <div className="xaas-data xaas-price"><span><Price value={self.state.chargeItem.amount}/></span></div>
                <div className="xaas-data xaas-action">
                    <Buttons btnType="primary" text="Make Payment" onClick={self.onPayCharge}/>
                </div>
            </div>
        );
    }
}

export default ServiceInstanceWaitingChargesItem;
