import React from 'react';

class Load extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type || 'content',
            message: "Loading...",
            loadState: "loading"
        };
    }

    componentDidMount() {
        let self = this;
        if(this.props.timeout !== false ){
            this.timeout = setTimeout(function(){
                self.setState({message: "There seems to be a problem in processing your request. Please try again.", loadState: "done" });
            }, this.props.timeout || 10000);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
    }

    render () {

        let style={};
        let loadingStyle={};
        if (this.state.type == 'content' || this.state.type == 'dataform'){
            if(this.state.loadState == 'loading'){
                loadingStyle={
                    position: 'absolute',
                    top: '50%',
                    left: '47%',
                    transform: 'translate(-50%,-50%)',
                    height: '80px',
                    width: '80px',
                    zIndex: 999999
                };
            }
        }else if(this.state.type == 'button'){
            if(this.state.loadState == 'loading'){
                loadingStyle={
                    height: '20px',
                    width: '20px'
                };
            }
        }else if(this.state.type == 'avatar'){
            if(this.state.loadState == 'loading'){
                loadingStyle={
                    height: '83px',
                    width: '83px'
                };
            }
        }

        return(
            <div className="loader" style={style}>
                <div className={this.state.loadState} style={loadingStyle}></div>
                <p className={`help-block m-b-0 ${this.state.loadState}`}>{this.state.message}</p>
            </div>
        );
    }
}

export default Load;
