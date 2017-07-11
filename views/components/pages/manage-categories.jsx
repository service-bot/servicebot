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

class ManageCategories extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            openAddCategoryModal: false,
            openDeleteCategoryModal: false,
            currentDataObject: {},
            lastFetch: Date.now()
        };

        this.openAddCategoryModal = this.openAddCategoryModal.bind(this);
        this.closeAddCategoryModal = this.closeAddCategoryModal.bind(this);
        this.openEditCategoryModal = this.openEditCategoryModal.bind(this);
        this.closeEditCategoryModal = this.closeEditCategoryModal.bind(this);
        this.openDeleteCategoryModal = this.openDeleteCategoryModal.bind(this);
        this.closeDeleteCategoryModal = this.closeDeleteCategoryModal.bind(this);
    }

    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }

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

    openEditCategoryModal(dataObject){
        let self = this;
        return function(e) {
            // console.log("clicked on unpub button", dataObject);
            e.preventDefault();
            self.setState({ openEditCategoryModal: true, currentDataObject: dataObject });
        }
    }
    closeEditCategoryModal(){
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

    modCreated(data){
        return (
            <DateFormat date={data} time/>
        );
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

        return(
            <Authorizer permissions="can_administrate">
                <Jumbotron pageName={pageName} location={this.props.location}/>
                <div className="page-service-instance">
                    <Content>
                        <div className="row m-b-20">
                            <div className="col-xs-12">
                                <ContentTitle icon="cog" title="Manage all your users here"/>
                                <Dropdown name="Actions"
                                          dropdown={[
                                              {id: 'addnewcategory', name: 'Add New Category', link: '#', onClick: this.openAddCategoryModal}
                                              ]}/>
                                <DataTable get="/api/v1/service-categories"
                                           col={['id', 'name', 'description', 'created_at', 'updated_at']}
                                           colNames={['', 'Name', 'Description', 'Created At', 'Updated At']}
                                           mod_created_at={this.modCreated}
                                           mod_updated_at={this.modCreated}
                                           lastFetch={this.state.lastFetch}
                                           dropdown={
                                               [{
                                                   name:'Actions',
                                                   direction: 'right',
                                                   buttons:[
                                                       {id: 1, name: 'Edit Category', link: '#', onClick: this.openEditCategoryModal},
                                                       {id: 2, name: 'Delete Category', link: '#', onClick: this.openDeleteCategoryModal, style: {color: "#ff3535"}},
                                                   ]}
                                               ]
                                           }
                                />
                            </div>
                        </div>
                        {getModals()}
                    </Content>
                </div>
            </Authorizer>
        );
    }
}

export default ManageCategories;
