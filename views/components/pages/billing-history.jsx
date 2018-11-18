import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import cookie from 'react-cookie';
import BillingHistoryList from "./billing-history-list.jsx";

class BillingHistory extends React.Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(!isAuthorized({})){
            return browserHistory.push("/login");
        }

    }
    render () {
        let uid = cookie.load("uid");
        return(
            <Authorizer>
                <div className="page __billing-history">
                    <Content>
                        <BillingHistoryList uid={this.props.params.uid || uid}/>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default BillingHistory;
