import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import { reduxForm } from 'redux-form'
import {Link, browserHistory} from 'react-router';

/*
To use ServiceBot Base Form:
Inputs->
*form - A redux-form
*initialValues - an object with the initial values of the form. will be overrode by values from initialRequests
*initialRequests - an Array of request object. All entries without a name value will be added to the redux-form initialValues highest level.
 All other requests should have a name formatted with a leading _ to avoid collisions. Ex:
    const initialRequests = [
        {'method': 'GET', 'url': `/api/v1/service-templates/1`},
        {'method': 'GET', 'url': `/api/v1/service-categories`, 'name': '_categories'},
    ];
*submissionRequest - A request object with just the method and url for the form to be submitted to. Ex:
    const submissionRequest = {
        'method': 'PUT',
        'url': `/api/v1/service-categories/1`
    };
*handleResponse - A method to be called after a form is submitted. Takes in the result of the submission Response
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
            failureRoute: (this.props.failureRoute || "/"),
            initialValues: this.props.initialValues || {}
        };
        this.submitForm = this.submitForm.bind(this);

        this.form = reduxForm({
            form: 'servicebotForm'  // the unique identifier for all servicebot base forms
        })(this.props.form);
    }

    submitForm(values){
        let self = this;
        self.setState({loading: true});
        Fetcher(self.state.submissionRequest.url, self.state.submissionRequest.method, values).then(result => {
            if(!result.error) {
                console.log(result);
                if(self.props.handleResponse){
                    self.props.handleResponse(result)
                }
                self.setState({loading:false, success: true, submissionResponse: result});
            }
            else{
                console.error("submission error", result.error);
                self.setState({loading:false});
                browserHistory.push(self.state.failureRoute);
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
                    let requestValues = self.state.initialValues;
                    for (let i = 0; i < values.length; i++) {
                        if(!self.state.initialRequests[0].name){
                            //requestValues = values[0];
                            Object.assign(requestValues, values[i])
                        }
                        else {
                            let objectName = self.state.initialRequests[i].name;
                            requestValues[objectName] = values[i];
                        }
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
            self.setState({loading: false});
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
