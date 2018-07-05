import React from 'react';
import cookie from 'react-cookie';
import Modal from '../../utilities/modal.jsx';

class ModalEmbedTemplate extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }


    render () {
        let self = this;
        let pageName = "Embed a request form";
        let pageMessage = "embed";
        let currentModal = self.state.current_modal;
        let embedHTML = `<div id="servicebot-request-form"></div>
<script src="https://js.stripe.com/v3/"></script>
<script src="https://servicebot.io/js/servicebot-embed.js" type="text/javascript"></script>
<script  type="text/javascript">
Servicebot.init({
    templateId : ${this.props.templateObject.id},
    url : "${window.location.origin}",
    selector : document.getElementById('servicebot-request-form'),
    handleResponse : (response) => {
        //Response function, you can put redirect logic or app integration logic here
    },
    spk: "${cookie.load("spk")}",
    forceCard : false
})
</script>`
            return (
                <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true}
                       top="40%" width="800px">
                    <div className="table-responsive">
                        <div className="p-20">
                            <span>Put this code in your app to generate a request form for this template</span>
                            <pre><code>{embedHTML}</code></pre>
                        </div>
                    </div>
                </Modal>
            );



    }
}

export default ModalEmbedTemplate;
