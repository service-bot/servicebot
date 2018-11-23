import React from 'react';
import Load from '../../utilities/load.jsx';
import {browserHistory} from 'react-router';
import cookie from 'react-cookie';
import {Fetcher} from "servicebot-base-form";
import Modal from '../../utilities/modal.jsx';
import DateFormat from '../../utilities/date-format.jsx';
import {Price} from '../../utilities/price.jsx';
import { connect } from "react-redux";

class ModalInvoice extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        let username = cookie.load("username");
        this.state = {  loading: true,
            nextInvoice : false,
            currentUser: false,
            url: `/api/v1/invoices/upcoming/${uid}`,
            uid: uid,
            email: username,
        };
        this.fetchNextInvoice = this.fetchNextInvoice.bind(this);
    }

    componentDidMount() {
        this.fetchNextInvoice();
    }

    fetchNextInvoice(){
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(response != null){
                if(!response.error){
                    self.setState({nextInvoice : response});
                    return response
                }
            }
        }).then(function (data) {
            Fetcher(`/api/v1/users/own`).then(function (response) {
               if(response != null && !response.error){
                   self.setState({loading: false, currentUser: response[0]});
               }else{
                   self.setState({loading: false});
               }
            });
            self.setState({loading:false});
        });
    }

    handleUnauthorized(){
        browserHistory.push("/login");
    }

    render () {
        let { loading, nextInvoice, currentUser } = this.state;
        let { icon, show, hide } = this.props;

        if(loading){
            return <Load/>;
        }else{
            let myNextInvoice = nextInvoice;
            if(myNextInvoice){
                let amountDue = myNextInvoice.amount_due || 0;
                let total = myNextInvoice.total || 0;
                let nextPaymentAttempt = myNextInvoice.next_payment_attempt || '';
                let closed = myNextInvoice.closed || false;
                let paid = myNextInvoice.paid || false;
                let lineItemCount = myNextInvoice.lines.total_count || 0;
                let lineItems = myNextInvoice.lines.data; //data is an array of objects

                let item_name = (item)=>{
                    if(item.description) {
                        return item.description;
                    } else if (item.plan) {
                        return item.plan.name;
                    } else {
                        return item.type;
                    }
                };

                let items = ()=>{
                    return(
                        lineItems.map((item)=>
                            <tr key={item.id}>
                                <td>{item_name(item)}</td>
                                <td><DateFormat date={nextPaymentAttempt}/></td>
                                <td><Price value={item.amount} currency={myNextInvoice.currency}/></td>
                            </tr>
                        )
                    );
                };

                let last4, fund = null;

                if(currentUser) {
                    fund = currentUser.references.funds;
                    if(fund && fund.length > 0){
                        last4 = fund[0].source.card.last4;
                    }
                }

                return(
                    <Modal modalTitle="Upcoming Invoice" icon="fa-credit-card-alt" show={show} hide={hide}>
                        <div className="__modal __upcoming-invoice">
                            <div className="__invoice-information">
                                <div className="__amount">
                                    <strong>Amount</strong><br/>
                                    <span><i className="fa fa-money"/><Price value={amountDue} currency={myNextInvoice.currency}/></span><br/>
                                </div>
                                <div className="__date">
                                    <strong>On Date</strong><br/>
                                    <span><i className="fa fa-calendar-o"/><DateFormat date={nextPaymentAttempt}/></span><br/>
                                </div>
                                <div className="__payment-method">
                                    <strong>Method</strong><br/>
                                    <span><i className="fa fa-credit-card"/>*** *** *** {last4}</span><br/>
                                </div>
                            </div>
                            <table className="table __invoice-table">
                                <thead>
                                    <tr>
                                        <td className="service-description"><strong>Service Item</strong></td>
                                        <td className="service-billing-date"><strong>Payment Date</strong></td>
                                        <td className="service-price"><strong>Amount</strong></td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items()}
                                </tbody>
                                <tfoot className="__invoice-footer">
                                    <tr>
                                        <td/>
                                        <td>Total:</td>
                                        <td><Price value={total} currency={myNextInvoice.currency}/></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Modal>
                );
            }else{
                return(
                    <Modal modalTitle="Upcoming Invoice" icon={icon} show={show} hide={hide}>
                        <div className="invoice-modal">
                            <div className="__invoice-information">
                                <p className="__no-invoice">You do not have any invoice at the moment.</p>
                            </div>
                        </div>
                    </Modal>
                );
            }

        }
    }
}

export default connect((state) => {return {options:state.options}})(ModalInvoice);