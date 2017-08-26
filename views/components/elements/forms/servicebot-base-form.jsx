import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import { reduxForm } from 'redux-form'
import {Link, browserHistory} from 'react-router';

/*
To use ServiceBot Base Form:
Inputs->
*form - A redux-form
*initalRequests - an Array of request object. The first request will be the main request object which will be up into
    the redux-form initialValues. All other requests should have a name formatted with a leading _ to avoid collisions. Ex:
    const initialRequests = [
        {'method': 'GET', 'url': `/api/v1/service-templates/1`},
        {'method': 'GET', 'url': `/api/v1/service-categories`, 'name': '_categories'},
    ];
*submissionRequest - A request object with just the method and url for the form to be submitted to. Ex:
    const submissionRequest = {
        'method': 'PUT',
        'url': `/api/v1/service-categories/1`
    };
*successMessage - The message to be displayed after submission succeeds
*failureRoute - The route for the browser to redirect to if there’s a failure

Note:
Form is name 'servicebotForm' is selector is needed
 */

class ServiceBotBaseForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            submissionResponse: {},
            loading: true,
            success: false,
            initialRequests: this.props.initialRequests,
            submissionRequest: this.props.submissionRequest,
            successMessage: this.props.successMessage,
            failureRoute: (this.props.failureRoute || "/")
        };
        this.submitForm = this.submitForm.bind(this);

        this.form = reduxForm({
            form: 'servicebotForm'  // the unique identifier for all servicebot base forms
        })(this.props.form);
    }

    submitForm(values){
        let self = this;
        //come back to this for error handling
        Fetcher(self.state.submissionRequest.url, self.state.submissionRequest.method, values).then(result => {
            if(!result.error) {
                self.setState({success: true, submissionResponse: result});
            }
        })
    }

    componentDidMount() {
        let self = this;
        let initialRequests = self.state.initialRequests;
        if(initialRequests && initialRequests.length > 0) {
            let allRequests = initialRequests.map(requestInfo => {
                return Fetcher(requestInfo.url, requestInfo.method);
            });
            Promise.all(allRequests).then(values => {
                //Check for errors and unauthenticated!
                let hasError = false;
                let error;
                values.map(value => {
                    if(value.error){
                        hasError = true;
                        error = value.error;
                    }
                });
                if(!hasError){
                    let requestValues = values[0];
                    for (let i = 1; i < values.length; i++) {
                        let objectName = self.state.initialRequests[i].name;
                        requestValues[objectName] = values[i];
                    }
                    self.setState({loading: false, initialValues: requestValues});
                }else{
                    console.error("fetch error", error);
                    self.setState({loading:false});
                    browserHistory.push(self.state.failureRoute);

                }
            })
        }
        else{
            self.setState({loading: false, initialValues: {}});
        }
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success){
            return (
                <div className="p-20">
                    <p><strong>{this.state.successMessage}</strong></p>
                    <p>{this.state.submissionResponse.name || 'something went wrong.'}</p>
                </div>
            );
        }else{
            return (
                <div >
                    <this.form initialValues={this.state.initialValues} onSubmit={this.submitForm} />
                </div>
            );
        }
    }
}

export default ServiceBotBaseForm;
