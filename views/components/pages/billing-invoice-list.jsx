import React from 'react';
import {Link, browserHistory} from 'react-router';
import ContentTitle from "../layouts/content-title.jsx";
import Fetcher from "../utilities/fetcher.jsx";
import cookie from 'react-cookie';
import Load from "../utilities/load.jsx";
import DataTable from "../elements/datatable/datatable.jsx";
import {Price} from "../utilities/price.jsx";
import DateFormat from "../utilities/date-format.jsx";
import _ from "lodash";

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
                        currentUser: uid
        };

        this.fetchInvoice = this.fetchInvoice.bind(this);
        this.fetchUser = this.fetchUser.bind(this);
    }

    componentDidMount(){
        this.fetchInvoice();
    }

    fetchInvoice(){
        let self = this;
        Fetcher(self.state.url).then(function (response) {
           if (!response.error){
               console.log(response);
               self.setState({invoice: response});
               return response;
           }else{
               console.log(response.error);
               self.setState({loading: false});
           }
        }).then(function(response){
            self.fetchUser(response);
        });
    }

    fetchUser(data){
        let self = this;
        if(self.state.currentUser == data.user_id){
            Fetcher('/api/v1/users/own').then(function (response) {
                if(!response.error){
                    console.log("own user object",response);
                    self.setState({loading: false, invoiceOwner: response[0]});
                }else{
                    console.log("error own user object", response);
                    self.setState({loading: false});
                }
            });
        }else{
            Fetcher(`/api/v1/users/${data.user_id}`).then(function (response) {
                if(!response.error){
                    console.log("admin getting user object", response);
                    self.setState({loading: false, invoiceOwner: response});
                }else{
                    console.log("error admin / other user getting user object", response);
                    self.setState({loading: false});
                }
            });
        }
    }

    render () {
        if(this.state.loading){
            return(<Load type="content"/>);
        }else{
            let invoice = this.state.invoice;
            let invoiceOwner = this.state.invoiceOwner;
            return (
                <div className="col-xs-12">
                    <ContentTitle icon="cog" title={`Invoice ID:${invoice.invoice_id}`}/>
                    <div className="Invoice">
                        <div className="invoice-header">
                            <div className="invoice-header-header">
                                <div className="invoice-date"><span className="invoice-date-label">Charge Date:</span><DateFormat date={invoice.date}/></div>
                                <div className="invoice-no">
                                    <span className="invoice-no-label">Invoice No:</span>{invoice.id}<br/>
                                    <span className="invoice-no-label">Invoice ID:</span>{invoice.invoice_id}<br/>
                                    <span className="invoice-no-label">Subscription ID:</span>{invoice.subscription}
                                </div>
                            </div>
                        </div>
                        <div className="entity-info">
                            <div className="invoice-entity">
                                <h2 className="invoice-name">Invoice</h2>
                                <h2 className="company-name">ServiceBot.io</h2>
                            </div>
                            <div className="invoice-entity-details">
                                <div className="invoice-from">
                                    <div className="invoice-from-header"><h3>From</h3></div>
                                    <div className="invoice-from-body">
                                        <ul>
                                            <li className="entity-name">ServiceBot.io</li>
                                            <li>1 Inifinite Loop</li>
                                            <li>Mountain View, CA 20010</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="invoice-to">
                                    <div className="invoice-to-header"><h3>To</h3></div>
                                    <div className="invoice-to-body">
                                        <ul>
                                            {invoiceOwner.name && <li className="entity-name"><i className="fa fa-user"/> {invoiceOwner.name}</li> }
                                            {invoiceOwner.email && <li><i className="fa fa-envelope"/>{invoiceOwner.email}</li> }
                                            {invoiceOwner.phone && <li><i className="fa fa-phone"/>{invoiceOwner.phone}</li> }
                                        </ul>
                                    </div>
                                </div>
                                <div className="invoice-status">
                                    <div className="invoice-status-header"><h3>Status</h3></div>
                                    <div className="invoice-status-body">
                                        <ul>
                                            <li><span className="status-label">Invoice Total:</span> {_.has(invoice, 'references.transactions[0].amount') ?
                                                <Price value={invoice.references.transactions[0].amount}/> : <Price value={invoice.amount_due}/>}</li>
                                            <li><span className="status-label">Period Start:</span> <DateFormat date={invoice.period_start}/></li>
                                            <li><span className="status-label">Period End:</span> <DateFormat date={invoice.period_end}/></li>
                                            <li><span className="status-label">Charge Date:</span> <DateFormat date={invoice.date}/></li>
                                            <li><span className="status-label">Status:</span> <span>{invoice.paid ? 'Paid' : 'Not Charged'}</span></li>
                                            {invoice.next_attempt != null &&
                                                <li><span className="status-label">Next Attempt:</span> <DateFormat date={invoice.next_attempt}/></li>
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                        <td><Price value={line.amount}/></td>
                                    </tr>
                                )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td/><td/><td/>
                                        <td><strong>Transaction Total</strong></td>
                                        {_.has(invoice, 'references.transactions[0].amount') ?
                                            <td><strong><Price value={invoice.references.transactions[0].amount}/></strong></td>:
                                            <td><strong>Not Charged</strong></td>
                                        }
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="invoice-footer">

                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default BillingInvoiceList;
