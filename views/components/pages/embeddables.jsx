import React from 'react';
import consume from "pluginbot-react/dist/consume"
import {Link} from "react-router";
let EmbeddableCard = function(props){
    let {name, description, iconUrl, link} = props;
    return <Link to={link}>
        <h1>{name}</h1>
        <span>{description}</span>
        <img src={iconUrl}/>
    </Link>
}
let Embeddables = function(props){
    let embeddables = props.services.embeddable || [];
    return (<div>
        {embeddables.map(embeddable => {
            return (<EmbeddableCard {...embeddable}/>)
        })}
    </div>)
}

export default consume("embeddable")(Embeddables)