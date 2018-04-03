import React from 'react';
import {isAuthorized} from '../../utilities/authorizer.jsx';
import consume from "pluginbot-react/dist/consume";


    let ServiceInstanceField = function (props) {
        // let widgets = this.props.services.widget.reduce((acc, widget) =>  ({...acc, [widget.type] : widget}), {});
        let type = props.field.type || "text";
        let widget = props.services.widget.find(widget => widget.type === type);
        let config = props.field.config;
        // if(config && config.pricing){
        //     delete config.pricing;
        // }
        if(widget && props.field.data && props.field.data.value !== null) {
            return (

                <div>
                    <label className="control-label form-label-flex-md">{props.field.prop_label}</label>
                    <widget.widget
                        configValue={props.field.config}
                        input={{value : props.field.data.value, disabled : true}}
                    />
                </div>

            );
        }else{
            return <div/>
        }
    }


export default consume("widget")(ServiceInstanceField);
