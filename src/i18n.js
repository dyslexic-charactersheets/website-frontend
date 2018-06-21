const fs = require('fs');
const _ = require('lodash');

// i18n
// load translations from a JSON file produced by the translator

var translations = {};

fs.readFile('./data/translations.json', (err, data) => {
    if (err) throw err;
    translations = JSON.parse(data);
});

module.exports = {
    translate: function (str, lang) {
        if (_.has(translations, lang) && _.has(translations[lang], str)) {
            return translations[lang][str];
        }
        return str;
    }
};