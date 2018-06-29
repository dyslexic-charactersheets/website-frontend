#!/usr/bin/env nodejs

const express = require('express');
const hbs = require('hbs');

const conf = require('./src/conf');

// engines
const gameData = require('./src/gamedata');
const pathfinder2 = require('./src/pathfinder2-server');

// i18n
const i18n = require('./src/i18n');
hbs.registerHelper('__', function(str) {
    return i18n.translate(str, this.lang);
});

// notes
const quotes = require('./src/quotes');
hbs.registerHelper('note',  function() {
    var quote = quotes();

    return `<aside class='float right top'>
        <aside class='note'>
        <blockquote class='${quote.noteClass}'>${quote.quote}</blockquote>
        <cite>&mdash; ${quote.author}</cite>
        </aside>
    </aside>`;
});

// patreon
var url = require('url')
var patreon = require('patreon')
var patreonAPI = patreon.patreon

var patreonOAuthClient = patreon.oauth(conf('patreon_client_id'), conf('patreon_client_secret'));

// set up the http engine
const app = express();
app.set('view engine', 'hbs');
app.use(express.static('../public'));

// patreon
app.get('/oauth/redirect', (req, res) => {
    var oauthGrantCode = url.parse(req.url, true).query.code
 
    patreonOAuthClient
        .getTokens(oauthGrantCode, conf('url')+'oauth/redirect')
        .then(function(tokensResponse) {
            var patreonAPIClient = patreonAPI(tokensResponse.access_token)
            return patreonAPIClient('/current_user')
        })
        .then(function(result) {
            var store = result.store
            // store is a [JsonApiDataStore](https://github.com/beauby/jsonapi-datastore)
            // You can also ask for result.rawJson if you'd like to work with unparsed data
            response.end(store.findAll('user').map(user => user.serialize()))
        })
        .catch(function(err) {
            console.error('error!', err)
            response.end(err)
        })
});

app.get('/login', (req, res) => res.render('login', { lang: 'en' }));
app.get('/:lang/login', (req, res) => res.render('login', { lang: req.params.lang }));


var loginGuard = function (fn) {
    if (conf('require_login')) {

    }
    return fn();
};

// ordinary pages
app.get('/howto', (req, res) => loginGuard(() => res.render('howto', { lang: 'en' })));
app.get('/:lang/howto', (req, res) => loginGuard(() => res.render('howto', { lang: req.params.lang })));

app.get('/legal', (req, res) => loginGuard(() => res.render('legal', { lang: 'en' })));
app.get('/:lang/legal', (req, res) => loginGuard(() => res.render('legal', { lang: req.params.lang })));

app.get('/opensource', (req, res) => loginGuard(() => res.render('opensource', { lang: 'en' })));
app.get('/:lang/opensource', (req, res) => loginGuard(() => res.render('opensource', { lang: req.params.lang })));

app.get('/', (req, res) => loginGuard(() => res.render('index', { lang: 'en' })));
app.get('/:lang', (req, res) => loginGuard(() => res.render('index', { lang: req.params.lang })));

// character sheet builder forms
function renderBuildForm(req, res, lang) {
    var game = req.params.game;
    var data = gameData(game);

    var buildForm = "build-form";
    if (game == "pathfinder2") buildForm = "build-pathfinder2";

    res.render(buildForm, {
        lang: lang,
        gameData: data,
    });
}

app.get('/build/:game', (req, res) => loginGuard(() => renderBuildForm(req, res, 'en')));
app.get('/:lang/build/:game', (req, res) => loginGuard(() => renderBuildForm(req, res, req.params.lang)));

// let's build a character sheet
app.post('/render/pathfinder2', (req, res) => loginGuard(() => pathfinder2.render(req, res, 'en')));

app.post('/:lang/render/pathfinder2', (req, res) => loginGuard(() => pathfinder2.render(req, res, req.params.lang)));

// go!
app.listen(3000, () => console.log('Listening on port 3000'));
