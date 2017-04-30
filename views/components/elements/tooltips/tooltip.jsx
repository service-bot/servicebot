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
        let text = ()=> {return ({__html: self.props.text || '?'})};
        let style = this.props.style || {};
        let placement = this.props.placement || 'left';
        let title = this.props.title || 'tooltip';
        let cssClass = this.props.cssClass || 'btn-default';
        // let delay = this.props.delay || 0;

        return(
            <button type="button" ref="tooltip" style={style}
                    className={`btn ${cssClass}`} data-placement={placement}
                    title={title}>
                <div dangerouslySetInnerHTML={text()}/>
            </button>
        );
    }

}

export default ToolTip;