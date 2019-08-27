const _ = require('lodash');
const message = require('./message');
module.exports = function (conf, i18n, quotes) {
    var msg = message(conf);
    return {
        __: function(str) {
            if (!(typeof str === 'string' || str instanceof String)) {
                console.log("NOT A STRING");
                return '';
            }
            if (str.match(/_\{(.*?)\}/)) {
                var lang = this.lang;
                return str.replace(/_\{(.*)\}/gs, function (m, p) {
                    return i18n.translate(p, lang);
                });
            }
            return i18n.translate(str, this.lang);
        },

        e: function(str) {
            str = str.replace(/\//g, '-');
            return str;
        },

        ifEnglish: function(code, options) {
            if (code == "english") {
                return options.fn(this);
            }
        },

        eq: function (v1, v2) {
            return v1 === v2;
        },

        ifEq: function(v1, v2, options) {
            // console.log("Helper:", v1, "==", v2);
            if(v1 === v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        },

        note: function () {
            var quote = quotes();
        
            return `<aside class='float right top'>
                <aside class='note'>
                <blockquote class='${quote.noteClass}'>${quote.quote}</blockquote>
                <cite>&mdash; ${quote.author}</cite>
                </aside>
            </aside>`;
        },
        
        humanYes: function () {
            var answers = [
                "Yes, I am",
                "I am indeed",
                "Last time I checked",
                "Definitely",
                "One hundred percent",
                "That's right",
            ];
            return answers[Math.floor(Math.random() * answers.length)];
        },

        humanNo: function () {
            var answers = [
                "Actually, no",
                "Not at all",
                "I'm afraid not",
                "I don't think so",
                "How insulting",
                "Boop boop be-boop",
            ];
            return answers[Math.floor(Math.random() * answers.length)];
        },

        verifyCodeHuman: function () {
            return msg.getHumanToken();
        },

        verifyCodeFake: function () {
            return msg.getFakeToken();
        },

        pdfUrl: function (game) {
            var url = conf('build_url');
            if (_.isNull(url)) url = conf('url');
            return url+'pdf/'+game;
        },

        bar: function() {
            return "BAR!";
        }
    };
};
