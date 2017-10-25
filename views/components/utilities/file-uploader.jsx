import React from 'react';
import Load from './load.jsx';
import Fetcher from "./fetcher.jsx";
import Buttons from "../elements/buttons.jsx";

class FileUploader extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            elementID: this.props.elementID,
            fileStyle: this.props.fileStyle,
            uploadMessage: this.props.uploadMessage || "Upload The File",
            uploadFunction: this.props.uploadTrigger || false,
            uploadButton: this.props.uploadButton,
            fileURL: this.props.fileURL,
            loading: true,
            ajaxLoad: false,
            fileSelected: false,
            loadingFile: false,
            success: false
        };

        this.onFileSelected = this.onFileSelected.bind(this);
        this.handleFile = this.handleFile.bind(this);
        this.handleUploadButton = this.handleUploadButton.bind(this);
    }

    componentWillReceiveProps(nextProps){

        if(nextProps.fileURL != this.state.fileURL){
            this.setState({
                fileURL: nextProps.fileURL
            });
        }
        if(nextProps.uploadTrigger){
            this.handleFile();
        }
    }

    componentDidMount(){
        // this.getCoverFile();
    }

    onFileSelected(e){
        let self = this;
        self.setState({loadingFile: true});
        let src = e.currentTarget;

        self.setState({loadingFile: false, fileSelected: true, theFile: src.files[0]}, function () {
            self.handleFile();
        });

        if(this.props.onChange) {
            this.props.onChange();
        }
    }

    handleFile(e){
        if(e != undefined)
            e.preventDefault();
        let self = this;
        let init = { method: "POST",
            credentials : "include",
            body : new FormData(document.getElementById(`fileform${this.state.elementID}`))
        };
        self.setState({ajaxLoad: true});

        Fetcher(self.state.fileURL, null, null, init).then(function(result){
            if(!result.error){
                self.setState({fileSelected: false, ajaxLoad: false}, function () {
                    if(self.props.handleSuccess){
                        self.props.handleSuccess();
                    }
                });
            }else{
                console.error("failed", result);
                self.setState({ajaxLoad: false});
            }
        });
    }

    handleUploadButton(e){
        e.preventDefault();
        document.getElementById(`${this.state.elementID}`).click();
    }


    render(){

        return(
            <div className="row">
                <div className={`col-md-12 edit-${this.state.elementID}-file`}>
                    <form id={`fileform${this.state.elementID}`} className="file-uploader" encType="multipart/form-data">
                        <div className={`${this.state.fileStyle}`}>
                            {(this.state.fileSelected && this.state.uploadButton) ?
                                <Buttons key="save-btn" btnType="primary" text="Save File" onClick={this.handleFile}
                                         containerClass="inline" size="md" position="left"
                                         loading={this.state.ajaxLoad} success="" type="submit"/> :
                                <Buttons key="upload-btn" btnType="info" text="Upload File" onClick={this.handleUploadButton}
                                         containerClass="inline" size="md" position="left"/>
                            }
                            <input id={this.state.elementID} type="file" onChange={this.onFileSelected} name={this.props.name || 'file'} style={{display: 'none'}}/>
                        </div>
                        {/*{(this.state.fileSelected && this.state.uploadButton) &&*/}
                            {/*<div className="file-upload-message"><span className="help-block">{`selected ${this.state.theFile.name}, click save file to upload.`}</span></div>*/}
                        {/*}*/}
                    </form>
                </div>
            </div>
        );
    }



}

export default FileUploader;