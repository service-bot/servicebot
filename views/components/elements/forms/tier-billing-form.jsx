import {inputField, priceField, selectField} from "servicebot-base-form";
import {numericality, required} from "redux-form-validators";
import React from 'react';
import {change, Field, FieldArray, FormSection, formValueSelector, getFormValues} from 'redux-form'
let PaymentStructureTemplates = function (props) {
    let {fields, tier, member, setPricingTemplates} = props;
    let plans = fields.getAll() || [];

    function addPayment(e) {
        e.preventDefault();
        fields.push({
            interval_count: 1,
            trial_period_days: tier.trial_period_days || 0,
            type: tier.type,
            // statement_descriptor: this.props.company_name.value.substring(0, 22),
            amount: 0

        });
    };

    function deletePlan(index) {
        return (e) => {
            e.preventDefault();
            fields.remove(index)
        }
    }


    let availableOptions = [
        {id: "month", name: "Monthly"},
        {id: "year", name: "Yearly"},
        {id: "day", name: "Daily"},
        {id: "week", name: "Weekly"}
    ];
    let optionMap = plans.map(plan => {
        return availableOptions.filter(option => option.id === plan.interval || !plans.some(plan2 => plan2.interval === option.id));
    });
    // ].filter(option => {
    //     return !plans.some(plan => plan.interval === option.id);
    // });
    if (tier.type === "custom") {
        return (<div>
            <p>Quotes are built for services that are customer specific. If your service is
                priced
                based on the customer's use-case, use this option. Once the quote service has
                been
                requested by the customer, you can add charges to the service at anytime.
            </p>
        </div>);

    }
    if (tier.type === "one_time") {
        return (<div>{fields.map((field, index) => {
            if (index === 0) {
                return (<Field key={"field-" + index + "-" + member} name={field + ".amount"} type="number"
                               component={priceField}
                               isCents={true}
                               label="Amount"
                               validate={numericality({'>=': 0.00})}/>);
            } else {
                return null
            }
        })
        }</div>);

    }
    if (tier.type === "subscription") {
        return (
            <div className="payment-structures">
                {fields.map((field, index) => {
                    return (
                        <div key={"field-" + index + "-" + member}>
                            {index > 0 &&
                            <div className="_billing-options">
                                <span className="_count">{index + 1}</span>
                                <span className="_sub-heading">Billing Option {index + 1}</span>
                                <div className="_hr"/>
                                {fields.length > 1 && <button className="_billing-options-delete"
                                                              aria-label={`delete billing option ${index + 1}`}
                                                              onClick={deletePlan(index)}/>}
                            </div>
                            }
                            <div className="_billing-options-fields">
                                <Field name={field + ".amount"} type="number"
                                       component={priceField}
                                       isCents={true}
                                       label="Amount"
                                       validate={numericality({'>=': 0.00})}/>
                                <span className="_per">per</span>
                                <Field name={field + ".interval"} id="interval" label="Billed" component={selectField}
                                       options={optionMap[index]}/>
                            </div>
                        </div>
                    )
                })}

                {plans.length < 4 && <button className="buttons _add" onClick={addPayment}><span className="icon plus"/>Add Pricing Options</button>}
                <span className="clear"/>
            </div>
        )
    } else {
        return <div></div>
    }
}
let TierBillingForm = function (props) {
    let {tier, member, setPricingTemplates, serviceTypeValue} = props;
    const changeServiceType = (event, newValue) => {
        let pricingStructures = (tier.references && tier.references.payment_structure_templates) || [];
        setPricingTemplates(member, pricingStructures.map(p => {
            return {
                ...p,
                type: newValue
            }
        }));
    };
    const changeTrial = (event, newValue) => {
        let pricingStructures = (tier.references && tier.references.payment_structure_templates) || [];
        setPricingTemplates(member, pricingStructures.map(p => {
            return {
                ...p,
                trial_period_days: newValue
            }
        }));
    };

    const formatFromPricing = (value, name) => {
                let pricingStructures = (tier.references && tier.references.payment_structure_templates) || [];
        if ((value === null || value === undefined) && pricingStructures.length > 0) {
            return pricingStructures[0][name];
        }
        return value;
    };


    return (
        <div className="_tier-details">
            <div className="_tier-name_name">
                <Field name={member + ".name"} type="text"
                       component={inputField} label="Tier Name (eg. Basic, Enterprise)"
                       validate={[required()]}
                />
            </div>
            <div className="_tier-name_type">
                <Field name={member + ".type"} id="type"
                       component={selectField} label="Billing Type" onChange={changeServiceType}
                       options={[
                           {id: "subscription", name: "Subscription"},
                           // {id: "split", name: "Scheduled Payments"},
                           {id: "one_time", name: "One Time"},
                           {id: "custom", name: "Quote"}
                       ]}
                />
            </div>

            {tier.type === "subscription" &&
            <div className="_tier-name_billing_period">
                <Field onChange={changeTrial} format={formatFromPricing} name={member + ".trial_period_days"} type="number"
                       component={inputField} label="Trial Period (Days)"
                       validate={required()}
                />
            </div>
            }

            <FormSection name={member + ".references"}>
                <FieldArray name="payment_structure_templates"
                            props={{tier: tier, member: member}}
                            component={PaymentStructureTemplates}/>
            </FormSection>
        </div>
    );
}
export {TierBillingForm};
