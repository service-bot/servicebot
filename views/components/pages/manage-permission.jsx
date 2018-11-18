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
        if(!isAuthorized({permissions: ["can_administrate", "can_manage"]})){
            return browserHistory.push("/login");
        }

    }

    render () {
        if(isAuthorized({permissions: ["can_administrate"]})){
            return(
                <div className="page __manage-permission">
                    <Content>
                        <div className="servicebot-table-base">
                            <ManagePermissionForm />
                        </div>
                    </Content>
                </div>
            );
        }else if(isAuthorized({permissions: ["can_manage"]})){
            return(
                <div className="page __manage-permission">
                    <Content>
                        <p>This feature is turned off for this demo.</p>
                    </Content>
                </div>
            );
        }else{
            return(
                <div className="page __manage-permission">
                    <Content>
                        <p>Unauthorized</p>
                    </Content>
                </div>
            )
        }
    }
}

export default ManagePermission;
