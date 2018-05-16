import React from 'react';
import {Price} from '../../utilities/price.jsx';
import Buttons from "../../elements/buttons.jsx";
import {isAuthorized} from "../../utilities/authorizer.jsx";


class ServiceInstanceWaitingChargesItem extends React.Component {

    constructor(props){
        super(props);
        let item = this.props.chargeItem;
        this.state = { chargeId: item.id, chargeItem: item };
        this.onPayCharge = this.onPayCharge.bind(this);
        this.onCancelCharge = this.onCancelCharge.bind(this);
    }

    onPayCharge(event){
        let self = this;
        event.preventDefault();
        this.props.handlePayChargeItem(self.state.chargeId);
    }

    onCancelCharge(event){
        let self = this;
        event.preventDefault();
        this.props.handleCancelChargeItem(self.state.chargeId);
    }

    render () {
        let self = this;
        return (
            <div className="xaas-body-row">
                <div className="xaas-data xaas-charge"><span>{self.state.chargeItem.description}</span></div>
                <div className="xaas-data xaas-price"><span><Price value={self.state.chargeItem.amount}  prefix={this.props.prefix}/></span></div>
                {isAuthorized({permissions: 'can_administrate'}) &&
                    <div className="xaas-data xaas-action">

                        <Buttons btnType="primary" text="Remove Charge" onClick={self.onCancelCharge}/>
                    </div>
                }
            </div>
        );
    }
}

export default ServiceInstanceWaitingChargesItem;
