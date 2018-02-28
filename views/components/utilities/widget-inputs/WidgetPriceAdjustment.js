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
            message = `  $${price} <span className="request-form-price-adjust-addon">Add-on</span>`
            break;
        case "subtract":
            message = `  $${price} <span className="request-form-price-adjust-discount">Discount</span>`

            break;
        case "multiply" :
            message = `  ${price}% <span className="request-form-price-adjust-increase">Increase</span>`

            break;
        case "divide" :
            message = `  ${price}% <span className="request-form-price-adjust-decrease">Discount</span>`
            break;
        default :
            message = ` -- ${operation} : ${price}`;
            break;
    }
    return (
        <div className="request-form-price-adjustment-wrapper">
        {message}
        </div>
    );
}

export default Adjustment;