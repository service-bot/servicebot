let fs = require("fs");
let http = require("http");
let https = require("https");
module.exports = function(appConfig, app) {
    let certConfig = {}
    if (appConfig.certificate_path) {
        var key = fs.readFileSync(appConfig.certificate_path + "servicebot.key");
        var cert = fs.readFileSync(appConfig.certificate_path + "servicebot.crt");
        var ca = fs.readFileSync(appConfig.certificate_path + "servicebot_bundle.crt");
        certConfig = {key: key, cert: cert, ca: ca};
    }
    let server = http.createServer(app);
    let httpsServer = https.createServer(certConfig, app);
    httpsServer.listen(appConfig.ssl_port || 3000);
    server.listen(appConfig.port);
    return {server, httpsServer}
};