import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Load from "../utilities/load.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import Dropdown from "../elements/dropdown.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

import ModalInviteUser from "../elements/modals/modal-invite-user.jsx";
import ModalSuspendUser from "../elements/modals/modal-suspend-user.jsx";
import ModalUnsuspendUser from "../elements/modals/modal-unsuspend-user.jsx";
import ModalDeleteUser from "../elements/modals/modal-delete-user.jsx";
import ModalAddFund from "../elements/modals/modal-add-fund.jsx";
import ModalEditUserRole from "../elements/modals/modal-edit-user-role.jsx";
import Modal from '../utilities/modal.jsx';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';

let _ = require("lodash");

class ManageUsers extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            openInviteUserModal: false,
            openSuspendUserModal: false,
            openUnsuspendUserModal: false,
            openDeleteUserModal: false,
            openEditRole: false,
            openMessageModal: null,
            rows: {},
            currentDataObject: {},
            lastFetch: Date.now(),
            loading: true,
            advancedFilter: null,
            reinviteUser: null
        };

        this.openInviteUserModal = this.openInviteUserModal.bind(this);
        this.closeInviteUserModal = this.closeInviteUserModal.bind(this);
        this.openSuspendUser = this.openSuspendUser.bind(this);
        this.closeSuspendUser = this.closeSuspendUser.bind(this);
        this.closeUnsuspendUser = this.closeUnsuspendUser.bind(this);
        this.openDeleteUser = this.openDeleteUser.bind(this);
        this.closeDeleteUser = this.closeDeleteUser.bind(this);
        this.openEditCreditCard = this.openEditCreditCard.bind(this);
        this.closeEditCreditCard = this.closeEditCreditCard.bind(this);
        this.openEditRole = this.openEditRole.bind(this);
        this.closeEditRole = this.closeEditRole.bind(this);
        this.dropdownStatus = this.dropdownStatus.bind(this);
        this.openMessageModal = this.openMessageModal.bind(this);
        this.closeMessageModal = this.closeMessageModal.bind(this);
        this.rowActionsFormatter = this.rowActionsFormatter.bind(this);
    }

    componentDidMount() {
        if (!isAuthorized({permissions: "can_administrate"})) {
            return browserHistory.push("/login");
        }
        this.fetchData();
    }

    /**
     * Fetches Table Data
     * Sets the state with the fetched data for use in ServiceBotTableBase's props.row
     */
    fetchData() {
        let self = this;
        Fetcher('/api/v1/users').then(function (response) {
            if (!response.error) {
                self.setState({rows: response});
            }
            self.setState({loading: false});
        });
    }

    /**
     * Modal Controls
     * Open and close modals by setting the state for rendering the modals,
     */
    openEditCreditCard(dataObject){
        this.setState({ openEditCreditCard: true, currentDataObject: dataObject });
    }
    closeEditCreditCard(){
        this.fetchData();
        this.setState({ openEditCreditCard: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openInviteUserModal(userObject){
        this.setState({ openInviteUserModal: true, reinviteUser: userObject });
    }
    closeInviteUserModal(){
        this.fetchData();
        this.setState({ openInviteUserModal: false, currentDataObject: {}, reinviteUser: {}, lastFetch: Date.now()});
    }
    openSuspendUser(dataObject){
        if(dataObject.id == this.props.user.id){
            this.setState({
                openMessageModal: {
                    title: 'Alert!',
                    message: 'Suspending own user is not allowed!'
                }
            });
        }else {
            let status = dataObject.status;
            const statusString = _.toLower(status);
            if (statusString == "suspended") {
                this.setState({
                    openUnsuspendUserModal: true,
                    currentDataObject: dataObject,
                });
            } else {
                this.setState({
                    openSuspendUserModal: true,
                    currentDataObject: dataObject
                });
            }
        }
    }
    closeSuspendUser(){
        this.fetchData();
        this.setState({openSuspendUserModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    closeUnsuspendUser(){
        this.fetchData();
        this.setState({openUnsuspendUserModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }
    openEditRole(dataObject){
        let self = this;
        if(dataObject.id == self.props.user.id){
            self.setState({openMessageModal: {title: 'Alert!', message: 'Editing own role is not allowed!'}});
        }else {
            self.setState({openEditRole: true, currentDataObject: dataObject});
        }
    }
    closeEditRole(){
        this.fetchData();
        this.setState({openEditRole: false, currentDataObject: {}, lastFetch: Date.now()});
    }
    openDeleteUser(dataObject){
        if(dataObject.id == this.props.user.id){
            this.setState({openMessageModal: {title: 'Alert!', message: 'Deleting own user is not allowed!'}});
        }else {
            this.setState({openDeleteUserModal: true, currentDataObject: dataObject});
        }
    }
    closeDeleteUser(){
        this.fetchData();
        this.setState({openDeleteUserModal: false,  currentDataObject: {}, lastFetch: Date.now()});
    }
    openMessageModal(title, message){
        this.setState({openMessageModal: {title: title, message: message}});
    }
    closeMessageModal(){
        this.fetchData();
        this.setState({openMessageModal: null});
    }
    viewUser(dataObject){
        browserHistory.push(`/manage-users/${dataObject.id}`);
    }
    viewUserServices(dataObject){
        browserHistory.push(`/manage-subscriptions/?uid=${dataObject.id}`);
    }

    /**
     * Cell formatters
     * Formats each cell data by passing the function as the dataFormat prop in TableHeaderColumn
     */
    idFormatter(cell){
        return (
            <div className="badge badge-xs">
                <img className="img-circle" src={`/api/v1/users/${cell}/avatar`}/>
            </div>
        );
    }
    fundFormatter(cell) {
        //check if user has funds
        if(cell.funds.length > 0){
            return ( <span className="status-badge green" ><i className="fa fa-check" /></span> );
        } else {
            return ( <span className="status-badge red" ><i className="fa fa-times" /></span> );
        }
    }
    statusFormatter(cell, row) {
        let color = 'status-badge ';
        switch ( cell.toLowerCase() ) {
            case 'active':
                color += 'green'; break;
            case 'invited':
                color += 'blue'; break;
            case 'flagged':
                color += 'yellow'; break;
            case 'suspended':
                color += 'red'; break;
            default:
                color += 'grey';
        }
        //If the customer_id from Stripe doesn't exist, mark user as disconnected
        if(!row.customer_id) {
            return ( <span className="status-badge grey" >Disconnected</span> );
        } else {
            return ( <span className={color} >{cell}</span> );
        }

    }
    roleFormatter(cell){
        return ( cell.user_roles[0].role_name );
    }


    dropdownStatus(dataObject){
        let status = dataObject.status;
        const statusString = _.toLower(status);
        if(statusString == "suspended"){
            return "Activate User";
        }else{
            return "Suspend User";
        }
        return "Error";
    }
    lastLoginFormatter(cell, row){
        if(row.last_login != null){
            return (
                <DateFormat time={true} date={row.last_login}/>
            );
        }else{
            return 'Never';
        }
    }
    createdAtFormatter(cell, row){
        return (
            <DateFormat date={row.created_at} time={true}/>
        );
    }
    profileLinkFormatter(cell, row){
        return (
            <Link to={`/manage-users/${row.id}`}>{cell}</Link>
        );
    }
    rowActionsFormatter(cell, row){
        let self=this;
        let dropdownOptions = [
            {
                type: "button",
                label: 'Re-invite User',
                action: () => { return (this.openInviteUserModal(row)) }
            },
            {   type: "button",
                label: row.references.funds.length ? 'Edit Credit Card' : 'Add Credit Card',
                action: () => { return (this.openEditCreditCard(row)) }},
            {   type: "button",
                label: 'Edit User',
                action: () => { browserHistory.push(`/manage-users/${row.id}`) }},
            {   type: "button",
                label: 'Manage Services',
                action: () => { browserHistory.push(`/manage-subscriptions/?uid=${row.id}`) }},
            {   type: "divider" },
            {   type: "button",
                label: 'Edit Role',
                action: () => {
                    return (this.openEditRole(row)) }},
            {   type: "button",
                label: row.status !== 'suspended' ? 'Suspend User' : 'Unsuspend User',
                action: () => { return (this.openSuspendUser(row)) }},
            {   type: "button",
                label: 'Delete User',
                action: () => { return (this.openDeleteUser(row)) }}
        ].filter((option, index) => {
            if(!self.props.stripe_publishable_key && index === 0){
                return false;
            }
            if(self.props.user && self.props.user.id === row.id && (option.label === "Delete User" || option.label === "Edit Role" || option.label === "Suspend User")){
                return false
            }
            if(row.status === 'invited' && option.label === "Suspend User") {
                return false
            }
            if(option.label === "Re-invite User" && row.status !== 'invited') {
                return false
            }
            return true;
        });

        return (
            <Dropdown
                direction="right"
                dropdown={dropdownOptions}
            />
        );
    }

    render () {
        let pageName = this.props.route.name;
        let subtitle = 'View, invite, edit, and manage users';

        let getModals = ()=> {
            if(this.state.openInviteUserModal){
                if(this.state.reinviteUser) {
                    return (<ModalInviteUser show={this.state.openInviteUserModal} hide={this.closeInviteUserModal} reinviteUser={this.state.reinviteUser.email}/>);
                } else {
                    return (<ModalInviteUser show={this.state.openInviteUserModal} hide={this.closeInviteUserModal}/>);
                }
            }
            if(this.state.openSuspendUserModal){
                return (
                    <ModalSuspendUser
                        uid={this.state.currentDataObject.id}
                        show={this.state.openSuspendUserModal}
                        hide={this.closeSuspendUser}/>
                )
            }
            if(this.state.openUnsuspendUserModal){
                return (
                    <ModalUnsuspendUser
                        uid={this.state.currentDataObject.id}
                        show={this.state.openSuspendUserModal}
                        hide={this.closeUnsuspendUser}/>
                )
            }
            if(this.state.openDeleteUserModal){
                return (
                    <ModalDeleteUser
                        uid={this.state.currentDataObject.id}
                        show={this.state.openDeleteUserModal}
                        hide={this.closeDeleteUser}/>
                )
            }
            if(this.state.openEditCreditCard){
                return (
                    <ModalAddFund
                        uid={this.state.currentDataObject.id}
                        user={this.state.currentDataObject}
                        show={this.state.openDeleteUserModal}
                        hide={this.closeEditCreditCard}/>
                )
            }
            if(this.state.openEditRole){
                return (
                    <ModalEditUserRole
                        uid={this.state.currentDataObject.id}
                        user={this.state.currentDataObject}
                        show={this.state.openEditRole}
                        hide={this.closeEditRole}/>
                )
            }
            if(this.state.openMessageModal){
                return (
                    <Modal modalTitle={this.state.openMessageModal.title} hideCloseBtn={true} icon="fa-exclamation-triangle"
                           show={this.state.openMessageModal} hide={this.closeMessageModal} hideFooter={true}>
                        <div className="p-20">
                            <span>{this.state.openMessageModal.message}</span>
                        </div>
                    </Modal>
                )
            }
        };

        if( this.state.loading ){
            return ( <Load/> );
        }else {
            return (
                <Authorizer permissions="can_administrate">
                    <Jumbotron pageName={pageName} subtitle={subtitle}/>
                    <div className="page-service-instance">
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ContentTitle icon="cog" title="Manage all your users here"/>
                                    <ServiceBotTableBase
                                        createItemProps={!this.props.stripe_publishable_key && {disabled : true}}
                                        createItemAction={this.props.stripe_publishable_key ? this.openInviteUserModal : () => {}}
                                        createItemLabel={this.props.stripe_publishable_key ? "Invite user" : (<Link to="/stripe-settings" data-tip="Setup Incomplete - Click to finish">
                                            Invite User
                                            <ReactTooltip place="bottom" type="dark" effect="solid"/>
                                        </Link>)}
                                        rows={this.state.rows}
                                        fetchRows={this.fetchData}
                                        sortColumn="created_at"
                                        sortOrder="desc"
                                    >
                                        <TableHeaderColumn isKey
                                                           dataField='id'
                                                           dataFormat={this.idFormatter}
                                                           dataSort={ false }
                                                           searchable={false}
                                                           width='30'/>
                                        <TableHeaderColumn dataField='email'
                                                           dataFormat={this.profileLinkFormatter}
                                                           dataSort={ true }
                                                           width='150'>
                                            Email
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='name'
                                                           dataFormat={this.profileLinkFormatter}
                                                           dataSort={ true }
                                                           width='80'>
                                            name
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='status'
                                                           dataFormat={this.statusFormatter}
                                                           dataSort={ true }
                                                           width='80'>
                                            Status
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='references'
                                                           dataFormat={this.fundFormatter}
                                                           dataSort={ true }
                                                           width='80'>
                                            Fund?
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='references'
                                                           dataFormat={this.roleFormatter}
                                                           dataSort={ true }
                                                           filterValue={this.roleFormatter}
                                                           width='80'>
                                            Role
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='last_login'
                                                           dataFormat={this.lastLoginFormatter}
                                                           dataSort={ true }
                                                           searchable={false}
                                                           width='100'>
                                            Last Login
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='created_at'
                                                           dataFormat={this.createdAtFormatter}
                                                           dataSort={ true }
                                                           searchable={false}
                                                           width='100'>
                                            Created At
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='Actions'
                                                           className={'action-column-header'}
                                                           columnClassName={'action-column'}
                                                           dataFormat={ this.rowActionsFormatter }
                                                           searchable={false}
                                                           width='80'
                                                           filter={false}>
                                        </TableHeaderColumn>
                                    </ServiceBotTableBase>
                                </div>
                            </div>
                            {getModals()}
                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default connect(
    (state) => {
        return ( {user: state.user,
        stripe_publishable_key : state.options && state.options.stripe_publishable_key} );
    })(ManageUsers);
