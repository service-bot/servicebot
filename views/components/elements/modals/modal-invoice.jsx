import React from 'react';
import Load from '../../utilities/load.jsx';
import {browserHistory} from 'react-router';
import cookie from 'react-cookie';
import Fetcher from "../../utilities/fetcher.jsx";
import Modal from '../../utilities/modal.jsx';
import DateFormat from '../../utilities/date-format.jsx';
import {Price} from '../../utilities/price.jsx';
import { connect } from "react-redux";
import getSymbolFromCurrency from 'currency-symbol-map';
let _ = require("lodash");

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
        let self = this;
        let pageName = "Upcoming Invoice";

        if(self.state.loading){
            return(
                <Load/>
            );
        }else{
            let myNextInvoice = self.state.nextInvoice;
            if(myNextInvoice){
                let amountDue = myNextInvoice.amount_due || 0;
                let total = myNextInvoice.total || 0;
                let prefix = getSymbolFromCurrency(myNextInvoice.currency);
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
                                <td><Price value={item.amount} prefix={prefix}/></td>
                            </tr>
                        )
                    );
                };

                let last4, fund = null;

                if(self.state.currentUser) {
                    fund = self.state.currentUser.references.funds;
                    if(fund && fund.length > 0){
                        last4 = fund[0].source.card.last4;
                    }
                }

                let modalHeadingStyle = {};
                if(this.props.options){
                    let options = this.props.options;
                    modalHeadingStyle.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');
                }

                return(
                    <Modal modalTitle={pageName} icon="fa-credit-card-alt" show={this.props.show} hide={this.props.hide}>
                        <div id="invoice-modal" className="table-responsive">
                            <div className="invoice-widget" style={modalHeadingStyle}>
                                <div className="row">
                                    <div className="col-xs-12 col-sm-4">
                                        <div className="address">
                                            <strong>Amount To Be Charged</strong><br/>
                                            <span><i className="fa fa-money"/><Price value={amountDue} perfix={prefix}/></span><br/>
                                        </div>
                                    </div>
                                    <div className="col-xs-12 col-sm-4">
                                        <div className="address">
                                            <strong>Charge Date</strong><br/>
                                            <span><i className="fa fa-calendar-o"/><DateFormat date={nextPaymentAttempt}/></span><br/>
                                        </div>
                                    </div>
                                    <div className="col-xs-12 col-sm-4">
                                        <div className="payment-method">
                                            <strong>Using Payment Method</strong><br/>
                                            <span><i className="fa fa-credit-card"/>*** *** *** {last4}</span><br/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <table id="invoice-table" className="table table-striped table-hover">
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
                                <tfoot className="invoice-footer">
                                    <tr>
                                        <td/>
                                        <td>Total:</td>
                                        <td><Price value={total} perfix={prefix}/></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </Modal>
                );
            }else{
                return(
                    <Modal modalTitle={pageName} icon={this.props.icon} show={this.props.show} hide={this.props.hide}>
                        <div className="table-responsive">
                            <div className="invoice-widget">
                                <div className="row">
                                    <div className="col-xs-12">
                                        <h4>You do not have any invoice at the moment.</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                );
            }

        }
    }
}

export default connect((state) => {return {options:state.options}})(ModalInvoice);