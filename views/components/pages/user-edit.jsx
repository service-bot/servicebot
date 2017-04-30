import React from 'react';
import {Link, hashHistory, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import UserFormEdit from "../elements/forms/user-form-edit.jsx";
import Fetcher from "../utilities/fetcher.jsx";

class UserEdit extends React.Component {

    constructor(props){
        super(props);
        console.log("this.props.param", this.props.params);
        this.state = {myUser:false, url:`/api/v1/users/${this.props.params.userId}`}

        this.fetchUser = this.fetchUser.bind(this);
    }


    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }
        this.fetchUser()

    }


    fetchUser(){
        let self = this;
        Fetcher(self.state.url).then(function (response) {
            if(!response.error){
                console.log("my user", response);
                self.setState({loading: false, myUser: response});
            }else{
                console.log("error getting user", response);
                self.setState({loading: false});
            }
        }).catch(function(err){
            browserHistory.push("/");
        })
    }


    render () {
        let pageName = this.props.route.name;
        let breadcrumbs = [{name: 'Home', link: 'home'}, {name: 'My Services', link: '/my-services'}, {name: 'Manage Users', link: '/manage-users'}, {name: pageName, link: null}];

        if(this.state.loading){
            return(
                <Authorizer permissions="can_administrate">
                    <div className="page-service-instance">
                        <Jumbotron pageName={pageName} location={this.props.location}/>
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ContentTitle icon="cog" title="Edit User"/>
                                        <Load/>
                                </div>
                            </div>
                        </Content>
                    </div>
                </Authorizer>
            );
        }else {
            console.log("rendering content");
            return (
                <Authorizer permissions="can_administrate">
                    <div className="page-service-instance">
                        <Jumbotron pageName={pageName} location={this.props.location}/>
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <UserFormEdit myUser={this.state.myUser}/>
                                </div>
                            </div>
                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default UserEdit;
