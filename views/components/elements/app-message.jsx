import React from 'react';
import {connect} from "react-redux";
import {dismissAlert} from "../utilities/actions";

class Message extends React.Component {

    constructor(props){
        super(props);

        this.dismiss = this.dismiss.bind(this);
    }

    componentDidMount(){
        let {alert, dismiss} = this.props;
        setTimeout(()=>{
            return(dismiss(alert.id));
        }, 4000 );
    }

    dismiss(){
        let {alert, dismiss} = this.props;
        dismiss(alert.id);
    }

    render(){
        let {alert: {alertType, message, id}} = this.props;
        return(
            <div className={`app-message app-message-${alertType || 'info'}`}>
                <p>
                    {message}
                    <button onClick={()=>{return(this.dismiss(id))}} id={id}
                            className="pull-right btn btn-rounded btn-outline btn-white btn-sm">
                        dismiss
                    </button>
                </p>
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
    console.log(state);
    return {
        alerts : state.alerts
    }
}
AppMessage = connect(mapStateToProps, mapDispatchToProps)(AppMessage);
export {AppMessage};