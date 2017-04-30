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

export default Price;
