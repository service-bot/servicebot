import React from 'react';
import $ from "jquery";
import '../../../../public/js/bootstrap-3.3.7-dist/js/bootstrap.js';

class ToolTip extends React.Component {

    constructor(props){
        super(props)
    }

    componentDidMount(){
        $(this.refs.tooltip).tooltip();
    }

    render(){
        let self = this;
        let text =  self.props.text || '-';
        let style = self.props.style || {};
        let placement = self.props.placement || 'left';
        let title = self.props.title || 'tooltip';
        let cssClass = self.props.cssClass || 'btn-default';
        let clickAction = self.props.onClick || null;

        let getText = ()=> {
            if (self.props.icon) {
                return (<div><i className={`fa ${self.props.icon}`} /> {text}</div>);
            } else {
                return (null);
            }
        };

        // let delay = this.props.delay || 0;
        return(
            <button type="button" ref="tooltip" style={style}
                    className={`btn ${cssClass}`} data-placement={placement}
                    title={title} onClick={clickAction}>
                {getText()}
            </button>
        );
    }

}

export default ToolTip;