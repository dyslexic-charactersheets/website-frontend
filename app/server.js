#!/usr/bin/env nodejs

const express = require('express');
const hbs = require('hbs');

const conf = require('./src/conf');

// engines
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

// set up the http engine
const app = express();
app.set('view engine', 'hbs');
app.use(express.static('../public'));

// ordinary pages
app.get('/', (req, res) => res.render('index', { lang: 'en' }));
app.get('/:lang', (req, res) => res.render('index', { lang: req.params.lang }));

app.get('/howto', (req, res) => res.render('howto', { lang: 'en' }))
app.get('/:lang/howto', (req, res) => res.render('howto', { lang: req.params.lang }));

// character sheet builder forms
app.get('/build/:game', (req, res) => res.render('build-'+req.params.game, {
    lang: 'en'
}));

app.get('/:lang/build/:game', (req, res) => res.render('build-'+req.params.game, {
    lang: req.params.lang
}));

// let's build a character sheet
app.post('/render/pathfinder2', (req, res) => pathfinder2.render(req, res, 'en'));

app.post('/:lang/render/pathfinder2', (req, res) => pathfinder2.render(req, res, req.params.lang));

// go!
app.listen(3000, () => console.log('Example app listening on port 3000!'));
