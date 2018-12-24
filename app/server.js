#!/usr/bin/env nodejs

// my own data
const conf = require('./src/conf');
const message = require('./src/message')(conf);

const i18n = require('./src/i18n')(conf);
const quotes = require('./src/quotes');

// set up the http engine
const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

// and the app view engine with handlebars
const hbs = require('hbs');
const express_hbs  = require('express-handlebars');

app.set('view engine', 'hbs');

var xhbs = express_hbs({
    extname: '.hbs',
    defaultView: 'default',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    helpers: require('./src/view-helpers')(conf, i18n, quotes)
  });
// layouts = require('handlebars-layouts');
// hbs.registerHelper(hbs_layouts(xhbs));
app.engine('.hbs', xhbs);

app.use(express.static(__dirname+'/../public'));
app.use(express.static(__dirname+'/../../assets'));
app.use('/iconics', express.static(__dirname+'/../../assets/iconics/small'));

// engines
const gameData = require('./src/gamedata.js');
const iconicData = require('./src/iconicdata');
const pathfinder2 = require('./src/pathfinder2-server.js');

// login
const auth = require('./src/auth')(conf);

function renderLogin(req, res, lang) {
    auth.setup();
    return res.render('login', {
        title: 'Dyslexic Character Sheets',
        lang: lang,
        translators_login_url: auth.translatorsLoginURL(),
        patreon_login_url: auth.patreonLoginURL(),
        allow_just_login: auth.allowJustLogin,
    });
}

// app.get('/oauth/redirect', auth.oauthRedirect);
app.get('/auth/patreon-redirect', auth.patreonRedirect);

app.get('/auth/login', (req, res) => renderLogin(req, res, 'en'));
app.get('/:lang/auth/login', (req, res) => renderLogin(req, res, req.params.lang));

app.get('/auth/translators-login', auth.translatorsLogin);
app.get('/auth/token-login', auth.tokenLogin);

var loginGuard = function (req, res, lang, fn) {
    if (conf('require_login') && !auth.isLoggedIn(req)) {
        return renderLogin(req, res, lang);
    }
    return fn();
};

// ordinary pages
app.get('/howto', (req, res) => loginGuard(req, res, 'en', () => res.render('howto', { title: 'How to', lang: 'en' })));
app.get('/:lang/howto', (req, res) => loginGuard(req, res, req.params.lang, () => res.render('howto', { title: 'How to', lang: req.params.lang })));

app.get('/legal', (req, res) => loginGuard(req, res, 'en', () => res.render('legal', { title: 'Legal information', lang: 'en' })));
app.get('/:lang/legal', (req, res) => loginGuard(req, res, req.params.lang, () => res.render('legal', { title: 'Legal information', lang: req.params.lang })));

app.get('/opensource', (req, res) => loginGuard(req, res, 'en', () => res.render('opensource', { title: 'Open source', lang: 'en' })));
app.get('/:lang/opensource', (req, res) => loginGuard(req, res, req.params.lang, () => res.render('opensource', { title: 'Open source', lang: req.params.lang })));

app.get('/', (req, res) => loginGuard(req, res, 'en', () => res.render('index', { title: 'Dyslexic Character Sheets', lang: 'en', isLoggedIn: auth.isLoggedIn(req) })));
app.get('/:lang', (req, res) => loginGuard(req, res, req.params.lang, () => res.render('index', { title: 'Dyslexic Character Sheets', lang: req.params.lang })));

app.post('/message', (req, res) => {
    message.sendMessage(req, res);
});

// character sheet builder forms
function renderBuildForm(req, res, lang) {
    var game = req.params.game;
    var gamedata = gameData(game);

    var buildForm = "build-form";
    if (game == "pathfinder2") buildForm = "build-pathfinder2";

    res.render(buildForm, {
        title: "Build my character: "+gamedata.name,
        lang: lang,
        gameData: gamedata,
        iconics: iconicData.iconics(),
        iconicGroups: iconicData.iconicGroups(),
        logos: iconicData.logos(),
        logoGroups: iconicData.logoGroups(),
    });
}

app.get('/build/:game', (req, res) => loginGuard(req, res, 'en', () => renderBuildForm(req, res, 'en')));
app.get('/:lang/build/:game', (req, res) => loginGuard(req, res, req.params.lang, () => renderBuildForm(req, res, req.params.lang)));

// let's build a character sheet
app.post('/render/pathfinder2', (req, res) => loginGuard(req, res, 'en', () => pathfinder2.render(req, res, 'en')));

app.post('/:lang/render/pathfinder2', (req, res) => loginGuard(req, res, req.params.lang, () => pathfinder2.render(req, res, req.params.lang)));

// go!
setTimeout(() => {
    var listen_port = conf('listen_port');
    app.listen(listen_port, () => console.log(`[server] Listening on port ${listen_port}`));
}, 500);