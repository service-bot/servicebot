import React from 'react';
import {Link} from 'react-router';

class DashboardWidget extends React.Component {

    constructor(props){
        super(props);
    }

    render () {

        let self = this;
        const widgetContent = (

            <div className="text-widget-1 color-white">
                <div className={`text-widget-wrapper bg-${self.props.widgetColor}-900`}>
                    <div className={`text-widget-item col-xs-4 bg-${self.props.widgetColor}-700`}>
                        <i className={`fa fa-${self.props.widgetIcon} fa-2x`}/>
                    </div>
                    <div className="text-widget-item col-xs-8">
                        <div className="title">{self.props.widgetName}</div>
                        <div className="subtitle"><span className="">{self.props.widgetData || this.props.children}</span></div>
                    </div>
                </div>
            </div>

        );

        if(this.props.link){
            return (
                <div className="col-xs-12 col-sm-6 col-md-3 col-xl-3">
                    <Link to={self.props.linkTo} >
                        {widgetContent}
                    </Link>
                </div>
            );
        }else if(this.props.clickAction){
            return(
                <div className="col-xs-12 col-sm-6 col-md-3 col-xl-3">
                    <Link to='' onClick={self.props.clickAction}>
                        {widgetContent}
                    </Link>
                </div>
            );
        }else{
            return (
                <div className="col-xs-12 col-sm-6 col-md-3 col-xl-3">
                    {widgetContent}
                </div>
            );
        }
    }
}

export default DashboardWidget;
