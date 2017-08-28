import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Load from "../utilities/load.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import DataTable from "../elements/datatable/datatable.jsx";
import Dropdown from "../elements/datatable/datatable-dropdown.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import DateFormat from "../utilities/date-format.jsx";
import ModalAddCategory from "../elements/modals/modal-add-category.jsx";
import ModalDeleteCategory from "../elements/modals/modal-delete-category.jsx";
import {BootstrapTable, TableHeaderColumn, SearchField} from 'react-bootstrap-table';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import Fetcher from '../utilities/fetcher.jsx';
import {ServiceBotTableSearch, ServiceBotTableSearchResetButton} from '../elements/bootstrap-tables/servicebot-table-search.jsx';
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';

class ManageCategories2 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            openAddCategoryModal: false,
            openDeleteCategoryModal: false,
            currentDataObject: {},
            lastFetch: Date.now(),
            loading: true,
            advancedFilter: null,
        };

        this.openAddCategoryModal = this.openAddCategoryModal.bind(this);
        this.closeAddCategoryModal = this.closeAddCategoryModal.bind(this);
        this.openEditCategoryModal = this.openEditCategoryModal.bind(this);
        this.closeEditCategoryModal = this.closeEditCategoryModal.bind(this);
        this.openDeleteCategoryModal = this.openDeleteCategoryModal.bind(this);
        this.closeDeleteCategoryModal = this.closeDeleteCategoryModal.bind(this);
        this.fetchData = this.fetchData.bind(this);
        this.rowActionsFormatter = this.rowActionsFormatter.bind(this);
    }

    componentDidMount() {
        if (!isAuthorized({permissions: "can_administrate"})) {
            return browserHistory.push("/login");
        }
        this.fetchData();
    }

    fetchData() {
        let self = this;
        let url = '/api/v1/service-categories';
        //todo: Can refactgor to reuse a fetch function as for the search
        Fetcher(url).then(function (response) {
            console.log("response", response);
            if (!response.error) {
                self.setState({rows: response});
            }
            self.setState({loading: false});
            console.log(self.state);
        });
    }

    openAddCategoryModal() {
        console.log("abs");
        this.setState({openAddCategoryModal: true,});
    }

    closeAddCategoryModal() {
        this.setState({openAddCategoryModal: false});
    }

    openEditCategoryModal(row) {
        console.log(row);
        let self = this;

        self.setState({openEditCategoryModal: true, currentDataObject: row});
    }

    closeEditCategoryModal() {
        this.fetchData();
        this.setState({openEditCategoryModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openDeleteCategoryModal(dataObject) {
        let self = this;
        return function (e) {
            e.preventDefault();
            console.log("dataobject", dataObject);
            self.setState({openDeleteCategoryModal: true, currentDataObject: dataObject});
        }
    }

    closeDeleteCategoryModal() {
        this.setState({openDeleteCategoryModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    priceFormatter(cell, row) {
        return <DateFormat date={cell} time/>;
    }

    rowActionsFormatter(cell, row) {
        let self = this;
        return (
            <button className="btn btn-rounded btn-default" onClick={() => {
                self.openEditCategoryModal(row)
            }}>Edit</button>
        )
    }

    render() {
        let pageName = this.props.route.name;

        let renderModals = () => {
            if (this.state.openAddCategoryModal) {
                return (
                    <ModalAddCategory show={this.state.openAddCategoryModal} hide={this.closeAddCategoryModal}/>
                )
            }
            if (this.state.openEditCategoryModal) {
                return (
                    <ModalAddCategory id={this.state.currentDataObject.id} show={this.state.openEditCategoryModal}
                                      hide={this.closeEditCategoryModal}/>
                )
            }
            if (this.state.openDeleteCategoryModal) {
                return (
                    <ModalDeleteCategory id={this.state.currentDataObject.id} show={this.state.openDeleteCategoryModal}
                                         hide={this.closeDeleteCategoryModal}/>
                )
            }
        };

        if (this.state.loading) {
            return ( <Load/> );
        } else {

            return (
                <Authorizer permissions="can_administrate">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ServiceBotTableBase
                                        tableTitle="Manage Products / Services"
                                        rows={this.state.rows}
                                        createItem={this.openAddCategoryModal}
                                    >
                                        <TableHeaderColumn isKey
                                                           dataField='id'
                                                           dataSort={ true }
                                                           width= {100} >
                                            ID
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='name'
                                                           dataSort={ true }
                                                           width= {300}>
                                            Name
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataSort={ true }
                                                           dataField='description'>
                                            Description
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataSort={ true }
                                                           dataField='created_at'
                                                           dataFormat={ this.priceFormatter }
                                                           width= {350}>
                                            Created At
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='Actions'
                                                           dataFormat={ this.rowActionsFormatter }
                                                           width= {130}
                                                           filter={false}>
                                            Actions
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

export default ManageCategories2;
