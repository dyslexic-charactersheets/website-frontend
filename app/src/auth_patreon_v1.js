// Patreon login
const url = require('url');
const _ = require('lodash');
const patreon = require('patreon');

// const pledgeSchema = require('patreon/dist/schemas/pledge');
// const jsonApiURL = require('patreon/dist/jsonapi-url');

var patreonAPI = patreon.patreon;
var patreonOAuthClient;

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
        var client_id = conf('patreon_v1_client_id');
        var client_secret = conf('patreon_v1_client_secret');

        patreonOAuthClient = patreon.oauth(client_id, client_secret);
        console.log("[patreon] auth configured");

        patreonRedirectURL = conf('url')+'auth/patreon-redirect';
        console.log("[patreon] redirect URL:", patreonRedirectURL);

        patreonLoginURL = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(patreonRedirectURL)}`;
        console.log("[patreon] login URL:", patreonLoginURL);
    },

    redirect: (req, res) => {
        console.log("[patreon] redirect");

        var oauthGrantCode = url.parse(req.url, true).query.code;
        console.log("[patreon] oauth grant code:", oauthGrantCode);

        patreonOAuthClient
            .getTokens(oauthGrantCode, patreonRedirectURL)
            .then(function(tokensResponse) {
                console.log("[patreon] Tokens response:", tokensResponse);
                var patreonAPIClient = patreonAPI(tokensResponse.access_token);

                // var reqURL = jsonApiURL(`/current_user`, {
                //     fields: {
                //       pledge: [pledgeSchema.default_attributes] //, pledgeSchema.attributes.total_historical_amount_cents]
                //     }
                //   });
                // return patreonAPIClient(reqURL);
                
                return patreonAPIClient('/current_user');
            })
            .then(function(result) {
                console.log("[patreon] Result:", result);
                console.log("[patreon] Raw result:", result.rawJson);
                console.log("[patreon] Pledges:", result.rawJson.data.relationships.pledges);

                var pledges = (_.has(result.rawJson, "data") && _.has(result.rawJson.data, "relationships") && _.has(result.rawJson.data.relationships, "pledges") && _.has(result.rawJson.data.relationships.pledges, "data")) ? result.rawJson.data.relationships.pledges.data : [];
                pledges = _.filter(pledges, function (pledge) {
                    if (!_.has(pledge, "type") || pledge.type != "pledge")
                        return;
                    if (_.has(pledge, "attributes") && _.has(pledge.attributes, "declined_since") && !_.isNull(pledge.attributes.declined_since))
                        return false;
                    return true;
                });
                if (pledges.length > 0) {
                    var pledge = pledges[0];
                    console.log("[patreon] Pledge located!", pledge);
                    login(res);
                    res.redirect('/');
                }

                console.log("[patreon] No pledge. Logging in anyway.");
                login(res);
                res.redirect('/');


                // store is a [JsonApiDataStore](https://github.com/beauby/jsonapi-datastore)
                // You can also ask for result.rawJson if you'd like to work with unparsed data
                // var store = result.store;
                // res.end(store.findAll('user').map(user => user.serialize()));
            })
            .catch(function(err) {
                if (err.statusText == "UNAUTHORIZED") {
                    console.error('[patreon] unauthorized');
                    res.redirect('/auth/login');
                    return;
                }

                console.error('[patreon] Patreon error!', err);
                res.end(err);
            });
    }
};