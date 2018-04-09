import React from 'react';
import {Link, browserHistory} from 'react-router';
import DataTable from "../elements/datatable/datatable.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import {Price} from "../utilities/price.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {isAuthorized} from "../utilities/authorizer.jsx";
import ModalRefund from "../elements/modals/modal-refund.jsx";
import getSymbolFromCurrency from 'currency-symbol-map';


class BillingHistoryList extends React.Component {

    constructor(props){
        super(props);
        let action = '/own';
        if(isAuthorized({permissions: "can_administrate"}) && this.props.uid){
            action = `?key=user_id&value=${this.props.uid}`
        }
        this.state = {
            url: `/api/v1/invoices${action}`,
            refundModal: false
        };

        this.openRefundModal = this.openRefundModal.bind(this);
        this.closeRefundModal = this.closeRefundModal.bind(this);
    }

    modInvoiceId(data, resObj){
        return(
            <Link to={`/billing-history/invoice/${resObj.id}`}>{resObj.invoice_id}</Link>
        );
    }
    modAmountDue(data, resObj){
        let prefix = getSymbolFromCurrency(resObj.currency);
        return (
            <Price value={data} prefix={prefix}/>
        );
    }
    modDate(data){
        return (
            <DateFormat date={data}/>
        );
    }

    onViewInvoice(dataObject){
        return function(e) {
            e.preventDefault();
            browserHistory.push(`/billing-history/invoice/${dataObject.id}`);
        }
    }
    onViewInstance(dataObject){
        return function(e) {
            e.preventDefault();
            if(dataObject != null) {
                browserHistory.push(`/service-instance/${dataObject.service_instance_id}`);
            }
        }
    }

    openRefundModal(dataObject){
        let self = this;
        return function(e) {
            e.preventDefault();
            self.setState({refundModal: true, invoice:dataObject});
        }
    }
    closeRefundModal(){
        this.setState({refundModal: false});
    }

    render () {
        let self = this;

        let currentModal = ()=> {
            if(self.state.refundModal){
                return(
                    <ModalRefund invoice={self.state.invoice} show={self.state.refundModal} hide={self.closeRefundModal}/>
                )
            }
        };

        return (
            <div className="col-xs-12">
                <ContentTitle icon="cog" title="View all your invoices"/>
                {/* no ending slash for the api url */}
                <DataTable get={ this.state.url }
                           col={['id', 'invoice_id', 'amount_due', 'date', 'closed', 'paid']}
                           colNames={['ID', 'Invoice ID', 'Amount Due', 'Date', 'Closed', 'Paid']}
                           statusCol="paid"
                           mod_invoice_id={this.modInvoiceId}
                           mod_amount_due={this.modAmountDue}
                           mod_date={this.modDate}
                           dropdown={[{name:'Actions', direction: 'right', buttons:[
                               {id: 1, name: 'View Invoice', link: '#', onClick: this.onViewInvoice},
                               {id: 2, name: 'View Service Page', link: '#', onClick: this.onViewInstance},
                               {id: 3, name: 'divider', permission: ["can_administrate", "can_manage"]},
                               {id: 4, name: 'Make Refund', link: '#', onClick: this.openRefundModal, permission: ["can_administrate", "can_manage"]},
                           ]}]}
                           nullMessage="You do not have any invoices at the moment."/>
                {currentModal()}
            </div>
        );
    }
}

export default BillingHistoryList;
