import React from "react";

function Adjustment(props){
    let {operation, price} = props;
    //todo: make this less hardcoded.
    let message = "";
    if(operation === "add" || operation === "subtract") {
        price = (price / 100).toFixed(2)
    }
    switch(operation) {
        case "add":
            message = <div>${price} <span class="request-form-price-adjust-discount">Add-on</span></div>;
            break;
        case "subtract":
            message = <div>${price} <span class="request-form-price-adjust-discount">Discount</span></div>;

            break;
        case "multiply" :
            message = <div>${price}% <span className="request-form-price-adjust-increase">Increase</span></div>;

            break;
        case "divide" :
            message = <div>${price}% <span class="request-form-price-adjust-decrease">Discount</span></div>;
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