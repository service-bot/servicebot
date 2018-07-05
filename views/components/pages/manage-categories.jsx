import React from 'react';
import {browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Load from "../utilities/load.jsx";
import Fetcher from '../utilities/fetcher.jsx';
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import Dropdown from "../elements/dropdown.jsx";
import {getFormattedDate} from "../utilities/date-format.jsx";
import DateFormat from "../utilities/date-format.jsx";
import ModalAddCategory from "../elements/modals/modal-add-category.jsx";
import ModalDeleteCategory from "../elements/modals/modal-delete-category.jsx";
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';

class ManageCategories2 extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            openAddCategoryModal: false,
            openDeleteCategoryModal: false,
            rows: {},
            currentDataObject: {},
            lastFetch: Date.now(),
            loading: true,
            advancedFilter: null,
        };

        this.fetchData = this.fetchData.bind(this);
        this.rowActionsFormatter = this.rowActionsFormatter.bind(this);
        this.openAddCategoryModal = this.openAddCategoryModal.bind(this);
        this.closeAddCategoryModal = this.closeAddCategoryModal.bind(this);
        this.openEditCategoryModal = this.openEditCategoryModal.bind(this);
        this.closeEditCategoryModal = this.closeEditCategoryModal.bind(this);
        this.openDeleteCategoryModal = this.openDeleteCategoryModal.bind(this);
        this.closeDeleteCategoryModal = this.closeDeleteCategoryModal.bind(this);
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
        let url = '/api/v1/service-categories';
        Fetcher(url).then(function (response) {
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
    openAddCategoryModal() {
        this.setState({openAddCategoryModal: true,});
    }

    closeAddCategoryModal() {
        this.fetchData();
        this.setState({openAddCategoryModal: false});
    }

    openEditCategoryModal(row) {
        this.setState({openEditCategoryModal: true, currentDataObject: row});
    }

    closeEditCategoryModal() {
        this.fetchData();
        this.setState({openEditCategoryModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openDeleteCategoryModal(row) {
        this.setState({openDeleteCategoryModal: true, currentDataObject: row});
    }

    closeDeleteCategoryModal() {
        this.fetchData();
        this.setState({openDeleteCategoryModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    /**
     * Cell formatters
     * Formats each cell data by passing the function as the dataFormat prop in TableHeaderColumn
     */
    createdFormatter(cell, row) {
        return getFormattedDate(cell, {time: true});
    }

    rowActionsFormatter(cell, row) {
        let self = this;

        return (
            <Dropdown
                direction="right"
                dropdown={[
                    { type: "button", label: "Edit", action: () => {self.openEditCategoryModal(row)}, },
                    { type: "divider" },
                    { type: "button", label: "Delete", action: () => {self.openDeleteCategoryModal(row)}, },
                ]}
            />
        );
    }

    render() {
        let pageName = this.props.route.name;
        let subtitle = 'Categorize your offerings. Once a category is created, an offering can be placed on that category.';

        let renderModals = () => {
            if (this.state.openAddCategoryModal) {
                return (
                    <ModalAddCategory show={this.state.openAddCategoryModal}
                                      hide={this.closeAddCategoryModal}/>
                );
            }
            if (this.state.openEditCategoryModal) {
                return (
                    <ModalAddCategory id={this.state.currentDataObject.id}
                                      show={this.state.openEditCategoryModal}
                                      hide={this.closeEditCategoryModal}/>
                );
            }
            if (this.state.openDeleteCategoryModal) {
                return (
                    <ModalDeleteCategory id={this.state.currentDataObject.id}
                                         show={this.state.openDeleteCategoryModal}
                                         hide={this.closeDeleteCategoryModal}/>
                );
            }
        };

        if (this.state.loading) {
            return ( <Load/> );
        } else {

            return (
                <Authorizer permissions="can_administrate">
                    <Jumbotron pageName={pageName} subtitle={subtitle}/>
                    <div className="page-service-instance">
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ServiceBotTableBase
                                        rows={this.state.rows}
                                        createItemAction={this.openAddCategoryModal}
                                        createItemLabel={'Create Category'}
                                        fetchRows={this.fetchData}
                                    >
                                        <TableHeaderColumn isKey
                                                           dataField='name'
                                                           dataSort={ true }
                                                           width={350}>
                                            Category Name
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataSort={ true }
                                                           dataField='description'
                                                           width={300}>
                                            Description
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataSort={ true }
                                                           dataField='created_at'
                                                           filterFormatted
                                                           dataFormat={ this.createdFormatter }
                                                           searchable={false}
                                                           width={150}>
                                            Created
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='Actions'
                                                           className={'action-column-header'}
                                                           columnClassName={'action-column'}
                                                           dataFormat={ this.rowActionsFormatter }
                                                           searchable={false}
                                                           width={100}
                                                           filter={false}>
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
