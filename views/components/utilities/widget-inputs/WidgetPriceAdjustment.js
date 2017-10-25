import React from "react";

function Adjustment(props){
    let {operation, price} = props;
    //todo: make this less hardcoded.
    let prefix = "$";
    let message = "";
    if(operation === "add" || operation === "subtract") {
        price = (price / 100).toFixed(2)
    }
    switch(operation) {
        case "add":
            message = `  $${price} Add-on`
            break;
        case "subtract":
            message = `  $${price} Discount`

            break;
        case "multiply" :
            message = `  ${price}% Increase`

            break;
        case "divide" :
            message = `  ${price}% Discount`
            break;
        default :
            message = ` -- ${operation} : ${price}`;
            break;
    }
    return <div>
        {message}
    </div>
}

export default Adjustment;