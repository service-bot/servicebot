import React from 'react';

class DataFormReview extends React.Component {

    constructor(props){
        super(props);
        this.state = { reviewJSON: props.reviewJSON || null};
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.reviewJSON){
            if(nextProps.reviewJSON != this.props.reviewJSON){
                this.setState({reviewJSON: JSON.parse(nextProps.reviewJSON)});
            }
        }
    }

    render(){

        if(this.state.reviewJSON){
            let reviewJSON = this.state.reviewJSON.form;
            let templateProps = null;
            if(reviewJSON.references.service_template_properties){
                templateProps = reviewJSON.references.service_template_properties;
            }

            return (
                <div id="review-content">
                    <div className="p-20">
                        <h3>Review</h3>
                        <div id="service-review-content" className="Review">
                            {!reviewJSON ? <p>Please fill out the form to create your service template.</p> : <p>Please review your entered information before submitting.</p>}

                            <div className="review-content-prop-item p-b-20">
                                <h4 className="review-content-prop-item-title">Review Basic Info</h4>
                                <div>
                                    <span className="label">Name: </span>
                                    <span className="value">{reviewJSON && reviewJSON.name ? reviewJSON.name : 'Required.'}</span>
                                </div>
                                <div>
                                    <span className="label">Description: </span>
                                    <span className="value">{reviewJSON && reviewJSON.description ? reviewJSON.description : 'Required.'}</span>
                                </div>
                                <div>
                                    <span className="label">Published: </span>
                                    <span className="value">{reviewJSON ? (!reviewJSON.published ? 'Not published' : 'Published') : 'Not published'}</span>
                                </div>
                                <div>
                                    <span className="label">Category: </span>
                                    <span className="value">{reviewJSON ? (!reviewJSON.category_id ? 'Please select a category' : reviewJSON.category_id) : 'Required'}</span>
                                </div>
                            </div>

                            <div className="review-content-prop-item p-b-20">
                                <h4 className="review-content-prop-item-title">Payment Plan</h4>
                                <div>
                                    <span className="label">Statement Descriptor: </span>
                                    <span className="value">{reviewJSON && (reviewJSON.statement_descriptor ? reviewJSON.statement_descriptor : 'Optional')}</span>
                                </div>
                                <div>
                                    <span className="label">Trial Period: </span>
                                    <span className="value">{reviewJSON && (reviewJSON.trial_period_days ? reviewJSON.trial_period_days : 'Optional')}</span>
                                </div>
                                <div>
                                    <span className="label">Amount: </span>
                                    <span className="value">{reviewJSON && (reviewJSON.amount ? reviewJSON.amount : 'Required')}</span>
                                </div>
                                <div>
                                    <span className="label">Currency: </span>
                                    <span className="value">{reviewJSON && (reviewJSON.currency ? reviewJSON.currency : 'Required')}</span>
                                </div>
                                <div>
                                    <span className="label">Interval: </span>
                                    <span className="value">{reviewJSON && (reviewJSON.interval ? reviewJSON.interval : 'Required')}</span>
                                </div>
                                <div>
                                    <span className="label">Interval Count: </span>
                                    <span className="value">{reviewJSON && (reviewJSON.interval_count ? reviewJSON.interval_count : 'Required')}</span>
                                </div>
                                <div>
                                    <span className="label">Prorated? </span>
                                    <span className="value">{reviewJSON ? (!reviewJSON.subscription_prorate ? 'Not prorated' : 'Prorated') : 'Not prorated'}</span>
                                </div>
                            </div>

                            {templateProps && Object.entries(templateProps).map(propEntry => {
                                let propItem = propEntry[1];
                                {/*console.log("prop item: ", propItem);*/}
                                return (
                                    <div key={propEntry[0]} className="review-content-prop-item p-b-20">
                                        <h4 className="review-content-prop-item-title">Custom Fields</h4>
                                        <div>
                                            <span className="label">Name: </span>
                                            <span className="value">{propItem.prop_label ? propItem.prop_label : 'No label'}</span>
                                        </div>
                                        <div>
                                            <span className="label">Default Value: </span>
                                            {typeof(propItem.value) == 'boolean' ?
                                                <span className="value">{propItem.value ? 'True' : 'False'}</span> :
                                                <span className="value">{propItem.value ? propItem.value : 'No default value'}</span>
                                            }
                                        </div>
                                        <div>
                                            <span className="label">Private? </span>
                                            <span className="value">{propItem.private ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div>
                                            <span className="label">Prompt User? </span>
                                            <span className="value">{propItem.prompt_user ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div>
                                            <span className="label">Required? </span>
                                            <span className="value">{propItem.required ? 'Yes' : 'No'}</span>
                                        </div>
                                        <div>
                                            <span className="label">Input Type: </span>
                                            <span className="value">{propItem.prop_input_type}</span>
                                        </div>
                                        <div>
                                            <span className="label">Options Values:</span>
                                            <span className="value">
                                                {propItem.prop_values ? propItem.prop_values.map( value => {
                                                    return(<span key={`key-${value}`}>{value}</span>); }) : 'No option values'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            );
        }else{
            return (<p>You don't have information to review yet.</p>);
        }


    }


}

export default DataFormReview;
