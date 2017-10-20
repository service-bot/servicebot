import React from 'react';
import ServiceTemplateForm from '../elements/forms/service-template-form.jsx';

class ManageCatalogDuplicate extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        return(
            <div className="col-xs-12">
                <p>Service Template Duplicate Form</p>
                <ServiceTemplateForm params = {{"duplicate" : true, 'templateId': this.props.params.templateId}}/>
            </div>
        );
    }
}

export default ManageCatalogDuplicate;
