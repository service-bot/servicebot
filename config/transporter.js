var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport

//todo: handle certs n stufff
let smtpConfig = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // upgrade later with STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
        rejectUnauthorized : false
    }
};

//var transporter = nodemailer.createTransport('smtps://testpug1%40gmail.com:100Dollar$@smtp.gmail.com');

var transporter = nodemailer.createTransport(smtpConfig);

// setup e-mail data with unicode symbols
module.exports = transporter;