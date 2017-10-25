let path = require("path");
let fs = require("fs")
let crypto = require("crypto")
let setup = function(config, callback){
    crypto.randomBytes(30, function (err, buffer) {
        const secret = crypto.randomBytes(32).toString("hex");

        let salt = buffer.toString("hex");

        let env =
            `POSTGRES_DB_HOST=${config.db_host || process.env.POSTGRES_DB_HOST}
POSTGRES_DB_USER=${config.db_user || process.env.POSTGRES_DB_USER}
POSTGRES_DB_NAME=${config.db_name || process.env.POSTGRES_DB_NAME}
POSTGRES_DB_PASSWORD=${config.db_password || process.env.POSTGRES_DB_PASSWORD}
POSTGRES_DB_PORT=${config.db_port || process.env.POSTGRES_DB_PORT}
SMTP_HOST=${config.smtp_host || process.env.SMTP_HOST}
SMTP_USER=${config.smtp_user || process.env.SMTP_USER}
SMTP_PASSWORD=${config.smtp_password || process.env.SMTP_PASSWORD}
SMTP_PORT=${config.smtp_port || process.env.SMTP_PORT}
INSTANCE_SALT=${process.env.INSTANCE_SALT || config.salt || salt}
SECRET_KEY=${process.env.SECRET_KEY || secret}`;

        let envPath = path.join(__dirname, '../env/.env')
        let envFolder = path.join(__dirname, "../env");
        if (!fs.existsSync(envFolder)){
            fs.mkdirSync(envFolder);
        }

        fs.writeFile(envPath, env, {flag: 'wx'}, function (err) {
            if (err) {

                console.error("env exists")

            } else {
                require('dotenv').config({path: envPath});
                require("../config/db").raw('select 1+1 as result').then(function () {
                    callback(env);
                }).catch(function(err){
                    fs.unlink(envPath);

                    throw "Specified Database connection error - env wiped\n" + err
                });

            }
        })
    });
};

module.exports = setup;