import React from 'react';
import Fetcher from "../../utilities/fetcher.jsx"
import ServiceBotBaseForm from "./servicebot-base-form.jsx";
import Alerts from '../alerts.jsx';
import {required, url} from 'redux-form-validators'
import {Field,FieldArray} from 'redux-form'
import Buttons from "../buttons.jsx";
import Modal from '../../utilities/modal.jsx';
import Jumbotron from '../../layouts/jumbotron.jsx';
import {widgetField} from "./servicebot-base-field.jsx";
import consume from "pluginbot-react/dist/consume";


let renderCustomProperty = (props) => {
    const {fields, formJSON, meta: {touched, error}, services: {widget}} = props;
    let widgets = widget.reduce((acc, widget) => {
        acc[widget.type] = widget;
        return acc;
    }, {});
    return (
        <div>
            {fields.map((customProperty, index) => {
                    let property = widgets[formJSON[index].type];
                    if(formJSON[index].prompt_user){

                        return (
                            <Field
                                key={index}
                                name={`${customProperty}.data.value`}
                                type={formJSON[index].type}
                                widget={property.widget}
                                component={widgetField}
                                label={formJSON[index].prop_label}
                                // value={formJSON[index].data.value}
                                formJSON={formJSON[index]}
                                configValue={formJSON[index].config}
                                validate={required()}
                            />)
                    }else{
                        if(formJSON[index].data && formJSON[index].data.value){
                            return (
                                <div className={`form-group form-group-flex`}>
                                    {(formJSON[index].prop_label && formJSON[index].type !== 'hidden') && <label className="control-label form-label-flex-md">{formJSON[index].prop_label}</label>}
                                    <div className="form-input-flex">
                                        <p>{formJSON[index].data.value}</p>
                                    </div>
                                </div>)
                        }else{
                            return (<span/>)
                        }


                    }

                }
            )}
        </div>
    )
};

renderCustomProperty = consume("widget")(renderCustomProperty);




function CustomFieldEditForm(props) {
    console.log(props.instance);
    let properties = props.instance.references.service_instance_properties;
    return (
        <form>
            <FieldArray name="service_instance_properties" component={renderCustomProperty}
                        formJSON={properties}/>

            <div className="text-right m-t-15">
                <Buttons btnType="primary" text="Submit" onClick={props.handleSubmit} type="submit" value="submit"/>
            </div>
        </form>
    )
}

function ModalEditProperties(props){
    let {show, hide, instance, handleSuccessResponse, handleFailureResponse} = props;
    let submissionRequest = {
        'method': 'POST',
        'url': `/api/v1/service-instances/${instance.id}/change-properties`
    };



    return (
        <Modal modalTitle={"Edit Properties"} icon="fa-plus" hideCloseBtn={false} show={show} hide={hide} hideFooter={false}>
            <div className="p-20">
                <ServiceBotBaseForm
                    form={CustomFieldEditForm}
                    //todo: is there a way to not need initial values to reference a prop name? (for array of X cases)
                    initialValues={{"service_instance_properties" : instance.references.service_instance_properties}}
                    submissionRequest={submissionRequest}
                    successMessage={"Properties edited successfully"}
                    // handleResponse={handleSuccessResponse}
                    // handleFailure={handleFailureResponse}
                    formName={"edit_properties_form"}
                    formProps={{instance}}
                />
            </div>
        </Modal>
    )

}


export {ModalEditProperties}