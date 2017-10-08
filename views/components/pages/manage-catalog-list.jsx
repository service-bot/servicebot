import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Load from "../utilities/load.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import Dropdown from "../elements/dropdown.jsx";
import {Price, serviceTypeFormatter} from "../utilities/price.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import ModalPublishingTemplate from "../elements/modals/modal-publishing-template.jsx";
import ModalDeleteTemplate from "../elements/modals/modal-delete-template.jsx";

class ManageCatalogList extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            publishingModal: false,
            deleteModal: false,
            rows: {},
            currentDataObject: {},
            lastFetch: Date.now(),
            loading: true,
            advancedFilter: null,
        };

        this.fetchData = this.fetchData.bind(this);
        this.onOpenPublishingModal = this.onOpenPublishingModal.bind(this);
        this.onClosePublishingModal = this.onClosePublishingModal.bind(this);
        this.onOpenDeleteModal = this.onOpenDeleteModal.bind(this);
        this.onCloseDeleteModal = this.onCloseDeleteModal.bind(this);
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
        let url = '/api/v1/service-templates';
        Fetcher(url).then(function (response) {
            if (!response.error) {
                self.setState({rows: response});
                console.log("my api data", self.state.rows);
            }
            self.setState({loading: false});
        });
    }

    /**
     * Modal Controls
     * Open and close modals by setting the state for rendering the modals,
     */
    onOpenPublishingModal(row){
        this.setState({publishingModal: true, currentDataObject: row});
    }
    onClosePublishingModal(){
        this.fetchData();
        this.setState({publishingModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }
    onOpenDeleteModal(row){
        this.setState({deleteModal: true, currentDataObject: row});
    }
    onCloseDeleteModal(){
        this.fetchData();
        this.setState({deleteModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    /**
     * Cell formatters
     * Formats each cell data by passing the function as the dataFormat prop in TableHeaderColumn
     */
    nameFormatter(cell, row){
        return ( <Link to={`/manage-catalog/${row.id}`}>{cell}</Link> );
    }
    priceFormatter(cell){
        return ( <Price value={cell}/> );
    }
    paymentTypeFormatter(cell, row){
        return ( serviceTypeFormatter(row) );
    }
    categoryFormatter(cell){
        return ( cell.service_categories[0].name );
    }
    publishedFormatter(cell){
        //Badge color
        let color_class = 'status-badge ';
        color_class += cell ? 'green' : 'red';
        return ( <span className={color_class} >{cell ? 'Published' : 'Unpublished'}</span> );
    }
    createdFormatter(cell){
        return ( <DateFormat date={cell}/> );
    }
    rowActionsFormatter(cell, row){
        let self = this;
        return (
            <Dropdown
                direction="right"
                dropdown={[
                    {
                        type: "button",
                        label: "Edit Item",
                        action: () => {browserHistory.push(`/manage-catalog/${row.id}`)},
                    },
                    {
                        type: "button",
                        label: "Duplicate Item",
                        action: () => {browserHistory.push(`/manage-catalog/${row.id}/duplicate`)},
                    },
                    {
                        type: "button",
                        label: "Request for User",
                        action: () => {browserHistory.push(`/service-catalog/${row.id}/request`)},
                    },
                    {
                        type: "divider"
                    },
                    {
                        type: "button",
                        label: row.published ? 'Unpublish Item' : 'Publish Item',
                        action: () => {self.onOpenPublishingModal(row)},
                    },
                    {
                        type: "button",
                        label: "Delete Item",
                        action: () => {self.onOpenDeleteModal(row)},
                    },
                ]}
            />
        );
    }

    render () {
        let pageName = this.props.route.name;
        let renderModals = ()=> {
            if (this.state.publishingModal) {
                return(
                    <ModalPublishingTemplate templateObject={this.state.currentDataObject}
                                             show={this.state.publishingModal}
                                             hide={this.onClosePublishingModal}/>
                );
            }
            if (this.state.deleteModal) {
                return(
                    <ModalDeleteTemplate templateObject={this.state.currentDataObject}
                                         show={this.state.deleteModal}
                                         hide={this.onCloseDeleteModal}/>
                );
            }
        };

        if (this.state.loading){
            return ( <Load/> );
        } else {
            return (
                <div className="row m-b-20">
                    <div className="col-xs-12">
                        <ServiceBotTableBase
                            rows={this.state.rows}
                            createItemAction={ () => {browserHistory.push('/manage-catalog/create')} }
                            createItemLabel={'Create Product / Service'}
                            fetchRows={this.fetchData}
                        >
                            <TableHeaderColumn isKey
                                               dataField='id'
                                               dataSort={ true }
                                               width={100}>
                                ID
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField='name'
                                               dataSort={ true }
                                               dataFormat={ this.nameFormatter }
                                               width={350}>
                                Product / Service Name
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField='amount'
                                               dataSort={ true }
                                               dataFormat={ this.priceFormatter }
                                               width={100}>
                                Pricing
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField='type'
                                               dataSort={ true }
                                               dataFormat={ this.paymentTypeFormatter }
                                               width={100}>
                                Type
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField='references'
                                               dataSort={ true }
                                               dataFormat={ this.categoryFormatter }
                                               width={200}>
                                Category
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField='published'
                                               dataSort={ true }
                                               dataFormat={ this.publishedFormatter }
                                               width={100}>
                                Category
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField='created_at'
                                               dataSort={ true }
                                               dataFormat={ this.createdFormatter }
                                               width={150}>
                                Created At
                            </TableHeaderColumn>
                            <TableHeaderColumn dataField='Actions'
                                               className={'action-column-header'}
                                               columnClassName={'action-column'}
                                               dataFormat={ this.rowActionsFormatter }
                                               width={100}
                                               filter={false}>
                            </TableHeaderColumn>
                        </ServiceBotTableBase>
                        {renderModals()}
                    </div>
                </div>
            );
        }
    }
}

export default ManageCatalogList;
