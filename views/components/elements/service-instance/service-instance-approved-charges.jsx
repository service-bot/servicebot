import React from 'react';
import DateFormat from '../../utilities/date-format.jsx';
import {Price} from '../../utilities/price.jsx';
import Datatable from '../../elements/datatable/datatable.jsx';
import Collapsible from 'react-collapsible';

class ServiceInstanceApprovedCharges extends React.Component {

    constructor(props) {
        super(props);

        this.getStatus = this.getStatus.bind(this);
    }

    getStatus(approved = false){
        if(approved){
            return (
                <span className="tag tag-info tag-md">Paid</span>
            );
        }
        return (
            <span className="tag tag-warning tag-md">Pending</span>
        );
    }

    modAmount(data){
        return( <Price value={data}/> );
    }

    modUpdatedAt(data){
        return( <DateFormat date={data} time/> );
    }

    modApproved(data){
        return( data ? 'Paid' : 'Unpaid' );
    }

    getChargeHistory() {
        let currentTime = Math.round(new Date().getTime()/1000);
        //Only get charges for previous billing cycles
        let approveItems = this.props.instanceApprovedItems.filter((item) => {
            return item.period_end < currentTime;
        });
        //Get total amount
        let totalCharges = 0;
        approveItems.map((charge)=>{ totalCharges+= charge.amount; });

        if(approveItems.length > 0) {
            return (
                <Collapsible trigger="Approved Charges - Previous Billing Cycles" openedClassName="opened">
                    <div className="service-instance-box-content">
                        <p>The following charges are approved during previous billing cycles.
                            The base subscription price is not included. This list only includes the approved additional charges.</p>
                        <Datatable dataObj={approveItems}
                                   col={['description', 'amount', 'updated_at', 'approved']}
                                   mod_amount={this.modAmount}
                                   mod_updated_at={this.modUpdatedAt}
                                   mod_approved={this.modApproved}
                                   colNames={['Line Item Description', 'Amount', 'Paid On', 'Status']}
                        />
                        <div className="xaas-body-row additional-charges-total dark">
                            <div className="xaas-data xaas-charge"><span><strong>Total Approved: <Price value={totalCharges}/></strong></span></div>
                        </div>
                    </div>
                </Collapsible>
            );
        } else {
            return null;
        }
    }

    getChargeCurrent() {
        let currentTime = Math.round(new Date().getTime()/1000);
        //Only get charges for current billing cycles
        let approveItems = this.props.instanceApprovedItems.filter((item) => {
            return item.period_end > currentTime;
        });
        //Get total amount
        let totalCharges = 0;
        approveItems.map((charge)=>{ totalCharges+= charge.amount; });

        if(approveItems.length > 0) {
            return (
                <div className="service-instance-box">
                    <div className="service-instance-box-title">
                        <span>Approved Charges - Current Billing Cycle</span>
                    </div>
                    <div className="service-instance-box-content">
                        <p>Following charges are one time charges that have been approved for the current billing cycle.</p>
                        <Datatable dataObj={approveItems}
                                   col={['description', 'amount', 'updated_at', 'approved']}
                                   mod_amount={this.modAmount}
                                   mod_updated_at={this.modUpdatedAt}
                                   mod_approved={this.modApproved}
                                   colNames={['Line Item Description', 'Amount', 'Paid On', 'Status']}
                        />
                        <div className="xaas-body-row additional-charges-total dark">
                            <div className="xaas-data xaas-charge"><span><strong>Total Approved: <Price value={totalCharges}/></strong></span></div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    render () {
        return (
            <div>
                {this.getChargeCurrent()}
                {this.getChargeHistory()}
            </div>
        );
    }
}

export default ServiceInstanceApprovedCharges;
