const fs = require('fs');
const path = require('path');
const moment = require('moment');
const request = require('request');

// const sendmail = require('sendmail')({});

const nodemailer = require('nodemailer');
var mailer = nodemailer.createTransport('direct:?name=hostname');

// var email 	= require("emailjs");

var conf;

var maildir = path.resolve('../mail');
console.log("[message] Mail dir:", maildir);
fs.mkdir(maildir, { recursive: true }, (err) => {
    
});


function sendMessage(req, res) {
    var message = req.body.message;
    var author = req.body.author;
    var email = req.body.email;
    var token = req.body.token;

    // first, verify the captcha
    var secret = conf('recaptcha_secret');
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    var verifyURL = "https://www.google.com/recaptcha/api/siteverify"
    var verifyData = {
        secret: secret,
        response: token,
        remoteip: ip
    };

    console.log("[message] verifying token:", token);
    console.log("[message] reCaptcha data:", verifyData);
    request.post({ url: verifyURL, formData: verifyData }, function (err, httpResponse, body) {
        var response = JSON.parse(body);
        console.log("[message] reCaptcha response:", response);
        if (response.success) {
            // save it to a file first
            var date = moment().format('YYYY-MM-DD_HH-mm-ss');
            var mailfile = maildir+'/'+date+'.msg';
            // console.log("[message] Logging a message to", mailfile);
            logmsg = `From: ${author} <${email}>\n\n${message}`;
            fs.writeFile(mailfile, logmsg, 'utf8');

            // send the email
            var maildest = conf('maildest');

            var mailOptions = {
                from: `"${author}" <noreply@dyslexic-charactersheets.com>`, // sender address
                to: maildest, // list of receivers
                subject: `Message from ${author}`, // Subject line
                text: message, // plain text body
                html: message // html body
            };
            mailer.sendMail(mailOptions, (error, info) => {
                if (error) {
                    res.status(500).end();
                    console.log("[message] Error sending mail:", error, error.stack);
                } else {
                    console.log("[message] Message sent");
                    res.status(200).end();
                }
            });
        }
    });
}

module.exports = function (c) {
    conf = c;

    return {
        sendMessage: sendMessage
    };
};