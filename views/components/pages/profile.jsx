import React from 'react';
import cookie from 'react-cookie';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import UserFormEdit from "../elements/forms/user-form-edit.jsx";
import Fetcher from "../utilities/fetcher.jsx";
import { connect } from "react-redux";

const mapStateToProps = (state, ownProps) => {
    return {
        uid: state.uid,
        user: state.user || null,
        options: state.options
    }
};

class Profile extends React.Component {

    constructor(props){
        super(props);
        let uid = cookie.load("uid");
        this.state = {myUser:false, url:`/api/v1/users/${uid}`}

        this.fetchUser = this.fetchUser.bind(this);
    }

    componentDidMount(){
        if(!isAuthorized({uid : this.props.uid})){
            return browserHistory.push("/login");
        } else {
            this.fetchUser();
        }
    }

    fetchUser(){
        let self = this;
        Fetcher(self.state.url).then(function (response) {
            if(!response.error){
                self.setState({loading: false, myUser: response});
            }else{
                console.error("error getting user", response);
                self.setState({loading: false});
            }
        })
    }

    getUserEditForm(){
        let user = this.props.user;
        if(user && user.status != "invited") {
            return (<UserFormEdit myUser={this.state.myUser}/>);
        } else {
            return (
                <div className="invited-user-profile basic-info col-md-6 col-md-offset-3">
                    <span>Please complete your registration by following the link that was emailed to you prior to editing your profile.</span>
                </div>
            );
        }
    }

    render () {
        let pageName = this.props.route.name;

        if(this.state.loading){
            return(
                <div>
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ContentTitle icon="user" title="My Profile"/>
                                    <Load/>
                                </div>
                            </div>
                        </Content>
                    </div>
                </div>
            );
        }else {
            return (
                <div>
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ContentTitle icon="user" title="My Profile"/>
                                    {this.getUserEditForm()}
                                </div>
                            </div>
                        </Content>
                    </div>
                </div>
            );
        }
    }
}

export default connect(mapStateToProps)(Profile);
