import React from 'react';
import {Link, browserHistory} from 'react-router';
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import {
    Field,
    Fields,
    FormSection,
    FieldArray,
    reduxForm,
    formValueSelector,
    change,
    unregisterField,
    getFormValues,
    Form
} from 'redux-form'
import {connect} from "react-redux";
import {RenderWidget, WidgetList, PriceBreakdown, widgets} from "../../utilities/widgets";
import {WysiwygRedux} from "../../elements/wysiwyg.jsx";
import {
    inputField,
    selectField,
    OnOffToggleField,
    iconToggleField,
    priceField,
    priceToCents
} from "./servicebot-base-field.jsx";
import {addAlert, dismissAlert} from "../../utilities/actions";
import ServiceBotBaseForm from "./servicebot-base-form.jsx";
import Load from "../../utilities/load.jsx";

let _ = require("lodash");
import {required, email, numericality, length} from 'redux-form-validators'

const TEMPLATE_FORM_NAME = "serviceTemplateForm"
const selector = formValueSelector(TEMPLATE_FORM_NAME); // <-- same as form name


function renderSplits({fields, meta: {error, submitFailed}}) {

    function onAdd(e) {
        e.preventDefault();
        let number_of_payments = e.target.value
        let number_of_fields = fields.length

        while (number_of_fields < number_of_payments) {
            fields.push({});
            number_of_fields++;
        }
        while (number_of_fields > number_of_payments) {
            fields.pop()
            number_of_fields--;
        }
        return (fields);

    }


    return (
        <div>
            <div className="form-group form-group-flex">
                <lable className="control-label form-label-flex-md">Number of payments</lable>
                <div className="form-input-flex">
                    <input className="form-control" type="number" defaultValue={fields.length} onChange={onAdd}/>
                    {submitFailed && error && <span>{error}</span>}
                </div>
            </div>

            <ul className="split-payment-items">
                {fields.map((member, index) => (
                    <li className="split-payment-item" key={index}>
                        <button className="btn btn-rounded custom-field-button iconToggleField"
                                id="split-payment-delete-button" onClick={() => fields.remove(index)}
                                type="button" title="Remove Payment"><span className="itf-icon"><i
                            className="fa fa-close"/></span></button>

                        <h4>Payment #{index + 1}</h4>
                        <label>Days to charge customer after subscribed</label>
                        <Field
                            name={`${member}.charge_day`}
                            type="number"
                            component={inputField}
                            validate={numericality({'>=': 0.00})}

                        />
                        <Field name={`${member}.amount`} type="number"
                               component={priceField}
                               isCents={true}
                               label="Amount"
                               validate={numericality({'>=': 0.00})}
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}


//The full form


class TemplateForm extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        let props = this.props;

        const changeServiceType = (event, newValue) => {
            if (newValue === 'one_time') {
                props.setIntervalCount();
                props.setInterval();
            }
            else if (newValue === 'custom' || newValue === 'split') {
                props.setIntervalCount();
                props.setInterval();
                props.clearAmount();
            }
        };


        const {handleSubmit, pristine, reset, submitting, error, serviceTypeValue, invalid, formJSON, options} = props;

        const sectionDescriptionStyle = {
            background: _.get(options, 'service_template_icon_background_color.value', '#000000'),
            height: "100px",
            width: "100px",
            padding: "30px",
            marginLeft: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
        };

        return (

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-level-errors">
                            {error && <div className="form-error">{error}</div>}
                        </div>
                        <div className="form-level-warnings"/>
                        <div className="p-b-15">
                            <h3>Create your first offering</h3>
                            <p>Add a name, description, and the type of the billing to start selling your offering.</p>
                        </div>
                        <Field name="name" type="text"
                               component={inputField} label="Offering Name"
                               validate={[required()]}
                        />
                        <Field name="description" type="text"
                               component={inputField} label="Offering Summary"
                               validate={[required()]}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <hr/>
                        <div className="row">
                            <div className="col-md-12">
                                <h3>Payment Details</h3>
                                <Field name="statement_descriptor" type="hidden"
                                       component={inputField} label="Statement Descriptor"
                                />
                                <Field name="type" id="type"
                                       component={selectField} label="Billing Type" onChange={changeServiceType}
                                       options={[
                                           {id: "subscription", name: "Subscription"},
                                           {id: "split", name: "Scheduled Payments"},
                                           {id: "one_time", name: "One Time"},
                                           {id: "custom", name: "Quote"}
                                       ]}
                                />
                                {(serviceTypeValue === 'subscription' || serviceTypeValue === 'one_time') &&
                                <Field name="amount" type="number"
                                       component={priceField}
                                       isCents={true}
                                       label="Amount"
                                       validate={numericality({'>=': 0.00})}
                                />
                                }

                                {(serviceTypeValue === 'subscription') &&
                                <div>
                                    <Field name="trial_period_days" type="number"
                                           component={inputField} label="Trial Period (Days)"
                                           validate={required()}
                                    />
                                    <div className="form-group form-group-flex">
                                        <label className="control-label form-label-flex-md" htmlFor="type">Bill
                                            Customer Every</label>
                                        <Field name="interval_count" type="number"
                                               component={inputField}
                                               validate={required()}
                                        />
                                        <Field name="interval" id="interval" component={selectField}
                                               options={[
                                                   {id: "day", name: "Day"},
                                                   {id: "week", name: "Week"},
                                                   {id: "month", name: "Month"},
                                                   {id: "year", name: "Year"}
                                               ]}
                                        />
                                    </div>
                                </div>
                                }

                                {(serviceTypeValue === 'custom') &&
                                <div>
                                    <p>Quotes are built for services that are customer specific. If your service is
                                        priced
                                        based on the customer's use-case, use this option. Once the quote service has
                                        been
                                        requested by the customer, you can add charges to the service at anytime.
                                    </p>
                                </div>
                                }

                                {(serviceTypeValue === 'split') &&
                                <div>

                                    <FormSection name="split_configuration">
                                        <FieldArray name="splits"
                                                    props={{templateType: serviceTypeValue}}
                                                    component={renderSplits}/>

                                    </FormSection>

                                </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
                <div id="service-submission-box" className="button-box right">
                    <button className="btn btn-rounded btn-primary btn-block" type="submit">
                        Next
                    </button>
                </div>
            </form>
        )
    };
}


class ServiceTemplateForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            newTemplateId: 0,
            success: false,
            imageSuccess: false,
            iconSuccess: false
        };
        this.handleResponse = this.handleResponse.bind(this);
        this.handleImageSuccess = this.handleImageSuccess.bind(this);
        this.handleIconSuccess = this.handleIconSuccess.bind(this);
        this.submissionPrep = this.submissionPrep.bind(this);
    }

    handleImageSuccess() {
        this.setState({
            imageSuccess: true
        });
    }

    handleIconSuccess() {
        this.setState({
            iconSuccess: true
        });
    }

    handleResponse(response) {
        this.setState({
            newTemplateId: response.id,
            success: true
        });
        let successMessage = {
            id: Date.now(),
            alertType: 'success',
            message: `${response.name} was saved successfully`,
            show: true,
            autoDismiss: 4000,
        };
        this.props.addAlert(successMessage);
        if(this.props.postResponse){
            this.props.postResponse();
        }
        browserHistory.push(`/dashboard`);
    }

    submissionPrep(values) {
        //remove id's for duplicate template operation
        if (this.props.params.duplicate) {
            console.log("We have a duplicate and we want to remove id");
            delete values.id;
            values.references.service_template_properties = values.references.service_template_properties.map(prop => {
                if (prop.id) {
                    delete prop.id;
                }
                return prop;
            })
        }
        return values;
    }

    render() {
        //Todo change this. this is how we are currently making sure the redux store is populated
        if (!this.props.company_name) {
            return (<Load/>);
        } else {
            let initialValues = {};
            let initialRequests = [];
            let submissionRequest = {};
            let successMessage = "Template Updated";
            let imageUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/image`;
            let iconUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/icon`;

            if (this.props.params.templateId) {
                initialRequests.push({
                        'method': 'GET',
                        'url': `/api/v1/service-templates/${this.props.params.templateId}`
                    },
                    {'method': 'GET', 'url': `/api/v1/service-categories`, 'name': '_categories'},
                );
                if (this.props.params.duplicate) {
                    submissionRequest = {
                        'method': 'POST',
                        'url': `/api/v1/service-templates`
                    };
                    successMessage = "Template Duplicated";
                }
                else {
                    submissionRequest = {
                        'method': 'PUT',
                        'url': `/api/v1/service-templates/${this.props.params.templateId}`
                    };
                    successMessage = "Template Updated";
                    imageUploadURL = `/api/v1/service-templates/${this.props.params.templateId}/image`;
                    iconUploadURL = `/api/v1/service-templates/${this.props.params.templateId}/icon`;
                }
            }
            else {
                initialValues = {
                    type: 'subscription',
                    category_id: 1,
                    trial_period_days: 0,
                    statement_descriptor: this.props.company_name.value.substring(0, 22),
                    interval: 'month',
                    interval_count: 1,
                    published: true,
                    amount: 0
                };
                initialRequests.push(
                    {'method': 'GET', 'url': `/api/v1/service-categories`, 'name': '_categories'},
                );
                submissionRequest = {
                    'method': 'POST',
                    'url': `/api/v1/service-templates`
                };
                successMessage = "Template Created";
            }

            return (
                <div>
                    <ServiceBotBaseForm
                        form={TemplateForm}
                        formName={TEMPLATE_FORM_NAME}
                        initialValues={initialValues}
                        initialRequests={initialRequests}
                        submissionPrep={this.submissionPrep}
                        submissionRequest={submissionRequest}
                        successMessage={successMessage}
                        handleResponse={this.handleResponse}
                        formProps={{
                            ...this.props.fieldDispatches,
                            ...this.props.fieldState
                        }}
                    />

                </div>
            )
        }
    }
}

function mapStateToProps(state) {
    return {
        alerts: state.alerts,
        company_name: state.options.company_name,
        fieldState: {
            "options": state.options,
            "serviceTypeValue": selector(state, `type`),
            formJSON: getFormValues(TEMPLATE_FORM_NAME)(state),
        },
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addAlert: (alert) => {
            return dispatch(addAlert(alert))
        },
        dismissAlert: (alert) => {
            return dispatch(dismissAlert(alert))
        },
        fieldDispatches: {
            'setIntervalCount': () => {
                dispatch(change(TEMPLATE_FORM_NAME, `interval_count`, 1))
            },
            'setInterval': () => {
                dispatch(change(TEMPLATE_FORM_NAME, `interval`, 'day'))
            },
            'clearAmount': () => {
                dispatch(change(TEMPLATE_FORM_NAME, `amount`, 0))
            }
        }

    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceTemplateForm);