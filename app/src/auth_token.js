// Translators login
const crypto = require('crypto');
const _ = require('lodash');
const moment = require('moment');

const dateFormat = 'YYYY-MM';

var auth;

var loginTokens = [];
var timedTokenBase;
var timedTokens = [];
var date = '';

function updateTimedTokens() {
    var d = moment().format(dateFormat);
    if (date != d) {
        date = d;
        timedTokens = [];

        for (var i = 2; i >= 0; i--) {
            d = moment().subtract(i, "months").format(dateFormat);
            
            var hash = crypto.createHash('sha256');
            hash.update(timedTokenBase);
            hash.update(d);
            var token = hash.digest('hex').substring(0, 32);

            console.log("[token] Timed token:", token);
            timedTokens.push(token);
        }
    }
}

module.exports = {
    setupAuth: (conf, a) => {
        auth = a;

        loginTokens = conf('login_tokens');
        timedTokenBase = conf('timed_token_base');
        console.log("[token] Tokens:", loginTokens);

        updateTimedTokens();
    },

    getTimedLoginToken: () => {
        updateTimedTokens();
    },

    login: (req, res) => {
        console.log("[token] login");
        try {
            var token = req.query.token;
            console.log("[token] token =", token);

            // static tokens
            if (loginTokens.indexOf(token) != -1) {
                console.log("[token] login now");
                auth.setLogin(res);
                return;
            }

            // timed tokens
            updateTimedTokens();
            if (timedTokens.indexOf(token) != -1) {
                console.log("[token] login now");
                auth.setLogin(res);
                return;
            }

            // Nope.
            res.redirect('/login');
        } catch (e) {
            console.log("[token] Error:", e);
            res.redirect('/login');
        }
    }
};