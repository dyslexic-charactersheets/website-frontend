// const express = require('express');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const _ = require('lodash');

// patreon
var url = require('url');
var patreon = require('patreon');
var patreonAPI = patreon.patreon;
var patreonOAuthClient;


// translation


// general
var conf;
var app;

var baseURL = false;
var sessionKey;
var sharedSecret;

function setupAuth() {
    if (baseURL)
        return;
    baseURL = conf('url');
    sessionKey = conf('session_key');
    sharedSecret = conf('shared_secret');
    
    patreonOAuthClient = patreon.oauth(conf('patreon_client_id'), conf('patreon_client_secret'));
    console.log("Auth configured");
}

function login(res) {
    var loginDur = 3600*24*30; // 30 days
    var now = Date.now();

    var loginToken = "$"+now;

    const hash = crypto.createHash('sha256');
    hash.update(loginToken);
    hash.update(sessionKey);
    var signature = hash.digest('hex');

    var cookie = loginToken+":"+signature;
    res.cookie('login', cookie, { maxAge: loginDur, httpOnly: true }).redirect('/');
}

function checkSignature(message, signature, salt) {
    const hash = crypto.createHash('sha256');
    hash.update(message);
    hash.update(salt);
    var signature2 = hash.digest('hex');

    return signature == signature2;
}

module.exports = {
    set: (c, a) => {
        conf = c;
        app = a;
        app.use(cookieParser());
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

    login: (req, res) => {
        setupAuth();
        login(res);
    },

    translatorsLogin: (req, res) => {    
        setupAuth();

        try {
            var token = req.query.login;

            var tokenParts = token.split(/:/);
            var id = tokenParts[0];
            var signature = tokenParts[1];

            if (!checkSignature(id, signature, sharedSecret))
                res.redirect('/login');
            login(res);
        } catch (e) {
            console.log("Error:", e);
            res.redirect('/login');
        }
    },

    patreonRedirect: (req, res) => {
        setupAuth();
        var oauthGrantCode = url.parse(req.url, true).query.code
 
        patreonOAuthClient
            .getTokens(oauthGrantCode, baseURL+'patreon-redirect')
            .then(function(tokensResponse) {
                var patreonAPIClient = patreonAPI(tokensResponse.access_token)
                return patreonAPIClient('/current_user')
            })
            .then(function(result) {
                var store = result.store
                // store is a [JsonApiDataStore](https://github.com/beauby/jsonapi-datastore)
                // You can also ask for result.rawJson if you'd like to work with unparsed data
                res.end(store.findAll('user').map(user => user.serialize()))
            })
            .catch(function(err) {
                console.error('error!', err)
                res.end(err)
            });
    }
};