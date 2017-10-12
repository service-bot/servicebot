
import React from 'react';
import {browserHistory} from 'react-router';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx";
import Jumbotron from "../../layouts/jumbotron.jsx";
import Content from "../../layouts/content.jsx";
import {DataForm, DataChild, DataInput} from "../../utilities/data-form.jsx";
import {Wysiwyg, WysiwygTemplater} from "../wysiwyg.jsx";
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import Buttons from "../buttons.jsx";

class NotificationTemplateForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            template : {},
            url : "/api/v1/notification-templates/" + props.params.id,
            roleUrl : "/api/v1/roles",
            roles : [],
            success: false
        };

        this.handleFiles = this.handleFiles.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.handleRole = this.handleRole.bind(this);
        this.insertString = this.insertString.bind(this);
        this.handleResetSuccess = this.handleResetSuccess.bind(this);
    }

    componentDidMount() {
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login");
        } else {
            this.fetchData();
        }
    }

    fetchData(){
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(!response.error){

                return response;
            }
        //then get the roles
        }).then(function(r){
            if(r){
                Fetcher(self.state.url + "/roles").then(function(roles){
                    if(!roles.error) {
                        Fetcher(self.state.roleUrl).then(function(allRoles){
                            let roleIds = roles.map(role => role.data.id);
                            self.setState({loading: false, template: r, templateRoles: roles, allRoles:allRoles, roles: roleIds});
                        })
                    }

                })
            }
        });


        }
    handleRole(id){
        let self = this;
        return function(e) {
            const target = e.target;
            if (target.checked) {
                if (!self.state.roles.includes(id)){
                    self.setState({roles: self.state.roles.concat(id)})
                }
            }else{
                self.setState({roles: self.state.roles.filter(role => role != id)})
            }

    }}
    handleFiles(e){
        e.preventDefault();
    }

    handleResponse(response){
        let self = this;
        Fetcher(this.state.url + "/roles", "PUT", this.state.roles).then(function(response2){
            self.setState({success: true});
        });
    }

    handleResetSuccess(){
        let self = this;
        self.setState({success: false});
    }

    handleImage(url, id){
        //This function is unused
        var self = this;
    }


    insertString(html) {
        let self = this;
        return function (e){
            e.preventDefault();
            self.refs.wysiwygTemplater.refs.wysiwyg.insert(html);
        }
    }

    humanString(text){
        return(text.replace(/_/g, ' '));
    }

    render() {

        if(this.state.loading) {
            return <Load/>;
        }else{
            let pageName = this.state.template.data.name || this.props.route.name;
            let template = this.state.template;
            let roles = this.state.templateRoles;
            let allRoles = this.state.allRoles;
            let references = template.schema.references;

            return(
                <div>
                    <Authorizer permissions={["can_administrate", "can_manage"]}>
                        <Jumbotron pageName={pageName} location={this.props.location}/>
                        <div className="page-service-instance">
                            <Content>
                                <div className="row m-b-20">
                                    <div className="col-sm-8 col-md-9">
                                        <div className="service-instance-section">
                                            <span className="service-instance-section-label"><strong>Editing Notification Template</strong></span>
                                            <h4>{template.data.name}</h4>
                                        </div>
                                        <div className="service-instance-section">
                                            <span className="service-instance-section-label"><strong>Select the roles you want this email to be sent to</strong></span>
                                            <span className="help-block">The notification will be sent to all users with the roles.</span>
                                        {allRoles.map(role => {

                                            let checked = roles.some(function(checkedRole){
                                                return role.id == checkedRole.data.id
                                            });


                                            return (
                                                <div key={role.id}>
                                                    <input onChange={this.handleRole(role.id)} type="checkbox" defaultChecked={checked}/>
                                                    <span> {role.role_name}</span>
                                                    <span>{role.role_name == "user" && " - email will be sent to all users"}</span>
                                                </div>
                                            )
                                        })}
                                        </div>
                                        <DataForm handleResponse={this.handleResponse} url={this.state.url} method="PUT">
                                            <div className="service-instance-section notification-settings-section">
                                                <span className="service-instance-section-label"><strong>Notification Settings</strong></span>

                                                <input name="create_notification" type="checkbox" defaultChecked={template.data.create_notification}/> <span>Create Notification</span><br/>
                                                <input name="send_email" type="checkbox" defaultChecked={template.data.send_email}/> <span className="inline"> Send Email</span><br/>
                                                <input name="send_to_owner" type="checkbox" defaultChecked={template.data.send_to_owner}/> <span className="inline"> Send Email To Owner</span>
                                            </div>
                                            {/*<div className="service-instance-section">*/}
                                                {/*<span className="service-instance-section-label"><strong>Additional Recipients</strong></span>*/}
                                                {/*<span className="help-block">Add recipients directly, these will be people who will also get this email notification for this event.</span>*/}
                                                {/*<TagsInput  name="additional_recipients" receiveOnChange={true} receiveValue={true} defaultValue={template.data.additional_recipients || []}/>*/}
                                            {/*</div>*/}
                                            <div className="service-instance-section">
                                                <span className="service-instance-section-label"><strong>Description</strong></span>
                                                <p>{template.data.description}</p>
                                            </div>
                                            <div className="service-instance-section">
                                                <span className="service-instance-section-label"><strong>Subject</strong></span>
                                                <input type="text" name="subject" defaultValue={template.data.subject}/>
                                            </div>
                                            <div className="service-instance-section">
                                                <span className="service-instance-section-label"><strong>Body</strong></span>
                                                <WysiwygTemplater receiveValue={true} receiveOnChange={true} name="message" defaultValue={template.data.message} ref="wysiwygTemplater" schema={template.schema}/>
                                                <div className="p-t-15">
                                                    <Buttons btnType="primary" text="Save Notification Template" type="submit" loading={this.state.ajaxLoad} success={this.state.success} reset={this.handleResetSuccess}/>
                                                    <div className="clearfix"/>
                                                </div>
                                            </div>
                                        </DataForm>
                                    </div>
                                    <div className="col-sm-4 col-md-3">
                                        <div className="service-instance-section">
                                            <span className="service-instance-section-label"><strong>Data Fields</strong></span>
                                            <span className="help-block">Available data fields, you can insert data fields related to this event ({this.humanString(template.data.name)}) into the body of your notification.</span>
                                            <ul className = "templateList">
                                                <span className="help-block text-capitalize">{this.humanString(template.data.name)} Fields</span>
                                                {Object.keys(template.schema).map(field => {
                                                    if(field == "references"){
                                                        return Object.keys(references).map(reference => {
                                                            return (
                                                                <ul key={reference} className="referenceList list-group">
                                                                    <span className="help-block text-capitalize">{this.humanString(reference)} Fields</span>
                                                                    {Object.keys(references[reference]).map(referenceColumn => {
                                                                        return (
                                                                        <li key={referenceColumn} className="column reference-column list-unstyled">
                                                                            <button className="btn btn-sm btn-info" onClick={this.insertString(`[[references.${reference}.${referenceColumn}]]`)}>{referenceColumn}</button>
                                                                        </li>)
                                                                    })}
                                                                </ul>
                                                            )
                                                        })
                                                    }else{
                                                        return (
                                                            <div>
                                                                <li key={field} className="column list-unstyled">
                                                                    <button className="btn btn-sm btn-info" onClick={this.insertString(`[[${field}]]`)}>{field}</button>
                                                                </li>
                                                            </div>
                                                        )
                                                    }
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </Content>
                        </div>
                    </Authorizer>
                </div>);
        }
    }

}

export default NotificationTemplateForm
