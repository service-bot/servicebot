import React from 'react';
import Load from '../../utilities/load.jsx';
import Fetcher from "../../utilities/fetcher.jsx"
import ServiceListItem from "./service-list-item.jsx"
import ReactDOM from 'react-dom';

class ServiceList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            services: [],
            url: "/api/v1/service-templates/public",
            loading:true,
            width: 0,
            cardHeight: 0,
        };

        this.handleSyncHeight = this.handleSyncHeight.bind(this);
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

    handleSyncHeight(height){
        if(this.state.cardHeight < height){
            this.setState({cardHeight: height});
        }
    }

    componentWillReceiveProps(nextProps){
        let self = this;
        if(nextProps.url){
            Fetcher(nextProps.url).then(function(response){
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
            let self = this;
            return(
                <div className="all-services" ref="allServices">
                    <h2 className="section-heading">{this.state.heading ? this.state.heading : "Featured Services"}</h2>
                    <div className="row">
                        {this.state.services.map(service => (
                            <ServiceListItem key={`service-${service.id}`}
                                             handleSyncHeight={self.handleSyncHeight}
                                             height={self.state.cardHeight}
                                             service={service}
                                             name={service.name}
                                             created={service.created}
                                             description={service.description}
                                             amount={service.amount}
                                             interval={service.interval}
                                             url={`/service-catalog/${service.id}/request`}/>
                        ))}
                    </div>
                </div>
            );
        }
    }
}

export default ServiceList;
