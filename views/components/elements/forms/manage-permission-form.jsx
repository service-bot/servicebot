import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import ContentTitle from "../../layouts/content-title.jsx"
import Buttons from "../buttons.jsx";
import Alerts from "../alerts.jsx";
let _ = require("lodash");

class RoleToggle extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            role: this.props.role,
            permission: this.props.permission,
            yes: this.props.checked
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e){
        if(e.currentTarget.checked){

            this.setState({yes: true});
            this.props.onChange({
                role: this.state.role,
                permission: this.state.permission,
                yes: true
            });
        }else{

            this.setState({yes: false});
            this.props.onChange({
                role: this.state.role,
                permission: this.state.permission,
                yes: false
            });
        }
    }

    render(){
        return(
            <input type="checkbox" onChange={this.handleChange} checked={this.state.yes}/>
        );
    }
}

class ManagePermissionForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            managePermissionsUrl: `/api/v1/roles/manage-permissions`,
            permissionMap: {},
            getPermissionsUrl: '/api/v1/permissions',
            permissions: {},
            getRolesUrl: '/api/v1/roles',
            roles: {},
            loading: true,
            success: false,
            changed: false,
            ajaxLoad: false
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.fetchManagePermissions = this.fetchManagePermissions.bind(this);
        this.fetchPermissions = this.fetchPermissions.bind(this);
        this.fetchRoles = this.fetchRoles.bind(this);
        this.getRolePermissions = this.getRolePermissions.bind(this);
        this.handleTogglePermission = this.handleTogglePermission.bind(this);
        this.savePermissions = this.savePermissions.bind(this);
    }

    componentDidMount(){
        this.fetchManagePermissions();
        this.fetchPermissions();
        this.fetchRoles();
    }

    fetchManagePermissions(){
        let self = this;
        Fetcher(self.state.managePermissionsUrl).then(function (response) {
            if(!response.error){
                self.setState({permissionMap: response});
            }else{
                self.setState({loading: false});
            }
        });
    }

    fetchPermissions(){
        let self = this;
        Fetcher(self.state.getPermissionsUrl).then(function (response) {
            if(!response.error){
                self.setState({permissions: response});
            }else{
                console.error("permissions response obj error", response);
                self.setState({loading: false});
            }
        });
    }

    fetchRoles(){
        let self = this;
        Fetcher(self.state.getRolesUrl).then(function (response) {
            if(!response.error){
                self.setState({loading: false, roles: response});
            }else{
                console.error("roles response obj error", response);
                self.setState({loading: false});
            }
        });
    }

    handleResponse(response){
        if(!response.error){
            this.setState({success: true});
        }
    }

    getRolePermissions(role_id){
        let self = this;
        let permissions = _.filter(self.state.permissionMap, function (role) {return (role.role_id == role_id)});
        return ( permissions[0].permission_ids );
    }

    handleTogglePermission(data){
        let self = this;
        let index = _.findIndex(self.state.permissionMap, function (role) { return role.role_id == data.role; });
        let currentPermissions = self.state.permissionMap[index].permission_ids;
        if(!data.yes){
            //removing permission from state
            let removePermissions = _.remove(currentPermissions, function (pid) { return (pid == data.permission); });
            let newPermissions = _.difference(currentPermissions, removePermissions);
            let newPermissionMap = self.state.permissionMap;
            newPermissionMap[index].permission_ids = newPermissions;
            self.setState({changed: true, permissionMap: newPermissionMap});
        }else{
            //adding permission to state
            let newPermissions = _.concat(currentPermissions, data.permission);
            let newPermissionMap = self.state.permissionMap;
            newPermissionMap[index].permission_ids = newPermissions;
            self.setState({changed: true, permissionMap: newPermissionMap});
        }
    }

    savePermissions(){
        let self = this;
        self.setState({ajaxLoad: true});
        Fetcher(self.state.managePermissionsUrl, 'POST', self.state.permissionMap).then(function (response) {
            if(!response.error){
                self.setState({success: true, ajaxLoad: false});
            }else{
                self.setState({ajaxLoad: false});
            }
        });
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else{
            let roles = this.state.roles;
            let permissions = this.state.permissions;
            let permissionMap = this.state.managePermissions;

            let renderRoles = ()=>{
                return (roles.map((role)=>
                        <th key={`role-${role.id}`} className={`capitalize role-${role.id}`}>{role.role_name}</th>));
            };

            let renderPermissions = ()=>{
                return (permissions.map((permission)=>
                    <tr key={`permission-${permission.id}`} className={`permission-${permission.id}`}>
                        <td className={`capitalize permission-${permission.id}`}>{permission.permission_name.replace(/_/g, ' ')}</td>
                        {roles.map((role)=>
                            <td key={`role${role.id}-permission${permission.id}`} className={`role${role.id}-permission${permission.id}`}>
                                {_.indexOf(this.getRolePermissions(role.id), permission.id) > -1 ?
                                    <RoleToggle role={role.id} permission={permission.id} onChange={this.handleTogglePermission} checked={true}/>:
                                    <RoleToggle role={role.id} permission={permission.id} onChange={this.handleTogglePermission} checked={false}/>
                                }
                            </td>
                        )}
                    </tr>));
            };

            return (
                <div className="col-xs-12">
                    <ContentTitle icon="cog" title="Manage all your permissions here"/>

                    <table className="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>Permissions</th>
                                {renderRoles()}
                            </tr>
                        </thead>
                        <tbody>
                            {renderPermissions()}
                        </tbody>
                    </table>
                    <Buttons btnType="primary" text="Save Permissions" onClick={this.savePermissions}
                             disabled={!this.state.changed} success={this.state.success} loading={this.state.ajaxLoad}/>
                </div>
            );
        }
    }
}

export default ManagePermissionForm;
