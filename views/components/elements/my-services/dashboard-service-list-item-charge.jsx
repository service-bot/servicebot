import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from '../../utilities/fetcher.jsx';
import {Price} from '../../utilities/price.jsx';

class DashboardServiceListItemCharge extends React.Component {

    constructor(props){
        super(props);
        let serviceInstanceId = this.props.serviceInstanceId;
        this.state = { chargeItems: [], url: `/api/v1/service-instances/${serviceInstanceId}/awaiting-charges`, loading:true};
    }

    componentDidMount() {
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(!response.error){
                self.setState({chargeItems : response});
            }
            self.setState({loading:false});
        })
    }

    render () {
        if(this.state.loading){
            return (
                <div className="xaas-body">
                    <div className="xaas-body-row">
                        <Load/>
                    </div>
                </div>
            );
        }
        if(this.state.chargeItems.length<1) {
            return (
                <div className="xaas-body">
                    <div className="xaas-body-row">
                        <p className="help-block center-align">You don't have any line items due.</p>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className="xaas-body">
                    {this.state.chargeItems.map(chargeItem => (
                        <div key={`charge-item-${chargeItem.data.id}`} className="xaas-body-row">
                            <div className="xaas-data xaas-charge"><span>{chargeItem.data.description}</span></div>
                            <div className="xaas-data xaas-price"><span><Price value={chargeItem.data.amount}/></span></div>
                            <div className="xaas-data xaas-action">
                                <button className="btn btn-info btn-rounded btn-sm">Pay<i className="fa fa-credit-card"/></button>
                            </div>
                        </div>
                    ))}
                </div>

            );
        }
    }
}

export default DashboardServiceListItemCharge;
