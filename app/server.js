#!/usr/bin/env nodejs

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

// engines
const gameData = require('./src/gamedata.js');
const iconicData = require('./src/iconicdata');
const pathfinder2 = require('./src/pathfinder2-server.js');
pathfinder2.init(conf);

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
app.get('/howto', (req, res) => loginGuard(req, res, 'en', () => res.render('howto', { title: 'How to', lang: 'en', scriptFile: "charsheets.js" })));
app.get('/:lang/howto', (req, res) => loginGuard(req, res, req.params.lang, () => res.render('howto', { title: 'How to', lang: req.params.lang, scriptFile: "charsheets.js" })));

app.get('/legal', (req, res) => loginGuard(req, res, 'en', () => res.render('legal', { title: 'Legal information', lang: 'en', scriptFile: "charsheets.js" })));
app.get('/:lang/legal', (req, res) => loginGuard(req, res, req.params.lang, () => res.render('legal', { title: 'Legal information', lang: req.params.lang, scriptFile: "charsheets.js" })));

app.get('/opensource', (req, res) => loginGuard(req, res, 'en', () => res.render('opensource', { title: 'Open source', lang: 'en', scriptFile: "charsheets.js" })));
app.get('/:lang/opensource', (req, res) => loginGuard(req, res, req.params.lang, () => res.render('opensource', { title: 'Open source', lang: req.params.lang, scriptFile: "charsheets.js" })));

app.get('/', (req, res) => loginGuard(req, res, 'en', () => res.render('index', { title: 'Dyslexic Character Sheets', lang: 'en', isLoggedIn: auth.isLoggedIn(req), scriptFile: "charsheets.js", validationToken: message.timedToken() })));
app.get('/:lang', (req, res) => loginGuard(req, res, req.params.lang, () => res.render('index', { title: 'Dyslexic Character Sheets', lang: req.params.lang, scriptFile: "charsheets.js", validationToken: message.timedToken() })));

app.post('/message', (req, res) => {
    message.sendMessage(req, res);
});

// character sheet builder forms
function renderBuildForm(req, res, lang) {
    var game = req.params.game;
    var gamedata = gameData(game);

    var buildForm = "build-form";
    var data = {
        title: "Build my character: "+gamedata.name,
        lang: lang,
        gameData: gamedata,
        iconics: iconicData.iconics(),
        iconicGroups: iconicData.iconicGroups(),
        logos: iconicData.logos(),
        logoGroups: iconicData.logoGroups(),
        scriptFile: "charsheets.js",
    };

    // Pathfinder 2e-specific data
    if (game == "pathfinder2") {
        buildForm = "build-pathfinder2";
        data = pathfinder2.formData(data, i18n, lang);
        data.scriptFile = "charsheets2.js";
    }

    res.render(buildForm, data);
}

app.get('/build/:game', (req, res) => loginGuard(req, res, 'en', () => renderBuildForm(req, res, 'en')));
app.get('/:lang/build/:game', (req, res) => loginGuard(req, res, req.params.lang, () => renderBuildForm(req, res, req.params.lang)));

// let's build a character sheet
app.post('/download/pathfinder2', (req, res) => loginGuard(req, res, 'en', () => pathfinder2.render(req, res, 'en')));

app.post('/:lang/download/pathfinder2', (req, res) => loginGuard(req, res, req.params.lang, () => pathfinder2.render(req, res, req.params.lang)));

// go!
setTimeout(() => {
    var listen_port = conf('listen_port');
    app.listen(listen_port, () => console.log(`[server]        Listening on port ${listen_port}\n\n`));
}, 500);