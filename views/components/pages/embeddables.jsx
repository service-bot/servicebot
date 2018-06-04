import React from 'react';
import consume from "pluginbot-react/dist/consume"
import {Link} from "react-router";
let EmbeddableCard = function(props){
    let {name, description, iconUrl, component} = props;
    return <div onClick={props.onClick}>
        <h1>{name}</h1>
        <span>{description}</span>
        <img src={iconUrl}/>
    </div>
}

class Embeddables extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            selected : "default"
        }
    }
    render() {
        let embeddables = this.props.services.embeddable || [];
        let self = this;
        let select = function(name){
            return function(e){
                console.log(e, name);
                self.setState({selected: name});
            }
        }
        let selected = embeddables.find(embed => embed.name === self.state.selected);
        console.log("SELECTED!",selected, embeddables);
        let SelectedComponent = (selected && selected.component) ||  EmbedIntro;
        return (<div>
            <div>
                {embeddables.map(embeddable => {
                    if(self.state.selected === embeddable.name){
                        return (<EmbeddableCard className={"selectedEmbed"}{...embeddable}/>)
                    }else{
                        return (<EmbeddableCard onClick={select(embeddable.name)}{...embeddable}/>)
                    }
                })}
            </div>
            <div>
                <SelectedComponent/>
            </div>
        </div>)
    }
}

let EmbedIntro = function(props){
    return <p>PICK AN EMBED!</p>
}
Embeddables = consume("embeddable")(Embeddables);
export default Embeddables;