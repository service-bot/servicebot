import React from "react";


let Text = (props) => {
    return (
        <div className="sb-form-group __addon-text-widget">
            <input className="_input- _input-addon-text-widget" {...props.input} type="text" placeholder={props.label}/>
        </div>
    );
};



let widget =     {widget : Text, type : "text", label : "Text"};

export default widget