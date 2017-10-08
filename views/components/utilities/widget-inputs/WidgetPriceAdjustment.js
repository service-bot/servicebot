import React from "react";

function Adjustment(props){
    let {operation, price} = props;
    if(operation === "add" || operation === "subtract"){
        price = (price/100).toFixed(2)
    }
    return <div>
        [{operation}s ${price}]
    </div>
}

export default Adjustment;