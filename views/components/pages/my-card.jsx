import React from 'react';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";

class MyCard extends React.Component {

    constructor(props){
        super(props);
    }


    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }

    }

    render () {
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:'My Profile', link:'/profile'},{name:pageName, link:null}];
        return(
            <Authorizer permissions="can_administrate">
                <div className="page __manage-my-cards">
                    <Content>
                        <ContentTitle icon="cog" title="Manage Your Credit Card"/>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default MyCard;
