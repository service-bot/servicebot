import React from "react";
import cookie from "react-cookie";
import {Fetcher} from "servicebot-base-form";
class CheckoutPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            loading : true,
            selectedTemplate: 0
        }
        this.changeTemplate = this.changeTemplate.bind(this);

    }
    async componentDidMount(){
        let templates = await Fetcher(`/api/v1/service-templates/`);
        this.setState({ templates, loading: false});
    }
    changeTemplate(e) {
        const selectedTemplate = e.currentTarget.value;
        this.setState({selectedTemplate});

    }
    render(props) {
        let formHTML;
        if(this.state.loading){
            return <div>LOADING</div>;
        }

        if (this.state.selectedTemplate === null || this.state.selectedTemplate == 0) {
            formHTML = "Select a template from the list to embed"
        } else {
            formHTML = `<div id="servicebot-request-form"></div>
<script src="https://js.stripe.com/v3/"></script>
<script src="https://servicebot.io/js/servicebot-embed.js" type="text/javascript"></script>
<script  type="text/javascript">
Servicebot.init({
    templateId : ${this.state.selectedTemplate},
    url : "${window.location.origin}",
    selector : document.getElementById('servicebot-request-form'),
    handleResponse : (response) => {
        //Response function, you can put redirect logic or app integration logic here
    },
    type: "request",
    spk: "${cookie.load("spk")}",
    forceCard : false, //set to true if you want credit card to be a required field for the customer
    setPassword : false //set to true if you want customer to fill out a password
})
</script>`
        }
        let formEmbed = (<div>
            <span>Paste the generated HTML on the page you want to embed a request form. You can find more detailed documentation <a
                href="https://docs.servicebot.io/embed">here</a></span>
            <select onChange={this.changeTemplate}>
                <option key={"default-0"} value="0">Select a template</option>
                {this.state.templates.map(template => {
                    return (<option key={template.id} value={template.id}>{template.name}</option>)
                })}
            </select>
            <pre>{formHTML}</pre>
        </div>)
        return formEmbed

    }
}
export default {component : CheckoutPage, name: "Checkout Page", description: "CHECKOUT!!!"}