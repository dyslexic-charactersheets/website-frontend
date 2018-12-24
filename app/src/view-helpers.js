const _ = require('lodash');
module.exports = function (conf, i18n, quotes) {
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
