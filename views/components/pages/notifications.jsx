import React from 'react';
import Fetcher from "../utilities/fetcher.jsx"
import {connect} from "react-redux";
import {setNotifications, addNotification} from "../utilities/actions";
import {isAuthorized} from "../utilities/authorizer.jsx"
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
        return <li>{unread.length} messages</li>
    }
}
class SystemNotificationList extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        console.log("RENDING SYSTEMS")
        let notifications = this.props.system_notifications.map(notification => {
            return (<li key={notification.id}><Notification {...notification} /></li>)
        })

        return (<ul>
            {notifications}
        </ul>)
    }

}
class NotificationList extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        let notifications = this.props.notifications.map(notification => {
            return (<li key={notification.id}><Notification {...notification} /></li>)
        })

        return (<ul>
            {notifications}
        </ul>)
    }
}
class Notifications extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            "url" : "/api/v1/notifications"
        }
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
                if(isAuthorized({permissions: "put_email_templates_id"})){
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

        return (<div>
            {isAuthorized({permissions: "put_email_templates_id"}) && <SystemNotificationList/>}
            <NotificationList/></div>)
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
        setNotifications : (notifications, system=false) => {console.log("SYS", system, notifications);return dispatch(setNotifications(notifications, system))},
        addNotification : (notification, system=false) => {return dispatch(addNotification(notification, system))}
    }
}
Notifications = connect(null, mapDispatchToProps)(Notifications);
NotificationList = connect(mapStateToProps)(NotificationList);
SystemNotificationList = connect(mapStateToProps)(SystemNotificationList);
NavNotification = connect(mapStateToProps)(NavNotification);


export { Notification, NotificationList, Notifications,NavNotification }