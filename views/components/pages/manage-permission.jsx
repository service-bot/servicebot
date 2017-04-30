import React from 'react';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ManagePermissionForm from '../elements/forms/manage-permission-form.jsx';

class ManagePermission extends React.Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        if(!isAuthorized({permissions: "can_administrate"})){
            return browserHistory.push("/login");
        }

    }

    render () {
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:pageName, link:null}];
        return(
            <Authorizer permissions="can_administrate">
                <div className="page-service-instance">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <Content>
                        <div className="row m-b-20">
                            <ManagePermissionForm />
                        </div>
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default ManagePermission;
