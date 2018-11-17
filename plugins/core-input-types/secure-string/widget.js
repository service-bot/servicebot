import React from "react";


let SecureString = (props) => {
    return (
        <div className="sb-form-group __addon-secure-text-widget">
            <input className="_input- _input-addon-secure-text-widget" {...props.input} type="password" placeholder={props.label}/>
        </div>
    );
};



let widget =     {widget : SecureString, type : "secure-string", label : "Secure String"};

export default widget