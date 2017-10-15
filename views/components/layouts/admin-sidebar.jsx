import React from 'react';
import {Link, browserHistory} from 'react-router';
import _ from "lodash";
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import SystemSettingsForm from '../elements/forms/system-settings-form.jsx';

class AdminEditingGear extends React.Component {

    constructor(props){
        super(props);
    }

    render(){
        let {toggle, name} = this.props

        if(isAuthorized({permissions: ["can_administrate"]})) {
            return (
                <div className="admin-editing-gear">
                <span onClick={toggle}>
                    {name && <span>{name}</span>}
                    <i className="fa fa-gear"/>
                </span>
                </div>
            );
        }else{
            return (
                <span/>
            )
        }
    }

}

class AdminEditingSidebar extends React.Component {

    constructor(props){
        super(props);
    }

    render(){

        return (
            <div className="admin-editing-sidebar bar-mode">
                <div className="sidebar-section heading">
                    <h4>Editing Site</h4>
                    <span className="close-editing-sidebar" onClick={this.props.toggle}><i className="fa fa-close"/></span>
                </div>
                <div className="sidebar-section">
                    <SystemSettingsForm filter={this.props.filter}/>
                    <div className="clearfix"/>
                </div>
                {this.props.children}
            </div>
        );
    }
}

export {AdminEditingGear, AdminEditingSidebar};



