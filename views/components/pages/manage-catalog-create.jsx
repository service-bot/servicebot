import React from 'react';
import ServiceTemplateForm from '../elements/forms/service-template-form-refactored.jsx';

class ManageCatalogCreate extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        return(
            <div className="app-content">
                <div className="_title-container">
                    <h1 className="_heading">Create a new service</h1>
                    <h2>Define your pricing model, tiers, and price for your SaaS</h2>
                </div>
                <ServiceTemplateForm params = {{'templateId': null}}/>
            </div>
        );
    }
}

export default ManageCatalogCreate;
