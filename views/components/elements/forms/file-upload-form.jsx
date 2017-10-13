import React, { Component, PropTypes } from 'react'
import ImageUploader from "../../utilities/image-uploader.jsx";


class FileInputForm extends Component {

    constructor(props){
        super(props);
        this.onImageChanged = this.onImageChanged.bind(this);

    }

    onImageChanged(){
        this.setState({imageChanged: true});
    }

    render() {
        return (
            <div className="form-group form-group-flex column">
                <label>{this.props.label}</label>
                <ImageUploader elementID={this.props.name} imageStyle="template-image-upload"
                               imageURL={this.props.imageUploadURL}
                               uploadTrigger={this.props.upload}
                               uploadButton={false}
                               handleSuccess={this.props.handleImageUploadSuccess}
                               onChange={this.onImageChanged}
                               imageRemovable={true}
                               name={this.props.name}/>
            </div>
        )
    }
}

export default FileInputForm