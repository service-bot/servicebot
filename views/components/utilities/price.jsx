import React from 'react';
import getSymbolFromCurrency from 'currency-symbol-map'


/**
 * This is used to display Stripe amount values,
 * Since Stripe takes amount in cents, we want to convert it and display dollar value.
 */
function getPriceValue(value){
    return `$${(value/100).toFixed(2)}`;
}

function formatMoney(price, c, d, t){
    let n = price;
    let cNew = isNaN(c = Math.abs(c)) ? 2 : c;
    let dNew = d == undefined ? "." : d;
    let tNew = t == undefined ? "," : t;
    let s = n < 0 ? "-" : "";
    let i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(cNew)));
    let j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + tNew : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + tNew) + (cNew ? dNew + Math.abs(n - i).toFixed(cNew).slice(2) : "");
};

let Price = function(props){
    let price = formatMoney((props.value/100).toFixed(2),',','.');
    let prefix = props.prefix || '$';
    return(
        <span>{prefix + price}</span>
    );
};

let getPrice = (myService, serviceType = null)=>{
    let serType = myService.type || serviceType;
    let prefix = getSymbolFromCurrency(myService.currency);

    if (serType === "subscription"){
        return (
            <span>
                <Price value={myService.amount} prefix={prefix}/>
                {myService.interval_count === 1 ? ' /' : ' / ' + myService.interval_count} {' '+myService.interval}
            </span>
        );
    }else if (serType === "one_time"){
        return (<span><Price value={myService.amount} prefix={prefix}/></span>);
    }else if (serType === "custom"){
        return false;
    } else{
        return (<span><Price value={myService.amount} prefix={prefix}/></span>)
    }
};
/**
 * To be deprecated after refactoring all code
 * @param myService - a service template record row
 * @returns {*}
 */
let getBillingType = (myService)=>{
    let serType = myService.type;

    if (serType === "subscription"){
        return ("Subscription");
    } else if (serType === "one_time"){
        return ("One-time");
    } else if (serType === "custom") {
        return ("Ongoing");
    } else if (serType === "split"){
        return ("Scheduled");
    } else{
        return ("Other")
    }
};

/**
 * Takes a service template and returns the text from row.type after formatting
 * @param row - a service template record row
 * @returns {string}
 */
let serviceTypeFormatter = (row)=>{
    let type = row.type;

    let text = type.replace(/_/g, " ");
    return ( text.charAt(0).toUpperCase() + text.slice(1) );
};


export {Price, getPrice, getBillingType, serviceTypeFormatter, getPriceValue};
