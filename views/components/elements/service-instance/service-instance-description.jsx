import React from 'react';

class ServiceInstanceDescription extends React.Component {

    constructor(props){
        super(props);
        this.state={opened: false}

        this.handleToggle = this.handleToggle.bind(this);
        this.getToggleStyle = this.getToggleStyle.bind(this);
    }

    componentDidMount(){
        let descriptionElement = document.getElementById('service-description');
        let descriptionElementHeight = descriptionElement.getBoundingClientRect().height;
        this.setState({descriptionHeight: descriptionElementHeight});
    }


    createMarkup(html) {
        return {__html: html};
    }

    handleToggle(){
        if(!this.state.opened){
            this.setState({opened: true});
        }else{
            this.setState({opened: false});
        }
    }

    getToggleStyle(){
        if(!this.state.opened && this.state.descriptionHeight > 315){
            let style = {height: 315, overflow: 'hidden'};
            return ( style );
        }else{
            let style = {height: 'auto'};
            return ( style );
        }
    }

    render () {

        return (
            <div className="">
                <div className="service-instance-box">
                    <div className="service-instance-box-title">
                        <span>{this.props.service.name}</span>
                    </div>
                    <div id="service-description" className="service-instance-box-content" style={this.getToggleStyle()}
                         dangerouslySetInnerHTML={this.createMarkup(this.props.instanceDescription)}/>
                    { this.state.descriptionHeight > 315 &&
                        <div className="instance-details-toggle">
                            <span onClick={this.handleToggle}
                              className="btn btn-info btn-outline btn-rounded btn-sm">{!this.state.opened ? 'Show More' : 'Show Less'}</span>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default ServiceInstanceDescription;
