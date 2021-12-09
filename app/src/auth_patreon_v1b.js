// Patreon login
const url = require('url');
const axios = require('axios');

var client_id;
var client_secret;

var patreonLoginURL = "";
var patreonRedirectURL = "";

var auth;

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
        // console.log("[patreon]       Redirect URL:", patreonRedirectURL);
        
        patreonLoginURL = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(patreonRedirectURL)}&state=login`;
        console.log("[patreon]       Patreon login URL:      ", patreonLoginURL);
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
            redirect_uri: patreonRedirectURL,
        };
        console.log("[patreon]       Retrieving auth token");
        console.log("[patreon]       Token URL:", tokenURL);
        console.log("[patreon]       Token form data:", formData);

        var request = axios.post(tokenURL, formData)
            .then(response => {
                if (err) {
                    console.log('[patreon]       Error', err);
                }
                console.log('[patreon]       OAuth response status', httpResponse.statusCode);
                console.log('[patreon]       OAuth response', httpResponse.headers);
                console.log('[patreon]       OAuth response body', body);

                if (httpResponse.statusCode == 200) {
                    var responseData = JSON.parse(body);
                    var accessCode = responseData.access_token;

                    var query = "fields[user]=full_name";
                    var identityURL = `https://www.patreon.com/api/oauth2/v2/identity?access_code=${encodeURIComponent(accessCode)}&${encodeURIComponent(query)}`;
                    console.log('[patreon]       Identity URL', identityURL);
                    https.get(identityURL, function (err, httpResponse, body) {
                        console.log('[patreon]       Identity response status', httpResponse.statusCode);
                        console.log('[patreon]       Identity response body', body);
                    });
                }
            });
    }
};