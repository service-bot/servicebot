import React from "react";
import {Field} from "redux-form";

const RenderWidget = (props) => {
    const {member, widgetComponent, configComponent, configValue, defaultWidgetValue} = props;
    return (<div>
        {configComponent && <Field name={`${member}.config`} component={configComponent}/>}
        <br/>
        <label>Default Value</label>
        {widgetComponent && <Field name={`${member}.default`} configValue={configValue} component={widgetComponent}/>}
    </div>)
}

export {RenderWidget}