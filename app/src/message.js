const fs = require('fs');
const path = require('path');
const moment = require('moment');

// const sendmail = require('sendmail')({});

const nodemailer = require('nodemailer');
var mailer = nodemailer.createTransport('direct:?name=hostname');

// var email 	= require("emailjs");

var conf;

var maildir = path.resolve('../mail');
console.log("Mail dir:", maildir);
fs.mkdir(maildir, { recursive: true }, (err) => {
    
});


function sendMessage(req, res) {
    var message = req.body.message;
    var author = req.body.author;
    var email = req.body.email;

    // save it to a file first
    var date = moment().format('YYYY-MM-dd_HH-mm-ss');
    var mailfile = maildir+'/'+date+'.msg';
    console.log("Logging a message to", mailfile);
    logmsg = `From: ${author} <${email}>\n\n${message}`;
    fs.writeFile(mailfile, logmsg, 'utf8');

    // send the email
    var maildest = conf('maildest');
    console.log("Mail destination:", maildest);
    console.log("Sending a message from ", author, "-", email);

    // // emailjs
    // var server 	= email.server.connect({
    //     // user:    "username",
    //     // password:"password",
    //     // host:    "smtp.your-email.com",
    //     // ssl:     true
    // });

    // server.send({
    //     text:    "Test",
    //     from:    "Test <noreply@dyslexic-charactersheets.com>",
    //     to:      "Marcus Downing <marcus.downing@gmail.com>",
    //     subject: "Test from emailjs"
    //  }, function(err, message) { console.log(err || message); });

    // nodemailer
    var mailOptions = {
        from: `"${author}" <noreply@dyslexic-charactersheets.com>`, // sender address
        to: maildest, // list of receivers
        subject: `Message from ${author}`, // Subject line
        text: message, // plain text body
        html: message // html body
    };
    mailer.sendMail(mailOptions, (error, info) => {
        if (error)
            console.log("Error sending mail:", error, error.stack);
        else
            console.log("Message sent:", info)
    });

    // // sendmail
    // sendmail({
    //     from: 'noreply@dyslexic-charactersheets.com',
    //     to: maildest,
    //     reply: email,
    //     subject: `Message from ${author}`,
    //     html: `Message from ${author}\n\n${message}`,
    //   }, function(err, reply) {
    //     console.log(err && err.stack);
    //     console.dir(reply);
    // });
}

module.exports = function (c) {
    conf = c;

    return {
        sendMessage: sendMessage
    };
};