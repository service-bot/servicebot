import React from 'react';
import consume from "pluginbot-react/dist/consume";
import slug from "slug";

slug.defaults.mode = "rfc3986";
let EmbeddableCard = function(props){
    let {name, description, iconUrl, component, selected} = props;
    return(
        <div className={`embeddable-card ${selected && 'selected'}`} onClick={props.onClick}>
            <img className="_icon" alt={`Get ${name} Embed`} src={iconUrl}/>
            <span className="_label">{name}</span>
            {/*<span className={"_description"}>{description}</span>*/}
        </div>
    );
}

class Embeddables extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            selected : (props.params && props.params.embedName) || "default"
        }
    }
    componentDidUpdate(prevProps){
        if(this.props.params && this.props.params.embedName && ((!prevProps.params || !prevProps.params.embedName) || this.props.params.embedName !== prevProps.params.embedName) ){
            this.setState({selected: this.props.params.embedName});
        }
    }

    render() {
        let embeddables = this.props.services.embeddable || [];
        let self = this;
        let select = function(name){
            return function(e){
                self.setState({selected: name});
            }
        }
        let selected = embeddables.find(embed => slug(embed.name) === self.state.selected);
        let SelectedComponent = (selected && selected.component) ||  EmbedIntro;
        console.log(self.state.selected);
        return (
            <div id="app-embeddables" className="app-content">
                {/*<div className="_title-container">*/}
                {/*<h1 className="_heading">Embeddables</h1>*/}
                {/*</div>*/}
                <div className="_content-container">
                    <div className="_sidebar">
                        <h2 className="_sub-heading">Embeddables</h2>
                        {embeddables.map(embeddable => {
                            if(self.state.selected === slug(embeddable.name)){
                                return (<EmbeddableCard selected={true} className={"selectedEmbed"}{...embeddable}/>)
                            }else{
                                return (<EmbeddableCard onClick={select(slug(embeddable.name))}{...embeddable}/>)
                            }
                        })}
                    </div>
                    <div className="_content">
                        <SelectedComponent/>
                    </div>
                </div>
            </div>
        );
    }
}

let EmbedIntro = function(props){
    return(
        <div className="embeddable-intro">
            <div className="_content-image">
                <img src="/assets/embed/embed-intro-default.png" alt="Embed Intro Image"/>
            </div>
            <p className="_content-text">
                To get started, choose an embedabble that you would like to add to you website. Choose from the widgets list on the left hand side.
            </p>
        </div>
    );
}
Embeddables = consume("embeddable")(Embeddables);
export default Embeddables;