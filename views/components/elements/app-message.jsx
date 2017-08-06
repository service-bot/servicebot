import React from 'react';
import {connect} from "react-redux";
import {dismissAlert} from "../utilities/actions";


class AppMessage extends React.Component {

    constructor(props){
        super(props);

        this.dismiss = this.dismiss.bind(this);
    }

    dismiss(id){
        let updatedAlerts = this.props.alerts.filter(alert => alert.id !== id);
        this.props.dismiss(updatedAlerts);
    }

    render(){
        let { alerts } = this.props;
        console.log("the alerts", alerts);
        if(this.props.alerts.length) {
            return (
                <div className="app-messages">
                    {alerts.map(theAlert=>(
                        <div key={`message-${theAlert.id}`} className="app-message">
                            <p>{theAlert.message}
                            <button onClick={()=>{return(this.dismiss(theAlert.id))}} id={theAlert.id} className="pull-right btn btn-rounded btn-outline btn-white btn-sm">dismiss</button>
                            </p>
                        </div>
                        ))
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
function mapDispatchToProps(dispatch){
    return {
        dismiss : (alerts) => {return dispatch(dismissAlert(alerts))},
    }
}

AppMessage = connect(mapStateToProps, mapDispatchToProps)(AppMessage);

export {AppMessage};