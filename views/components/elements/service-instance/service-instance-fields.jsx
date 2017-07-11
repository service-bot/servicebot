import React from 'react';
import {isAuthorized} from '../../utilities/authorizer.jsx';

class ServiceInstanceFields extends React.Component {

    render () {
        console.log("service custom props", this.props.instanceProperties);
        return (
            <div className="service-instance-section">
                <span className="service-instance-section-label">Custom Fields</span>
                <span className="m-b-20 block label color-grey-600">Information collected from customer.</span>
                <div className="row">
                    {this.props.instanceProperties.map( field => (
                        (!field.private || isAuthorized({permissions: 'can_administrate'})) &&
                            <div key={"item-" + field.id} className="col-xs-12 col-sm-4 col-md-3">
                                <span className="block color-grey-600 label">{field.prop_label}</span>
                                <p className="service-instance-field-text block">{field.value}</p>
                            </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default ServiceInstanceFields;
