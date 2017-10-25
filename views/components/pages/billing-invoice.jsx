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
        var self = this;
        let pageName = self.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:pageName, link:null}];
        return(
            <Authorizer>
                <Jumbotron pageName={pageName} location={this.props.location}/>
                <div className="page-service-instance">
                    <Content>
                        <div className="row m-b-20">
                            <BillingInvoiceList invoiceId={this.props.params.invoiceId}/>
                        </div>

                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default BillingInvoice;
