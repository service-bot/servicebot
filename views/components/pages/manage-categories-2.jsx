import React from 'react';
import {Link, browserHistory} from 'react-router';
import {Authorizer, isAuthorized} from "../utilities/authorizer.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import DataTable from "../elements/datatable/datatable.jsx";
import Dropdown from "../elements/datatable/datatable-dropdown.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import DateFormat from "../utilities/date-format.jsx";
import ModalAddCategory from "../elements/modals/modal-add-category.jsx";
import ModalDeleteCategory from "../elements/modals/modal-delete-category.jsx";
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';
import Fetcher from '../utilities/fetcher.jsx';

class ManageCategories2 extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            openAddCategoryModal: false,
            openDeleteCategoryModal: false,
            currentDataObject: {},
            lastFetch: Date.now(),
            loading: true
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

    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }

        this.fetchData();

    }

    openAddCategoryModal(dataObject){
        let self = this;
        return function(e) {
            // console.log("clicked on unpub button", dataObject);
            e.preventDefault();
            self.setState({ openAddCategoryModal: true, currentDataObject: dataObject });
        }
    }
    closeAddCategoryModal(){
        this.setState({ openAddCategoryModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openEditCategoryModal(row){
        console.log(row);
        let self = this;

        self.setState({ openEditCategoryModal: true, currentDataObject: row });
    }
    closeEditCategoryModal(){
        this.fetchData();
        this.setState({ openEditCategoryModal: false, currentDataObject: {}, lastFetch: Date.now()});
    }

    openDeleteCategoryModal(dataObject){
        let self = this;
        return function (e) {
            e.preventDefault();
            console.log("dataobject",dataObject);
            self.setState({openDeleteCategoryModal: true, currentDataObject: dataObject});
        }
    }
    closeDeleteCategoryModal(){
        this.setState({openDeleteCategoryModal: false,  currentDataObject: {}, lastFetch: Date.now()});
    }

    onAfterInsertRow(row) {
        alert('This will call an API to insert a row into the database');
    }

    afterSearch(searchText, result) {
        console.log('Your search text is ' + searchText);
        console.log('Result is:');
        for (let i = 0; i < result.length; i++) {
            console.log('Fruit: ' + result[i].id + ', ' + result[i].name + ', ' + result[i].price);
        }
    }
    onAfterDeleteRow(rowKeys) {
        alert('The rowkey you drop: ' + rowKeys);
    }
    customConfirm(next, dropRowKeys) {
        const dropRowKeysStr = dropRowKeys.join(',');
        if (confirm(`(It's a custom confirm)Are you sure you want to delete ${dropRowKeysStr}?`)) {
            // If the confirmation is true, call the function that
            // continues the deletion of the record.
            next();
        }
    }

    priceFormatter(cell, row) {
        return <DateFormat date={cell} time/>;
    }

    rowActionsFormatter(cell, row) {
        let self = this;
        return (
            <button onClick={()=>{self.openEditCategoryModal(row)}}>Edit</button>
        )
    }

    fetchData(){
        let self = this;
        let url = '/api/v1/service-categories';
        //todo: Can refactgor to reuse a fetch function as for the search
        Fetcher(url).then(function(response){
            console.log("response", response);
            if(!response.error){
                self.setState({resObjs : response});
            }
            self.setState({loading:false});
            console.log(self.state);
        });
    }

    render () {
        let pageName = this.props.route.name;
        let breadcrumbs = [{name:'Home', link:'home'},{name:'My Services', link:'/my-services'},{name:pageName, link:null}];

        let getModals = ()=> {
            if(this.state.openAddCategoryModal){
                return (
                    <ModalAddCategory show={this.state.openAddCategoryModal} hide={this.closeAddCategoryModal}/>
                )
            }
            if(this.state.openEditCategoryModal){
                return (
                    <ModalAddCategory id={this.state.currentDataObject.id} show={this.state.openEditCategoryModal} hide={this.closeEditCategoryModal}/>
                )
            }
            if(this.state.openDeleteCategoryModal){
                return (
                    <ModalDeleteCategory id={this.state.currentDataObject.id} show={this.state.openDeleteCategoryModal} hide={this.closeDeleteCategoryModal}/>
                )
            }
        };

        if(this.state.loading){
            return( <div><p>'loading'</p></div>);
        }else {

            let rows = this.state.resObjs;
            const selectRowProp = {
                mode: 'checkbox'
            };

            const options = {
                afterInsertRow: this.onAfterInsertRow,   // A hook for after insert rows
                handleConfirmDeleteRow: this.customConfirm,
                afterDeleteRow: this.onAfterDeleteRow,
                afterSearch: this.afterSearch,
                clearSearch: true,
            };
            return (
                <Authorizer permissions="can_administrate">
                    <Jumbotron pageName={pageName} location={this.props.location}/>
                    <div className="page-service-instance">
                        <Content>
                            <div className="row m-b-20">
                                <div className="col-xs-12">
                                    <ContentTitle icon="cog" title="Manage all your users here"/>
                                    <div className="row pull-right p-b-15 p-r-15">
                                        <Dropdown name="Actions" direction="right"
                                                  dropdown={[
                                                      {
                                                          id: 'addnewcategory',
                                                          name: 'Add New Category',
                                                          link: '#',
                                                          onClick: this.openAddCategoryModal
                                                      }
                                                  ]}/>
                                    </div>


                                    <BootstrapTable data={rows}
                                                    insertRow={ true }
                                                    deleteRow={ true }
                                                    selectRow={ selectRowProp }
                                                    exportCSV={ true }
                                                    search={ true }
                                                    options={ options }
                                                    striped
                                                    hover
                                                    lastFatch={this.lastFetch}
                                    >
                                        <TableHeaderColumn isKey
                                                           dataField='id'
                                                           dataSort={ true }
                                                           filter={ {type: 'TextFilter', delay: 100} }>
                                            Product ID
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='name'
                                                           dataSort={ true }
                                                           filter={ {type: 'TextFilter', delay: 100} }>
                                            Name
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataSort={ true }
                                                           dataField='description'
                                                           filter={ {type: 'TextFilter', delay: 100} }>
                                            Description
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataSort={ true }
                                                           dataField='created_at'
                                                           dataFormat={ this.priceFormatter }
                                                           filter={ {type: 'TextFilter', delay: 100} }>
                                            Created At
                                        </TableHeaderColumn>
                                        <TableHeaderColumn dataField='Actions'
                                                           dataFormat={ this.rowActionsFormatter }>
                                            Actions
                                        </TableHeaderColumn>
                                    </BootstrapTable>


                                    {/*<DataTable get="/api/v1/service-categories"*/}
                                               {/*col={['id', 'name', 'description', 'created_at', 'updated_at']}*/}
                                               {/*colNames={['', 'Name', 'Description', 'Created At', 'Updated At']}*/}
                                               {/*mod_created_at={this.modCreated}*/}
                                               {/*mod_updated_at={this.modCreated}*/}
                                               {/*lastFetch={this.state.lastFetch}*/}
                                               {/*dropdown={*/}
                                                   {/*[{*/}
                                                       {/*name: 'Actions',*/}
                                                       {/*direction: 'right',*/}
                                                       {/*buttons: [*/}
                                                           {/*{*/}
                                                               {/*id: 1,*/}
                                                               {/*name: 'Edit Category',*/}
                                                               {/*link: '#',*/}
                                                               {/*onClick: this.openEditCategoryModal*/}
                                                           {/*},*/}
                                                           {/*{*/}
                                                               {/*id: 2,*/}
                                                               {/*name: 'Delete Category',*/}
                                                               {/*link: '#',*/}
                                                               {/*onClick: this.openDeleteCategoryModal,*/}
                                                               {/*style: {color: "#ff3535"}*/}
                                                           {/*},*/}
                                                       {/*]*/}
                                                   {/*}*/}
                                                   {/*]*/}
                                               {/*}*/}
                                    {/*/>*/}
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

export default ManageCategories2;
