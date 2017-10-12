import React from 'react';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Fetcher from "../utilities/fetcher.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import UserFormEdit from "../elements/forms/user-form-edit.jsx";

class UserEdit extends React.Component {

    constructor(props){
        super(props);
        this.state = {myUser:false, url:`/api/v1/users/${this.props.params.userId}`};

        this.fetchUser = this.fetchUser.bind(this);
    }

    componentDidMount(){
        if(!isAuthorized({permissions: ["can_administrate", "can_manage"]})){
            return browserHistory.push("/login");
        }else{
            this.fetchUser();
        }
    }

    fetchUser(){
        let self = this;
        Fetcher(self.state.url).then(function (response) {
            if(!response.error){
                self.setState({loading: false, myUser: response});
            }else{
                self.setState({loading: false});
            }
        }).catch(function(err){
            browserHistory.push("/");
        })
    }

    render () {
        let pageName = this.props.route.name;

        if(this.state.loading){
            return(
                <Authorizer permissions="can_administrate">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
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
            return (
                <Authorizer permissions="can_administrate">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
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
