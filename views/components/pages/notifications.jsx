import React from 'react';
import Fetcher from "../utilities/fetcher.jsx"
import DataTable from "../elements/datatable/datatable.jsx";
import Jumbotron from "../layouts/jumbotron.jsx";
import {Link, browserHistory} from 'react-router';
import Content from "../layouts/content.jsx";
import ContentTitle from "../layouts/content-title.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {connect} from "react-redux";
import {setNotifications, setNotification,setSystemNotifications, addNotification} from "../utilities/actions";
import {isAuthorized} from "../utilities/authorizer.jsx"
import ModalNotification from "../elements/modals/modal-notification.jsx";
let _ = require("lodash");

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
        super(props);

        this.state = {openNotificationDropdown: false, viewMessage: null};

        this.dismiss = this.dismiss.bind(this);
        this.trimText = this.trimText.bind(this);
        this.miniList = this.miniList.bind(this);
        this.openNotificationDropdown = this.openNotificationDropdown.bind(this);
        this.closeNotificationDropdown = this.closeNotificationDropdown.bind(this);
        this.openMessageModel = this.openMessageModel.bind(this);
        this.closeMessageModel = this.closeMessageModel.bind(this);
        this.viewAll = this.viewAll.bind(this);
    }

    dismiss(dataObj){
        let self = this;
        let read = {read: true};
        Fetcher(`/api/v1/notifications/${dataObj.id}`, 'PUT', read).then(function (response) {
            if(!response.error){
                self.setState({lastFetch: Date.now()});
                //dismiss the notification in the Redux store
                self.props.setNotification(response);
            }
        })
    }

    openNotificationDropdown(){
        let unread = this.props.notifications.filter(notification => !notification.read);
        this.setState({openNotificationDropdown: true});
    }
    closeNotificationDropdown(){
        this.setState({openNotificationDropdown: false});
    }

    createMarkup(html){
        let trimmedHTML = this.trimText(html, 100);
        if(html.length > 100){
            trimmedHTML = this.trimText(html, 100).props.children + ' ...';
        }
        return {__html: trimmedHTML}
    }

    openMessageModel(dataObj){
        this.setState({viewMessage: dataObj});
        this.closeNotificationDropdown();
        this.dismiss(dataObj);
    }

    closeMessageModel(){
        this.setState({viewMessage: null});
    }

    viewAll(){
        this.closeNotificationDropdown();
        this.closeMessageModel();
        browserHistory.push('/notifications');
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

    miniList(unread){

        if(this.state.openNotificationDropdown === true) {

            let totalUnread = unread.length;
            if(unread.length && unread.length > 3){
               unread = _.slice(unread, unread.length -3, unread.length);
            }

            return (
                <div className="mini-notification-list">
                    {totalUnread ? <li className="text-center"><strong>{`You have ${totalUnread} unread notifications`}</strong></li> : <span/>}
                    <ul>
                        {unread.length ? unread.map(message => (
                                <li className="unread-message" key={`message-${message.id}`} onClick={()=>{return this.openMessageModel(message)}}
                                    dangerouslySetInnerHTML={this.createMarkup((message.message))}>
                                </li>
                            )) :  <li className="text-center">You have no new notifications</li>
                        }
                        <li className="text-center" onClick={this.viewAll}>View All</li>
                    </ul>
                </div>
            );
        }else{
            return ( <span/> );
        }
    }

    render(){
        let unread = this.props.notifications.filter(notification => !notification.read);

        return (
            <li className="nav-notification">
                <div>
                    <span onClick={this.openNotificationDropdown}>
                        <i className="fa fa-bell nav-notification-icon" aria-hidden="true"/>
                        {unread.length ? <span className="nav-notification-indicator"/> : <span/>}
                        {/*<span className="notification-badge">{unread.length ? unread.length : '0'}</span>*/}
                    </span>
                    {this.miniList(unread)}
                </div>
                {this.state.openNotificationDropdown && <div className="mini-notification-backdrop" onClick={this.closeNotificationDropdown}/>}
                {this.state.viewMessage != null && <ModalNotification key="notification-modal" hide={this.closeMessageModel} notification={this.state.viewMessage}/>}
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


    dismiss(dataObj){
        let self = this;
        let read = {read: true};
        Fetcher(`/api/v1/notifications/${dataObj.id}`, 'PUT', read).then(function (response) {
            if(!response.error){
                self.setState({lastFetch: Date.now()});
                //dismiss the notification in the Redux store
                self.props.setNotification(response);
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
            return 'unread';
        }else{
            return 'read';
        }
    }

    openMessageModel(dataObj){
        this.setState({viewMessage: dataObj});
        this.dismiss(dataObj);
    }
    closeMessageModel(){
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


        return (
            <div>
                <DataTable
                    dataObj={notifications}
                    col={['subject', 'message', 'created_at']}
                    colNames={['Subject', 'Message', 'Created At']}
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
        };
    }
    componentDidMount() {
        let self = this;
        Fetcher(self.state.url + "/own")
            .then(function(response){
                if(!response.error){
                    return self.props.setNotifications(response);
                }
            })
            .then(response => {
                if(isAuthorized({permissions: "put_notification_templates_id"})){
                    return Fetcher(self.state.url + "/system")

                }else{
                    throw "not authorized for system"
                }
            })
            .then((sys_notifications) => self.props.setSystemNotifications(sys_notifications, true))
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
                                {isAuthorized({permissions: "put_notification_templates_id"}) &&
                                    <div>
                                        <p><strong>System Notifications</strong></p>
                                        <NotificationList notificationType="_SYSTEM"/>
                                    </div>
                                }
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
    return {
        system_notifications: state.system_notifications,
        notifications : state.notifications
    }
}
function mapDispatchToProps(dispatch){
    return {
        setNotifications : (notifications, system=false) => { return dispatch(setNotifications(notifications, system))},
        setNotification : (notification, system=false)=> { return dispatch(setNotification(notification, system))},
        setSystemNotifications : (notifications, system=true) => { return dispatch(setSystemNotifications(notifications, system))},

        addNotification : (notification, system=false) => { return dispatch(addNotification(notification, system)) }
    }
}
Notifications = connect(null, mapDispatchToProps)(Notifications);
NotificationList = connect(mapStateToProps, mapDispatchToProps)(NotificationList);
NavNotification = connect(mapStateToProps, mapDispatchToProps)(NavNotification);


export { Notification, Notifications, NavNotification }