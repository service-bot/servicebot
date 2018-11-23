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

class BillingHistoryList extends React.Component {

    constructor(props){
        super(props);
        let action = '/own';
        if(isAuthorized({permissions: "can_administrate"}) && this.props.uid){
            action = `?key=user_id&value=${this.props.uid}`
        }
        this.state = {
            url: `/api/v1/invoices${action}`,
            refundModal: false
        };

        this.openRefundModal = this.openRefundModal.bind(this);
        this.closeRefundModal = this.closeRefundModal.bind(this);
        this.rowActionsFormatter = this.rowActionsFormatter.bind(this);
        this.openRefundModal = this.openRefundModal.bind(this);
        this.fetchData = this.fetchData.bind(this);
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
        this.fetchData();
    }

    modInvoiceId(data, resObj){
        return(
            <Link to={`/billing-history/invoice/${resObj.id}`}>{resObj.invoice_id}</Link>
        );
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
                        action: () => {browserHistory.push(`/billing-history/invoice/${row.id}`)},
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

    openRefundModal(dataObject){
        this.setState({refundModal: true, invoice:dataObject});
    }
    closeRefundModal(){
        this.setState({refundModal: false});
    }

    render () {
        let { rows, refundModal, invoice } = this.state;

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
                    <TableHeaderColumn isKey dataField='id' dataSort={ true } width={`200px`}>ID</TableHeaderColumn>
                    <TableHeaderColumn dataField='invoice_id' dataSort={ true } dataFormat={this.modInvoiceId} width={`200px`}>Invoice ID</TableHeaderColumn>
                    <TableHeaderColumn dataField='amount_due' dataSort={ true } dataFormat={this.modAmountDue} width={`200px`}>Amount Due</TableHeaderColumn>
                    <TableHeaderColumn dataField='date' dataSort={ true } dataFormat={this.modDate} width={`200px`}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataField='closed' dataSort={ true } dataFormat={this.modSubject} width={`200px`}>Closed</TableHeaderColumn>
                    <TableHeaderColumn dataField='paid' dataSort={ true } dataFormat={this.modSubject} width={`200px`}>Paid</TableHeaderColumn>
                    <TableHeaderColumn dataField='Actions'
                                       className={'action-column-header'}
                                       columnClassName={'action-column'}
                                       dataFormat={ this.rowActionsFormatter }
                                       searchable={false}
                                       width={`100px`}>Actions</TableHeaderColumn>
                </ServiceBotTableBase>
                {currentModal()}
            </React.Fragment>
        );
    }
}

export default BillingHistoryList;
