import React from 'react';

const Section = (props) => {

    return <div className={`_section ${props.className}`}>
        <div className="tiers">
            <div className="_tier-details">
                {props.children}
            </div>
            {props.outside}
        </div>
    </div>

};

export {Section};