import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx";
let _ = require("lodash");
import Input from '../../utilities/inputs.jsx';
import ContentTitle from '../../layouts/content-title.jsx';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import Buttons from "../buttons.jsx";
import ImageUploader from "../../utilities/image-uploader.jsx";
import {setOptions} from "../../utilities/actions"
class SystemSettingsForm extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            url: `/api/v1/system-options/public`,
            system_settings: false,
            loading: true,
            ajaxLoad: false,
            success: false
        };
        this.fetchSettings = this.fetchSettings.bind(this);
        this.handleResponse = this.handleResponse.bind(this);
        this.handleOnChange = this.handleOnChange.bind(this);
        this.handleUpdateSettings = this.handleUpdateSettings.bind(this);
        this.handleOnBack = this.handleOnBack.bind(this);
    }

    componentDidMount(){
        this.fetchSettings();
    }

    fetchSettings(){
        let self = this;
        Fetcher(self.state.url).then(function (response) {
            if(!response.error){
                console.log("system-settings", response);
                self.setState({loading: false, system_settings: response});
            }else{
                console.log("system setting error", response);
                self.setState({loading: false});
            }
        });
    }

    handleResponse(response){
        console.log("inside handle response", response);
        if(!response.error){
            this.setState({success: true});
        }
    }

    handleOnChange(e){
        let self = this;
        let name = e.currentTarget.name;
        let value = e.currentTarget.value;

        const newData = update(self.state,
            {system_settings: {
                    [name]:{value: {$set: value}}
                }
            }
        );
        self.setState(newData);
    }

    handleUpdateSettings(){
        let self = this;
        self.setState({ajaxLoad: true});
        let payload = _.toArray(self.state.system_settings);
        // console.log("payload", payload);
        Fetcher('/api/v1/system-options', 'PUT', payload).then(function(response){
            if(!response.error){
                self.setState({ajaxLoad: false, success: true});
                self.props.onUpdateSettings();

            }else{
                self.setState({ajaxLoad: false});
                console.log('Problem PUT /api/v1/system-options');
            }
        });
    }

    handleOnBack(){
        this.setState({success: false});
        this.fetchSettings();
    }

    render () {

        if(this.state.loading){
            return ( <Load/> );
        }else if(this.state.success && false){
            return ( // this is disabled
                <div>
                    <div className="p-20">
                        <p><strong>Success! System settings has been updated.</strong></p>
                        <Buttons btnType="default" text="Back to System Settings" onClick={self.handleOnBack}/>
                    </div>
                </div>
            );
        }else{
            let self = this;
            let group = _.groupBy(this.state.system_settings, (setting)=>{return setting.type ? setting.type : other});
            let types = _.uniq(_.map(this.state.system_settings, (setting) => setting.type));
            let colorSettings = _.map(this.state.system_settings, (s)=> {
                if(s.data_type == 'color_picker' && s.value != "undefined" && s.value != undefined){
                    console.log(s);
                    return s.value
                }else{
                    return null
                }});
            colorSettings = _.remove(colorSettings, null);
            colorSettings = _.union(colorSettings, ['#FF6900', '#FCB900', '#7BDCB5', '#00D084', '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C', '#F78DA7', '#9900EF']);
            console.log("colorSettings", colorSettings);

            return (
                <div className="col-xs-12">
                    <ContentTitle icon="cog" title="Customize your system options here."/>

                    <div>
                        <h3 className="p-t-20 p-b-20 text-capitalize">Branding</h3>
                        <div className="row">
                            <div className="col-md-3 form-group-flex column centered">
                                <label className="control-label">Upload Brand Logo</label>
                                <ImageUploader name="file" elementID="brand-logo" imageURL="/api/v1/system-options/file/brand_logo" imageStyle="badge badge-lg" uploadButton={true}/>
                            </div>
                            <div className="col-md-3 form-group-flex column centered">
                                <label className="control-label">Front Page Featured Image</label>
                                <ImageUploader name="file" elementID="front-page-image" imageURL="/api/v1/system-options/file/front_page_image" imageStyle="badge badge-lg" uploadButton={true}/>
                            </div>
                        </div>
                    </div>

                    {types.map((type)=>{
                        return(
                            <div key={`setting_type_${type}`} className={`system-settings-group setting-type-${type}`}>
                                <h3 className="p-t-20 p-b-20 text-capitalize">{type}</h3>
                                    {group[type].map((group)=>{
                                        if(group.data_type == 'color_picker'){
                                            return(
                                                <div key={`option_${group.option}`}>
                                                    <Input type={group.data_type} name={group.option} label={group.option.replace(/_+/g, ' ')}
                                                           colors={colorSettings} defaultValue={group.value} onChange={self.handleOnChange}/>
                                                </div>
                                            );
                                        }else{
                                            return(
                                                <div key={`option_${group.option}`}>
                                                    <Input type={group.data_type} name={group.option} label={group.option.replace(/_+/g, ' ')}
                                                           defaultValue={group.value} onChange={self.handleOnChange}/>
                                                </div>
                                            );
                                        }
                                    })}
                                    <div className="clearfix" />
                            </div>
                        );
                    })}

                    <div className="text-right">
                        <Buttons btnType="primary" text="Update Settings" onClick={self.handleUpdateSettings}
                                 loading={this.state.ajaxLoad} success={this.state.success}/>
                    </div>
                </div>
            );
        }
    }
}

let mapDispatch = function(dispatch){
    return {onUpdateSettings : () => {
        Fetcher("/api/v1/system-options/public").then((options) => {
            dispatch(setOptions(options));
        })
    }
    }
}

export default connect(null, mapDispatch)(SystemSettingsForm);
