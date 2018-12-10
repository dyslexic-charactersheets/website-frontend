// Translators login
const _ = require('lodash');

var sharedSecret;
var auth;

module.exports = {
    setupAuth: (conf, a) => {
        sharedSecret = conf('shared_secret');
        auth = a;
    },

    loginURL: () => "https://translate.dyslexic-charactersheets.com/authorize",

    login: (req, res) => {
        console.log("[translators] login");
        try {
            var token = req.query.login;

            var tokenParts = token.split(/:/);
            var id = tokenParts[0];
            var signature = tokenParts[1];

            if (!checkSignature(id, signature, sharedSecret)) {
                res.redirect('/login');
                return;
            }
            console.log("[translators] login now");
            auth.setLogin(res);
        } catch (e) {
            console.log("[translators] Error:", e);
            res.redirect('/login');
        }
    }
};