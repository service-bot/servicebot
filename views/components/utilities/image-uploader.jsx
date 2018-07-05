import React from 'react';
import Load from './load.jsx';
import Fetcher from "./fetcher.jsx";
import Buttons from "../elements/buttons.jsx";

class ImageUploader extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            elementID: this.props.elementID,
            imageStyle: this.props.imageStyle,
            uploadMessage: this.props.uploadMessage || "Upload The Image",
            uploadFunction: this.props.uploadTrigger || false,
            uploadButton: this.props.uploadButton,
            imageURL: this.props.imageURL,
            loading: true,
            ajaxLoad: false,
            imageSelected: false,
            loadingImage: false,
            success: false,
            image: true,
            imageFailed: false,
            imageChanged : false
        };

        this.onImageSelected = this.onImageSelected.bind(this);
        this.handleImage = this.handleImage.bind(this);
        this.getCoverImage = this.getCoverImage.bind(this);
        this.removeImage = this.removeImage.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.imageURL != this.state.imageURL){
            this.setState({
                imageURL: nextProps.imageURL
            });
        }
    }

    componentDidUpdate(prevProps){
        if(this.props.uploadTrigger != prevProps.uploadTrigger){
            if(!this.state.imageChanged){
                if(this.props.handleSuccess){
                    return this.props.handleSuccess();
                }else{
                    return;
                }
            }
            this.handleImage();
        }
    }

    componentDidMount(){
        this.getCoverImage();
    }

    onImageSelected(e){
        let self = this;
        self.setState({loadingImage: true});
        let src = e.currentTarget;
        let targetImg = document.getElementById(`edit-${this.state.elementID}-img`);
        let fileReader = new FileReader();

        fileReader.addEventListener("load", function () {
            targetImg.src = fileReader.result;
            self.setState({loadingImage: false, imageSelected: true, image: true, imageChanged : true}, function () {
                targetImg.classList.remove("no-image-yet");
            });
        }, false);

        fileReader.readAsDataURL(src.files[0]);

        if(this.props.onChange) {
            this.props.onChange();
        }
    }

    getCoverImage(){
        let self = this;
        let myImage = document.getElementById(`edit-${this.state.elementID}-img`);
        fetch(this.props.imageGETURL || self.state.imageURL,
            {method: 'GET', header: new Headers({"Content-Type": "application/json"}), credentials: "include"}).then(function(response) {
            if(response.ok){
                self.setState({hasImage: true});
                return response.blob();
            }
            throw new Error('Network response was not ok.');
        }).then(function(myBlob) {
            if(myBlob.type == "text/html"){
                throw "not an image";
            }
            let objectURL = URL.createObjectURL(myBlob);
            myImage.src = objectURL;
        }).catch(function(error) {
            self.setState({image: false});
            // myImage.src = '/assets/custom_icons/cloud-computing.png?' + new Date().getTime();
            myImage.classList.add("no-image-yet");
        });
    }

    handleImage(e){
        if(e != undefined)
            e.preventDefault();
        let self = this;
        let init = { method: "PUT",
                    credentials : "include",
                    body : new FormData(document.getElementById(`imgform${this.state.elementID}`))
        };
        self.setState({ajaxLoad: true});
        Fetcher(self.state.imageURL, null, null, init).then(function(result){
            if(!result.error){
                self.setState({imageSelected: false, ajaxLoad: false}, function () {
                    if(self.props.handleSuccess){
                        self.props.handleSuccess();
                    }
                    if(self.props.reloadNotice){
                        self.setState({success: true, reloadNotice: self.props.reloadNotice});
                    }
                });
            }else{
                self.setState({ajaxLoad: false, imageFailed: result.error});
            }
        }).catch(e => {console.error("error getting img", e)});
    }

    removeImage(e){
        let self = this;
        e.preventDefault();
        Fetcher(self.props.imageURL, "DELETE", null, null).then(function (response) {
            if(!response.error){
                self.setState({hasImage: false, image: false, imageChanged : true});
            }
        }).catch(e => {console.error("error removing img", e)});

    }

    render(){
        return(
            <div className="row">
                <div className={`col-md-12 edit-${this.state.elementID}-image`}>
                    <form id={`imgform${this.state.elementID}`} className="image-uploader" encType="multipart/form-data">
                        <div className={`${this.state.imageStyle}`}>
                            <img id={`edit-${this.state.elementID}-img`} className={!this.state.image && 'hidden'}
                                 src={this.props.imageGETURL || this.state.imageURL} ref="avatar" alt="badge"/>
                            { this.state.loadingImage && <Load type="avatar"/> }
                            <input id={this.state.elementID} type="file" onChange={this.onImageSelected} name={this.props.name || 'file'}/>
                        </div>
                        {(this.state.success && this.state.reloadNotice) &&
                            <div>
                                <span className="help-block"><small>{this.props.reloadNotice}</small></span>
                                <Buttons btnType="primary" text="Reload Application" onClick={()=>{return location.reload()}}
                                         position="center"/>
                            </div>
                        }
                        {(this.state.imageSelected && this.state.uploadButton) &&
                        <div>
                            <div className="image-upload-message"><small>{this.state.uploadMessage}</small></div>
                            <Buttons btnType="primary" text="Save Image" onClick={this.handleImage}
                                     loading={this.state.ajaxLoad} success="" type="submit" position="center"/>
                        </div>
                        }
                    </form>
                    {(this.state.hasImage && this.props.imageRemovable) &&
                    <Buttons btnType="primary" text="Remove Image" onClick={this.removeImage}
                             loading={this.state.ajaxLoad} success="" position="center"/>
                    }
                    {this.state.imageFailed &&
                    <span className="help-block image-failed">{this.state.imageFailed}</span>
                    }
                </div>
            </div>
        );
    }



}

export default ImageUploader;