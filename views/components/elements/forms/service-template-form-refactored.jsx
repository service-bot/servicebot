import React from 'react';
import {browserHistory, Link} from 'react-router';
import 'react-tagsinput/react-tagsinput.css';
import './css/template-create.css';
import consume from "pluginbot-react/dist/consume"
import {change, Field, FieldArray, FormSection, formValueSelector, getFormValues} from 'redux-form'
import {connect} from "react-redux";
import {iconToggleField, inputField, priceField, ServicebotBaseForm} from "servicebot-base-form";
import {addAlert, dismissAlert, setHasOffering} from "../../utilities/actions";
// import ServiceBotBaseForm from "./servicebot-base-form2.jsx";
import Load from "../../utilities/load.jsx";
import {numericality, required} from 'redux-form-validators'
import {TierBillingForm} from "./tier-billing-form.jsx"
import DragScroll from 'react-dragscroll'
let _ = require("lodash");

const TEMPLATE_FORM_NAME = "serviceTemplateForm"
const selector = formValueSelector(TEMPLATE_FORM_NAME); // <-- same as form name

let Tiers = function (props) {
    let {member, fields, selected, selectTier, services: {tierBillingOverride}, setPricingTemplate} = props;
    selectTier = selectTier || (() => {
    });
    let current = fields.get(selected);
    let OverrideBilling = tierBillingOverride && tierBillingOverride[0];
    function deleteTier(index) {
        return (e) => {
            e.preventDefault();
            let newIndex = selected ? selected - 1 : 0;
            selectTier(newIndex)(e);
            fields.remove(index)
        }
    }

    function onAdd(e) {
        e.preventDefault();
        selectTier(fields.length)()
        return fields.push({
            references: {
                payment_structure_templates: [{
                    trial_period_days: 0,
                    amount: 0,
                    type:"subscription",
                    interval: "month",
                    interval_count: 1
                }]
            },
            name: "Tier " + (fields.length + 1),
            trial_period_days: 0,
            amount: 0,
            type:"subscription"
        });
    }

    let mappedFields = fields.map((field, index) => {
        let liClass = "_tier";
        let tier = fields.get(index);
        if (index === selected) {
            liClass = liClass + " _selected";
        }
        return {component: (<li key={"tier-" + index} className={liClass} id={"tier-" + index}>
                <div className="_tier-heading" >
                    <h2 className={"_tier-name"} onClick={selectTier(index)} >{tier.name}</h2>
                    {fields.length > 1 && <button className="_tier-delete" aria-label="delete tier" onClick={deleteTier(index)}/>}
                </div>
                <div onClick={selectTier(index)} className={"_tier-preview"}>
                </div>
            </li>), amount: tier.amount, type: tier.type}
    }).sort((tier1, tier2) => {
        if((tier1.type === "custom" && tier2.type === "custom")){
            return 0;
        }
        if(tier1.type === "custom" || ((tier1.amount > tier2.amount) && tier2.type !== "custom")){
            return 1
        }
        if(tier2.type === "custom" || tier2.amount > tier1.amount){
            return -1;
        }
        return 0;
    }).map(tier => tier.component);

    return (
        <div className="tiers">
            <div className="_container">
                <DragScroll width={`100%`} height={`auto`}>
                <ul className="_tier-list">
                    {mappedFields}
                    <li id={"_tier-add"} onClick={onAdd}>
                        <button className="buttons _add _tier-add-button" aria-label="add new tier"/>
                    </li>

                </ul>
                </DragScroll>
            </div>
            {(OverrideBilling && <OverrideBilling {...props} member={"tiers[" + selected + "]"} tier={current}/>) || <TierBillingForm {...props} member={"tiers[" + selected + "]"} tier={current}/>}
        </div>
    )

};
Tiers = connect((state, ownProps) => {
    return {
        formJSON: getFormValues(TEMPLATE_FORM_NAME)(state)
        // "privateValue": selector(state, "references.service_template_properties")[ownProps.index].private,
        // "requiredValue": selector(state, "references.service_template_properties")[ownProps.index].required,
        // "promptValue": selector(state, "references.service_template_properties")[ownProps.index].prompt_user,
        // "typeValue": selector(state, "references.service_template_properties")[ownProps.index].type,
        // "configValue": selector(state, `references.service_template_properties`)[ownProps.index].config,
        // "tiers": selector(state, `references.tiers`)


    }
}, (dispatch, ownProps) => {
    return {
        "setPricingTemplates": (member, val) => {
            dispatch(change(TEMPLATE_FORM_NAME, `references.${member}.references.payment_structure_templates`, val));
        },
        "changeMember" : (member, val) => {
            dispatch(change(TEMPLATE_FORM_NAME, member, val));
        }
    }
})(Tiers);
Tiers = consume("tierBillingOverride")(Tiers)

class TemplateForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedTier: 0
        };
        this.selectTier = this.selectTier.bind(this)
    }

    selectTier(index) {
        let self = this;
        return (event) => {
            self.setState({
                selectedTier: index
            });
        }
    }

    render() {
        let self = this;
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

            <form className="form-offering" onSubmit={handleSubmit}>
                <div className="_section _active">
                    <div className="form-level-errors">
                        {error && <div className="form-error">{error}</div>}
                    </div>
                    <div className="form-level-warnings"/>
                    <h3><span className="form-step-count">1</span>Service Name</h3>
                    <div className="_indented">
                        <div className="_form-field-group _form-field-name_software_name">
                            <Field name="name" type="text" component={inputField} label="Service Name" validate={[required()]}/>
                        </div>
                    </div>
                </div>
                <div className="_section _active">
                    <h3><span className="form-step-count">2</span>Pricing Details</h3>
                    <div className="_indented">
                        <Field name="statement_descriptor" type="hidden"
                               component={inputField} label="Statement Descriptor"/>

                        <FormSection name="references">
                            <FieldArray name="tiers"
                                        props={{
                                            selected: self.state.selectedTier,
                                            selectTier: self.selectTier,
                                            templateType: serviceTypeValue
                                        }}
                                        component={Tiers}/>
                        </FormSection>
                    </div>
                </div>
                <hr/>
                <button className="buttons _save" type="submit">Save & Embed</button>
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
    handleFailure(result){
        if(result.error === "service_instances_payment_structure_template_id_foreign"){
            result.error = "Unable to delete payment structures that are being used by existing subscriptions"
        }
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
        this.props.setHasOffering(true);
        browserHistory.push(`/embeddables`);
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
            values.references.tiers = values.references.tiers.map(tier => {
                if (tier.id) {
                    delete tier.id;
                }
                if(tier.references && tier.references.payment_structure_templates){
                    tier.references.payment_structure_templates = tier.references.payment_structure_templates.map(pay => {
                        if(pay.id){
                            delete pay.id;
                        }
                        return pay;
                    })
                }
                return tier;
            })

        }
        return values;
    }

    render() {
        //Todo change this. this is how we are currently making sure the redux store is populated
        if (!this.props.company_name) {
            return (<Load/>);
        } else {
            let templateId = this.props.params.templateId;
            let initialValues = {};
            let initialRequests = [];
            let submissionRequest = {};
            let successMessage = "Template Updated";
            let imageUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/image`;
            let iconUploadURL = `/api/v1/service-templates/${this.state.newTemplateId}/icon`;
            function initializer(values){
                if(templateId){
                    values.references.tiers = (values._tiers || []).map(tier => {
                        let paymentPlans = tier.references.payment_structure_templates;
                        if(paymentPlans && paymentPlans.length > 0){
                            return {
                                ...tier,
                                trial_period_days: paymentPlans[0].trial_period_days,
                                type: paymentPlans[0].type,
                                amount: paymentPlans[0].amount
                            }
                        }else{
                            return tier;
                        }
                    });
                }
                return values;
            }
            if (templateId) {
                initialRequests.push({
                        'method': 'GET',
                        'url': `/api/v1/service-templates/${templateId}`
                    },
                    {'method': 'GET', 'url': `/api/v1/tiers/search?key=service_template_id&value=${templateId}`, 'name': '_tiers'},
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
                        'url': `/api/v1/service-templates/${templateId}`
                    };
                    successMessage = "Template Updated";
                    imageUploadURL = `/api/v1/service-templates/${templateId}/image`;
                    iconUploadURL = `/api/v1/service-templates/${templateId}/icon`;
                }
            }
            else {
                initialValues = {
                    interval: 'month',
                    published: true,
                    references: {
                        tiers: [
                            {
                                trial_period_days: 0,
                                amount: 0,
                                type: "subscription",
                                references: {
                                    payment_structure_templates: [{
                                        interval: 'month',
                                        interval_count: 1,
                                        trial_period_days: 0,
                                        type: 'subscription',
                                        amount: 0
                                    }
                                    ]
                                }, name: "Tier 1"
                            }
                        ]
                    }
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
                <div className="_content-container">
                    <div className="_content">
                        <ServicebotBaseForm
                            form={TemplateForm}
                            formName={TEMPLATE_FORM_NAME}
                            initialValues={initialValues}
                            initialRequests={initialRequests}
                            submissionPrep={this.submissionPrep}
                            submissionRequest={submissionRequest}
                            successMessage={successMessage}
                            handleResponse={this.handleResponse}
                            handleFailure={this.handleFailure}
                            initializer={initializer}
                            formProps={{
                                ...this.props.fieldDispatches,
                                ...this.props.fieldState
                            }}
                        />
                    </div>
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
        setHasOffering: (option) => {
            return dispatch(setHasOffering(option))
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
