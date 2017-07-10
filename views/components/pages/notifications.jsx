import React from 'react';
import Fetcher from "../utilities/fetcher.jsx"
import {connect} from "react-redux";
import {setNotifications} from "../utilities/actions";
class Notification extends React.Component{

   render(){
       return <div>
           <div>
              Subject :  {this.props.subject}
           </div>
           <br/>
           <br/>
           <div>
               Message : {this.props.message}
           </div>
       </div>

   }
}
class SystemNotificationList extends React.Component{

}
class NotificationList extends React.Component{

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
        Fetcher(self.state.url).then(function(response){
            if(!response.error){
                console.log(response);
                return self.props.setNotifications(response);
            }
        });
    }
    render(){
        return (<NotificationList/>)
    }
}

function mapStateToProps(state){
    return {
        notifications : state.notifications
    }
}
function mapDispatchToProps(dispatch){
    return {
        setNotifications : (notifications) => {return setNotifications(notifications)}
    }
}
Notifications = connect(null, mapDispatchToProps)(Notifications);
NotificationList = connect(mapStateToProps)(NotificationList);

export { Notification, NotificationList, Notifications }