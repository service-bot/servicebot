import React from 'react';
import './css/style.css';

class ServiceBotTableNoData extends React.Component {

    constructor(props){
        super(props);
    }

    render(){
        let {title, body, buttonLabel, buttonAction} = this.props;

        return(
            <div className="no-data-message">
                {this.props.children}
                <p className="no-data-message-text">
                    <span className="no-data-message-text-title">{title}</span>
                    <span className="no-data-message-text-body">{body}</span>
                    <button className="btn btn-rounded btn-outline btn-info"
                            onClick={buttonAction}>{buttonLabel}</button>
                </p>
            </div>
        )
    }

}

export default ServiceBotTableNoData;