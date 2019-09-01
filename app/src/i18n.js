const fs = require('fs');
const _ = require('lodash');

// i18n
// load translations from a JSON file produced by the translator

var translations = {};

function writePOT (entries) {

}

function parsePO (data) {
    var trans = {};

    var lines = data.split(/\n/);
    var current_msgid = "";
    lines.forEach(line => {
        if (line.match(/^#/))
            return;
        
        var msgid = line.match(/^msgid \"(.*)\"/);
        if (msgid) {
            current_msgid = msgid[1];
        }
        var msgstr = line.match(/^msgstr \"(.*)\"/);
        if (msgstr) {
            var translation = msgstr[1];
            if (translation != "") {
                trans[current_msgid] = translation;
            }
        }
    });

    return trans;
}

fs.readdir("../data/i18n", (err, files) => {
    files.forEach(file => {
        if (file.match(/\.po$/)) {
            fs.readFile('../data/i18n/'+file, 'utf8', (err, data) => {
                if (err) throw err;

                var lang = file.replace(/.po$/, '');
                if (!_.has(translations, lang))
                    translations[lang] = {};

                translations[lang] = parsePO(data);

                /*
                var lines = data.split(/\n/);
                var current_msgid = "";
                lines.forEach(line => {
                    if (line.match(/^#/))
                        return;
                    
                    var msgid = line.match(/^msgid \"(.*)\"/);
                    if (msgid) {
                        current_msgid = msgid[1];
                    }
                    var msgstr = line.match(/^msgstr \"(.*)\"/);
                    if (msgstr) {
                        var translation = msgstr[1];
                        if (translation != "") {
                            translations[lang][current_msgid] = translation;
                        }
                    }
                });
                */
            });
        }
    });
});



var i18n = {
    translateFixed: function (str, lang) {
        if (_.has(translations, lang) && _.has(translations[lang], str)) {
            return translations[lang][str];
        }
        return str;
    },

    translateLive: function (str, lang) {
        // TODO talk to the translation API
        return str;
    },

    translate: function (str, lang) {
        if (i18n.conf('i18n_live')) {
            i18n.translate = i18n.translateLive;
            console.log("[i18n]          Live configured");
        } else {
            i18n.translate = i18n.translateFixed;
            console.log("[i18n]          Configured");
        }
        return i18n.translate(str, lang);
    }
};

module.exports = function (conf) {
    i18n.conf = conf;
    return i18n;
}