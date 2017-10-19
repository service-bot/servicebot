import React from 'react';
import {Link, browserHistory} from 'react-router';
import ServiceTemplateForm from '../elements/forms/service-template-form.jsx';

class ManageCatalogCreate extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        var self = this;
        return(
            <div className="col-xs-12">
                <ServiceTemplateForm params = {{'templateId': null}}/>
            </div>
        );
    }
}

export default ManageCatalogCreate;
