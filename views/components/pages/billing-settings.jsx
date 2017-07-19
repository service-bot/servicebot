import React from 'react';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import BillingSettingsForm from "../elements/forms/billing-settings-form.jsx";

class BillingSettings extends React.Component {

    constructor(props){
        super(props);
    }


    componentDidMount(){
        if(!isAuthorized({})){
            return browserHistory.push("/login");
        }

    }
    render () {
        let pageName = this.props.route.name;
        console.log("props", this.props);
        return(
            <Authorizer>
                <Jumbotron pageName={pageName} location={this.props.location}/>
                <div className="page-service-instance">
                    <Content>
                        <div className="row m-b-20">
                            <div className="col-md-6 col-md-offset-3">
                                <BillingSettingsForm/>
                            </div>
                        </div>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default BillingSettings;
