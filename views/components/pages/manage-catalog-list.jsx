import React from 'react';
import {Link, browserHistory} from 'react-router';
import DataTable from "../elements/datatable/datatable.jsx";
import Dropdown from "../elements/datatable/datatable-dropdown.jsx"
import ContentTitle from "../layouts/content-title.jsx"
import DateFormat from "../utilities/date-format.jsx";
import ModalPublishingTemplate from "../elements/modals/modal-publishing-template.jsx";
import ModalDeleteTemplate from "../elements/modals/modal-delete-template.jsx";

class ManageCatalogList extends React.Component {

    constructor(props){
        super(props);
        this.state = {  publishingModal: false,
                        deleteModal: false,
                        currentDataObject: false
        };

        this.dropdownPublish = this.dropdownPublish.bind(this);
        this.dropdownPublishLink = this.dropdownPublishLink.bind(this);
        this.onOpenPublishingModal = this.onOpenPublishingModal.bind(this);
        this.onClosePublishingModal = this.onClosePublishingModal.bind(this);
        this.onOpenDeleteModal = this.onOpenDeleteModal.bind(this);
        this.onCloseDeleteModal = this.onCloseDeleteModal.bind(this);
    }

    dropdownPublish(dataObject){
        let published = dataObject.published;
        return published ? "Unpublish" : "Publish";
    }
    dropdownPublishLink(dataObject){
        let published = dataObject.published;
        return published ? "/manage-catalog/:id/unpublish" : "/manage-catalog/:id/publish";
    }

    onOpenPublishingModal(dataObject){
        let self = this;
        return function(e) {
            // console.log("clicked on unpub button", dataObject);
            e.preventDefault();
            self.setState({publishingModal: true, currentDataObject: dataObject});
        }
    }
    onClosePublishingModal(){
        event.preventDefault();
        this.setState({publishingModal: false});
    }
    onOpenDeleteModal(dataObject){
        let self = this;
        return function(e) {
            e.preventDefault();
            self.setState({deleteModal: true, currentDataObject: dataObject});
        }
    }
    onCloseDeleteModal(){
        event.preventDefault();
        this.setState({deleteModal: false});
    }

    modName(data, resObj){
        return(
            <Link to={`/manage-catalog/${resObj.id}/edit`}>{data}</Link>
        );
    }
    modCreated(data){
        return (
            <DateFormat date={data}/>
        );
    }

    render () {

        let self = this;

        const currentModal = ()=> {
            if(self.state.publishingModal){
                return(
                    <ModalPublishingTemplate templateObject={self.state.currentDataObject} show={self.state.publishingModal} hide={self.onClosePublishingModal}/>
                );
            }else if(self.state.deleteModal){
                return(
                    <ModalDeleteTemplate templateObject={self.state.currentDataObject} show={self.state.deleteModal} hide={self.onCloseDeleteModal}/>
                );
            }
        };

        return (
            <div className="col-xs-12">
                <ContentTitle icon="cog" title="Manage all your services here"/>
                <Dropdown name="Actions" dropdown={[{id: 'servicetemplateaction', name: 'Create New Service', link: '/manage-catalog/create'}]}/>
                {/* no slash at the end of the api url */}
                <DataTable parentState={this.state}
                           get="/api/v1/service-templates"
                           col={['id', 'name', 'references.service_categories.0.name', 'published', 'references.users.0.name', 'created_at']}
                           colNames={['ID', 'Name', 'Category', 'Published', 'Created By', 'Created At']}
                           statusCol="published"
                           mod_name={this.modName}
                           mod_created_at={this.modCreated}
                           dropdown={[{name:'Actions', direction: 'right', buttons:[
                                        {id: 1, name: 'Edit', link: '/manage-catalog/:id/edit'},
                                        {id: 2, name: 'divider'},
                                        {id: 3, name: this.dropdownPublish, link: '#', onClick: this.onOpenPublishingModal},
                                        {id: 4, name: 'Delete Service', link: '#', onClick: this.onOpenDeleteModal, style: {color: "#ff3535"}}]
                                    }]}/>
                {currentModal()}
            </div>
        );
    }
}

export default ManageCatalogList;
