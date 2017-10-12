import React from 'react';

class Alerts extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            alert: {
                type: this.props.type || 'info',
                message: this.props.message || 'Empty Message',
                icon: this.props.icon || 'check-circle'
            }
        };

        if(this.props.position){
            this.setState(
                {
                    position: {
                        position: this.props.position.position || 'relative',
                            bottom: this.props.position.bottom || false,
                    }
                }
            )
        }

        this.dismiss = this.dismiss.bind(this);
    }

    componentWillReceiveProps(nextProps){
        let self = this;
        if(nextProps.message != this.state.alert.message || !this.state.alert.message){
            self.setState({
                alert:{
                    type: nextProps.type || 'info',
                    message: nextProps.message || 'Empty Message',
                    icon: nextProps.icon || 'check-circle'
                }
            }, function () {
            })
        }
    }

    dismiss(){
        this.setState({alert: {}});
    }

    render(){

        if(this.state.alert.message){


            let type = this.state.alert.type;
            let message = this.state.alert.message;
            let icon = this.state.alert.icon;
            let style = {};
            if( this.state.position && this.state.position.position == 'fixed'){
                style.position = 'fixed';
                style.left = '0px';
                style.width = '100%';
                style.zIndex = 99999;
                style.marginBottom = '0px';
                if(this.state.position.bottom) {
                    style.bottom = '0px';
                }else{
                    style.top = '0px';
                }
            }

            return(
                <div className={`alert alert-${type}`} role="alert" style={style}>
                    <i className={`fa fa-${icon}`}/>
                    <a className={`btn btn-${type} btn-outline btn-rounded btn-sm pull-right`}
                       onClick={this.props.action || this.dismiss}>{this.props.actionName || 'Dismiss'}</a>
                    <span>{message}</span>
                </div>
            );
        }

        return(<span/>);
    }

}

export default Alerts;