let handleConfig = {
    priceHandler : function(data, config){
        return config.pricing.value[data.value];
    },
    validator : function(data, config){
        if(config.value.indexOf(data.value) < 0){
            return "Selected value: " + data.value + " not a valid choice"
        }
        return true;
    }
}

module.exports = handleConfig;