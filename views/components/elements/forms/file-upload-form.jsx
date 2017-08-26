import React, { Component, PropTypes } from 'react'
import { reduxForm } from 'redux-form'
export const fields = [ 'avatar' ];
import ImageUploader from "../../utilities/image-uploader.jsx";


class FileInputForm extends Component {

    constructor(props){
        super(props);
    }
    handleImageUploadSuccess(){
        if(!this.state.submitSuccessful) {
            this.setState({submitSuccessful: true});
        }
    }
    onImageChanged(){
        this.setState({imageChanged: true});
    }

    render() {
        const {
            fields: { avatar },
            handleSubmit,
            resetForm,
            submitting
        } = this.props;
        let imageUploadURL = this.props.params.templateId ?
            `/api/v1/service-templates/${this.props.params.templateId}/image` :
            `/api/v1/service-templates/${this.props.params.templateId}/image`;
        return (
            <div>
                <div className="form-group form-group-flex column">
                    <label>Upload Cover Image</label>
                    <ImageUploader elementID="template-image" imageStyle="template-image-upload"
                                   imageURL={`/api/v1/service-templates/${this.props.params.templateId}/image`}
                                   imageGETURL={imageUploadURL}
                                   uploadTrigger={true}
                                   uploadButton={false}
                                   handleSuccess={this.handleImageUploadSuccess}
                                   onChange={this.onImageChanged}
                                   imageRemovable={true}
                                   name="template-image"/>
                </div>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Avatar</label>
                        <div>
                            <input type="file" {...avatar} value={ null } />
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={submitting}>
                            {submitting ? <i/> : <i/>} Submit
                        </button>
                        <button type="button" disabled={submitting} onClick={resetForm}>
                            Clear Values
                        </button>
                    </div>
                </form>
            </div>
        )
    }
}

FileInputForm.propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    resetForm: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired
}

export default reduxForm({
    form: 'file',
    fields
})(FileInputForm)