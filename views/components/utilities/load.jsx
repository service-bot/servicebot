import React from 'react';

class Load extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type || 'content',
            message: "Loading...",
            loadState: "loading",
            show: false,
        };
    }

    componentDidMount() {
        let self = this;
        let {timeout, delayed, show} = this.props;

        if(delayed !== false){
            this.delayed = setTimeout(function () {
                self.setState({
                    show: true
                })
            }, 1000)
        }

        if(this.props.timeout !== false ){
            this.timeout = setTimeout(function(){
                self.setState({message: "There seems to be a problem in processing your request. Please try again.", loadState: "done" });
            }, this.props.timeout || 10000);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        clearTimeout(this.delayed);
    }

    render () {

        let {timeout, delayed, show} = this.state;
        // let style={};
        // let loadingStyle={};
        // if (this.state.type == 'content' || this.state.type == 'dataform'){
        //     if(this.state.loadState == 'loading'){
        //         loadingStyle={
        //             position: 'absolute',
        //             top: '50%',
        //             left: '47%',
        //             transform: 'translate(-50%,-50%)',
        //             height: '80px',
        //             width: '80px',
        //             zIndex: 999999
        //         };
        //     }
        // }else if(this.state.type == 'button'){
        //     if(this.state.loadState == 'loading'){
        //         loadingStyle={
        //             height: '20px',
        //             width: '20px'
        //         };
        //     }
        // }else if(this.state.type == 'avatar'){
        //     if(this.state.loadState == 'loading'){
        //         loadingStyle={
        //             height: '83px',
        //             width: '83px'
        //         };
        //     }
        // }
        if(show){
            return(
                <div className="loader"><div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div></div>
            );
        }else{
            return(
                <div/>
            )
        }
    }
}

export default Load;
