let handleConfig = {
    priceHandler : function(data, config){
        console.log("STUFF!", data);
        return data.value ? config.pricing.value : 0;
    },
    validator : function(data, config){
        if(config.value.indexOf(data.value) < 0){
            return "Selected value: " + data.value + " not a valid choice"
        }
        return true;
    }
};

module.exports = handleConfig;