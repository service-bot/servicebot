import React from 'react';
import $ from "jquery";

import "../../../public/js/scripts/redactor/redactor.min.css";
import "../../../public/js/scripts/redactor/redactor.min.js";


class Wysiwyg extends React.Component {
    constructor(props){
        super(props)
        this.insert = this.insert.bind(this);

        this.state = {
        }
    }

    insert(content){
        // $R(this.refs.wysiwygArea, "buffer.set");
        $R(this.refs.wysiwygArea, "insertion.insertRaw", content);
    }

    componentDidMount() {
        var self = this;
        $R(this.refs.wysiwygArea, {
            callbacks: {
                changed: function(html)
                {
                    self.props.onChange(html);
                }
            }
        });


    }
    render(){
        return <textarea onChange={this.props.onChange} name={this.props.name} id="editor" ref="wysiwygArea" value={this.props.value}>

        </textarea>
    }
}

class WysiwygRedux extends React.Component {
    constructor(props){
        super(props);
        this.insert = this.insert.bind(this);
    }

    insert(content){
        $R(this.refs[`wysiwyg_${this.props.name}`]).redactor("insert.raw", content);
    }

    componentDidMount() {
        var self = this;
        $R(this.refs[`wysiwyg_${this.props.name}`]).redactor();
        $R(this.refs[`wysiwyg_${this.props.name}`]).on('change.callback.redactor', function(e, data) {
            self.props.input.onChange(e);
        });

    }
    render(){
        let {label, type, meta: {touched, error, warning}} = this.props;
        let formControlClass = `form-control ${touched && error && 'has-error'} ${touched && warning && 'has-warning'}`;

        return (
            <div className="form-input-flex">
                {this.props.label && <label className="control-label">{this.props.label}</label>}
                <textarea onChange={this.props.onChange} name={this.props.name} id="editor" ref={"wysiwyg_" + this.props.name} value={this.props.input.value}/>
                {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span className="form-warning">{warning}</span>)) }
            </div>
        );
    }
}

class WysiwygTemplater extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        if(!this.props.schema){
            return <div>h</div>
        }
        return (
            <div>
                <Wysiwyg name={this.props.name} value={this.props.value || this.props.defaultValue} ref="wysiwyg" onChange={this.props.onChange}/>
            </div>
        )
    }

}

export {Wysiwyg, WysiwygRedux, WysiwygTemplater};
