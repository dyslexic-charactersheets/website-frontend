const _ = require('lodash');
const message = require('./message');
module.exports = function (conf, i18n, quotes) {
    var msg = message(conf);
    return {
        __: function(str) {
            return i18n.translate(str, this.lang);
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
            ];
            return answers[_.random(0, answers.length - 1)];
        },

        humanNo: function () {
            var answers = [
                "Actually, no",
                "I'm afraid not",
                "I don't think so",
                "How insulting",
                "Boop boop be-boop",
            ];
            return answers[_.random(0, answers.length - 1)];
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
