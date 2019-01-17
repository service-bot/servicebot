import React from 'react'
import {browserHistory} from 'react-router'
import Load from '../../utilities/load.jsx'
import {Fetcher} from "servicebot-base-form"
import {Authorizer, isAuthorized} from "../../utilities/authorizer.jsx"
import Content from "../../layouts/content.jsx"
import {DataForm} from "../../utilities/data-form.jsx"
import {Wysiwyg, WysiwygTemplater} from "../wysiwyg.jsx"
import 'react-tagsinput/react-tagsinput.css'
import Buttons from "../buttons.jsx"
import { Section } from "../../layouts/section.jsx"
import { Columns, Rows } from "../../layouts/columns.jsx"

class NotificationTemplateForm extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loading : true,
            template : {},
            url : "/api/v1/notification-templates/" + props.params.id,
            roleUrl : "/api/v1/roles",
            roles : [],
            success: false
        }

        this.handleFiles = this.handleFiles.bind(this)
        this.handleResponse = this.handleResponse.bind(this)
        this.handleRole = this.handleRole.bind(this)
        this.insertString = this.insertString.bind(this)
        this.handleResetSuccess = this.handleResetSuccess.bind(this)
    }

    componentDidMount() {
        if(!isAuthorized({permissions:"can_administrate"})){
            return browserHistory.push("/login")
        } else {
            this.fetchData()
        }
    }

    fetchData(){
        let self = this
        Fetcher(self.state.url).then(function(response){
            if(!response.error){

                return response
            }
        //then get the roles
        }).then(function(r){
            if(r){
                Fetcher(self.state.url + "/roles").then(function(roles){
                    if(!roles.error) {
                        Fetcher(self.state.roleUrl).then(function(allRoles){
                            let roleIds = roles.map(role => role.data.id)
                            self.setState({loading: false, template: r, templateRoles: roles, allRoles:allRoles, roles: roleIds})
                        })
                    }

                })
            }
        })


        }
    handleRole(id){
        let self = this
        return function(e) {
            const target = e.target
            if (target.checked) {
                if (!self.state.roles.includes(id)){
                    self.setState({roles: self.state.roles.concat(id)})
                }
            }else{
                self.setState({roles: self.state.roles.filter(role => role != id)})
            }

    }}
    handleFiles(e){
        e.preventDefault()
    }

    handleResponse(response){
        let self = this
        Fetcher(this.state.url + "/roles", "PUT", this.state.roles).then(function(response2){
            self.setState({success: true})
        })
    }

    handleResetSuccess(){
        this.setState({success: false})
    }

    // handleImage(url, id){
    //     //This function is unused
    //     var self = this
    // }


    insertString(html) {
        let self = this
        return function (e){
            e.preventDefault()
            self.refs.wysiwygTemplater.refs.wysiwyg.insert(html)
        }
    }

    humanString(text, capitalize = false){
        let humanText = text.replace(/_/g, ' ')
        return capitalize ? <span className={`capitalize`}>{humanText}</span> : humanText
    }

    render() {

        if(this.state.loading) {
            return <Load/>
        }else{
            let template = this.state.template
            let roles = this.state.templateRoles
            let allRoles = this.state.allRoles
            let references = template.schema.references

            return <React.Fragment>
                    <Authorizer permissions={["can_administrate", "can_manage"]}>
                        <div className="app-content __edit-email-templates">
                            <Content>
                                <div className={`_title-container`}>
                                    <h1 className={`_heading`}>Edit Notification Template</h1>
                                </div>
                                <DataForm handleResponse={this.handleResponse} url={this.state.url} method="PUT">
                                <Columns>
                                    <Rows>
                                        <Section className={`__email-description`}>
                                            <h3>Email template name</h3>
                                            <p>{this.humanString(template.data.name)}</p>
                                            <h3>Description</h3>
                                            <p>{template.data.description}</p>
                                        </Section>
                                        {/* <Section className={`__email-role-settings`}>
                                                    <h3>The notification will be sent to all users with the roles.</h3>
                                                    {allRoles.map(role => {
                                                        let checked = roles.some(function(checkedRole){
                                                            return role.id === checkedRole.data.id
                                                        })
                                                        return (
                                                            <div className={`sb-form-group`} key={role.id}>
                                                                <input receiveOnChange={false} onChange={this.handleRole(role.id)} type="checkbox" defaultChecked={checked}/>
                                                                <label className={`_label-`}> {role.role_name}</label>
                                                                <span className={`form-help-text`}>{role.role_name === "user" && " - email will be sent to all users"}</span>
                                                            </div>
                                                        )
                                                    })}
                                        </Section> */}
                                        <Section className={`__email-notification-settings`}>
                                                <h3>Notification Settings</h3>
                                                {/* <div className={`sb-form-group`}>
                                                    <input className={`_input- checkbox`} name="create_notification" type="checkbox" defaultChecked={template.data.create_notification}/>
                                                    <label className="_label-">Create Notification</label>
                                                </div> */}
                                                <div className={`sb-form-group`}>
                                                    <input className={`_input- checkbox`} name="send_email" type="checkbox" defaultChecked={template.data.send_email}/>
                                                    <label className="_label-"> Enabled</label>
                                                </div>
                                                {/* <div className={`sb-form-group`}>
                                                    <input className={`_input- checkbox`} name="send_to_owner" type="checkbox" defaultChecked={template.data.send_to_owner}/>
                                                    <label className="_label-"> Send Email To Owner</label>
                                                </div> */}
                                        </Section>
                                    </Rows>
                                    <Rows>
                                        <Section>
                                            <h3>Email Content</h3>
                                            <h4>Subject</h4>
                                            <div className={`sb-form-group _group-email-subject`}>
                                                <input className={`default-input _input- _input-email-subject`} type="text" name="subject" defaultValue={template.data.subject}/>
                                            </div>
                                            <React.Fragment>
                                                <h4 className="text-capitalize">{this.humanString(`Available fields for ${template.data.name}`, true)}</h4>
                                                <span className="form-help-text">Available data fields, you can insert data fields related to this event ({this.humanString(template.data.name)}) into the body of your notification.</span>
                                                <ul className = "templateList">
                                                    {Object.keys(template.schema).map(field => {
                                                        if(field === "references"){
                                                            return Object.keys(references).map(reference => {
                                                                return (
                                                                    <div className={`__reference-fields`}>
                                                                        <h4 className="text-capitalize">{this.humanString(`${reference} fields`, true)}</h4>
                                                                        <ul key={reference} className="templateList">
                                                                            {Object.keys(references[reference]).map(referenceColumn => {
                                                                                return (
                                                                                    <li key={referenceColumn} className="column reference-column">
                                                                                        <button className="buttons btn-sm btn-info" onClick={this.insertString(`[[references.${reference}.${referenceColumn}]]`)}>{this.humanString(referenceColumn, true)}</button>
                                                                                    </li>)
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                )
                                                            })
                                                        }else{
                                                            return <li key={field} className="column">
                                                                <button className="buttons btn-sm btn-info" onClick={this.insertString(`[[${field}]]`)}>{this.humanString(field, true)}</button>
                                                            </li>
                                                        }
                                                    })}
                                                </ul>
                                            </React.Fragment>
                                            <h4>Body</h4>
                                            <WysiwygTemplater receiveValue={true} receiveOnChange={true} name="message" defaultValue={template.data.message} ref="wysiwygTemplater" schema={template.schema}/>
                                            <div className="p-t-15">
                                                <Buttons buttonClass={`__save-email-template`} btnType="primary" text="Save Notification Template" type="submit" loading={this.state.ajaxLoad} success={this.state.success} reset={this.handleResetSuccess}/>
                                                <div className="clearfix"/>
                                            </div>
                                        </Section>
                                    </Rows>
                                </Columns>
                                </DataForm>
                            </Content>
                        </div>
                    </Authorizer>
                </React.Fragment>
        }
    }

}

export default NotificationTemplateForm
