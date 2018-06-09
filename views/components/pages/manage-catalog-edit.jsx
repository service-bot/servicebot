import React from 'react';
import ServiceTemplateForm from '../elements/forms/service-template-form-refactored.jsx';

class ManageCatalogEdit extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        return(
            <div className="app-content">
                <div className="_title-container">
                    <h1 className="_heading">Edit offering</h1>
                </div>
                <ServiceTemplateForm params = {{'templateId': this.props.params.templateId}}/>
            </div>
        );
    }
}

export default ManageCatalogEdit;
