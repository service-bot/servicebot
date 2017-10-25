import React from 'react';
import cookie from 'react-cookie';
import Load from "../../utilities/load.jsx";
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';

class ModalPublishingTemplate extends React.Component {

    constructor(props){
        super(props);
        let templateObject = this.props.templateObject;
        this.state = {  loading: true,
                        template: templateObject,
                        template_id: templateObject.id,
                        unpublish_url: `/api/v1/service-templates/${templateObject.id}`,
                        current_modal: 'model_publishing'
        };
        this.onUnpublish = this.onUnpublish.bind(this);
        this.onPublish = this.onPublish.bind(this);
        this.fetchTemplate = this.fetchTemplate.bind(this);
    }

    componentDidMount(){
        this.fetchTemplate();
    }

    fetchTemplate(){
        let self = this;
        Fetcher(`/api/v1/service-templates/${self.state.template_id}`, "GET", {}).then(function (response) {
            if(!response.error){
                self.setState({loading: false, template: response});
            }
            self.setState({loading: false});
        })
    }

    onUnpublish(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});

        Fetcher(self.state.unpublish_url, "PUT", {"published": "false"}).then(function (response) {
            if (!response.error) {
                self.setState({loading: false, current_modal: 'model_publishing_action_success'});
            }
            self.setState({loading: false});
        })
    }

    onPublish(event){
        event.preventDefault();
        let self = this;
        self.setState({loading:false});

        Fetcher(self.state.unpublish_url, "PUT", {"published": "true"}).then(function (response) {
            if (!response.error) {
                self.setState({loading: false, current_modal: 'model_publishing_action_success'});
            }
            self.setState({loading: false});
        })
    }

    handleUnauthorized(){
        browserHistory.push("/login");
    }

    render () {

        if(this.state.loading){
            return (
                <Load/>
            );
        }else {
            let self = this;
            let pageName = "";
            let pageMessage = "";
            let publishingFunction = false;
            let currentModal = self.state.current_modal;
            let template = self.state.template;
            let name = template.name;
            let description = template.description;
            let status = template.published;
            if(status){
                pageName = "Unpublish a Service";
                pageMessage = "unpublish";
                publishingFunction = self.onUnpublish;
            }else{
                pageName = "Publish a Service";
                pageMessage = "publish"
                publishingFunction = self.onPublish;
            }

            if (currentModal == 'model_publishing') {
                return (
                    <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true}
                           top="40%" width="490px">
                        <div className="table-responsive">
                            <div className="p-20">
                                <div className="row">
                                    <div className="col-xs-12">
                                        <p><strong>You are about to {pageMessage} the following service.</strong>
                                        </p>
                                        <ul>
                                            <li>Service: {name}</li>
                                            <li>Description: {description}</li>
                                            <li>Status: {status ? 'Published' : 'Unpublished'}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className={`modal-footer text-right p-b-20`}>
                                <button className="btn btn-primary btn-rounded" onClick={publishingFunction}>
                                    <span className="capitalize">{pageMessage}</span>
                                </button>
                                <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Nevermind</button>
                            </div>
                        </div>
                    </Modal>
                );
            } else if (currentModal == 'model_publishing_action_success') {
                return (
                    <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide}>
                        <div className="table-responsive">
                            <div className="p-20">
                                <div className="row">
                                    <div className="col-xs-12">
                                        <p><strong>You have successfully {pageMessage} {name}</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal>
                );
            }
        }

    }
}

export default ModalPublishingTemplate;
