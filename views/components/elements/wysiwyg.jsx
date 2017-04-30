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
        $(this.refs.wysiwygArea).redactor("buffer.set");
        $(this.refs.wysiwygArea).redactor("insert.raw", content);
    }

    componentDidMount() {
        var self = this;
        $(this.refs.wysiwygArea).redactor();
        $(this.refs.wysiwygArea).on('change.callback.redactor', function(e, data) {
            let event = new Event('input', { bubbles: true });
            self.refs.wysiwygArea.dispatchEvent(event);

        });

    }
    render(){
        return <textarea onChange={this.props.onChange} name={this.props.name} id="editor" ref="wysiwygArea" value={this.props.value}>

        </textarea>
    }



}


class WysiwygTemplater extends React.Component{
    constructor(props){
        super(props)
        this.insertString = this.insertString.bind(this);


    }

    insertString(html) {
        let self = this;
        return function (e){
            e.preventDefault();
            self.refs.wysiwyg.insert(html);
        }
    }


    render(){
        if(!this.props.schema){
            return <div>h</div>
        }
        let references = this.props.schema.references;
        return (
            <div>
                <Wysiwyg name={this.props.name} value={this.props.value || this.props.defaultValue} ref="wysiwyg" onChange={this.props.onChange}/>
                <ul className = "templateList">
                {Object.keys(this.props.schema).map(field => {
                    if(field == "references"){
                        return Object.keys(references).map(reference => {
                            return (<ul key={reference} className="referenceList">references{Object.keys(references[reference]).map(referenceColumn => {
                                return <li key={referenceColumn} className="column reference-column"> <button onClick={this.insertString(`[[references.${reference}.${referenceColumn}]]`)}>{referenceColumn}</button></li>
                            })}
                            </ul>)
                        })
                    }else{
                        return <li key={field} className="column" ><button onClick={this.insertString(`[[${field}]]`)}>{field}</button></li>
                    }
                })}


                </ul>
            </div>
        )
    }

}

export {Wysiwyg, WysiwygTemplater};
