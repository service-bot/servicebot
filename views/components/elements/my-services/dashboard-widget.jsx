import React from 'react';
import {Link} from 'react-router';
import { connect } from 'react-redux';
let _ = require("lodash");
import {hexToRgb, rgbToHex, getDarkenedRGB} from '../../utilities/color-converter.js';

class DashboardWidget extends React.Component {

    constructor(props){
        super(props);
    }

    render () {
        let {clickAction, widgetClass, widgetIcon, widgetName, widgetData, children} = this.props;
        const WidgetContent = () => {
            return <React.Fragment>
                <div className="__item-icon">
                    <i className={`fa fa-${widgetIcon} fa-2x`}/>
                </div>
                <div className="__item-body">
                    <div className="__title">{widgetName}</div>
                    <div className="__sub-title">
                        <span className="__data">{widgetData || children}</span>
                    </div>
                </div>
            </React.Fragment>;
        };

        if(clickAction){
            return(
                <div className={`text-widget ${widgetClass}`} onClick={clickAction}>
                    <WidgetContent/>
                </div>
            );
        }else{
            return (
                <div className={`text-widget ${widgetClass}`}>
                    <WidgetContent/>
                </div>
            );
        }
    }
}

export default connect((state) => {return {options:state.options}})(DashboardWidget);
