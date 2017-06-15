import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import ServiceListItem from "./service-list-item.jsx"
import ReactDOM from 'react-dom';
let _ = require("lodash");

class ServiceList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            services: [],
            url: this.props.url || "/api/v1/service-templates/public",
            loading:true,
            width: 0,
        };
    }

    componentDidMount() {
        let that = this;
        Fetcher(that.state.url).then(function(response){
            if(!response.error){
                that.setState({services : response});
            }
            that.setState({loading:false});
        });
    }

    componentDidUpdate(){
        let myItemsList = document.getElementsByClassName('card-wrapper');
        let max = 0;
        for(let i = 0; i < myItemsList.length; i++){
            if(myItemsList[i].clientHeight > max){
                max = myItemsList[i].clientHeight;
            }
        }

        if(this.state.height != max) {
            this.setState({height: max});
        }
    }

    componentWillReceiveProps(nextProps){
        let self = this;
        if(nextProps.url != this.props.url){
            console.log("updated props url", nextProps.url);
            Fetcher(nextProps.url).then(function(response){
                console.log("url response", response);
                if(!response.error){
                    self.setState({services : response});
                }
            })
        }
    }

    render () {

        if(this.state.loading)
            return <Load/>;
        if(this.state.services.length<1) {
            return <p className="help-block center-align">There are no services</p>;
        }
        else {
            return(
                <div className="all-services" ref="allServices">
                    <div className="row" ref="hello">
                        {this.state.services.map(service => (
                            <ServiceListItem key={`service-${service.id}`}
                                             service={service}
                                             height={this.state.height || 'auto'}
                                             name={service.name}
                                             created={service.created}
                                             description={service.description}
                                             amount={service.amount}
                                             interval={service.interval}
                                             url={`/service-catalog/${service.id}/request`} />
                        ))}
                    </div>
                </div>
            );
        }
    }
}

export default ServiceList;
