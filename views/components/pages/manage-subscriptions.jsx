import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import DataTable from "../elements/datatable/datatable.jsx";
import ContentTitle from "../layouts/content-title.jsx"
import Fetcher from "../utilities/fetcher.jsx";
import Load from "../utilities/load.jsx";
import Price from "../utilities/price.jsx";
import DateFormat from "../utilities/date-format.jsx";
import ModalRequestCancellation from "../elements/modals/modal-request-cancellation.jsx";
import ModalManageCancellation from "../elements/modals/modal-manage-cancellation.jsx";
import ModalDeleteRequest from "../elements/modals/modal-delete-request.jsx";
import InfoToolTip from "../elements/tooltips/info-tooltip.jsx";
let _ = require("lodash");

class ManageSubscriptions extends React.Component {

    constructor(props){
        if(!isAuthorized({permissions:["can_administrate", "can_manage"]})){
            browserHistory.push("/my-services");
        }

        super(props);

        this.state = {
            loading: true,
            actionModal:false,
            currentDataObject: false,
            allUsers: {}
        };

        // console.log("my props params", this.props.params);
        this.fetchAllUsers = this.fetchAllUsers.bind(this);
        this.dropdownStatus = this.dropdownStatus.bind(this);
        this.modRequestedBy = this.modRequestedBy.bind(this);
        this.onOpenActionModal = this.onOpenActionModal.bind(this);
        this.onCloseActionModal = this.onCloseActionModal.bind(this);
    }

    dropdownStatus(dataObject){
        let status = dataObject.status;
        const statusString = _.toLower(status);
        if(statusString == "requested"){
            return "Delete Request";
        }else if(statusString == "running"){
            return "Cancel Service";
        }else if(statusString == "waiting_cancellation"){
            return "Manage Cancellation";
        }else if(statusString == "cancelled"){
            return "No Actions";
        }else if(statusString == "waiting"){
            return "No Actions";
        }
        return "Error";
    }

    modName(data, resObj){
        return (
            <Link to={`/service-instance/${resObj.id}`}>{data}</Link>
        );
    }
    modSubscriptionId(data){
        return (
            <InfoToolTip title={data} text="i" placement="left"/>
        );
    }
    modRequestedBy(data){
        if(data && data != null){
            let user = _.find(this.state.allUsers, function (user) {
                return user.id == data
            });
            if(user!= undefined){
                return user.name;
            }
            return data;
        }
        return data;
    }
    modAmount(data){
        return (
            <Price value={data}/>
        );
    }
    modCreated(data){
        // console.log("created data", data);
        return (
            <DateFormat date={data}/>
        );
    }
    modStatus(data){
        switch (data) {
            case 'requested':
                return 'Requested';
            case 'running':
                return 'Running';
            case 'waiting_cancellation':
                return 'Waiting Cancellation';
            case 'cancelled':
                return 'Cancelled';
            default:
                return data;
        }
    }
    modInterval(data){
        switch (data){
            case 'day':
                return 'Daily';
            case 'week':
                return 'Weekly';
            case 'month':
                return 'Monthly';
            case 'year':
                return 'Yearly';
            default:
                return data;
        }
    }
    modUserId(data){
        return (
            <div className="badge badge-xs">
                <img className="img-circle" src={`/api/v1/users/${data}/avatar`} alt="..."/>
            </div>
        );
    }

    onOpenActionModal(dataObject){
        let self = this;
        return function(e) {
            // console.log("clicked on unpub button", dataObject);
            e.preventDefault();
            self.setState({actionModal: true, currentDataObject: dataObject});
        }
    }
    onCloseActionModal(){
        this.setState({actionModal: false});
    }

    goToInvoices(dataObject){
        return function(e) {
            e.preventDefault();
            browserHistory.push(`/billing-history/${dataObject.user_id}`);
        }
    }

    fetchAllUsers(){
        let self = this;
        Fetcher('/api/v1/users').then(function (response) {
            if(!response.error){
                console.log('all users', response);
                self.setState({loading: false, allUsers: response});
            }else{
                self.setState({loading: false});
            }
        })
    }

    componentDidMount(){
        if(!isAuthorized({permissions: "can_administrate"})){
            return browserHistory.push("/login");
        }
        this.fetchAllUsers();
    }
    render () {
        let self = this;
        let pageName = this.props.route.name;
        let pageTitle = 'Manage your services here';
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:pageName, link:null}];
        let url = '/api/v1/service-instances';

        if(this.props.params.status) {
            if (this.props.params.status == 'running') {
                pageName = 'Running Services';
                pageTitle = 'Manage your running services here.';
                url = '/api/v1/service-instances/search?key=status&value=running';
            } else if (this.props.params.status == 'requested') {
                pageName = 'Requested Services';
                pageTitle = 'Manage your requested services here.';
                url = '/api/v1/service-instances/search?key=status&value=requested';
            } else if (this.props.params.status == 'waiting_cancellation') {
                pageName = 'Service Cancellations';
                pageTitle = 'Approve or deny service cancellations here.';
                url = '/api/v1/service-instances/search?key=status&value=waiting_cancellation';
            }
        }
        if(_.has(this.props, 'location.query.uid')) {
            let uid = this.props.location.query.uid;
            pageName = `Services for user ${uid}`;
            pageTitle = `Manage user ${uid} services here.`;
            url = `/api/v1/service-instances/search?key=user_id&value=${uid}`;
        }

        let currentModal = ()=> {
            if(self.state.actionModal){
                console.log("current instance", self.state.currentDataObject);
                switch (self.state.currentDataObject.status){
                    case 'requested':
                        return(
                            <ModalDeleteRequest myInstance={self.state.currentDataObject} show={self.state.actionModal} hide={self.onCloseActionModal}/>
                        );
                    case 'running':
                        return(
                            <ModalRequestCancellation myInstance={self.state.currentDataObject} show={self.state.actionModal} hide={self.onCloseActionModal}/>
                        );
                    case 'waiting_cancellation':
                        return(
                            <ModalManageCancellation myInstance={self.state.currentDataObject} show={self.state.actionModal} hide={self.onCloseActionModal}/>
                        );
                    case 'cancelled':
                        return(null);
                    default:
                        console.log("Error in status", self.state.currentDataObject.status);
                        return(null);
                }
            }
        };

        if(this.state.loading){
            return (<Load/>);
        }else {
            return (
                <Authorizer permissions={["can_administrate", "can_manage"]}>
                    <div className="page-service-instance">
                        <Jumbotron pageName={pageName} location={this.props.location}/>
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ContentTitle icon="cog" title={pageTitle}/>
                                    <DataTable parentState={this.state}
                                               get={url}
                                               col={['user_id', 'references.users.0.name', 'name', 'subscription_id', 'status', 'requested_by', 'payment_plan.amount', 'payment_plan.interval', 'created_at']}
                                               colNames={['', 'User', 'Instance', ' ', 'Status', 'Requested By', 'Amount', 'Interval', 'Created']}
                                               statusCol="status"
                                               mod_user_id={this.modUserId}
                                               mod_name={this.modName}
                                               mod_subscription_id={this.modSubscriptionId}
                                               mod_requested_by={this.modRequestedBy}
                                               mod_created_at={this.modCreated}
                                               mod_payment_plan-amount={this.modAmount}
                                               mod_status={this.modStatus}
                                               mod_payment_plan-interval={this.modInterval}
                                               dropdown={[{
                                                   name: 'Actions', direction: 'right', buttons: [
                                                       {id: 1, name: 'View', link: '/service-instance/:id'},
                                                       {id: 2, name: 'divider'},
                                                       {
                                                           id: 4,
                                                           name: 'View Invoices',
                                                           link: '#',
                                                           onClick: this.goToInvoices
                                                       },
                                                       {
                                                           id: 5,
                                                           name: this.dropdownStatus,
                                                           link: '#',
                                                           onClick: this.onOpenActionModal
                                                       }]
                                               }]}
                                    />
                                    {currentModal()}
                                </div>
                            </div>

                        </Content>
                    </div>
                </Authorizer>
            );
        }
    }
}

export default ManageSubscriptions;
