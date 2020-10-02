const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const moment = require('moment');
const request = require('request');

// const sendmail = require('sendmail')({});

const nodemailer = require('nodemailer');
var mailer = nodemailer.createTransport('direct:?name=hostname');

// var email 	= require("emailjs");

var conf;

var maildir = path.resolve('../mail');
console.log("[message]       Mail dir:", maildir);
fs.mkdir(maildir, { recursive: true }, (err) => {
    
});

// Timed tokens

const timeFormat = 'YYYY-MM-DD-hh';

var timedTokenBase = '';
var currentTime = '';
var currentTokens = [];

function updateTimedTokens() {
    let t = moment().subtract(i, "hours").format(timeFormat);
    if (currentTime != t) {
        let tokens = [];
        for (var i = 2; i >= 0; i--) {
            t = moment().subtract(i, "hours").format(timeFormat);
            console.log(t);
            
            var hash = crypto.createHash('sha256');
            console.log(timedTokenBase);
            hash.update(timedTokenBase);
            hash.update(t);
            var token = hash.digest('hex').substring(0, 32);

            tokens.push(token);
        }
        currentTokens = tokens;
        currentTime = t;
    }
    return currentTokens;
}

function timedToken() {
    let tokens = updateTimedTokens();
    return tokens[0];
}

function validateToken(token) {
    let tokens = updateTimedTokens();
    return tokens.includes(token);
}


function sendMessage(req, res) {
    var message = req.body.message;
    var author = req.body.author;
    var email = req.body.email;

    // check the validation
    var validationToken = req.body.validation;
    if (!validateToken(validationToken)) {
        res.status(403).end();
        console.log("[message]       Message failed validation:", validationToken);
        return;
    }

    var humanToken = req.body.verify;
    if (!verifyHumanToken(humanToken)) {
        res.status(403).end();
        console.log("[message]       Message failed validation:", humanToken);
        return;
    }

    // save it to a file first
    var date = moment().format('YYYY-MM-DD_HH-mm-ss');
    var mailfile = maildir+'/'+date+'.msg';
    // console.log("[message] Logging a message to", mailfile);
    logmsg = `From: ${author} <${email}>\n\n${message}`;
    fs.writeFile(mailfile, logmsg, 'utf8', (err) => {});

    // send the email
    var maildest = conf('maildest');

    var mailOptions = {
        from: `"${author}" <noreply@dyslexic-charactersheets.com>`, // sender address
        to: maildest, // list of receivers
        subject: `Dyslexic Character Sheets: Message from ${author}`, // Subject line
        text: message, // plain text body
        html: message // html body
    };
    if (email) {
        mailOptions.replyTo = email;
    }
    mailer.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.status(500).end();
            console.log("[message]       Error sending mail:", error, error.stack);
        } else {
            console.log("[message]       Message sent");
            res.status(200).end();
        }
    });
}

function getHumanToken() {
    var salt = (Math.floor(Math.random() * 999999999999).toString(16)+'0000').substr(0,10);
    
    var hash = crypto.createHash('sha256');
    hash.update(timedTokenBase);
    hash.update(salt);
    var parity = hash.digest('hex').substring(0, 32);

    console.log(`[message]       Human token: salt = ${salt}, parity = ${parity}`);
    return salt+parity;
}

function getFakeToken() {
    var salt = (Math.floor(Math.random() * 999999999999).toString(16)+'0000').substr(0,10);
    
    var hash = crypto.createHash('sha256');
    hash.update('12345678');
    hash.update(salt);
    var parity = hash.digest('hex').substring(0, 32);

    return salt+parity;
}

function verifyHumanToken(token) {
    console.log("[message]       Verify human:", token);
    let salt = token.substr(0,10);
    let parity = token.substr(10);
    
    var hash = crypto.createHash('sha256');
    hash.update(timedTokenBase);
    hash.update(salt);
    var token = hash.digest('hex').substring(0, 32);
    
    return token == parity;
}

module.exports = function (c) {
    conf = c;
    timedTokenBase = conf('timed_token_base');
    if (timedTokenBase === null) {
        timedTokenBase = '';
    }

    return {
        timedToken: timedToken,
        getHumanToken: getHumanToken,
        getFakeToken: getFakeToken,
        verifyHumanToken: verifyHumanToken,
        sendMessage: sendMessage
    };
};