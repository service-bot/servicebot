module.exports = function setup(options, imports, register) {

    // "database" was a service this plugin consumes
    console.log("INTITIALIZING PLUGIN!")

    register(null, {
        // "auth" is a service this plugin provides
        knex: require("../../config/db"),
        app : options.app,
        api : options.api,
        stripe : require('../../config/stripe'),
        store : require("../../config/redux/store")
    });
};
