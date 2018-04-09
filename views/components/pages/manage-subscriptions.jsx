import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Load from "../utilities/load.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import Dropdown from "../elements/dropdown.jsx";
import {Price, getBillingType, getPriceValue} from "../utilities/price.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import ModalRequestCancellation from "../elements/modals/modal-request-cancellation.jsx";
import ModalManageCancellation from "../elements/modals/modal-manage-cancellation.jsx";
import ModalDeleteInstance from "../elements/modals/modal-delete-instance.jsx";
import getSymbolFromCurrency from 'currency-symbol-map';
let _ = require("lodash");

class ManageSubscriptions extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            actionModal: false,
            allUsers: {},
            rows: {},
            currentDataObject: {},
            lastFetch: Date.now(),
            loading: true,
            advancedFilter: null,
        };

        this.fetchAllUsers = this.fetchAllUsers.bind(this);
        this.dropdownStatusFormatter = this.dropdownStatusFormatter.bind(this);
        this.onOpenActionModal = this.onOpenActionModal.bind(this);
        this.onCloseActionModal = this.onCloseActionModal.bind(this);
        this.rowActionsFormatter = this.rowActionsFormatter.bind(this);
        this.requestedByFormatter = this.requestedByFormatter.bind(this);
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
        let { params, params: {status}, location: {query: {uid} } } = this.props;
        let url = '/api/v1/service-instances';
        if(this.props.params.status) {
            if (status === 'running') {
                url = '/api/v1/service-instances/search?key=status&value=running';
            } else if (status === 'requested') {
                url = '/api/v1/service-instances/search?key=status&value=requested';
            } else if (status === 'waiting_cancellation') {
                url = '/api/v1/service-instances/search?key=status&value=waiting_cancellation';
            }
        }
        if(uid) {
            url = `/api/v1/service-instances/search?key=user_id&value=${uid}`;
        }

        Fetcher(url).then(function (response) {
            if (!response.error) {
                self.setState({rows: response});
            }
        }).then(function (){
            self.fetchAllUsers();
        });
    }

    /**
     * Fetches Other Data
     */
    fetchAllUsers(){
        let self = this;
        Fetcher('/api/v1/users').then(function (response) {
            if(!response.error){
                self.setState({loading: false, allUsers: response});
            }else{
                self.setState({loading: false});
            }
        })
    }

    /**
     * Modal Controls
     * Open and close modals by setting the state for rendering the modals,
     */
    onOpenActionModal(dataObject){
        this.setState({actionModal: true, currentDataObject: dataObject});
    }
    onCloseActionModal(){
        this.fetchData();
        this.setState({actionModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    /**
     * Cell formatters
     * Formats each cell data by passing the function as the dataFormat prop in TableHeaderColumn
     */
    userIdFormatter(cell, row){
        return (
            <div className="badge badge-xs">
                <img className="img-circle" src={`/api/v1/users/${cell}/avatar`}/>
                <span className="customer-name">{row.references.users[0].name}</span>
            </div>
        );
    }
    nameFormatter(cell, row){
        return ( <Link to={`/service-instance/${row.id}`}><b>{cell}</b></Link> );
    }
    emailFormatter(cell, row){
        return (
            <div>
                <div className="badge badge-xs">
                    <img className="img-circle" src={`/api/v1/users/${row.user_id}/avatar`}/>
                </div>
                <span className="customer-email">&nbsp;&nbsp;{cell.users[0].email}</span>
            </div>
        );
    }
    typeFormatter(cell, row){
        //null check for the payment plan
        if(cell) {
            let interval = cell.interval;
            if(interval == 'day') { interval = 'Daily'; }
            else if (interval == 'week') { interval = 'Weekly'; }
            else if (interval == 'month') { interval = 'Monthly'; }
            else if (interval == 'year') { interval = 'Yearly'; }

            let type = row.type.toLowerCase();
            switch(type){
                case 'subscription':
                    //return ( <div><span className="status-badge neutral" >{getBillingType(row)}</span> <span className="status-badge black" >{interval}</span></div> );
                    return ( <div><span className="status-badge black" >{interval}</span></div> );
                case 'custom':
                    return ( <span className="status-badge neutral">{getBillingType(row)}</span> );
                case 'one_time':
                    return ( <span className="status-badge neutral">{getBillingType(row)}</span> );
                case 'split':
                    return ( <span className="status-badge neutral">{getBillingType(row)}</span> );
                default:
                    return ( <span className="status-badge grey">{getBillingType(row)}</span> );
            }
        } else {
            return ( <span className="status-badge grey">Missing</span> );
        }

    }
    typeDataValue(cell, row){
        if(cell) {
            return (row.type);
        } else {
            return 'N/A';
        }
    }
    amountFormatter(cell, row){
        if(cell) {
            let prefix = getSymbolFromCurrency(cell.currency);
            return (<Price value={cell.amount} prefix={prefix}/>);
        } else {
            return ( <span className="status-badge red">No Plan</span> );
        }
    }
    emailDataValue(cell){
        return cell.users[0].email;
    }
    statusFormatter(cell){
        switch (cell) {
            case 'requested':
                return ( <span className='status-badge blue' >Requested</span> );
            case 'running':
                return ( <span className='status-badge green' >Running</span> );
            case 'waiting_cancellation':
                return ( <span className='status-badge yellow' >Waiting Cancellation</span> );
            case 'cancelled':
                return ( <span className='status-badge grey' >Cancelled</span> );
            default:
                return ( <span className='status-badge grey' >{cell}</span> );
        }
    }
    createdFormatter(cell){
        return ( <DateFormat date={cell} time/> );
    }
    requestedByFormatter(cell){
        if(cell && cell != null){
            let user = _.find(this.state.allUsers, function (user) {
                return user.id == cell
            });
            if(user!= undefined){
                return user.name || user.email;
            }
            return cell;
        }
    }
    rowActionsFormatter(cell, row){
        let self = this;
        let status = row.status;
        let customAction = {
            type: "button",
            label: this.dropdownStatusFormatter(row),
            action: () => {self.onOpenActionModal(row)}
        };

        return (
            <Dropdown
                direction="right"
                dropdown={[
                    {   type: "button",
                        label: 'View',
                        action: () => { browserHistory.push(`/service-instance/${row.id}`) }},
                    {   type: "divider" },
                    {   type: "button",
                        label: 'View Invoice',
                        action: () => { browserHistory.push(`/billing-history/${row.user_id}`) }},
                    customAction,
                ]}
            />
        );
    }

    dropdownStatusFormatter(dataObject){
        let status = dataObject.status;
        const statusString = _.toLower(status);
        if(statusString === "waiting_cancellation"){
            return "Manage Cancellation";
        }else if(statusString === "cancelled" || !dataObject.payment_plan){
            return "Delete Service";
        }else {
            return "Cancel Service";
        }
    }

    render () {
        let self = this;
        let pageName = this.props.route.name;
        let pageTitle = 'Manage your services here';
        let subtitle = 'View, edit, and manage your subscriptions';

        if(this.props.params.status) {
            if (this.props.params.status == 'running') {
                pageName = 'Running Services';
                pageTitle = 'Manage your running services here.';
            } else if (this.props.params.status == 'requested') {
                pageName = 'Requested Services';
                pageTitle = 'Manage your requested services here.';
            } else if (this.props.params.status == 'waiting_cancellation') {
                pageName = 'Service Cancellations';
                pageTitle = 'Approve or deny service cancellations here.';
            }
        }
        if(_.has(this.props, 'location.query.uid')) {
            let uid = this.props.location.query.uid;
            pageName = `Services for user ${uid}`;
            pageTitle = `Manage user ${uid} services here.`;
        }

        let renderModals = ()=> {
            //change the status to cancelled if no payment plan is detected
            let status = self.state.currentDataObject.status;
            if(!self.state.currentDataObject.payment_plan){
                status = 'cancelled';
            }
            //Show the proper cancellation modal
            if(self.state.actionModal){
                switch (status){
                    case 'waiting_cancellation':
                        return(
                            <ModalManageCancellation myInstance={self.state.currentDataObject}
                                                     show={self.state.actionModal}
                                                     hide={self.onCloseActionModal}/>
                        );
                    case 'cancelled':
                        return(
                            <ModalDeleteInstance myInstance={self.state.currentDataObject}
                                                      show={self.state.actionModal}
                                                      hide={self.onCloseActionModal}/>
                        );
                    default:
                        return(
                            <ModalRequestCancellation myInstance={self.state.currentDataObject}
                                                      show={self.state.actionModal}
                                                      hide={self.onCloseActionModal}/>
                        );
                        console.error("Error in status", self.state.currentDataObject.status);
                        return(null);
                }
            }
        };

        if(this.state.loading){
            return ( <Load/> );
        }else {
            const qualityType = {
                0: 'good',
                1: 'bad',
                2: 'unknown'
            };
            return (
                <Authorizer permissions={["can_administrate", "can_manage"]}>
                    <Jumbotron pageName={pageName} subtitle={subtitle}/>
                    <div className="page-service-instance">
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ContentTitle icon="cog" title={pageTitle}/>
                                    <ServiceBotTableBase
                                        rows={this.state.rows}
                                        fetchRows={this.fetchData}
                                        sortColumn="updated_at"
                                        sortOrder="desc"
                                    >
                                        <TableHeaderColumn isKey
                                                           dataField='name'
                                                           dataFormat={this.nameFormatter}
                                                           dataSort={ true }
                                                           width='130'>
                                            Offering
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='references'
                                                           dataFormat={this.emailFormatter}
                                                           dataSort={ true }
                                                           filterValue={this.emailDataValue}
                                                           width='150'>
                                            Email
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='payment_plan'
                                                           dataFormat={this.amountFormatter}
                                                           dataSort={ true }
                                                           searchable={false}
                                                           width='80'>
                                            Amount
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='payment_plan'
                                                           dataFormat={this.typeFormatter}
                                                           dataSort={ true }
                                                           filterValue={this.typeDataValue}
                                                           width='100'>
                                            Type
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='status'
                                                           dataFormat={this.statusFormatter}
                                                           dataSort={ true }
                                                           width='100'>
                                            Status
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='updated_at'
                                                           dataFormat={this.createdFormatter}
                                                           dataSort={ true }
                                                           searchable={false}
                                                           width='140'>
                                            Updated
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='Actions'
                                                           className={'action-column-header'}
                                                           columnClassName={'action-column'}
                                                           dataFormat={ this.rowActionsFormatter }
                                                           width='80'
                                                           searchable={false}>
                                        </TableHeaderColumn>
                                    </ServiceBotTableBase>
                                </div>
                            </div>
                            {renderModals()}
                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default ManageSubscriptions;
