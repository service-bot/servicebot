import React from 'react';

class Tab extends React.Component {

    constructor(props){
        super(props);
    }

    render(){

        return (
            <div onClick={this.props.handleClick} className={this.props.active === true ? 'tab active' : 'tab'}>
                {this.props.faIcon && <i className={`fa fa-${this.props.faIcon} m-r-10`} />}
                {this.props.imgIcon && <img scr={this.props.imgIcon} className="m-r-10" />}
                <span className="tab-label">{this.props.name}</span>
            </div>
        );

    }


}

export default Tab;
