import React from 'react';
import ToolTip from './tooltip.jsx';

class InfoToolTip extends React.Component {

    render(){
        let text = this.props.text || '?';
        let placement = this.props.placement || 'left';
        let title = this.props.title || 'tooltip';

        return(
            <ToolTip cssClass="btn-default btn-rounded btn-outline btn-sm"
                     style={{'fontWeight': 'bold', 'fontSize': '10px', 'lineHeight': '6px', 'padding':'0px',
                         'height':'20px', 'width':'20px', 'color':'#4a90e2', 'border-color':'#4a90e2', 'margin-top':'-2px',
                         'box-shadow':'0px 0px 9px rgba(123, 184, 255, 0.38)', 'margin-left':'5px', 'fontFamily': 'Roboto Slab'}}
                     title={title} placement={placement} text={text}/>
        );
    }

}

export default InfoToolTip;