import React from 'react';
import ServiceRequestForm from "../elements/forms/service-instance-form-request.jsx"
import {AdminEditingGear, AdminEditingSidebar} from "../layouts/admin-sidebar.jsx";
import {Fetcher} from "servicebot-base-form"
import {Price, getPrice} from "../utilities/price.jsx";
import {getPrice as getTotalPrice, getPriceAdjustments} from "../../../lib/handleInputs";
import { connect } from 'react-redux';
import ServicebotCheckoutEmbed from "servicebot-checkout-embed"
let _ = require("lodash");
import {formValueSelector, getFormValues} from 'redux-form'
import consume from "pluginbot-react/dist/consume";
const REQUEST_FORM_NAME = "serviceInstanceRequestForm";
const selector = formValueSelector(REQUEST_FORM_NAME); // <-- same as form name
import {setNavClass, resetNavClass} from "../utilities/actions";
import { StickyContainer, Sticky } from 'react-sticky';
import getSymbolFromCurrency from 'currency-symbol-map'
import Load from '../utilities/load.jsx';


class RequestPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading: true,
            selectedTemplate: this.props.params.templateId,
            selectedTier: null,
            selectedPlan: null,
            tier: null,
            template: null
        }
        this.changeTier = this.changeTier.bind(this);
        this.changePlan = this.changePlan.bind(this);

    }

    async componentDidMount(){
        let template = await Fetcher(`/api/v1/service-templates/${this.props.params.templateId}/request`);
        this.setState({ template, loading: false});
    }
    async changeTier(e) {
        const selectedTier = e.currentTarget.value;
        let tier = this.state.template.references.tiers[selectedTier];
        this.setState({selectedTier, tier, selectedPlan: null});

    }
    changePlan(e) {
        const selectedPlan = e.currentTarget.value;
        this.setState({selectedPlan});

    }

    render() {
        let formHTML;
        let {loading, selectedTemplate,template, selectedPlan, selectedTier, tier} = this.state;
        if(loading){
            return <Load/>;
        }
        let currentTemplate = template;
        let formEmbed = (<div>
            {selectedTemplate && <div>
                <select onChange={this.changeTier}>
                    <option key={"default-0"} value="0">Select a tier</option>
                    {currentTemplate.references.tiers.map((tier, index) => {
                        return (<option key={tier.id} value={index}>{tier.name}</option>)
                    })}
                </select>
                {selectedTier && <select onChange={this.changePlan}>
                    <option key={"default-0"} value="0">Select a plan</option>
                    {tier.references.payment_structure_templates.map(plan => {
                        return (<option key={plan.id} value={plan.id}>{`${plan.amount/100} - ${plan.interval} - ${plan.type}`}</option>)
                    })}
                </select>}
                {selectedPlan && <ServicebotCheckoutEmbed
                    useAsComponent={true}
                    templateId={selectedTemplate}
                    paymentStructureTemplateId={selectedPlan}
                    url={""}
                />}
            </div>}
        </div>)
        return formEmbed

    }
}
export default RequestPage;