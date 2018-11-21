import React from 'react';
import {Fetcher} from "servicebot-base-form"
import {Link, browserHistory} from 'react-router';
import Content from "../layouts/content.jsx";
import DateFormat from "../utilities/date-format.jsx";
import {connect} from "react-redux";
import {setNotifications, setNotification,setSystemNotifications, addNotification} from "../utilities/actions";
import {isAuthorized} from "../utilities/authorizer.jsx"
import ModalNotification from "../elements/modals/modal-notification.jsx";
import SVGIcons from '../utilities/svg-icons.jsx';
let _ = require("lodash");
import {TableHeaderColumn} from 'react-bootstrap-table';
import {ServiceBotTableBase} from '../elements/bootstrap-tables/servicebot-table-base.jsx';
import '../../../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css';


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

        let self = this;
        let {openNotificationDropdown} = this.state;

        if(openNotificationDropdown === true) {

            let totalUnread = unread.length;
            if(unread.length && unread.length > 3){
               unread = _.slice(unread, unread.length -3, unread.length);
            }

            return (
                <div>
                    <div className="_backdrop" onClick={()=>{self.setState({openNotificationDropdown: false})}}/>
                    <div className="app-notification-list">
                        <h3 className="__header">
                            <SVGIcons width="24" height="24" viewBoxX="0" viewBoxY="0" viewWidth="24" viewHeight="24">
                                <path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"/>
                            </SVGIcons>
                            Notifications
                        </h3>
                        { totalUnread ? <h4 className="__unread-heading">{`You have ${totalUnread} unread notifications`}</h4> : <React.Fragment/>}
                        { !totalUnread ? <h4 className="__empty-heading">You have no new notifications</h4> : <React.Fragment/> }
                        <ul className={`__unread-list`}>
                            {unread.length ? unread.map(message => (
                                <li className="__unread-item" key={`message-${message.id}`} onClick={()=>{return this.openMessageModel(message)}}
                                    dangerouslySetInnerHTML={this.createMarkup((message.message))}>
                                </li>
                                )) : <React.Fragment/>
                            }
                            <li className={`_view-all`}>
                                <button className={`buttons _text`} onClick={this.viewAll}>View All</button>
                            </li>
                        </ul>
                    </div>
                </div>
            );
        }else{
            return ( <span/> );
        }
    }

    render(){
        let unread = this.props.notifications.filter(notification => !notification.read);

        return (
            <div className="app-notification">
                <span className="_toggle" onClick={this.openNotificationDropdown}>
                    <SVGIcons width="24" height="24" viewBoxX="0" viewBoxY="0" viewWidth="24" viewHeight="24">
                        <path fill="none" d="M0 0h24v24H0V0z"/><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71L18 16z"/>
                    </SVGIcons>
                    {unread.length ? <span className="nav-notification-indicator"/> : <span/>}
                    {/*<span className="notification-badge">{unread.length ? unread.length : '0'}</span>*/}
                </span>
                {this.miniList(unread)}
                {this.state.openNotificationDropdown && <div className="app-notification-backdrop" onClick={this.closeNotificationDropdown}/>}
                {this.state.viewMessage !== null && <ModalNotification key="notification-modal" hide={this.closeMessageModel} notification={this.state.viewMessage}/>}
            </div>
        )
    }
}

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
                <span className="buttons _default _text __message-link" onClick={()=>{return (this.openMessageModel(dataObj))}}>{data || 'Empty message body.'}</span>
            );
        }else {
            let trimmedHTML = this.createMarkup(this.trimText(data, 90).props.children);
            return (
                <span className="buttons _default _text __message-link-trimmed" onClick={()=>{return (this.openMessageModel(dataObj))}} dangerouslySetInnerHTML={trimmedHTML}/>
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
        let notificationsNullMessage = notificationType == '_SYSTEM' ? "There are no system notifications at this time" : "There are no notifications at this time";

        if(notifications.length){
            return (
                <React.Fragment>
                    <ServiceBotTableBase
                        rows={notifications}
                        sortColumn="created_at"
                        sortOrder="desc">
                        <TableHeaderColumn isKey dataField='subject' dataSort={ true } dataFormat={this.modSubject} width={`200px`}>Subject</TableHeaderColumn>
                        <TableHeaderColumn dataField='message' dataSort={ true } dataFormat={this.modMessage} width={`200px`}>Message</TableHeaderColumn>
                        <TableHeaderColumn dataField='created_at' dataSort={ true } dataFormat={this.modCreatedAt} width={`200px`}>Notification Time</TableHeaderColumn>
                    </ServiceBotTableBase>
                    {this.state.viewMessage != null && <ModalNotification key="notification-modal" hide={this.closeMessageModel} notification={this.state.viewMessage}/>}
                </React.Fragment>
            )
        }else{
            return (
                <p>{notificationsNullMessage}</p>
            )
        }

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
                <div className="app-content __manage-notifications">
                    <Content>
                        <div className={`_title-container`}>
                            <h1 className={`_heading`}>Notification Center</h1>
                        </div>
                        {isAuthorized({permissions: "put_notification_templates_id"}) &&
                            <div className={`_section`}>
                                <h3>System Notifications</h3>
                                <NotificationList notificationType="_SYSTEM"/>
                            </div>
                        }
                        <div className={`_section`}>
                            <h3>User Notifications</h3>
                            <NotificationList/>
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