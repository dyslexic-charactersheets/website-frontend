// Translators login
const _ = require('lodash');

var loginTokens = [];
var auth;

module.exports = {
    setupAuth: (conf, a) => {
        loginTokens = conf('login_tokens');
        auth = a;
        console.log("[token] Tokens:", loginTokens);
    },

    login: (req, res) => {
        console.log("[token] login");
        try {
            var token = req.query.token;
            console.log("[token] token =", token);

            if (loginTokens.indexOf(token) == -1) {
                res.redirect('/login');
                return;
            }
            console.log("[token] login now");
            auth.setLogin(res);
        } catch (e) {
            console.log("[token] Error:", e);
            res.redirect('/login');
        }
    }
};