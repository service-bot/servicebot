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
        let self = this;

        let style = {widget:{}, widgetDark:{}};

        if(this.props.options) {
            let options = this.props.options;
            style.widget.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');
            let darkened = getDarkenedRGB(hexToRgb(_.get(options, 'primary_theme_background_color.value', '#000000')));
            let darkenedHex = rgbToHex(darkened.r, darkened.g, darkened.b);

            if(self.props.widgetColor){
                style.widget.backgroundColor = self.props.widgetColor;
                darkened = getDarkenedRGB(hexToRgb(self.props.widgetColor));
                darkenedHex = rgbToHex(darkened.r, darkened.g, darkened.b);
            }

            style.widgetDark.backgroundColor = darkenedHex;
            style.widgetDark.color = _.get(options, 'primary_theme_text_color.value', '#ffffff');
        }

        if(this.props.borderRadius) {
            style.widgetDark.borderRadius = this.props.borderRadius;
        }

        if(this.props.iconPadding) {
            style.widget.paddingTop = this.props.iconPadding;
            style.widget.paddingBottom = this.props.iconPadding;
        }


        const widgetContent = (

            <div className={`text-widget-1 color-white ${self.props.reversed && "reversed"} ${self.props.margins}`} style={style.widgetDark}>
                {!self.props.plain &&
                <div className={`text-widget-wrapper ${self.props.widgetHoverClass}`} style={style.widgetDark}>
                    {!self.props.reversed &&
                    <div className={`text-widget-item col-xs-4 ${self.props.small && "small"}`} style={style.widget}>
                        <i className={`fa fa-${self.props.widgetIcon} fa-2x`} />
                    </div>
                    }
                    <div className="text-widget-item col-xs-8">
                        <div className="title">{self.props.widgetName}</div>
                        <div className={self.props.small ? "subtitle small" : "subtitle"}><span
                            className="">{self.props.widgetData || this.props.children}</span></div>
                    </div>
                    {self.props.reversed &&
                    <div className={`text-widget-item col-xs-4 ${self.props.small && "small"}`} style={style.widget}>
                        <i className={`fa fa-${self.props.widgetIcon} fa-2x`} />
                    </div>
                    }
                </div>
                ||
                <div className={`text-widget-wrapper plain ${self.props.widgetHoverClass}`} style={style.widget}>
                    <div className="text-widget-item col-xs-12">
                        <div className="title">{self.props.widgetName}</div>
                        <div className="subtitle"><span
                            className="">{self.props.widgetData || this.props.children}</span></div>
                    </div>
                </div>
                }
            </div>

        );

        if(this.props.link){
            return (
                <div className={self.props.widgetClass || "col-xs-12 col-sm-6 col-md-3 col-xl-3"}>
                    <Link to={self.props.link} target="_Blank" >
                        {widgetContent}
                    </Link>
                </div>
            );
        }else if(this.props.clickAction){
            return(
                <div className={self.props.widgetClass || "col-xs-12 col-sm-6 col-md-3 col-xl-3"}>
                    <Link to='' onClick={self.props.clickAction}>
                        {widgetContent}
                    </Link>
                </div>
            );
        }else{
            return (
                <div className={self.props.widgetClass || "col-xs-12 col-sm-6 col-md-3 col-xl-3"}>
                    {widgetContent}
                </div>
            );
        }
    }
}

export default connect((state) => {return {options:state.options}})(DashboardWidget);
