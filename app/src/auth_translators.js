// Translators login
const crypto = require('crypto');
const _ = require('lodash');

var sharedSecret;
var auth;

function checkSignature(token, signature, salt) {
    const hash = crypto.createHash('sha256');
    hash.update(token, 'latin1');
    hash.update(salt, 'latin1');
    var signature2 = hash.digest('hex');

    console.log("[auth]          Check signature:        ", signature, "==", signature2);

    return signature == signature2;
}

module.exports = {
    setupAuth: (conf, a) => {
        sharedSecret = conf('shared_secret');
        auth = a;
    },

    loginURL: () => "https://translate.dyslexic-charactersheets.com/authorize",

    login: (req, res) => {
        console.log("[auth]          Translator's login");
        try {
            var token = req.query.login;

            var tokenParts = token.split(/:/);
            var id = tokenParts[0];
            var signature = tokenParts[1];
            console.log("[auth]          Shared secret:          ", sharedSecret);
            console.log("[auth]          Login token:            ", id);
            console.log("[auth]          Signature:              ", signature);

            if (!checkSignature(id, signature, sharedSecret)) {
                console.log("[auth]          Signature doesn't match");
                auth.failLogin(res, true);
                return;
            }
            console.log("[auth]          Translator login now");
            auth.setLogin(res, true);
        } catch (e) {
            console.log("[auth]          Translator's login: Error:", e);
            // res.redirect('/login');
            auth.failLogin(res, true);
        }
    }
};