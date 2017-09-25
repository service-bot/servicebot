let express = require('express')
let bodyParser = require('body-parser');
let path = require("path");
let fs = require('fs');
let https = require("https");
let http = require("http");
let enableDestroy = require('server-destroy');
let {eventChannel, END }  = require("redux-saga");
let {take }  = require("redux-saga/effects")

let startApp = function(app, callback=null){
    let debug = require('debug')('testpassport:server');

    /**
     * Get port from environment and store in Express.
     */

    let port = normalizePort(process.env.PORT || '3001');
    app.set('port', port);

    /**
     * Create HTTP server.
     */
    let config = {}
    if(process.env.CERTIFICATES){
        var key = fs.readFileSync(process.env.CERTIFICATES + "servicebot.key");
        var cert = fs.readFileSync(process.env.CERTIFICATES + "servicebot.crt");
        var ca = fs.readFileSync(process.env.CERTIFICATES + "servicebot_bundle.crt");
        config = {key:key, cert:cert, ca:ca};
    }
    let server = http.createServer(app);
    let httpsServer = https.createServer(config, app);
    httpsServer.listen(process.env.SSL_PORT || 3000);
    httpsServer.on('error', onError);
    httpsServer.on('listening', onListening);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);
    if(callback){
        enableDestroy(server);
        callback(app, server);
    }

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
        let port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        let bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
        let addr = server.address();
        let bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        console.log('Listening on ' + bind);
    }
};




module.exports = function*(appConfig) {






    const channel = eventChannel(emitter => {
        let app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: false
        }));
        let api = express.Router();
        console.log("environment not initialized - waiting for installation request")
        app.get('/', function (req, res, next) {
            if (req.url === '/setup') {
                console.log(req.url);
                next();
            } else {
                res.redirect('/setup');
            }
        });

        app.use(express.static(path.join(__dirname, '../..', 'public')));

//this routes all requests to serve index
// view engine setup
        app.set('views', path.join(__dirname, 'views'));

        let server = app.listen((appConfig.port || 3001), function () {
        });
        let sslConfig = {}
        if (appConfig.certificate_path) {
            var key = fs.readFileSync(appConfig.certificate_path + "servicebot.key");
            var cert = fs.readFileSync(appConfig.certificate_path + "servicebot.crt");
            var ca = fs.readFileSync(appConfig.certificate_path + "servicebot_bundle.crt");
            sslConfig = {key: key, cert: cert, ca: ca};
        }

        let httpsServer = https.createServer(sslConfig, app).listen(appConfig.ssl_port || 3000);
        enableDestroy(server);
        enableDestroy(httpsServer);
        console.log("waitin around");
        api.post("/api/v1/check-db", function (req, res, next) {
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
            let conf = req.body;

            if (!conf.admin_user || !conf.admin_password || !conf.company_name || !conf.company_email) {
                return res.status(400).json({error: 'All fields are required'});
            }

            try {
                require("../../bin/setup")(conf, function (env) {
                    emitter({conf});
                    emitter(END);
                    console.log("yeah ok");
                });
            } catch (e) {
                res.json({"error": "Error - " + e});
            }
        });
        app.get('/setup', function (request, response) {
            response.sendFile(path.resolve(__dirname, '../../public', 'index.html'))
        });

        return () => {
            // Perform any cleanup you need here
            server.destroy();
            httpsServer.destroy();
        };

    });
    let {conf} = yield take(channel);
    console.log("GOTTA CONF!");
    return conf;
};