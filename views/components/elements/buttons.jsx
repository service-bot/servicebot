import React from 'react';
import Load from '../utilities/load.jsx';
import { connect } from 'react-redux'
let _ = require("lodash");

class Buttons extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            containerClass: this.props.containerClass || '',
            buttonClass: `buttons btn-default btn-rounded ${this.props.buttonClass}` || 'buttons btn-default btn-rounded',
            btnType: this.props.btnType || 'default',
            text: this.props.text || 'Button',
            size: this.props.size || 'md',
            position: this.props.position || 'right',
            loading: this.props.loading || false,
            success: this.props.success || false,
            disabled: this.props.disabled || false,
            style: this.props.style || {},
            hover: false
        };

        this.handleClick = this.handleClick.bind(this);
        this.hover = this.hover.bind(this);
        this.unHover = this.unHover.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.loading === true){
            this.setState({loading: true});
        }else{
            this.setState({loading: false});
        }
        if(nextProps.text != this.state.text){
            this.setState({text: nextProps.text});
        }
        if(nextProps.disabled === true){
            this.setState({disabled: true});
        }else{
            this.setState({disabled: false});
        }
        if(nextProps.success === true){
            this.setState({success: true});
        }else{
            this.setState({success: false});
        }


    }

    handleClick(e){
        if(this.props.preventDefault !== false){
            e.preventDefault();
        }
        if(this.props.onClick) {
            this.props.onClick(e);
        }
    }

    success(){
        let self = this;
        setTimeout(()=>{
            self.setState({success: false});
        }, 3000);

        let style = {color: '#8BC34A'};
        if(this.state.systemOptions){
            let options = this.state.systemOptions;
            style.color = _.get(options, 'button_success_icon_color.value', '#8BC34A');
        }
        return(
            <span style={style} className="ajax-response success"><i className="fa fa-check-circle"/></span>
        )
    }

    hover(){
        this.setState({hover: true});
    }
    unHover(){
        this.setState({hover: false})
    }

    render(){

        let btnStyle = {border: 'none'};
        if(this.props.options) {
            let options = this.props.options;
            let hover = this.state.hover;
        }

        return(
            <div className={`react-buttons ${this.state.position} ${this.state.containerClass}`}>
                {this.state.loading === true && <Load type="button"/>}
                {this.state.success === true && this.success()}
                <button className={`buttons _primary ${this.state.buttonClass}`}
                        disabled={this.state.loading}
                        style={this.state.style ? _.merge(this.state.style, btnStyle) : btnStyle}
                        onClick={this.handleClick}
                        type={this.props.type} value={this.props.value}
                        onMouseEnter={this.hover} onMouseLeave={this.unHover}>{this.state.text || this.props.children}</button>
            </div>
        );

    }
}

export default connect((state) => {return {options:state.options}})(Buttons);