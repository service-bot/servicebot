import React from 'react';
import Fetcher from "../utilities/fetcher.jsx"
import DataTable from "../elements/datatable/datatable.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {connect} from "react-redux";
import {setNotifications, addNotification} from "../utilities/actions";
import {isAuthorized} from "../utilities/authorizer.jsx"
import ModalNotification from "../elements/modals/modal-notification.jsx";

class Notification extends React.Component{

   render(){
       return <div>
           <div>
              Subject :  {this.props.subject}
           </div>
           <br/>
           <p>TYPE : {this.props.type}</p>
           <br/>
           <div>
               Message : {this.props.message}
           </div>
       </div>

   }
}

class NavNotification extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        let unread = this.props.notifications.filter(notification => !notification.read);
        return (
            <li className="nav-notification">
                <i className="fa fa-bell" aria-hidden="true"/>
                {unread.length ? unread.length : ''}
            </li>
        )
    }
}
// class SystemNotificationList extends React.Component{
//     constructor(props){
//         super(props);
//     }
//     render(){
//         console.log("RENDING SYSTEMS")
//         let notifications = this.props.system_notifications.map(notification => {
//             return (<li key={notification.id}><Notification {...notification} /></li>)
//         })
//
//         return (<ul>
//             {notifications}
//         </ul>)
//     }
//
// }
class NotificationList extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            lastFetch: Date.now(),
            viewMessage: null
        };

        this.modSubject = this.modSubject.bind(this);
        this.modMessage = this.modMessage.bind(this);
        this.trimText = this.trimText.bind(this);
        this.dismiss = this.dismiss.bind(this);
        this.openMessageModel = this.openMessageModel.bind(this);
        this.closeMessageModel = this.closeMessageModel.bind(this);
    }

    componentWillReceiveProps(nextProps){
        console.log("getting new props", nextProps);
    }

    dismiss(dataObj){
        console.log("dismissing", dataObj);
        let self = this;
        let read = {read: true};
        Fetcher(`/api/v1/notifications/${dataObj.id}`, 'PUT', read).then(function (response) {
            if(!response.error){
                self.setState({lastFetch: Date.now()});
                self.props.setNotifications({...self.props.notifications, })
            }
        })
    }

    modSubject(data, dataObj){
        if(data.length <= 40){
            return (data);
        }else{
            return this.trimText(data, 40);
        }
    }
    modMessage(data, dataObj){
        if(data.length <= 90){
            return (
                <span className="btn-link" onClick={()=>{return (this.openMessageModel(dataObj))}}>{data}</span>
            );
        }else {
            let trimmedHTML = this.createMarkup(this.trimText(data, 90).props.children);
            return (
                <span className="trimmed-text btn-link" onClick={()=>{return (this.openMessageModel(dataObj))}} dangerouslySetInnerHTML={trimmedHTML}/>
            );
        }
    }
    modCreatedAt(data, dataObj){
        return (
            <DateFormat date={data} time/>
        )
    }

    rowClasses(dataObj){
        if(!dataObj.read){
            console.log('returning unread');
            return 'unread';
        }else{
            console.log('returning read');
            return 'read';
        }
    }

    openMessageModel(dataObj){
        this.setState({viewMessage: dataObj});
        this.dismiss(dataObj);
    }
    closeMessageModel(){
        console.log("clicked close");
        this.setState({viewMessage: null});
    }

    createMarkup(html){
        return {__html: html}
    }

    trimText(data, limit){
        if(data.length <= limit){
            return (data);
        }else {
            return (
                <span className="trimmed-text">{data.slice(0, limit)}</span>
            );
        }
    }

    render(){

        let notificationType = this.props.notificationType;
        let notifications = notificationType == '_SYSTEM' ? this.props.system_notifications : this.props.notifications;
        let notificationsNullMessage = notificationType == '_SYSTEM' ? "No system notifications at this time" : "No notifications at this time";

        console.log("readering notificationlist", notifications);

        return (
            <div>
                <DataTable
                    dataObj={notifications}
                    col={['id', 'subject', 'message', 'created_at']}
                    colNames={['ID', 'Subject', 'Message', 'Created At']}
                    mod_message={this.modMessage}
                    mod_created_at={this.modCreatedAt}
                    rowClasses={this.rowClasses}
                    nullMessage={notificationsNullMessage}
                    lastFetch={this.state.lastFetch}
                />
                {this.state.viewMessage != null && <ModalNotification key="notification-modal" hide={this.closeMessageModel} notification={this.state.viewMessage}/>}
            </div>
        )
    }
}
class Notifications extends React.Component{
    //this has both system and user notifications

    constructor(props){
        super(props);
        this.state = {
            "url" : "/api/v1/notifications"
        }
        console.log("Notifications props", this.props);
    }
    componentDidMount() {
        let self = this;
        Fetcher(self.state.url + "/own")
            .then(function(response){
                if(!response.error){
                    console.log(response);
                    return self.props.setNotifications(response);
                }
            })
            .then(response => {
                if(isAuthorized({permissions: "put_notification_templates_id"})){
                    console.log("system")
                    return Fetcher(self.state.url + "/system")

                }else{
                    console.log("BAD");
                    throw "not authorized for system"
                }
            })
            .then((sys_notifications) => self.props.setNotifications(sys_notifications, true))
            .catch((err) => Promise.reject());
    }
    render(){
        return (
            <div>
                <Jumbotron pageName={this.props.route.name} location={this.props.location}/>
                <div className="page-service-instance">
                    <Content>
                        <div className="row m-b-20">
                            <div className="col-xs-12">
                                <ContentTitle icon="user" title="Notifications"/>
                                <p><strong>System Notifications</strong></p>
                                {isAuthorized({permissions: "put_notification_templates_id"}) && <NotificationList notificationType="_SYSTEM"/>}
                                <p><strong>User Notifications</strong></p>
                                <NotificationList/>
                            </div>
                        </div>
                    </Content>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state){
    console.log(state);
    return {
        system_notifications: state.system_notifications,
        notifications : state.notifications
    }
}
function mapDispatchToProps(dispatch){
    return {
        setNotifications : (notifications, system=false) => {console.log("SYS", system, notifications); return dispatch(setNotifications(notifications, system))},
        addNotification : (notification, system=false) => { return dispatch(addNotification(notification, system)) }
    }
}
Notifications = connect(null, mapDispatchToProps)(Notifications);
NotificationList = connect(mapStateToProps, mapDispatchToProps)(NotificationList);
// SystemNotificationList = connect(mapStateToProps)(SystemNotificationList);
NavNotification = connect(mapStateToProps)(NavNotification);


export { Notification, Notifications, NavNotification }