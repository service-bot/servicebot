import React from "react";


let Text = (props) => {
    return (
        <div className="form-group form-group-flex addon-text-widget-input-wrapper">
            <input className="form-control addon-text-widget-input" {...props.input} type="text" placeholder="Set Default Value (Optional)"/>
        </div>
    );
};



let widget =     {widget : Text, type : "text", label : "Text"};

export default widget