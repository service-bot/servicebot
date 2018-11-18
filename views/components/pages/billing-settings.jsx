import React from 'react';
import cookie from 'react-cookie';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import {BillingForm} from "../elements/forms/billing-settings-form.jsx";
import {connect} from "react-redux";

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
        let spk = cookie.load("spk");
        return(
            <Authorizer>
                <div className="page __manage-billing-settings">
                    <Content>
                        <BillingForm uid={this.props.uid} spk={spk}/>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default connect(state => ({
    uid : state.uid
}))(BillingSettings)
