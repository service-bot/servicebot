import React from 'react';
import {Link} from 'react-router';
import Fetcher from '../../utilities/fetcher.jsx';
import Load from '../../utilities/load.jsx';
import ServiceInstanceMessageForm from '../../elements/forms/service-instance-message-form.jsx';
import DateFormat from '../../utilities/date-format.jsx';

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
        console.log('get messages url',self.state.url);
        Fetcher(self.state.url).then(function(response){
            if(response != null){
                if(!response.error){
                    console.log("instance messages",response);
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
            console.log("the messages", messages);
            if(messages.length > 0){
                return (
                    <div id="service-instance-message" className="row">
                        <div className="col-xs-12 service-comments service-block">
                            <h5 className="m-b-20">Have questions?</h5>
                            <div className="comments">
                                <ul className="comments-list">
                                    {messages.map((message)=>{
                                        return(
                                            <li key={message.id} className="comment">
                                                <div className="comment-icon badge badge-sm">
                                                    <Link to="#"><img className="avatar-img" src={`/api/v1/users/${message.user_id}/avatar`} alt="..."/></Link>
                                                </div>
                                                <div className="media-body">
                                                    <small className="message-date"><DateFormat time date={message.created_at}/></small>
                                                    <h4 className="media-heading"><strong>{message.references.users[0].name}</strong></h4>
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
                    <div id="service-instance-message" className="row">
                        <div className="col-xs-12 service-comments service-block">
                            <h5>Have questions?</h5>
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
