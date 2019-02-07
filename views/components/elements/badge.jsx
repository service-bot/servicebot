import React from 'react';

const Badge = (props)=> {

    let { type } = props;
    return <span className={`status-badge ${type}`}>{props.children}</span>

};

export default Badge;