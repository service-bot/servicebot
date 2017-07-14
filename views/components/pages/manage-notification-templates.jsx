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

class ManageNotificationTemplates extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            currentDataObject: {},
            lastFetch: Date.now()
        };
    }

    componentDidMount(){
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        }

    }

    modName(data, dataObj){
        return( <Link to={`notification-templates/${dataObj.id}`}>{data}</Link>);
    }
    modCreatedAt(data, dataObj){
        return (<DateFormat date={data} time/>);
    }
    modUpdatedAt(data, dataObj){
        return (<DateFormat date={data} time/>)
    }

    render () {
        let pageName = this.props.route.name;

        let getModals = ()=> {
            if(this.state.openAddCategoryModal){
                return (
                    <ModalAddCategory show={this.state.openAddCategoryModal} hide={this.closeAddCategoryModal}/>
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
                                <ContentTitle icon="cog" title="Manage Notification Templates"/>
                                <Dropdown name="Actions"
                                          dropdown={[
                                              {id: 'addnewcategory', name: 'Add New Category', link: '#', onClick: this.openAddCategoryModal}
                                          ]}/>
                                <DataTable get="/api/v1/notification-templates"
                                           col={['id', 'name', 'model', 'created_at', 'updated_at']}
                                           colNames={['ID', 'Name', 'Model', 'Created At', 'Updated At']}
                                           mod_name={this.modName}
                                           mod_created_at={this.modCreatedAt}
                                           mod_updated_at={this.modUpdatedAt}
                                           lastFetch={this.state.lastFetch}
                                           dropdown={
                                               [{
                                                   name:'Actions',
                                                   direction: 'right',
                                                   buttons:[
                                                       {id: 1, name: 'Edit Template', link: '/notification-templates/:id'},
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

export default ManageNotificationTemplates;
