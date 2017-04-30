
import React from 'react';
import Load from '../utilities/load.jsx';
import {Link, browserHistory} from 'react-router';
import Alert from 'react-s-alert';
import Fetcher from "../utilities/fetcher.jsx"
import {DataForm, DataChild, DataInput} from "../utilities/data-form.jsx";
import {Wysiwyg, WysiwygTemplater} from "../elements/wysiwyg.jsx";
import TagsInput from 'react-tagsinput'
import 'react-tagsinput/react-tagsinput.css'

class EmailTemplateForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading : true,
            template : {},
            url : "/api/v1/email-templates/" + props.params.templateId,
            roleUrl : "/api/v1/roles",
            roles : []

        }
        this.handleFiles = this.handleFiles.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.handleRole = this.handleRole.bind(this);

    }

    componentDidMount() {
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(!response.error){

                console.log(response);
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
            console.log("HELLO!");
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
        // console.log($(".yo"));
        // $('#content').redactor({
        //     focus: true
        // });

        // let self = this;
        // let url = this.state.url;
        // self.handleImage(url + "/image", "template-image-form").then(function(result){
        //     console.log(result);
        //     self.handleImage(url + "/icon", "template-icon-form").then(function(result2){
        //         console.log(result2);
        //         self.forceUpdate();
        //     })
        // });

    }
    handleResponse(response){
        Fetcher(this.state.url + "/roles", "PUT", this.state.roles).then(function(response2){
            console.log(response2)
        })
        console.log(response);

    }

    handleImage(url, id){
        console.log("HELLO!");
        var self = this;



    }





    render() {

        if(this.state.loading) {
            return <Load/>;
        }else{
            console.log("HELLO!?")
            console.log(this.state.template);
            let template = this.state.template;
            let roles = this.state.templateRoles;
            let allRoles = this.state.allRoles;

            return(<div>
                <span>{JSON.stringify(this.state.roles)}</span>
                {allRoles.map(role => {
                    console.log(role)
                    console.log(roles);

                    let checked = roles.some(function(checkedRole){
                        return role.id == checkedRole.data.id
                    });
                    console.log(checked);


                    return (
                        <div key={role.id}>
                        <input onChange={this.handleRole(role.id)} type="checkbox" defaultChecked={checked}/>{role.role_name}
                        </div>
                    )
                })}
                <DataForm handleResponse={this.handleResponse} url={this.state.url} method="PUT">
                    <DataInput defaultValue="SUP" name="whatisit"/>
                    <input type="email" multiple name="additional_recipients"/>
                    <TagsInput onChange={this.handleImage} name="test" receiveOnChange={true} receiveValue={true} value={["hello", "hoo"]}/>
                    <h4>{template.data.name}</h4>
                    Subject:<input type="text" name="email_subject" defaultValue={template.data.email_subject}/>
                    <WysiwygTemplater receiveValue={true} receiveOnChange={true} name="email_body" defaultValue={template.data.email_body} schema={template.schema}/>
                    <button type="submit" value="submit">Submit</button>
                </DataForm>
                <div className="yo">
                    <h3>MY USER</h3>
                </div>
            </div>);
        }
    }

}

export default EmailTemplateForm
