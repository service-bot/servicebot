import React from 'react';
import ServiceTemplateForm from '../elements/forms/service-template-form.jsx';

class ManageCatalogEdit extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        return(
            <div className="col-xs-12">
                <p>Service Template Create Form</p>
                <ServiceTemplateForm params = {{'templateId': this.props.params.templateId}}/>
            </div>
        );
    }
}

export default ManageCatalogEdit;
