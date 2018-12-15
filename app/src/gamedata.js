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
            console.log("[data] File not found "+filename);
        } else {
            fs.readFile(filename, 'utf-8', (err, data) => {
                var json = JSON.parse(data);

                json.isDnd35 = game == "dnd35";
                json.isDnd = json.isDnd35;
                json.isPathfinder = game == "pathfinder";
                json.isStarfinder = game == "starfinder";

                var books = {}
                json.books.forEach((book) => { books[book.name] = book; });
                // console.log("Books: "+JSON.stringify(books, null, 4));

                var classes = {};
                json.classes.forEach((cls) => { classes[cls.name] = cls; });

                json.layout = json.layout.map((col) => {
                    return col.map((bk) => {
                        var book = books[bk];
                        book.classes = book.classes.map((cls) => {
                            if (!_.has(classes, cls)) {
                                console.log("[data] Missing class: "+cls);
                                return null;
                            } else {
                                var clas = classes[cls];
                                if (clas.name) {
                                    clas.code = clas.name.toLowerCase().replace(/[^a-zA-Z]+/g, "-");
                                }
                                // if (clas.axes) {
                                //     clas.axisValues = axes.map((axis) => {
                                //         if ()
                                //     });
                                //     // def axisValues: List[List[String]] = axes.zipWithIndex.map { case (axisValues,index) =>
                                //     //     if (!axisValues.isEmpty) axisValues 
                                //     //     else variants.map(_.axes(index)).distinct
                                //     //   }
                                // }
                                return clas;
                            }
                        });
                        return book;
                    });
                });

                // console.log("[data] Layout: "+JSON.stringify(json.layout, null, 4));

                console.log("[data] Loaded "+json.name);
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
