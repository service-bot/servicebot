import React from 'react';

const Columns = (props) => {

    return <div className={`columns`}>
        {props.children}
    </div>

};

const Rows = (props) => {

    return <div className={`rows`}>
        {props.children}
    </div>
};

export {Columns, Rows};