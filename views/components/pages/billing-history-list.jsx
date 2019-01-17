import React from 'react';
import {Link, browserHistory} from 'react-router';
import DataTable from "../elements/datatable/datatable.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import {Price} from "../utilities/price.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {isAuthorized} from "../utilities/authorizer.jsx";
import ModalRefund from "../elements/modals/modal-refund.jsx";
import Dropdown from "../elements/dropdown.jsx";
import {TableHeaderColumn} from 'react-bootstrap-table';
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import Fetcher from '../utilities/fetcher.jsx';
import CustomerInvoice from "./billing-history-modal.jsx";

class BillingHistoryList extends React.Component {

    constructor(props){
        super(props);
        let action = '/own';
        if(isAuthorized({permissions: "can_administrate"}) && this.props.uid){
            action = `?key=user_id&value=${this.props.uid}`
        }
        this.state = {
            url: `/api/v1/invoices${action}`,
            refundModal: false,
            invoiceToShow: null,
        };

        this.openRefundModal = this.openRefundModal.bind(this);
        this.closeRefundModal = this.closeRefundModal.bind(this);
        this.rowActionsFormatter = this.rowActionsFormatter.bind(this);
        this.openRefundModal = this.openRefundModal.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.openInvoiceModal = this.openInvoiceModal.bind(this);
        this.closeInvoiceModal = this.closeInvoiceModal.bind(this);
        this.modInvoiceId = this.modInvoiceId.bind(this);
        this.fetchUser = this.fetchUser.bind(this);
    }

    fetchUser(){
        let self = this;
        Fetcher(`/api/v1/users/${self.props.uid}`).then(function (response) {
            if(!response.error){
                self.setState({loading: false, user: response})
                console.log('user',self.state.user)
            }else{
                self.setState({loading: false})
            }
        }).catch(function(err){
            console.error('Failed to load user', err)
        })
    }

    fetchData() {
        let { url } = this.state;
        let self = this;

        Fetcher(url).then(function (response) {
            if (!response.error) {
                self.setState({rows: response});
            }
            self.setState({loading: false});
        });
    }

    componentDidMount() {
        this.fetchUser();
        this.fetchData();
    }

    modInvoiceId(data, resObj){
        let self = this;
        return <span role="button"
                     title={`view invoice`}
                     onClick={() => {self.openInvoiceModal(resObj)}}> {resObj.invoice_id} </span>
    }
    modAmountDue(data, resObj){
        return (
            <Price value={data} currency={resObj.currency}/>
        );
    }
    modDate(data){
        return (
            <DateFormat date={data}/>
        );
    }
    rowActionsFormatter(cell, row){
        let self = this;
        return (
            <Dropdown
                direction="right"
                dropdown={[
                    {
                        type: "button",
                        label: "View Invoice",
                        action: () => {self.openInvoiceModal(row)},
                    },
                    {
                        type: "button",
                        label: "View Service Page",
                        action: () => {browserHistory.push(`/service-instance/${row.service_instance_id}`)},
                    },
                    {
                        type: "divider"
                    },
                    {
                        type: "button",
                        label: "Make Refund",
                        action: () => {self.openRefundModal(row)}
                    },
                ].filter(option => {
                    if(option.label !== "Make Refund" || isAuthorized({permissions: "can_administrate"})){
                        return true;
                    }
                })}
            />
        );
    }
    openInvoiceModal(dataObject) {
        this.setState({invoiceToShow: dataObject});
    }
    openRefundModal(dataObject){
        this.setState({refundModal: true, invoice: dataObject});
    }
    closeInvoiceModal(){
        this.setState({invoiceToShow: null});
    }
    closeRefundModal(){
        this.setState({refundModal: false});
    }

    render () {
        let { rows, refundModal, invoice, invoiceToShow, user} = this.state;

        let currentModal = ()=> {
            if(refundModal){
                return(
                    <ModalRefund invoice={invoice} show={refundModal} hide={this.closeRefundModal}/>
                )
            }
        };

        return (
            <React.Fragment>
                <ContentTitle title="View all your invoices"/>
                {/* no ending slash for the api url */}
                <ServiceBotTableBase
                    rows={rows}
                    sortColumn="date"
                    sortOrder="desc">
                    <TableHeaderColumn isKey dataField='id' dataSort={ true } width={`100px`}>ID</TableHeaderColumn>
                    <TableHeaderColumn dataField='invoice_id' dataSort={ true } dataFormat={this.modInvoiceId} width={`300px`}>Invoice ID</TableHeaderColumn>
                    <TableHeaderColumn dataField='date' dataSort={ true } dataFormat={this.modDate} width={`200px`}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataField='amount_due' dataSort={ true } dataFormat={this.modAmountDue} width={`200px`}>Amount Due</TableHeaderColumn>
                    <TableHeaderColumn dataField='closed' dataSort={ true } dataFormat={this.modSubject} width={`100px`}>Closed</TableHeaderColumn>
                    <TableHeaderColumn dataField='paid' dataSort={ true } dataFormat={this.modSubject} width={`100px`}>Paid</TableHeaderColumn>
                    <TableHeaderColumn dataField='Actions'
                                       className={'action-column-header'}
                                       columnClassName={'action-column'}
                                       dataFormat={ this.rowActionsFormatter }
                                       searchable={false}
                                       width={`100px`}>Actions</TableHeaderColumn>
                </ServiceBotTableBase>
                {currentModal()}
                {invoiceToShow !== null && <CustomerInvoice
                    cancel={this.closeInvoiceModal}
                    user={user}
                    refund={this.openRefundModal}
                    invoice={invoiceToShow}/>}
            </React.Fragment>
        );
    }
}

export default BillingHistoryList;
