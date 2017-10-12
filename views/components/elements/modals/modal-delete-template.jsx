import React from 'react';
import cookie from 'react-cookie';
import Load from "../../utilities/load.jsx";
import Fetcher from "../../utilities/fetcher.jsx"
import {browserHistory} from 'react-router';
import Modal from '../../utilities/modal.jsx';
import Alerts from "../alerts.jsx";

class ModalDeleteTemplate extends React.Component {

    constructor(props){
        super(props);
        let templateObject = this.props.templateObject;
        this.state = {  loading: true,
            template: templateObject,
            template_id: templateObject.id,
            action_url: `/api/v1/service-templates/${templateObject.id}`,
            current_modal: 'modal_action',
            alerts: {}
        };
        this.onDelete = this.onDelete.bind(this);
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
            }else{
                console.error("failed called api delete", `/api/v1/service-templates/${self.state.template_id}`);
            }
            self.setState({loading: false});
        })
    }

    onDelete(event){
        let self = this;
        event.preventDefault();
        self.setState({loading:false});
        Fetcher(self.state.action_url, "DELETE", {}).then(function (response) {
            if (!response.error) {
                self.setState({loading: false, current_modal: 'modal_action_success'});
            } else {
                self.setState({
                    loading: false,
                    alerts: {
                        type: 'danger',
                        icon: 'times',
                        message: 'Service template has attached instances. Cannot delete!'
                    }
                });
            }
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
            let pageName = "Delete a Service";
            let pageMessage = "delete";
            let actionFunction = this.onDelete;
            let currentModal = self.state.current_modal;
            let template = self.state.template;
            let name = template.name;
            let description = template.description;
            let status = template.published;

            if (currentModal == 'modal_action') {
                return (
                    <Modal modalTitle={pageName} show={self.props.show} hide={self.props.hide} hideFooter={true}
                           top="40%" width="490px">
                        <div className="table-responsive">
                            <div className="p-20">
                                {(this.state.alerts && this.state.alerts.message) &&
                                <div>
                                    <Alerts type={this.state.alerts.type} message={this.state.alerts.message}/>
                                </div>
                                }
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
                                <button className="btn btn-primary btn-rounded" onClick={actionFunction}>
                                    <span className="capitalize">{pageMessage}</span>
                                </button>
                                <button className="btn btn-default btn-rounded" onClick={self.props.hide}>Nevermind</button>
                            </div>
                        </div>
                    </Modal>
                );
            } else if (currentModal == 'modal_action_success') {
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

export default ModalDeleteTemplate;
