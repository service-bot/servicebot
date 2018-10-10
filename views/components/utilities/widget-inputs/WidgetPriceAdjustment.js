import React from "react";
function Adjustment(props){
    let {operation, price, currency} = props;
    let formatter = new Intl.NumberFormat("en-US", { style: 'currency', currency: currency }).format;
    //todo: make this less hardcoded.
    let message = "";
    if(operation === "add" || operation === "subtract") {
        price = (price / 100).toFixed(2)
    }
    switch(operation) {
        case "add":
            message = <div className="_price"><span className="_value">{formatter(Number(price))}</span> <span className="request-form-price-adjust-discount">Add-on</span></div>;
            break;
        case "subtract":
            message = <div className="_price"><span className="_value">{formatter(Number(price))}</span> <span className="request-form-price-adjust-discount">Discount</span></div>;

            break;
        case "multiply" :
            message = <div className="_price"><span className="_value">{price}</span>% <span className="request-form-price-adjust-increase">Increase</span></div>;

            break;
        case "divide" :
            message = <div className="_price"><span className="_value">{price}</span>% <span className="request-form-price-adjust-decrease">Discount</span></div>;
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

function adjust(operation, price){
    //todo: make this less hardcoded.
    let message = "";
    if(operation === "add" || operation === "subtract") {
        price = (price / 100).toFixed(2)
    }
    switch(operation) {
        case "add":
            message =`${price} Add-on`;
            break;
        case "subtract":
            message =`${price} Discount`;

            break;
        case "multiply" :
            message =`${price}% Increase`;

            break;
        case "divide" :
            message =`${price}% Discount`;
            break;
        default :
            message = ` -- ${operation} : ${price}`;
            break;
    }
    return message;
}

export default Adjustment;
export {adjust}