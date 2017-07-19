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
        var self = this;
        let pageName = self.props.route.name;
        let uid = cookie.load("uid");
        return(
            <Authorizer>
                <Jumbotron pageName={pageName} location={this.props.location}/>
                <div className="page-service-instance">
                    <Content>
                        <div className="row m-b-20">
                            <BillingHistoryList uid={this.props.params.uid || uid}/>
                        </div>

                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default BillingHistory;
