import React from 'react';
import Fetcher from '../../utilities/fetcher.jsx';
import FileUploader from '../../utilities/file-uploader.jsx';
import Buttons from '../../elements/buttons.jsx';
import DateFormat from '../../utilities/date-format.jsx';
import DataTable from '../../elements/datatable/datatable.jsx';

class ServiceInstanceFiles extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            instanceId: props.instanceId,
            loading: true,
            files: [],
            url: `/api/v1/service-instances/${props.instanceId}/files`,
            lastFetch: Date.now()
        };

        this.fetchFiles = this.fetchFiles.bind(this);
        this.modDataID = this.modDataID.bind(this);
    }

    componentDidMount(){
        this.fetchFiles();
    }

    fetchFiles(){
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(response != null){
                if(!response.error){
                    self.setState({loading: false, files : response, lastFetch: Date.now()});
                }
            }
            self.setState({loading:false});
        })
    }

    modDataID(data){
        let self = this;

        let deleteFile = ()=>{
            Fetcher(`/api/v1/service-instances/${this.state.instanceId}/files/${data}`, 'DELETE').then(function (response) {
                if(!response.error){
                    self.fetchFiles();
                }else{
                    console.error("delete file error",response);
                }
            });
        };

        return(
            <div>
                <Buttons btnType="link" onClick={deleteFile} containerClass="inline"><small>Delete</small></Buttons>
                <a href={`/api/v1/service-instances/${this.state.instanceId}/files/${data}`}><small>Download</small></a>
            </div>
        )
    }

    modDataMimeType(data){
        return( data.substr(data.indexOf("/") + 1).toUpperCase() );
    }

    modDataCreatedAt(data){
        return( <DateFormat date={data} time/> );
    }

    render () {

        if(this.state.loading){
            return (
                <load/>
            )
        }else {
            return (
                <div className="service-instance-box">
                    <div className="service-instance-box-title">
                        <div>Files</div>
                        <div className="react-buttons right ">
                            <FileUploader elementID="service-file"
                                          fileStyle="service-file"
                                          name="files"
                                          uploadButton={true}
                                          fileURL={`/api/v1/service-instances/${this.props.instanceId}/files`}
                                          handleSuccess={this.fetchFiles}
                            />
                        </div>
                    </div>
                    <div className="service-instance-box-content">
                        <DataTable parentState={this.state}
                                   dataObj={this.state.files}
                                   col={['data.name', 'data.mimetype', 'data.created_at', 'data.id']}
                                   colNames={['Name', 'Type', 'Uploaded On','Actions']}
                                   mod_data-mimetype={this.modDataMimeType}
                                   mod_data-id={this.modDataID}
                                   mod_data-created_at={this.modDataCreatedAt}
                                   nullMessage="Upload files"
                        />
                    </div>
                </div>
            )
        }

    }
}

export default ServiceInstanceFiles;