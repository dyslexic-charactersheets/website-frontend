const fs = require('fs');
const _ = require('lodash');
const path = require('path');

// quotes
// load quotes from a text file

var quotes = {};

let assetsDir = path.normalize(`${__dirname}/../../../assets`);
fs.readFile(assetsDir+'/quotes.txt', 'utf-8', (err, data) => {
    if (err) {
        console.log("[quotes]        Error reading quotes", err);
        throw err;
    }
    
    var lines = data.split(/\n/);
    quotes = _(lines).map(line => line.trim())
        .filter(line => line != "" && !line.match(/^--/) && line.match(/ --by-- /))
        .map(line => {
            var split = line.split(/ --by-- /);
            var quote = split[0];
            var author = split[1];
            var noteClass = (quote.length > 115) ? "long" : ( (quote.length > 50) ? "medium" : "short");

            return {
                noteClass: noteClass,
                quote: quote,
                author: author
            }
        })
        .value();

    console.log("[quotes]        Loaded "+quotes.length+" quotes");
});

module.exports = function () {
    var n = Math.floor(Math.random() * quotes.length);
    return quotes[n];
}