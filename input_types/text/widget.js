import React from "react";


let Text = (props) => {
    return <input {...props.input} type="text"/>
};



let widget =     {widget : Text, type : "text", label : "Text"};

export default widget