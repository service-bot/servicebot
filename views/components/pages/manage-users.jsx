import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import DataTable from "../elements/datatable/datatable.jsx";
import Dropdown from "../elements/datatable/datatable-dropdown.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import DateFormat from "../utilities/date-format.jsx";
import ModalInviteUser from "../elements/modals/modal-invite-user.jsx";
import ModalSuspendUser from "../elements/modals/modal-suspend-user.jsx";
import ModalDeleteUser from "../elements/modals/modal-delete-user.jsx";
import ModalAddFund from "../elements/modals/modal-add-fund.jsx";
import ModalEditUserRole from "../elements/modals/modal-edit-user-role.jsx";

class ManageUsers extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            openInviteUserModal: false,
            openSuspendUserModal: false,
            openDeleteUserModal: false,
            openEditRole: false,
            currentDataObject: {},
            lastFetch: Date.now()
        };

        this.openInviteUserModal = this.openInviteUserModal.bind(this);
        this.closeInviteUserModal = this.closeInviteUserModal.bind(this);
        this.openSuspendUser = this.openSuspendUser.bind(this);
        this.closeSuspendUser = this.closeSuspendUser.bind(this);
        this.openDeleteUser = this.openDeleteUser.bind(this);
        this.closeDeleteUser = this.closeDeleteUser.bind(this);
        this.openEditCreditCard = this.openEditCreditCard.bind(this);
        this.closeEditCreditCard = this.closeEditCreditCard.bind(this);
        this.openEditRole = this.openEditRole.bind(this);
        this.closeEditRole = this.closeEditRole.bind(this);
    }

    modID(data){
        return (
            <div className="badge badge-xs">
                <img className="img-circle" src={`/api/v1/users/${data}/avatar`} alt="..."/>
            </div>
        );
    }
    modName(data, dataObj){
        return (
            <Link to={`/manage-users/${dataObj.id}`}>{data}</Link>
        );
    }
    modLastLogin(data, dataObj){
        if(dataObj.last_login != null){
            return (
                <DateFormat time={true} date={dataObj.last_login}/>
            );
        }else{
            return 'Never';
        }
    }
    modCreatedAt(data, dataObj){
        return (
            <DateFormat date={dataObj.created_at} time={true}/>
        );
    }

    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }
    }

    openEditCreditCard(dataObject){
        let self = this;
        return function(e) {
            // console.log("clicked on unpub button", dataObject);
            e.preventDefault();
            self.setState({ openEditCreditCard: true, currentDataObject: dataObject });
        }
    }
    closeEditCreditCard(){
        this.setState({ openEditCreditCard: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openInviteUserModal(dataObject){
        let self = this;
        return function(e) {
            // console.log("clicked on unpub button", dataObject);
            e.preventDefault();
            self.setState({ openInviteUserModal: true, currentDataObject: dataObject });
        }
    }
    closeInviteUserModal(){
        this.setState({ openInviteUserModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    viewUser(dataObject){
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            browserHistory.push(`/manage-users/${dataObject.id}`);
        }
    }
    viewUserServices(dataObject){
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            browserHistory.push(`/manage-subscriptions/?uid=${dataObject.id}`);
        }
    }

    openSuspendUser(dataObject){
        let self = this;
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            self.setState({openSuspendUserModal: true, currentDataObject: dataObject});
        }
    }
    closeSuspendUser(){
        this.setState({openSuspendUserModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openEditRole(dataObject){
        let self = this;
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            self.setState({openEditRole: true, currentDataObject: dataObject});
        }
    }
    closeEditRole(){
        this.setState({openEditRole: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openDeleteUser(dataObject){
        let self = this;
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            self.setState({openDeleteUserModal: true, currentDataObject: dataObject});
        }
    }
    closeDeleteUser(){
        this.setState({openDeleteUserModal: false,  currentDataObject: {}, lastFetch: Date.now()});
    }


    render () {
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:pageName, link:null}];

        let getModals = ()=> {
            if(this.state.openInviteUserModal){
                return (
                    <ModalInviteUser show={this.state.openInviteUserModal} hide={this.closeInviteUserModal}/>
                )
            }
            if(this.state.openSuspendUserModal){
                return (
                    <ModalSuspendUser uid={this.state.currentDataObject.id} show={this.state.openSuspendUserModal} hide={this.closeSuspendUser}/>
                )
            }
            if(this.state.openDeleteUserModal){
                return (
                    <ModalDeleteUser uid={this.state.currentDataObject.id} show={this.state.openDeleteUserModal} hide={this.closeDeleteUser}/>
                )
            }
            if(this.state.openEditCreditCard){
                return (
                    <ModalAddFund uid={this.state.currentDataObject.id} user={this.state.currentDataObject} show={this.state.openDeleteUserModal} hide={this.closeEditCreditCard}/>
                )
            }
            if(this.state.openEditRole){
                return (
                    <ModalEditUserRole uid={this.state.currentDataObject.id} user={this.state.currentDataObject} show={this.state.openEditRole} hide={this.closeEditRole}/>
                )
            }
        };

        return(
            <Authorizer permissions="can_administrate">
                <Jumbotron pageName={pageName} location={this.props.location}/>
                <div className="page-service-instance">
                    <Content>
                        <ContentTitle icon="cog" title="Manage all your users here"/>
                        <Dropdown name="Actions"
                                  dropdown={[
                                      {id: 'invitenewuser', name: 'Invite New User', link: '#', onClick: this.openInviteUserModal}
                                  ]}/>
                        <DataTable get="/api/v1/users"
                                   col={['id', 'name', 'email', 'phone', 'references.user_roles.0.role_name', 'status', 'last_login', 'created_at']}
                                   colNames={['', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Last Login', 'Created At']}
                                   mod_id={this.modID}
                                   mod_name={this.modName}
                                   mod_last_login={this.modLastLogin}
                                   mod_created_at={this.modCreatedAt}
                                   lastFetch={this.state.lastFetch}
                                   dropdown={
                                       [{
                                           name:'Actions',
                                           direction: 'right',
                                           buttons:[
                                               {id: 1, name: 'Edit Credit Card', link: '#', onClick: this.openEditCreditCard},
                                               {id: 2, name: 'Edit User', link: '#', onClick: this.viewUser},
                                               {id: 3, name: 'Manage Services', link: '#', onClick: this.viewUserServices},
                                               {id: 4, name: 'divider'},
                                               {id: 5, name: 'Edit Role', link: '#', onClick: this.openEditRole},
                                               {id: 6, name: 'Suspend User', link: '#', onClick: this.openSuspendUser},
                                               {id: 7, name: 'Delete User', link: '#', onClick: this.openDeleteUser, style: {color: "#ff3535"}},
                                           ]}
                                       ]
                                   }
                        />
                        {getModals()}
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default ManageUsers;
