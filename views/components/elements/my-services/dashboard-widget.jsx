import React from 'react';
import {Link} from 'react-router';
import { connect } from 'react-redux';
let _ = require("lodash");

class DashboardWidget extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            systemOptions: this.props.options || {},
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.options){
            this.setState({systemOptions: nextProps.options});
        }
    }

    hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
    }

    componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    rgbToHex(r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    }

    getDarkenedRGB(rgb){
        let r = rgb.r + 20;
        let b = rgb.b +20;
        let g = rgb.g + 20;

        return { "r": r, "g": g, "b": b};
    }

    render () {
        let self = this;

        let style = {widget:{}, widgetDark:{}};

        if(this.state.systemOptions) {
            let options = this.state.systemOptions;
            style.widget.backgroundColor = _.get(options, 'primary_theme_background_color.value', '#000000');

            let darkened = this.getDarkenedRGB(this.hexToRgb(_.get(options, 'primary_theme_background_color.value', '#000000')));
            let darkenedHex = this.rgbToHex(darkened.r, darkened.g, darkened.b);
            style.widgetDark.backgroundColor = darkenedHex;
            style.widgetDark.color = _.get(options, 'primary_theme_text_color.value', '#ffffff');
        }

        const widgetContent = (

            <div className="text-widget-1 color-white" style={style.widgetDark}>
                <div className={`text-widget-wrapper`} style={style.widgetDark}>
                    <div className={`text-widget-item col-xs-4`} style={style.widget}>
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

export default connect((state) => {return {options:state.options}})(DashboardWidget);
