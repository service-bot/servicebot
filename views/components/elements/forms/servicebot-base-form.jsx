import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
import {reduxForm, SubmissionError, stopSubmit} from 'redux-form'
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
*submissionPrep -
*submissionRequest - A request object with just the method and url for the form to be submitted to. Ex:
    const submissionRequest = {
        'method': 'PUT',
        'url': `/api/v1/service-categories/1`
    };
*handleResponse - A method to be called after a form is submitted. Takes in the result of the submission Response
*successMessage - The message to be displayed after submission succeeds
* successRoute - The route to redirect the page to upon successful completion
*failureRoute - The route for the browser to redirect to if there’s a failure
*helpers - any properties needed to pass to the form for functionality
Note:
Form is name 'servicebotForm' is selector is needed
 */

class ServiceBotBaseForm extends React.Component {

    constructor(props) {
        super(props);
        console.log("NEW BASER FORM!", props);

        this.state = {
            submissionResponse: {},
            loading: false,
            initializing: true,
            success: false,
            initialRequests: this.props.initialRequests,
            submissionRequest: this.props.submissionRequest,
            successMessage: this.props.successMessage,
            failureRoute: (this.props.failureRoute || "/"),
            successRoute: (this.props.successRoute || null),
            initialValues: this.props.initialValues || {},
            helpers: this.props.helpers || {}
        };
        this.submitForm = this.submitForm.bind(this);
    }

    async submitForm(values) {
        let self = this;
        self.setState({loading: true});
        if (self.props.submissionPrep) {
            console.log("submissionprepcalled");
            let promiseToResolve = new Promise(resolve => {
                self.props.submissionPrep(values, resolve);
            });
            let prepResults = await promiseToResolve;
            await self.makeCall(prepResults);
        }
        else {
            await self.makeCall(values);
        }
    }

    //NEED TO CHANGE MAKECALL TO AN ASYNC
    //ITS NOT EASY BECAUSE OF HOW SUBMISSIONPREP iS
    //AND MAKE SURE WERE GETTING THE SUBMISSION ERRORS
    async makeCall(values) {
        console.log("MAKING A CALL");
        console.log("These are the values", values);
        let self = this;
        let result = null;
        try {
            result = await Fetcher(self.state.submissionRequest.url, self.state.submissionRequest.method, values);
        } catch (e) {
            console.error("Fetch error", e);
            self.setState({loading: false});
            throw new SubmissionError({_error: "Error submitting"})
        }

        if (!result.error) {
            console.log("Submission Result", result);
            if (self.props.handleResponse) {
                console.log("Handling response!!")
                self.props.handleResponse(result)
            }
            console.log("removing state thing")
            self.setState({loading: false, success: true, submissionResponse: result});
            if (this.props.successRoute) {
                console.log("redirecting browser")
                browserHistory.push(this.props.successRoute);
            }
        }
        else {
            console.error("submission error", result.error);
            self.setState({loading: false});
            // self.props.endSubmit({_error: result.error})
            throw new SubmissionError({_error: result.error});
            if (this.props.failureRoute) {
                browserHistory.push(this.props.failureRoute);
            }
        }

    }


    componentDidMount() {
        let self = this;
        let initialRequests = self.state.initialRequests;
        if (initialRequests && initialRequests.length > 0) {
            let allRequests = initialRequests.map(async requestInfo => {
                let response = await Fetcher(requestInfo.url, requestInfo.method);
                if (requestInfo.name) {
                    response.name = requestInfo.name;
                }
                return response;
            });
            Promise.all(allRequests).then(values => {
                //Check for errors and unauthenticated!
                let error = values.find(value => value.error);
                if (!error) {
                    let requestValues = values.reduce((acc, value, currentIndex) =>
                            (value.name ? {...acc, [value.name]: value} : {...acc, ...value}),
                        self.state.initialValues)

                    let initialForm = reduxForm({
                        form: self.props.formName || "servicebotForm",
                        initialValues: requestValues,
                    })(self.props.form);
                    self.setState({initializing: false, reduxForm: initialForm});
                } else {
                    console.error("fetch error", error);
                    self.setState({initializing: false});
                    browserHistory.push(self.state.failureRoute);

                }
            })
        }
        else {
            //todo: clean this whole function to not duplicate this code.
            let initialForm = reduxForm({
                form: self.props.formName || "servicebotForm",
                initialValues: self.state.initialValues,
            })(this.props.form);

            self.setState({initializing: false, reduxForm: initialForm});
        }
    }

    render() {
        if (this.state.initializing) {
            return (<Load/>);

        }
        if (this.state.success) {
            return (
                <div className="p-20">
                    <p><strong>{this.state.successMessage}</strong></p>
                    <p>{this.state.submissionResponse.name || 'something went wrong.'}</p>
                </div>
            );
        } else {
            let ReduxFormWrapper = this.state.reduxForm;
            console.log(this.props.formProps);

            return (
                    <div>
                        {this.state.loading && <Load/>}
                        <ReduxFormWrapper {...this.props.formProps} helpers={this.props.helpers} onSubmit={this.submitForm} />
                    </div>
            );
        }
    }
}


export default ServiceBotBaseForm;
