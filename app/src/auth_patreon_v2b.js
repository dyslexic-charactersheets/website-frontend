// Patreon login
const url = require('url');
const patreon = require('patreon');
const patreonAPI = patreon.patreon;
const patreonOAuth = patreon.oauth;


var client_id;
var client_secret;

var patreonOAuthClient;

module.exports = {
    loginURL: () => patreonLoginURL,
    redirectURL: () => patreonRedirectURL,
    
    setupAuth: (conf, a) => {
        client_id = conf('patreon_v2_client_id');
        client_secret = conf('patreon_v2_client_secret');

        patreonOAuthClient = patreonOAuth(client_id, client_secret);    
        patreonRedirectURL = conf('url')+'auth/patreon-redirect';
        console.log("[patreon]       Patreon redirect URL:", patreonRedirectURL);
        
        patreonLoginURL = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(patreonRedirectURL)}&state=login`;
        console.log("[patreon]       Patreon login URL:      ", patreonLoginURL);
    },

    redirect: (request, response) => {
        console.log("[patreon]       Callback");
        
        var oauthGrantCode = url.parse(request.url, true).query.code;
        patreonOAuthClient
            .getTokens(oauthGrantCode, patreonRedirectURL)
            .then(function(tokensResponse) {
                var patreonAPIClient = patreonAPI(tokensResponse.access_token);
                console.log("[patreon]       Contacting Patreon API");
                return patreonAPIClient('/current_user');
            })
            .then(function(result) {
                var store = result.store;
                // store is a [JsonApiDataStore](https://github.com/beauby/jsonapi-datastore)
                // You can also ask for result.rawJson if you'd like to work with unparsed data
                // response.end(store.findAll('user').map(user => user.serialize()))

                var user = store.findAll('user');
                console.log("[patreon]       User:", user);
            })
            .catch(function(err) {
                console.error('error!', err);
                response.end(err);
            });
    }
};