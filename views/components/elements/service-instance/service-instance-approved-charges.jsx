import React from 'react';
import DateFormat from '../../utilities/date-format.jsx';
import {Price} from '../../utilities/price.jsx';
import Datatable from '../../elements/datatable/datatable.jsx';

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

    render () {
        return (
            <div className="service-instance-section">
                <span className="service-instance-section-label">Approved Line Items</span>
                <div className="table-responsive service-block">
                    <p>Service line items are one time charges for standalone services performed related to this service within current pay period.</p>
                    <Datatable dataObj={this.props.instanceApprovedItems}
                               col={['description', 'amount', 'updated_at', 'approved']}
                               mod_amount={this.modAmount}
                               mod_updated_at={this.modUpdatedAt}
                               mod_approved={this.modApproved}
                               colNames={['Line Item Description', 'Amount', 'Paid On', 'Status']}
                    />
                </div>
            </div>
        );
    }
}

export default ServiceInstanceApprovedCharges;
