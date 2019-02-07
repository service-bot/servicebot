import React from 'react';
import { formBuilder } from "../../utilities/form-builder"
class FormTest extends React.Component {

    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.onClick2 = this.onClick2.bind(this);

    }

    onClick(e){
        e.preventDefault();
        this.props.setFormData({"test" : "data"});
    }
    onClick2(e){
        e.preventDefault();
        this.props.setFormData({"test2" : "data2"});
    }




    render(){
        console.log(this.props.formData);
        return (<div>

            <pre>{JSON.stringify(this.props.formData, null, '\t')}</pre>
            <button onClick={this.onClick}>BUTTON</button>
            <button onClick={this.onClick2}>BUTTON2</button>

        </div>)
    }
}

export default formBuilder("testForm")(FormTest)
