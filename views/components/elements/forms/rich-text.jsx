import React, { Component } from 'react';
import { Field } from 'redux-form';
import TinyMCE from 'react-tinymce';

class RichTextArea extends Component {

    constructor(props) {
        super(props);
        this.editorConfig = {
            plugins: 'link,image,lists,paste,code',
            toolbar: 'undo redo | formatselect bullist numlist | bold italic link | code paste',
            block_formats: 'Paragraph=p;Heading 3=h3',
            menubar: false,
            statusbar: false,
            body_class: 'editable-field-content',
            paste_word_valid_elements: 'b,strong,i,em,h1,h2,h3,p,li,ul,ol,a',
            paste_retain_style_properties: 'none',
            paste_strip_class_attributes: 'none',
            paste_remove_styles: true,
        };
    }


    renderTinyMCE(field){

        let props = Object.assign({}, field);
        delete props.input;
        delete props.meta;

        return <TinyMCE
            {...props}
            value={field.input.content !== '' ? field.input.content : null}
            onBlur={(event, value) => { field.input.onChange(event.target.getContent()) }}
        />
    }

    render(){

        const { handleSubmit, value, pristine, reset, submitting } = this.props;

        return (
            <Field
                component={ this.renderTinyMCE }
                name={ this.props.id.toString() }
                ref={ this.props.id }
                id={ this.props.id }
                disabled={ this.props.readonly }
                autoComplete="off"
                config={ this.editorConfig }
            />
        );
    }

};

RichTextArea.propTypes = {
    id:         	React.PropTypes.string.isRequired,
    show_label: 	React.PropTypes.bool,
    label:      	React.PropTypes.string,
    className:  	React.PropTypes.string
};

export default RichTextArea;