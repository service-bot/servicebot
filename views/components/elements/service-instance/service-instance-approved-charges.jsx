import React from 'react';
import DateFormat from '../../utilities/date-format.jsx';
import Price from '../../utilities/price.jsx';

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

    render () {
        let self = this;

        return (
            <div id="service-instance-approved-charges" className="row">
                <div className="table-responsive service-block">
                    <h5>Service Line Items</h5>
                    <span className="m-t-5 m-b-20 block label color-grey-600">Service line items are one time charges for standalone services performed related to this service within current pay period.</span>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead>
                                <tr>
                                    <td className="service-description p-l-20"><strong>Service Line Items</strong></td>
                                    <td className="service-price text-center"><strong>Price</strong></td>
                                    <td className="service-date"><strong>Payment Date</strong></td>
                                    <td className="service-status text-right"><strong>Status</strong></td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.instanceApprovedItems.map(item => (
                                    <tr key={"item-" + item.id}>
                                        <td className="p-l-20">{item.description}</td>
                                        <td className="text-center"><Price value={item.amount}/></td>
                                        <td><DateFormat date={item.updated_at}/></td>
                                        <td className="text-right p-r-20">{self.getStatus(item.approved)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default ServiceInstanceApprovedCharges;
