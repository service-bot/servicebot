import React from 'react';
import {Link, browserHistory} from 'react-router';
import ServiceTemplateForm from '../elements/forms/service-template-form.jsx';

class ManageCatalogCreate extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        let self = this;
        return(
            <div className="form-box col-xs-12">
                <div className="offering-title">Create a new offering</div>
                <ServiceTemplateForm params = {{'templateId': null}}/>
            </div>
        );
    }
}

export default ManageCatalogCreate;
