import React from "react";


let SecureString = (props) => {
    return (
        <div className="form-group form-group-flex addon-text-widget-input-wrapper">
            <input className="form-control addon-text-widget-input" {...props.input} type="password" placeholder={props.label}/>
        </div>
    );
};



let widget =     {widget : SecureString, type : "secure-string", label : "Secure String"};

export default widget