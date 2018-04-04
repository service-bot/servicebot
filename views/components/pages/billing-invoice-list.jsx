import React from 'react';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import {Link, browserHistory} from 'react-router';
import ContentTitle from "../layouts/content-title.jsx";
import Fetcher from "../utilities/fetcher.jsx";
import cookie from 'react-cookie';
import Load from "../utilities/load.jsx";
import DataTable from "../elements/datatable/datatable.jsx";
import {Price} from "../utilities/price.jsx";
import DateFormat from "../utilities/date-format.jsx";
import _ from "lodash";
import { connect } from "react-redux";
import ModalRefund from "../elements/modals/modal-refund.jsx";
import getSymbolFromCurrency from 'currency-symbol-map';

const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid,
        user: state.user || null,
        options: state.options
    }
};

class BillingInvoiceList extends React.Component {

    constructor(props){
        super(props);
        let invoiceId = this.props.invoiceId;
        let uid = cookie.load("uid");
        this.state = {  loading: true,
                        url: `/api/v1/invoices/${invoiceId}`,
                        invoiceId: invoiceId,
                        invoice: {},
                        invoiceOwner: {},
                        currentUser: uid,
                        refundModal: false
        };

        this.fetchInvoice = this.fetchInvoice.bind(this);
        this.fetchUser = this.fetchUser.bind(this);
        this.openRefundModal = this.openRefundModal.bind(this);
        this.closeRefundModal = this.closeRefundModal.bind(this);
        this.getRefunds = this.getRefunds.bind(this);
        this.getRefundDetail = this.getRefundDetail.bind(this);
        this.getActionButtons = this.getActionButtons.bind(this);
    }

    componentDidMount(){
        this.fetchInvoice();
    }

    fetchInvoice(){
        let self = this;
        Fetcher(self.state.url).then(function (response) {
           if (!response.error){
               self.setState({invoice: response});
               return response;
           }else{
               console.error(response.error);
               self.setState({loading: false});
           }
        }).then(function(response){
            self.fetchUser(response);
        }).catch(function (err) {
            //If the user is unauthorized force them to 404 page
            return browserHistory.push("/404");
        });
    }

    fetchUser(data){
        let self = this;
        if(self.state.currentUser == data.user_id){
            Fetcher('/api/v1/users/own').then(function (response) {
                if(!response.error){
                    self.setState({loading: false, invoiceOwner: response[0]});
                }else{
                    self.setState({loading: false});
                }
            });
        }else{
            Fetcher(`/api/v1/users/${data.user_id}`).then(function (response) {
                if(!response.error){
                    self.setState({loading: false, invoiceOwner: response});
                }else{
                    self.setState({loading: false});
                }
            });
        }
    }

    openRefundModal(){
        let self = this;
        return function(e) {
            e.preventDefault();
            self.setState({refundModal: true});
        }
    }

    closeRefundModal(){
        this.setState({refundModal: false});
    }

    getRefundDetail(transactions){
        if(transactions.length > 0 && transactions[0].amount_refunded > 0) {
            let refunded = transactions[0].amount_refunded;
            let prefix = getSymbolFromCurrency(transactions[0].currency);
            return (
                <li><span className="status-label">Refunded:</span> <span><Price value={refunded} prefix={prefix}/></span></li>
            );
        } else {
            return (<span/>);
        }
    }

    getRefunds(transactions){
        //If there is a transaction for this invoice
        if(transactions.length > 0 && transactions[0].refunds.data.length > 0) {
            let refunds = transactions[0].refunds.data;
            let prefix = getSymbolFromCurrency(transactions[0].currency);
            return (
                <div className="xaas-dashboard">
                    <div className="xaas-row waiting">
                        <div className="xaas-title xaas-has-child">
                            <div className="xaas-data xaas-service"><span>Applied Refunds</span></div>
                        </div>
                        <div className="xaas-body">
                            {refunds.map((refund, index) =>
                                <div key={"refund-" + index} className="xaas-body-row">
                                    <div className="xaas-data xaas-price"><b><Price value={refund.amount} prefix={prefix}/></b></div>
                                    <div className="xaas-data xaas-charge"><span>{refund.reason}</span></div>
                                    <div className="xaas-data xaas-action"><span>{refund.status}</span></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        } else {
            return (<span/>);
        }
    }

    getActionButtons(){
        let self = this;
        return (
            <Authorizer permissions="can_administrate">
                <button className="btn btn-danger" onClick={self.openRefundModal()}>Refund Invoice</button>
            </Authorizer>
        );
    }

    render () {
        let options = this.props.options;

        if(this.state.loading){
            return(<Load type="content"/>);
        }else{
            let invoice = this.state.invoice;
            let prefix = getSymbolFromCurrency(invoice.currency);
            let invoiceOwner = this.state.invoiceOwner;

            let currentModal = ()=> {
                if(this.state.refundModal){
                    return(
                        <ModalRefund invoice={this.state.invoice} show={this.state.refundModal} hide={this.closeRefundModal}/>
                    )
                }
            };

            return (
                <div className="col-xs-12">
                    <div className="row">
                        <div className="col-xs-10">
                            <ContentTitle icon="cog" title={`Invoice ID:${invoice.invoice_id}`}/>
                        </div>
                        <div className="col-xs-2">
                            {this.getActionButtons()}
                        </div>
                    </div>
                    <div className="Invoice">
                        <div className="invoice-header">
                            <div className="invoice-header-header">
                                <div className="invoice-entity">
                                    <h2 className="invoice-name">Invoice</h2>
                                    <h2 className="company-name">{options.hostname && options.hostname.value}</h2>
                                </div>
                                <div className="invoice-no">
                                    <span className="invoice-date-label">Charge Date:</span><DateFormat date={invoice.date}/><br/>
                                    <span className="invoice-no-label">Invoice No:</span>{invoice.id}<br/>
                                    <span className="invoice-no-label">Invoice ID:</span>{invoice.invoice_id}<br/>
                                    <span className="invoice-no-label">Subscription ID:</span>{invoice.subscription}<br/>
                                </div>
                            </div>
                        </div>
                        <div className="entity-info">
                            <div className="invoice-entity-details">
                                <div className="col-xs-12 col-md-4">
                                    <div className="invoice-from-header"><h3>From</h3></div>
                                    <div className="invoice-from-body">
                                        <ul>
                                            <li className="entity-name">{options.company_name && options.company_name.value}</li>
                                            <li>{options.company_address && options.company_address.value}</li>
                                            {options.company_email && <li><i className="fa fa-envelope"/> {options.company_email.value}</li>}
                                            {options.company_phone_number && <li><i className="fa fa-phone"/> {options.company_phone_number.value}</li>}
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-xs-12 col-md-4">
                                    <div className="invoice-to-header"><h3>To</h3></div>
                                    <div className="invoice-to-body">
                                        <ul>
                                            {invoiceOwner.name && <li className="entity-name"><i className="fa fa-user"/> {invoiceOwner.name}</li> }
                                            {invoiceOwner.email && <li><i className="fa fa-envelope"/> {invoiceOwner.email}</li> }
                                            {invoiceOwner.phone && <li><i className="fa fa-phone"/> {invoiceOwner.phone}</li> }
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-xs-12 col-md-4">
                                    <div className="invoice-status-header"><h3>Details</h3></div>
                                    <div className="invoice-status-body">
                                        <ul>
                                            <li><span className="status-label">Invoice Total:</span> {_.has(invoice, 'references.transactions[0].amount') ?
                                                <Price value={invoice.references.transactions[0].amount} prefix={prefix}/> : <Price value={invoice.amount_due} prefix={prefix}/>}</li>

                                            {this.getRefundDetail(invoice.references.transactions)}

                                            <li><span className="status-label">Status:</span> <span>{invoice.paid ? 'Paid' : 'Not Charged'}</span></li>
                                            {invoice.next_attempt != null &&
                                                <li><span className="status-label">Next Attempt:</span> <DateFormat date={invoice.next_attempt}/></li>
                                            }

                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {this.getRefunds(invoice.references.transactions)}

                        <div className="invoice-details">
                            <table className="table table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Quantity</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {invoice.references.user_invoice_lines.map((line)=>
                                    <tr key={`lineitem-${line.line_item_id}`}>
                                        <td>{line.id}</td>
                                        <td>{line.description}</td>
                                        <td>{line.type}</td>
                                        <td>{line.quantity}</td>
                                        <td><Price value={line.amount} prefix={prefix}/></td>
                                    </tr>
                                )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td/><td/><td/>
                                        <td><strong>Transaction Total</strong></td>
                                        {_.has(invoice, 'references.transactions[0].amount') ?
                                            <td><strong><Price value={invoice.references.transactions[0].amount} prefix={prefix}/></strong></td>:
                                            <td><strong>No Charge</strong></td>
                                        }
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="invoice-footer">

                        </div>
                    </div>
                    {currentModal()}
                </div>
            );
        }
    }
}

export default connect(mapStateToProps)(BillingInvoiceList);