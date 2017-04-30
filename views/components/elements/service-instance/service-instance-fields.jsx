import React from 'react';
import {isAuthorized} from '../../utilities/authorizer.jsx';

class ServiceInstanceFields extends React.Component {

    render () {
        console.log("service custom props", this.props.instanceProperties);
        return (
            <div id="service-instance-fields">
                <div className="row">
                    <div className="col-xs-12 service-block service-field-block">
                        <h5 className="">Service Fields</h5>
                        <span className="m-b-20 block label color-grey-600">Service fields are service specification entered during service request.</span>
                    </div>
                </div>
                <div className="row">
                    {this.props.instanceProperties.map( field => (
                        (!field.private || isAuthorized({permissions: 'can_administrate'})) &&
                            <div key={"item-" + field.id} className="col-xs-12 col-sm-6 col-md-3 m-b-10">
                                <span className="block color-grey-600 label">{field.prop_label}</span>
                                <h5 className="">{field.value}</h5>
                            </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default ServiceInstanceFields;
