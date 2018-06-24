const fs = require('fs');
const _ = require('lodash');

// i18n
// load translations from a JSON file produced by the translator

var translations = {};

/*
fs.readFile('./data/translations.json', (err, data) => {
    if (err) throw err;
    translations = JSON.parse(data);
});
*/

fs.readdir("../data/i18n", (err, files) => {
    files.forEach(file => {
        if (file.match(/\.po$/)) {
            fs.readFile('../data/i18n/'+file, 'utf8', (err, data) => {
                if (err) throw err;
                console.log("Read "+file);

                var lang = file.replace(/.po$/, '');
                if (!_.has(translations, lang))
                    translations[lang] = {};

                var lines = data.split(/\n/);
                var current_msgid = "";
                lines.forEach(line => {
                    if (line.match(/^#/))
                        return;
                    
                    var msgid = line.match(/^msgid \"(.*)\"/);
                    if (msgid) {
                        current_msgid = msgid[1];
                        // console.log("msgid: "+msgid[1]);
                    }
                    var msgstr = line.match(/^msgstr \"(.*)\"/);
                    if (msgstr) {
                        // console.log("msgstr: "+msgstr[1]);
                        var translation = msgstr[1];
                        if (translation != "") {
                            // console.log(current_msgid+" = "+translation);
                            translations[lang][current_msgid] = translation;
                        }
                    }
                });
            });
        }
    });
})

module.exports = {
    translate: function (str, lang) {
        if (_.has(translations, lang) && _.has(translations[lang], str)) {
            return translations[lang][str];
        }
        return str;
    }
};