import React from 'react';
import CurrencyInput from 'react-currency-input';

const inputField = ({input, label, type, meta: {touched, error, warning}}) => (
    <div className={`form-group form-group-flex`}>
        {label && <label className="control-label form-label-flex-md">{label}</label>}
        <div className="form-input-flex">
            {type === "textarea" && <textarea className="form-control" {...input} placeholder={label}/> }
            {(type === "text" || type === "number") && <input className="form-control" {...input} placeholder={label} type={type}/> }
            {type === "checkbox" && <input className="form-control checkbox" {...input} placeholder={label} type={type}/> }
            {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span>{warning}</span>)) }
        </div>
    </div>
);

const selectField = ({input, label, type, options, valueKey, labelKey, meta: {touched, error, warning}}) => (
    <div className="form-group form-group-flex">
        {label && <label className="control-label form-label-flex-md">{label}</label>}
        <div className="form-input-flex">
            <select className="form-control" {...input} placeholder={label}>
                {options && options.map((option, index) =>
                    <option key={index} value={valueKey ? option[valueKey] : option.id}>
                        {labelKey ? option[labelKey] : option.name}
                    </option>
                    )
                }
            </select>
            {touched && ((error && <span className="form-error">{error}</span>) || (warning && <span>{warning}</span>))}
        </div>
    </div>
);

class priceField extends React.Component {

    constructor(props) {
        super(props);
        this.state = {amount: "0.00"};
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event, maskedvalue, floatvalue){
        this.setState({amount: maskedvalue});
    }

    render() {
        let {input, label, type, meta: {touched, error, warning}} = this.props;
        console.log("Price Input", input);
        return (
            <div className={`form-group form-group-flex`}>
                {label && <label className="control-label form-label-flex-md">{label}</label>}
                <div className="form-input-flex">
                    <CurrencyInput className="form-control" {...input}
                        prefix="$" decimalSeparator="." thousandSeparator="," precision="2"
                        onChangeEvent={this.handleChange}
                    />
                    {touched && ((error && <span className="form-error">{error}</span>) || (warning &&
                    <span>{warning}</span>)) }
                </div>
            </div>
        );
    }
}

export {inputField, selectField, priceField};