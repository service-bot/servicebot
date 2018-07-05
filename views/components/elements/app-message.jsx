import React from 'react';
import {connect} from "react-redux";
import {dismissAlert} from "../utilities/actions";

class Message extends React.Component {

    constructor(props){
        super(props);

        this.dismiss = this.dismiss.bind(this);
    }

    componentDidMount(){
        let {alert, dismiss, alert: {id, alertType, message, show, autoDismiss}} = this.props;
        if(autoDismiss) {
            setTimeout(() => {
                return (dismiss(alert));
            }, autoDismiss);
        }
    }

    dismiss(){
        let {alert, dismiss} = this.props;
        dismiss(alert);
    }

    render(){
        let {alert: {alertType, message, id}} = this.props;
        return(
            <div className={`app-message app-message-${alertType || 'info'}`}>
                <p>
                    {message}
                </p>
                <button onClick={()=>{return(this.dismiss())}} id={id}
                        className="pull-right btn btn-rounded btn-outline btn-white btn-sm">
                    dismiss
                </button>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch){
    return {
        dismiss : (alerts) => {return dispatch(dismissAlert(alerts))},
    }
}
Message = connect(null, mapDispatchToProps)(Message);


class AppMessage extends React.Component {

    constructor(props){
        super(props);
    }

    render(){
        let { alerts } = this.props;
        if(alerts.length) {
            return (
                <div className="app-messages">
                    {
                        alerts.map(
                            theAlert => (
                                <Message key={`message-${theAlert.id}`} alert={theAlert}/>
                            )
                        )
                    }
                </div>
            )
        }else{
            return(<span/>);
        }
    }

}

function mapStateToProps(state){
    return {
        alerts : state.alerts
    }
}
AppMessage = connect(mapStateToProps, null)(AppMessage);
export {AppMessage};