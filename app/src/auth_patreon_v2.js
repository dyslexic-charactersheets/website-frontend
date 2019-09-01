// Patreon login
const url = require('url');
const patreon = require('patreon');
const request = require('request');

// const pledgeSchema = require('../../node_modules/patreon/dist/schemas/pledge.js');
// const jsonApiURL = require('../../node_modules/patreon/dist/jsonapi-url.js');

// var patreonAPI = patreon.patreon;
// var patreonOAuthClient;

var client_id;
var client_secret;

var patreonLoginURL = "";
var patreonRedirectURL = "";

var auth;
function login (res) {
    console.log("[patreon] login now");
    auth.setLogin(res);
}

module.exports = {
    loginURL: () => patreonLoginURL,
    redirectURL: () => patreonRedirectURL,
    
    setupAuth: (conf, a) => {
        auth = a;
        client_id = conf('patreon_v2_client_id');
        client_secret = conf('patreon_v2_client_secret');

        // patreonOAuthClient = patreon.oauth(client_id, client_secret);
        // console.log("[patreon] auth configured");
    
        patreonRedirectURL = conf('url')+'auth/patreon-redirect';
        console.log("[patreon]       Redirect URL:", patreonRedirectURL);
        
        patreonLoginURL = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(patreonRedirectURL)}&state=login`;
        console.log("[patreon]       Login URL:", patreonLoginURL);
    },

    redirect: (req, res) => {
        console.log("[patreon]       Redirect");

        var query = url.parse(req.url, true).query;
        var oauthGrantCode = query.code;
        console.log("[patreon]       OAuth grant code:", oauthGrantCode);
        console.log("[patreon]       State:", query.state);

        // var authURL = `http://www.patreon.com/api/oauth2/token?code=${}&grant_type=authorization_code&client_id=${client_id}&client_secret=${client_secret}&redirect_uri=${encodeURIComponent(patreonRedirectURL)}`;
        var tokenURL = 'https://www.patreon.com/api/oauth2/token';
        var formData = {
            code: oauthGrantCode,
            grant_type: 'authorization_code',
            client_id: client_id,
            client_secret: client_secret,
            redirectURL: patreonRedirectURL,
        };
        console.log("[patreon]       Retrieving auth token");
        console.log("[patreon]       Token URL:", tokenURL);
        console.log("[patreon]       Token form data:", formData);

        request.post({ url: tokenURL, formData: formData }, function (err, httpResponse, body) {
            if (err) {
                console.log('[patreon]       Rrror', err);
            }
            console.log('[patreon]       OAuth response status', httpResponse.statusCode);
            console.log('[patreon]       OAuth response', httpResponse.headers);
            console.log('[patreon]       OAuth response body', body);
        });








        // patreonOAuthClient
        //     .getTokens(oauthGrantCode, auth.patreonRedirectURL)
        //     .then(function(tokensResponse) {
        //         console.log("[patreon] Tokens response:", tokensResponse);

        //         var access_token = tokensResponse.access_token;
        //         request('https://www.patreon.com/api/oauth2/v2/identity')
        //             .on('error', function(err) {
        //                 console.log('[patreon] Error', err);
        //             })
        //             .on('response', function(response) {
        //                 console.log('[patreon] Response', response);
        //                 console.log(response.statusCode) // 200
        //                 console.log(response.headers['content-type']) // 'image/png'
        //             });
        //     });
    }
};