import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Load from "../utilities/load.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import Dropdown from "../elements/dropdown.jsx";
import {Price, getBillingType} from "../utilities/price.jsx";
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import ModalRequestCancellation from "../elements/modals/modal-request-cancellation.jsx";
import ModalManageCancellation from "../elements/modals/modal-manage-cancellation.jsx";
import ModalDeleteInstance from "../elements/modals/modal-delete-instance.jsx";
import {getFormattedDate} from "../utilities/date-format.jsx";
import ReactTooltip from 'react-tooltip';
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
        this.paymentFormatter = this.paymentFormatter.bind(this);
    }

    componentDidMount() {
        if (!isAuthorized({permissions: "can_administrate"})) {
            return browserHistory.push("/login");
        }
        this.fetchAllUsers();
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
        });
    }

    /**
     * Fetches Other Data
     */
    fetchAllUsers(){
        let self = this;
        Fetcher('/api/v1/users').then((response) => {
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
    typeFormatter(cell, row){
        if(cell) {
            const label = { 'day': 'Daily', 'week': 'Weekly', 'month': 'Monthly', 'year': 'Yearly' };
            const formattedType = {
                'subscription': <span className="mc-badge"><i className="fa fa-circle micro-badge black" /> {label[cell]} </span>,
                'custom': <span className="mc-badge"><i className="fa fa-circle micro-badge grey" /> {getBillingType(row)}</span>,
                'one_time' : <span className="mc-badge"><i className="fa fa-circle micro-badge grey" /> {getBillingType(row)}</span>,
                'split' : <span className="mc-badge"><i className="fa fa-circle micro-badge grey" /> {getBillingType(row)}</span>
            };
            return formattedType[row.type] || <span className="mc-badge"><i className="fa fa-circle micro-badge grey" /> {getBillingType(row)}</span>;
        }
        return <span className="mc-badge"><i className="fa fa-circle micro-badge grey" />Missing</span>;
    }
    typeDataValue(cell){
        if(cell) {
            const label = { 'day': 'Daily', 'week': 'Weekly', 'month': 'Monthly', 'year': 'Yearly' };
            return label[cell];
        }
        return 'N/A';
    }
    statusDataValue(cell, row){
        let status = cell;
        if(status === 'running'){
            let currentDate = new Date();
            let trialEnd = new Date(row.trial_end * 1000);
            if(currentDate < trialEnd)
                status = 'trialing';
            else
                status = 'active';
        } else if(status === 'cancellation_pending') {
            status = 'cancel pending';
        }
        return status;
    }
    amountFormatter(cell, row){
        if(cell >= 0) {
            return <Price value={cell} currency={row.currency}/>;
        } else {
            return <span className="status-badge red">No Plan</span>;
        }
    }
    statusFormatter(cell, row){
        switch (cell) {
            case 'requested':
                return ( <span className='status-badge yellow' >Requested</span> );
            case 'running':
                //Get trial detail
                let color = 'status-badge green';
                let str = 'Active';
                let currentDate = new Date();
                let trialEnd = new Date(row.trial_end * 1000);
                //Service is trialing if the expiration is after current date
                if(currentDate < trialEnd) {
                    str = 'Trialing';
                    color = 'status-badge blue';
                }
                return ( <span className={color} >{str}</span> );
            case 'waiting_cancellation':
                return ( <span className='status-badge yellow' >Waiting Cancellation</span> );
            case 'cancellation_pending':
                return ( <span className='status-badge yellow' >Cancel Pending</span> );
            case 'cancelled':
                return ( <span className='status-badge grey' >Cancelled</span> );
            default:
                return ( <span className='status-badge grey' >{cell}</span> );
        }
    }
    paymentFormatter(cell) {
        const formattedPayment = {
            'failed': <React.Fragment>
                        <span data-tip='Payment Failed' data-for='valid-card' className='status-badge yellow' >
                            <i className="fa fa-credit-card"/><i className="fa fa-flag"/>
                            <ReactTooltip id="flagged-card" aria-haspopup='true' delayShow={100} role='date' place="left" effect="solid"/>
                        </span>
                      </React.Fragment>,
            'paying': <React.Fragment>
                        <span data-tip='Paying - Valid Card' data-for='valid-card' className='status-badge green'>
                            <i className="fa fa-credit-card"/> <i className="fa fa-check"/>
                            <ReactTooltip id="valid-card" aria-haspopup='true' delayShow={100} role='date' place="left" effect="solid"/>
                        </span>
                      </React.Fragment>,
            'no payment': <span className='status-badge grey'><i className="fa fa-times m-0"/></span>
        };
        return formattedPayment[cell];
    }

    createdFormatter(cell, row){
        let fullTime = `${getFormattedDate(cell, {time: true})} - Created: ${getFormattedDate(row.created_at, {time: true})}`;
        return (<div className="datatable-date">
            <span data-tip={fullTime} data-for='date-updated'>{getFormattedDate(cell)}</span>
            <ReactTooltip id="date-updated" aria-haspopup='true' delayShow={200}
                          role='date' place="left" effect="solid"/>
        </div>);
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
        // console.log('dropdown',dataObject);
        let status = dataObject.status;
        const statusString = _.toLower(status);
        if(statusString === "waiting_cancellation"){
            console.log('waiting_cancellation stuff', dataObject);
            return "Manage Cancellation";
        }else if(statusString === "cancelled" || !dataObject.payment_plan) {
            console.log('cancelled stuff', dataObject);
            return "Delete Service";
        }else if(statusString === 'running'){
            console.log('running stuff', dataObject);
            return "Cancel Service";
        }else {
            return "Cancel Service";
        }
    }

    render () {
        let self = this;
        let {loading, rows, allUsers, currentDataObject, currentDataObject: {status, payment_plan}, actionModal} = this.state;

        if(!payment_plan){
            status = 'cancelled';
        }

        const getPaymentData = (row, users) => {
            let user = _.find(users, function (user) {
                return user.id === row.user_id;
            });
            if (user.references.funds.length) {
                if (user.status === 'flagged')
                    return 'failed';
                else
                    return 'paying';
            }
            return 'no payment';
        };

        let extractedData = [];
        console.log({rows});

        _.mapValues(rows, row => {
            extractedData = [...extractedData, {
                id: _.get(row, 'id'),
                name: _.get(row, 'name'),
                email: _.get(row, 'references.users[0].email'),
                user_id: _.get(row, 'user_id'),
                subscribed_to: _.get(row, 'name'),
                price: _.get(row, 'payment_plan.amount'),
                currency: _.get(row, 'currency.amount'),
                interval: _.get(row, 'payment_plan.interval'),
                type: _.get(row, 'references.payment_structure_templates[0].type'),
                status: _.get(row, 'status'),
                payment: getPaymentData(row, allUsers),
                payment_plan: _.get(row, 'payment_plan'),
                updated_at: _.get(row, 'updated_at'),
                created_at: _.get(row, 'created_at'),
            }];
        });

        if (loading)
            return <Load/>;
        else
            return <Authorizer permissions={["can_administrate", "can_manage"]}>
                        <div className="page __manage-subscriptions">
                            <Content>
                                <ContentTitle title={'Manage Subscription'}/>
                                <ServiceBotTableBase
                                    rows={extractedData}
                                    fetchRows={this.fetchData}
                                    sortColumn="updated_at"
                                    sortOrder="desc" >
                                    <TableHeaderColumn isKey
                                                       dataField='email'
                                                       dataFormat={(cell, row)=>{return <Link to={`/service-instance/${row.id}`}>{cell}</Link>}}
                                                       dataSort={true}
                                                       searchable={true}
                                                       width='150'> Customer </TableHeaderColumn>
                                    <TableHeaderColumn dataField='subscribed_to'
                                                       dataSort={true}
                                                       width='130'> Subscribed to </TableHeaderColumn>
                                    <TableHeaderColumn dataField='price'
                                                       dataFormat={this.amountFormatter}
                                                       dataSort={true}
                                                       width='80'> Price </TableHeaderColumn>
                                    <TableHeaderColumn dataField='interval'
                                                       dataFormat={this.typeFormatter}
                                                       dataSort={true}
                                                       filterValue={this.typeDataValue}
                                                       width='100'> Type </TableHeaderColumn>
                                    <TableHeaderColumn dataField='status'
                                                       dataFormat={this.statusFormatter}
                                                       dataSort={true}
                                                       filterValue={this.statusDataValue}
                                                       width='100'> Status </TableHeaderColumn>
                                    <TableHeaderColumn dataField='payment'
                                                       dataFormat={this.paymentFormatter}
                                                       dataSort={true}
                                                       width='100'> Payment </TableHeaderColumn>
                                    <TableHeaderColumn dataField='updated_at'
                                                       dataFormat={this.createdFormatter}
                                                       dataSort={true}
                                                       searchable={false}
                                                       width='140'> Updated </TableHeaderColumn>
                                    <TableHeaderColumn dataField='Actions'
                                                       className={'action-column-header'}
                                                       columnClassName={'action-column'}
                                                       dataFormat={this.rowActionsFormatter}
                                                       width='80'
                                                       searchable={false}
                                                       export={ false } />
                                </ServiceBotTableBase>

                                { actionModal && status === 'waiting_cancellation' &&
                                    <ModalManageCancellation myInstance={currentDataObject}
                                                             show={actionModal}
                                                             hide={self.onCloseActionModal}/> }
                                { actionModal && status === 'cancelled' &&
                                    <ModalDeleteInstance myInstance={currentDataObject}
                                                         show={actionModal}
                                                         hide={self.onCloseActionModal}/> }
                                { actionModal && status === 'running' &&
                                    <ModalRequestCancellation myInstance={currentDataObject}
                                                              show={actionModal}
                                                              hide={self.onCloseActionModal}/> }
                            </Content>
                        </div>
                    </Authorizer>;
    }
}

export default ManageSubscriptions;
