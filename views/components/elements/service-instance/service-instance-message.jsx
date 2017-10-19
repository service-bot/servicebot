import React from 'react';
import {Link} from 'react-router';
import Fetcher from '../../utilities/fetcher.jsx';
import Load from '../../utilities/load.jsx';
import {isAuthorized} from '../../utilities/authorizer.jsx';
import ServiceInstanceMessageForm from '../../elements/forms/service-instance-message-form.jsx';
import DateFormat from '../../utilities/date-format.jsx';
import Avatar from '../../elements/avatar.jsx';

class ServiceInstanceMessage extends React.Component {

    constructor(props){
        super(props);
        let id = this.props.instanceId;
        this.state = {  instanceId: id,
                        loading: true,
                        url: `/api/v1/service-instance-messages?key=service_instance_id&value=${id}`,
                        messages: false
                        };
        this.fetchMessages = this.fetchMessages.bind(this);
        this.handleComponentUpdating = this.handleComponentUpdating.bind(this);
    }

    componentDidMount(){
        this.fetchMessages();
    }

    fetchMessages(){
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(response != null){
                if(!response.error){
                    self.setState({messages : response});
                }
            }
            self.setState({loading:false});
        })
    }

    handleComponentUpdating(){
        this.fetchMessages();
    }

    render () {

        let self = this;

        if(self.state.loading){
            return (
                <div id="service-instance-message" className="row">
                    <div className="col-xs-12 service-comments service-block">
                        <h5 className="m-b-20">Have questions?</h5>
                            <Load/>
                    </div>
                </div>);
        }else{
            let messages = self.state.messages;
            let getUserURL = (id)=>{
                if(isAuthorized({permissions: "can_administrate"})){
                    return `/manage-users/${id}`;
                }else{
                    return "#";
                }
            };
            if(messages.length > 0){
                return (
                    <div className="service-instance-box">
                        <div className="service-instance-box-title">
                            <span>Have questions?</span>
                        </div>
                        <div className="service-instance-box-content">
                            <div className="comments">
                                <ul className="comments-list">
                                    {messages.map((message)=>{
                                        return(
                                            <li key={message.id} className="comment">
                                                <div className="comment-icon">
                                                    <Avatar size="sm" uid={message.user_id}/>
                                                </div>
                                                <div className="media-body">
                                                    <h4 className="media-heading text-capitalize"><small>{message.references.users[0].name}</small></h4>
                                                    <h4 className="message-date"><small><DateFormat time date={message.created_at}/></small></h4>
                                                    <span className="message-content">{message.message}</span>
                                                </div>
                                            </li>
                                        );})
                                    }
                                </ul>
                            </div>
                            <div>
                                <ServiceInstanceMessageForm instanceId={self.state.instanceId} handleComponentUpdating={self.handleComponentUpdating}/>
                            </div>
                        </div>
                    </div>
                );
            }else{
                return(
                    <div className="service-instance-box">
                        <div className="service-instance-box-title">
                            <span>Have questions?</span>
                        </div>
                        <div className="service-instance-box-content">
                            <div>
                                <ServiceInstanceMessageForm instanceId={self.state.instanceId} handleComponentUpdating={self.handleComponentUpdating}/>
                            </div>
                        </div>
                    </div>
                );
            }
        }
    }
}

export default ServiceInstanceMessage;