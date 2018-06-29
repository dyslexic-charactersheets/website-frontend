const fs = require('fs');
const _ = require('lodash');

const games = [
    "pathfinder",
    "starfinder",
    "dnd35"
];

var gameData = {};

games.forEach(game => {
    var filename = '../../assets/data/'+game+'.json';
    fs.stat(filename, (err, stats) => {
        if (!stats.isFile()) {
            console.log("File not found "+filename);
        } else {
            fs.readFile(filename, 'utf-8', (err, data) => {
                var json = JSON.parse(data);
                console.log("Loaded "+json.name);

                gameData[game] = json;
            });
        }
    });
});

module.exports = function (game) {
    if (_.has(gameData, game))
        return gameData[game];
    return {};
};
