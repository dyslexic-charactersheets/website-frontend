#!/usr/bin/env nodejs

const url = require('url');

// my own data
const conf = require('./src/conf');
const message = require('./src/message')(conf);

const i18n = require('./src/i18n')(conf);
const quotes = require('./src/quotes');

// set up the http engine
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
// app.use(bodyParser());

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
app.use('/docs', express.static(__dirname+'/../node_modules/dyslexic-charactersheets/docs'));

// engines
const gameData = require('./src/gamedata.js');
const iconicData = require('./src/iconicdata');
const pathfinder2 = require('./src/pathfinder2-server.js');

// login
const auth = require('./src/auth')(conf);

function renderLogin(req, res, lang) {
    auth.setup();
    var no_login = !!url.parse(req.url, true).query.no_login;
    var patreon_login_url = auth.patreonLoginURL();
    var translators_login_url = auth.translatorsLoginURL();
    console.log("[server]        Patreon URL:              "+patreon_login_url);

    return res.render('login', {
        title: 'Login - Dyslexic Character Sheets',
        lang: lang,
        translators_login_url: translators_login_url,
        patreon_login_url: patreon_login_url,
        allow_just_login: auth.allowJustLogin,
        scriptFile: "charsheets.js",
        no_login: no_login,
        isLoggedIn: auth.isLoggedIn(req),
    });
}

function renderParams(req, title, lang, data = {}) {
    auth.setup();

    var patreon_login_url = auth.patreonLoginURL();
    var translators_login_url = auth.translatorsLoginURL();
    console.log("[server]        Patreon URL:              "+patreon_login_url);

    data = {
        title: title,
        lang: lang,
        translators_login_url: translators_login_url,
        patreon_login_url: patreon_login_url,
        allow_just_login: auth.allowJustLogin,
        scriptFile: "charsheets.js",
        isLoggedIn: auth.isLoggedIn(req),
        ...data,
    };
    return data;
}

function renderPage(req, res, page, title, lang = 'en', data = {}) {
    // console.log("Merged render params", data);
    var data = renderParams(req, title, lang, data);
    res.render(page, data)
}

// app.get('/oauth/redirect', auth.oauthRedirect);
app.get('/auth/patreon-redirect', auth.patreonRedirect);

app.get('/auth/login', (req, res) => renderLogin(req, res, 'en'));
app.get('/:lang/auth/login', (req, res) => renderLogin(req, res, req.params.lang));

app.get('/auth/translators-login', auth.translatorsLogin);
app.get('/auth/token-login', auth.tokenLogin);

app.get('/auth/logout', (req, res) => auth.logout(res));

var loginGuard = function (req, res, lang, fn) {
    if (conf('require_login') && !auth.isLoggedIn(req)) {
        return renderLogin(req, res, lang);
    }
    return fn();
};

// ordinary pages
app.get('/howto', (req, res) => loginGuard(req, res, 'en', () => renderPage(req, res, 'howto', 'How to', 'en')));
app.get('/:lang/howto', (req, res) => loginGuard(req, res, req.params.lang, () => renderPage(req, res, 'howto', 'How to', req.params.lang)));

app.get('/legal', (req, res) => loginGuard(req, res, 'en', () => renderPage(req, res, 'legal', 'Legal information', 'en')));
app.get('/:lang/legal', (req, res) => loginGuard(req, res, req.params.lang, () => renderPage(req, res, 'legal', 'Legal information', req.params.lang)));

app.get('/opensource', (req, res) => loginGuard(req, res, 'en', () => renderPage(req, res, 'opensource', 'Open source', 'en')));
app.get('/:lang/opensource', (req, res) => loginGuard(req, res, req.params.lang, () => renderPage(req, res, 'opensource', 'Open source', req.params.lang)));

app.get('/', (req, res) => loginGuard(req, res, 'en', () => renderPage(req, res, 'index', 'Dyslexic Character Sheets', 'en', { validationToken: message.timedToken() })));
app.get('/:lang', (req, res) => loginGuard(req, res, req.params.lang, () => renderPage(req, res, 'index', 'Dyslexic Character Sheets', req.params.lang, { validationToken: message.timedToken() })));

app.post('/message', (req, res) => {
    message.sendMessage(req, res);
});

// character sheet builder forms
function renderBuildForm(req, res, lang) {
    var game = req.params.game;
    var gamedata = gameData(game);

    var buildForm = "build-form";
    var data = {
        gameData: gamedata,
        iconics: iconicData.iconics(),
        iconicGroups: iconicData.iconicGroups(),
        logos: iconicData.logos(),
        logoGroups: iconicData.logoGroups(),
        ...renderParams(req, "Build my character: "+gamedata.name, lang)
    };

    // Pathfinder 2e-specific data
    if (game == "pathfinder2") {
        buildForm = "build-pathfinder2";
        data = pathfinder2.formData(data, i18n, lang);
        data.scriptFile = "charsheets2.js";
    }
    // console.log("Form data", data);
    res.render(buildForm, data);
}

app.get('/build/:game', (req, res) => loginGuard(req, res, 'en', () => renderBuildForm(req, res, 'en')));
app.get('/:lang/build/:game', (req, res) => loginGuard(req, res, req.params.lang, () => renderBuildForm(req, res, req.params.lang)));

// let's build a character sheet
app.post('/download/pathfinder2', (req, res) => loginGuard(req, res, 'en', () => pathfinder2.render(req, res, 'en')));

app.post('/:lang/download/pathfinder2', (req, res) => loginGuard(req, res, req.params.lang, () => pathfinder2.render(req, res, req.params.lang)));

// go!
setTimeout(() => {
    pathfinder2.init(conf, i18n);
    var listen_port = conf('listen_port');
    app.listen(listen_port, () => console.log(`[server]        Listening on port ${listen_port}\n\n`));
}, 500);
