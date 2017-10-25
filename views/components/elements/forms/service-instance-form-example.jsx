import React from 'react';
import Load from '../../utilities/load.jsx';
import {Link, browserHistory} from 'react-router';
import Alert from 'react-s-alert';
import Fetcher from "../../utilities/fetcher.jsx"
import {DataForm, DataChild} from "../../utilities/data-form.jsx";
import update from "immutability-helper";


class ServiceInstanceForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = { files:[], template: {}, url: "/api/v1/service-instances/" + props.params.instanceId, loading:true};
        this.handleFiles = this.handleFiles.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        var that = this;
        Fetcher(that.state.url).then(function(response){
            if(!response.error){
                Fetcher(that.state.url + "/files").then(function(files){
                    if(!response.error) {
                        that.setState({loading:false, template: response, files: files});
                    }else{
                        that.setState({loading:false});
                    }
                })
            }else{
                that.setState({loading:false});
            }
        })
    }

    handleDelete(id){
        let self = this;
        return function(e){
            e.preventDefault();
            let url = self.state.url + "/files/" + id;

            Fetcher(url, "DELETE").then(function(){
                self.setState({files:self.state.files.filter(file=>file.id != id)});
            });
        }
    }

    handleFiles(e){
        e.preventDefault();
        let self = this;
        let url = this.state.url + "/files";

        let init = { method: "POST",
            credentials : "include",
            body : new FormData(document.getElementById("instance-files-form"))
        };

        Fetcher(url, null, null, init).then(function(result){
            let updated = result.concat(self.state.files);
           self.setState({files:updated});
        });
    }

    render() {
        if(this.state.loading)
            return <Load/>;
        if(this.state.template == {}) {
            return <p className="help-block center-align">There is no template</p>;
        }
        else {
            let template = this.state.template;
            return(
                <div>
                    {/* handle file upload */}
                    {JSON.stringify(this.state.files)}
                    {/* display files */}
                    {this.state.files.map(file => (
                        <div key={file.id}>
                            <a href={`${this.state.url}/files/${file.id}`}>{file.name}</a>
                            <button onClick={this.handleDelete(file.id)}>X</button>
                        </div>
                        )
                    )}
                    {/* file upload form */}
                    <form  id="instance-files-form" encType="multipart/form-data">
                        <input id="instance-files" type="file" name="files" multiple/>
                    </form>
                    <button type="submit" onClick={this.handleFiles}>Submiot</button>


                    {/* template default form */}
                    <DataForm handleResponse={this.handleResponse} url="/api/v1/service-instances">
                        <DataChild modelName="service_instance_properties" objectName="prop1">
                            <input name="name"/>Prop Name
                            <div>
                                <input name="value"/>
                                Prop Value
                            </div>
                        </DataChild>

                        <DataChild modelName="service_instance_properties" objectName="prop2">
                            <input name="name"/>Prop Name
                            <div>
                                <input name="value"/>
                                Prop Value
                            </div>
                        </DataChild>

                        <DataChild modelName="service_instance_properties" objectName="prop3">
                            <input name="name"/>Prop Name
                            <div>
                                <input name="value" defaultValue="testdefault"/>
                                Prop Value
                            </div>
                        </DataChild>

                        <input name="name"/>Name
                        <br/>
                        <input name="description"/>Description
                        <button type="submit" value="submit">Submit</button>
                        <input name="service_id" type="hidden" value={1}/>
                        <input name="requested_by" type="hidden" value={1}/>
                        <input name="user_id" type="hidden" value={1}/>

                    </DataForm>


                    {/* template test data */}
                    <div className="yo">
                        <h3>MY USER</h3>

                        <div key={template.id} className="article-item">
                            <div className="article-item-title">
                                <div>{template.name}</div>
                            </div>
                            <div className="article-item-description">
                                Created {new Date(template.created).toDateString()}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default ServiceInstanceForm
