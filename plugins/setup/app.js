let express = require('express')
let path = require("path");
let {eventChannel, END} = require("redux-saga");
let {take} = require("redux-saga/effects")


module.exports = function* (appConfig, initialConfig, dbConfig, app) {


    const channel = eventChannel(emitter => {

        //todo move setup disabled into a .use instead of duplicate code everywhere..
        let setupDisabled = false;
        if(dbConfig && initialConfig.admin_user && initialConfig.admin_password && initialConfig.company_name && initialConfig.company_email){
            console.log("Configuration pre-set, initialization starting")
            require("../../bin/setup")({...initialConfig, ...dbConfig}, function (env) {

                emitter({initialConfig});
                setupDisabled = true;
                emitter(END);
            });
        }
        let api = express.Router();
        app.get('/', function (req, res, next) {
            if (setupDisabled) {
                return next();
            }
            if (req.url === '/setup') {
                console.log(req.url);
                next();
            } else {
                res.redirect('/setup');
            }
        });

        api.get("/api/v1/setup/steps", function (req, res, next) {
            if (setupDisabled) {
                return next();
            }
            let steps = [];
            if (!dbConfig) {
                steps.push("database");
            }
            if (!initialConfig.stripe_public || !initialConfig.stripe_secret) {
                steps.push("stripe");
            }
            if (!initialConfig.admin_user || !initialConfig.admin_password || !initialConfig.company_name || !initialConfig.company_email) {
                steps.push("configuration");
            }
            res.json(steps);
        });
        api.get(`/api/v1/system-options/file/brand_logo`, function (req, res, next) {
            if (setupDisabled) {
                return next();
            }
            return res.sendFile(path.resolve(__dirname, "../../public/assets/logos/servicebot-logo.png"));
        });


        api.post("/api/v1/check-db", function (req, res, next) {
            if (setupDisabled) {
                return next();
            }

            let dbconfig = req.body;

            //Null Check
            if (!dbconfig.db_host || !dbconfig.db_user || !dbconfig.db_name || !dbconfig.db_password) {
                res.status(400).json({error: "Database values are required!"});
            }

            let config = {
                host: dbconfig.db_host,
                user: dbconfig.db_user,
                database: dbconfig.db_name,
                password: dbconfig.db_password,
                port: dbconfig.db_port
            };
            let knex = require('knex')({
                client: 'pg',
                connection: config
            });
            knex.raw('select 1+1 as result').then(function () {
                knex("pg_catalog.pg_tables").select("tablename").where("schemaname", "public").then(function (exists) {
                    if (exists.length > 0) {
                        res.status(200).json({message: "Connected to an Existing Database", empty: false})

                    } else {
                        res.status(200).json({message: "Connected to Empty Database", empty: true})

                    }
                });
            }).catch(function (err) {
                res.status(400).json({error: "Invalid Database: " + err.toString()});
            });
        });

        api.post("/api/v1/check-stripe", function (req, res, next) {
            if (setupDisabled) {
                return next();
            }

            let stripe_config = req.body;
            let publishable = stripe_config.stripe_public;
            let secret = stripe_config.stripe_secret;
            console.log(stripe_config);
            require("../../lib/stripeValidator")(publishable, secret, function (err, result) {
                if (err) {
                    return res.status(400).json({error: err});
                } else {
                    return res.status(200).json({message: result});
                }
            })
        });

        app.use(api);

        app.post("/setup", function (req, res, next) {
            if (setupDisabled) {
                return next();
            }


            let stripe_config = req.body;
            let publishable = stripe_config.stripe_public;
            let secret = stripe_config.stripe_secret;
            if (!publishable || !secret) {
                return res.json({"error": "Stripe keys not inputted"});
            }

            require("../../lib/stripeValidator")(publishable, secret, function (err, result) {
                if (err) {
                    return res.status(400).json({error: err});
                }

                let config = {
                    ...initialConfig,
                    ...req.body,
                }

                if (!config.admin_user || !config.admin_password || !config.company_name || !config.company_email) {
                    return res.status(400).json({error: 'All fields are required'});
                }

                try {
                    require("../../bin/setup")(config, function (env) {
                        res.cookie("spk", publishable);
                        emitter({initialConfig: config, response: res});
                        emitter(END);
                    });
                } catch (e) {
                    res.json({"error": "Error - " + e});
                }
            })
        });

        //todo - figure out how to have this be served by the api gateway
        app.get('/setup', async function (request, response, next) {
            if (setupDisabled) {
                return next();
            }

            const CONFIG_PATH = appConfig.configPath;

            let configBuilder = require("pluginbot/config");
            let clientPlugins = Object.keys((await configBuilder.buildClientConfig(CONFIG_PATH)).plugins);

            response.render("main", {bundle: appConfig.bundle_path, plugins: clientPlugins});
        });

        return () => {
            setupDisabled = true;
        };

    });


    return yield take(channel);
};