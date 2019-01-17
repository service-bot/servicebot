import React from "react";
import { Price } from '../utilities/price.jsx';
import DateFormat from '../utilities/date-format.jsx';
import ReactToPrint from "react-to-print";

class CustomerInvoice extends React.Component {
    constructor(props) {
        super(props)
    }
    getRefunds(transactions) {
        //If there is a transaction for this invoice
        if (transactions.length > 0 && transactions[0].refunds.data.length > 0) {
            let refunds = transactions[0].refunds.data;
            return ( <React.Fragment>
                <h4 className={`__heading`}>Applied Refunds</h4>
                <div className={`mbf-summary`}>
                    <p className={`_heading`}>Items</p>
                    <div className={`_items`}>
                        {refunds.map((refund, index) =>
                                <p key={"refund-" + index} className="_item">
                                    <span className={`_label`}><Price value={refund.amount} currency={transactions[0].currency} /></span>
                                    <span className={`_value_wrap`}>
                            <span className={`_value`}>
                                {refund.reason}
                            </span>
                        </span>
                                    <span className={`_value_wrap`}>
                            <span className={`_value`}>
                                {refund.status}
                            </span>
                        </span>
                                </p>
                        )}
                    </div>
                </div>
                </React.Fragment>
            );
        } else {
            return (<span />);
        }
    }
    render() {
        let { invoice, user, cancel } = this.props;
        let self = this;
        return (
            <div className={`servicebot-invoice-modal-container`} ref={el => (this.componentRef = el)}>
                <div className={`__modal`}>
                    <div className={`__header`}>
                        <div className={`__inner`}>
                            <div className={`__left`}>
                                <h3>{user.name || user.email}</h3>
                                <span className={`__invoice-id`}>Invoice #: {invoice.invoice_id}</span>
                                <span className={`__date`}><DateFormat date={invoice.date} /></span>
                            </div>
                            <div className={`__right`}>
                                <span role={`button`}
                                    aria-label={`close invoice modal`}
                                    className={`icon close`}
                                    onClick={cancel} />
                            </div>
                        </div>
                    </div>
                    <div className={`__body`}>

                        <h4 className={`__heading`}>Summary</h4>
                        <div className={`mbf-summary`}>
                            <p className={`_heading`}>Items</p>
                            <div className={`_items`}>
                                {invoice.references.user_invoice_lines.map((line, index) => {
                                    return (
                                        <p key={index} className={`_item`}>
                                            <span className={`_label`}>{line.description}</span>
                                            <span className={`_value_wrap`}>
                                                <span className={`_value`}>
                                                    <Price value={line.amount} currency={line.currency} />
                                                </span>
                                            </span>
                                        </p>
                                    );
                                })}
                            </div>
                            <p className={`_total`}>
                                <span className={`_label`}>Total: </span>
                                <span className={`_value`}><Price value={invoice.total}
                                    currency={invoice.currency} /></span>
                            </p>
                        </div>

                        {this.getRefunds(invoice.references.transactions)}
                    </div>
                    <div className={`__footer`}>
                        <div className={`buttons-group __gap`}>
                            <ReactToPrint
                                copyStyles={true}
                                bodyClass={"servicebot--embeddable"}
                                trigger={() => <button onClick={(e) => {
                                    window.print();
                                    return false;
                                }} className={`buttons _primary _download-invoice`}>Print Invoice</button>}
                                content={() => this.componentRef}
                            />
                            <button className={`buttons _primary _red _refund-invoice`} onClick={() => { self.props.refund(invoice) }}>Refund</button>
                        </div>
                    </div>
                </div>
                <div onClick={cancel} className={`__backdrop`} />
            </div>
        );
    }
}
export default CustomerInvoice