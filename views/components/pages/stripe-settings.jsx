import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import StripeSettingsForm from "../elements/forms/stripe-settings-form.jsx";
import StripeImportForm from "../elements/forms/stripe-import-form.jsx";

class StripeSettings extends React.Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }

    }


    render () {
        let self = this;
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:pageName, link:null}];
        let subtitle= 'Servicebot works with Stripe. Integrate and import your existing Stripe data with one click.';
        return(
            <Authorizer permissions="can_administrate">
                <Jumbotron pageName={pageName} subtitle={subtitle} />
                <div className="stripe-settings-wrapper col-xs-12 col-sm-12 col-md-8 col-lg-8 col-md-offset-2 col-lg-offset-2">
                    <div className="row m-b-20">
                        <StripeSettingsForm/>
                    </div>
                </div>
            </Authorizer>
        );
    }
}

export default StripeSettings;
