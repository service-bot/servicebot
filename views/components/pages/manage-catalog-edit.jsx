import React from 'react';
import ServiceTemplateForm from '../elements/forms/service-template-form.jsx';

class ManageCatalogEdit extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        return(
            <div className="form-box col-xs-12">
                <div className="offering-title">Edit your existing offering</div>
                <ServiceTemplateForm params = {{'templateId': this.props.params.templateId}}/>
            </div>
        );
    }
}

export default ManageCatalogEdit;
