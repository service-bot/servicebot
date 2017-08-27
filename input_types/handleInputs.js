//takes in a request and outputs the updated instance

let getHandlers = require("./handlers");
module.exports = {
    validateProperties: function (properties) {
        let handlers = getHandlers()
        return properties.reduce((acc, prop) => {
            //todo: reduce duplicate code that exists here and in webpack code.

            if (!handlers[prop.type]) {
                return acc;
            }
            const validator = handlers[prop.type].validator;
            if (validator) {
                const validationResult = validator(prop.data, prop.config)
                if (validationResult != true) {
                    prop.error = validationResult;
                    acc.push(prop);
                }

            }
            return acc;
        }, [])
    },
    getPriceAdjustments: function (properties) {
        let handlers = getHandlers()
        if(properties) {
            return properties.reduce((acc, prop) => {
                if (handlers[prop.type] && handlers[prop.type].priceHandler) {
                    const adjuster = handlers[prop.type].priceHandler;
                    acc.push({
                        name: prop.name,
                        type: prop.type,
                        operation: prop.config.pricing.operation,
                        value: adjuster(prop.data, prop.config)
                    });
                }
                return acc;
            }, [])
        }else{
            return [];
        }
    }
};

