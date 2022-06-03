const crypto = require('crypto');
const _ = require('lodash');

const auth_patreon = require('./auth_patreon_api');
const auth_translators = require('./auth_translators');
const auth_token = require('./auth_token');

// general
var conf;
var sessionKey;

var baseURL = false;

function setupAuth() {
    if (baseURL)
        return;
    baseURL = conf('url');
    
    console.log("[auth]          Base URL:  ", baseURL);
    sessionKey = conf('session_key');
    auth.allowJustLogin = conf('allow_just_login');
    auth_patreon.setupAuth(conf, auth);
    auth_translators.setupAuth(conf, auth);
    auth_token.setupAuth(conf, auth);
}

function checkSignature(message, signature, salt) {
    const hash = crypto.createHash('sha256');
    hash.update(message);
    hash.update(salt);
    var signature2 = hash.digest('hex');

    return signature == signature2;
}

var auth = {
    allowJustLogin: false,

    setup: () => {
        setupAuth();
    },

    isLoggedIn: req => {
        setupAuth();

        try {
            if (_.has(req.cookies, 'login')) {
                var cookieParts = req.cookies.login.split(/:/);
                var loginToken = cookieParts[0];
                var signature = cookieParts[1];

                return checkSignature(loginToken, signature, sessionKey);
            }
        } catch (e) {
            console.log(e);
            return false;
        }
        
        return false;
    },

    setLogin: (res, redirect = false) => {
        var loginDur = 3600*24*30*1000; // 30 days
        var now = Date.now();

        var loginToken = "$"+now;

        const hash = crypto.createHash('sha256');
        hash.update(loginToken);
        hash.update(sessionKey);
        var signature = hash.digest('hex');

        var cookie = loginToken+":"+signature;
        res.cookie('login', cookie, { maxAge: loginDur, httpOnly: true }).redirect((redirect ? '/' : '')+'#login_success');
    },

    failLogin: (res, redirect = false) => {
        res.redirect((redirect ? '/' : '')+'#login_fail');
    },

    logout: (res) => {
        res.clearCookie('login').redirect('/#logged_out');
    },

    patreonLoginURL: () => auth_patreon.loginURL(),
    patreonRedirectURL: () => auth_patreon.redirectURL(),

    patreonLogin: (req, res) => {
        setupAuth();
        auth_patreon.login(req, res);
    },

    patreonRedirect: (req, res) => {
        setupAuth();
        auth_patreon.redirect(req, res)
    },

    translatorsLoginURL: () => auth_translators.loginURL(),

    translatorsLogin: (req, res) => {
        setupAuth();
        auth_translators.login(req, res);
    },

    tokenLogin: (req, res) => {
        setupAuth();
        auth_token.login(req, res);
    }
};

module.exports = function (c) {
    conf = c;
    return auth;
};
