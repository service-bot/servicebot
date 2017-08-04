var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var express = require('express');
var expressSession = require('express-session');
var favicon = require('serve-favicon');
var flash = require('connect-flash');
var swaggerJSDoc = require('swagger-jsdoc');
var logger = require('morgan');
var passport = require('passport');
var path = require('path');
let architect = require("architect")
let schedule = require("node-schedule");
var helmet = require('helmet')

module.exports = function (initConfig = null) {
    let envPath = path.join(__dirname, 'env/.env');
    require('dotenv').config({path: envPath});
    let injectProperties = require("./middleware/property-injector")

    return require('./config/init.js')(initConfig).then(function (init) {
        return new Promise(function (resolve, reject) {

            console.log(init);

            require('./config/passport.js')(passport);

            var app = express();
            app.use(helmet());
            //var subpath = express();

            // swagger definition
            var swaggerDefinition = {
                info: {
                    title: 'ServiceBot API',
                    version: '1.0.0',
                    description: 'Rest API documentation for ServiceBot',
                },
                host: 'localhost:3001',
                basePath: '/api/v1/',
            };

            // options for the swagger docs
            var options = {
                // import swaggerDefinitions
                swaggerDefinition: swaggerDefinition,
                // path to the API docs
                apis: ["./api/*"],
            };

            // initialize swagger-jsdoc
            var swaggerSpec = swaggerJSDoc(options);
            swaggerSpec.paths = require('./api-docs/api-paths.json');
            swaggerSpec.definitions = require('./api-docs/api-definitions.json');
            swaggerSpec.securityDefinitions = require('./api-docs/api-security-definitions.json');
            // serve swagger
            app.get('/swagger.json', function (req, res) {
                res.setHeader('Content-Type', 'application/json');
                res.send(swaggerSpec);
            });

            //this is where we set routes to go through react
            app.use(express.static(path.join(__dirname, 'public')));

            //this routes all requests to serve index

            // view engine setup
            app.set('views', path.join(__dirname, 'views'));
            //app.set('view engine', 'jade');


            // uncomment after placing your favicon in /public
            //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

            app.use(logger('dev'));
            app.use(bodyParser.json());
            app.use(bodyParser.urlencoded({
                extended: false
            }));
            app.use(cookieParser());

            app.use(expressSession({
                secret: process.env.SECRET_KEY,
                resave: true,
                saveUninitialized: true
            }));

            app.use(passport.initialize());
            app.use(passport.session());
            app.use(require("./middleware/role-session")());
            app.use(flash());
            app.use(injectProperties());

            //auth route doesn't go in express route so it doesn't need auth
            require("./api/auth")(app, passport);

            //initialize api route
            var api = express.Router();

            //force all requests to api route to look for token, if token is present in header the user will be logged in with taht token
            api.use(function (req, res, next) {
                passport.authenticate('jwt', function (err, user, info) {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        return next();
                    }
                    req.logIn(user, {
                        session: false
                    }, function (err) {
                        if (err) {
                            return next(err);
                        }
                        return next();
                    });
                })(req, res, next);
            });


            require('./api/users')(api, passport);
            require('./api/funds')(api);
            require('./api/invoices')(api);
            require('./api/service-instances')(api);
            require('./api/service-instance-properties')(api);
            require('./api/service-instance-messages')(api);
            require('./api/service-instance-cancellations')(api);
            require('./api/service-templates')(api);
            require('./api/service-template-properties')(api);
            require('./api/service-categories')(api);
            require('./api/system-options')(api);
            require('./api/charge')(api);
            require('./api/event-logs')(api);
            require('./api/notification-templates')(api);
            require('./api/notifications')(api);
            require('./api/permissions')(api);
            require('./api/roles')(api);
            require('./api/analytics')(api);


            var configPath = path.join(__dirname, "./config/plugins.js");

            let pluginConf = architect.loadConfig(configPath);
            pluginConf[0].app = app;
            pluginConf[0].api = api;
            architect.createApp(pluginConf, function (err, architectApp) {

                architectApp.services.api.use(function (req, res, next) {
                    if (res.locals.json) {
                        res.json(res.locals.json);
                    } else {
                        next();
                    }
                })

                architectApp.services.app.use('/api/v1', architectApp.services.api);

                architectApp.services.app.get('*', function (req, res) {
                    if (req.path.split("/")[3] == "embed" && req.method === 'GET') {
                        res.removeHeader('X-Frame-Options');
                    }
                    res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
                })


                // catch 404 and forward to error handler
                architectApp.services.app.use(function (req, res, next) {
                    var err = new Error('Not Found');
                    err.status = 404;
                    next(err);
                });

                // error handler
                architectApp.services.app.use(function (err, req, res, next) {
                    // set locals, only providing error in development
                    res.locals.message = err.message;
                    console.error(err);
                    res.locals.error = req.app.get('env') === 'development' ? err : "unhandled error has happened in server";
                    if(err.message == "File too large"){
                        err.status = 413;
                        res.locals.error = "File too large";

                    }

                    // send the error
                    res.status(err.status || 500).json({error : res.locals.error});

                    //res.render('error');
                });
                resolve(app);


            })

        })
    });
}