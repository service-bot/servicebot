import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from '../../utilities/fetcher.jsx';
import ContentTitle from '../../layouts/content-title.jsx';
import Card from '../card.jsx';

class TabContent extends React.Component {

    constructor(props){
        super(props);
        this.state = { tabContent: [], url: this.props.contentUrl, loading:true};

        this.reFetch = this.reFetch.bind(this);
    }

    componentWillReceiveProps(nextProps){
        this.reFetch(nextProps.contentUrl);
    }

    componentDidMount() {
        let self = this;
        Fetcher(self.state.url).then(function(response){
            if(!response.error){
                self.setState({tabContent : response});
            }
            self.setState({loading:false});
        })
    }

    reFetch(url){
        let self = this;
        // self.setState({loading: true});
        Fetcher(url).then(function(response){
            if(!response.error){
                self.setState({url: url, tabContent: response});
            }
            self.setState({loading:false});
        })
    }

    render(){
        if(this.state.loading){
            return ( <Load/> );
        }else{
            return (
                <div className={this.props.classes ? this.props.classes : 'tab-content-inner'}>
                    <ContentTitle title={this.props.contentTitle} />
                    <div className="row cards">
                        {this.state.tabContent.length > 0 ?
                            this.state.tabContent.map( content => (
                                <Card key={`content-${content.id}`} id={content.id}
                                      name={content.name}
                                      description={content.description}
                                      amount={content.amount}
                                      interval={content.interval}
                                      imgUrl={this.props.imgUrl}
                                      color={'#4ca6cf'}/>
                            )) :
                            <p> No Content </p>
                        }
                    </div>
                </div>
            );
        }
    }


}

export default TabContent;
