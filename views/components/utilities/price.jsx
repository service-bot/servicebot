import React from 'react';

/**
 * This is used to display Stripe amount values,
 * Since Stripe takes amount in cents, we want to convert it and display dollar value.
 */
let Price = function(props){
    return(
        <span>${(props.value / 100).toFixed(2)}</span>
    );
};

let getPrice = (myService, serviceType = null)=>{
    let serType = myService.type || serviceType;
    if (serType == "subscription"){
        return (
            <span>
                <Price value={myService.amount}/>
                {myService.interval_count == 1 ? ' /' : ' / ' + myService.interval_count} {' '+myService.interval}
            </span>
        );
    }else if (serType == "one_time"){
        return (<span><Price value={myService.amount}/></span>);
    }else if (serType == "custom"){
        return false;
    }else{
        return (<span><Price value={myService.amount}/></span>)
    }
};

let getBillingType = (myService)=>{
    let serType = myService.type;

    if (serType == "subscription"){
        return ("Subscription");
    }else if (serType == "one_time"){
        return ("One Time Charge");
    }else if (serType == "custom"){
        return ("Custom Billing");
    }else{
        return ("Other")
    }
};

export {Price, getPrice, getBillingType};
