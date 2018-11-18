import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import BillingInvoiceList from "./billing-invoice-list.jsx";

class BillingInvoice extends React.Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(!isAuthorized({})){
            return browserHistory.push("/login");
        }

    }
    render () {
        let { params: { invoiceId }} = this.props
        return(
            <Authorizer>
                <div className="page __billing-invoice">
                    <Content>
                        <BillingInvoiceList invoiceId={invoiceId}/>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default BillingInvoice;
