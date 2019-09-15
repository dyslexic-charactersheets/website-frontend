const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const games = [
    "pathfinder",
    "pathfinder2",
    "starfinder",
    "dnd35"
];

var gameData = {};

games.forEach(game => {
    var filename = path.normalize(__dirname+'/../../../assets/data/'+game+'.json');
    console.log("[data]          Loading file:", filename);
    fs.access(filename, fs.constants.R_OK, err => {
        if (err) {
            console.log("[data]          File not found, or not readable:", filename, err);
        } else {
            fs.readFile(filename, 'utf-8', (err, data) => {
                var json = JSON.parse(data);

                json.isDnd35 = game == "dnd35";
                json.isDnd = json.isDnd35;
                json.isPathfinder = game == "pathfinder";
                json.isStarfinder = game == "starfinder";

                switch (game) {
                    case "pathfinder":
                        json.defaultLogo = "pathfinder-pathfinder";
                        break;
                    case "pathfinder2":
                        json.defaultLogo = "pathfinder-pathfinder-second-edition-pathfinder-2e";
                        break;
                    case "starfinder":
                        json.defaultLogo = "starfinder-starfinder";
                        break;
                    case "dnd35":
                        json.defaultLogo = "dnd35-dnd35";
                        break;
                }
                // console.log(`[data] ${game} default logo:`, json.defaultLogo);

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

                console.log("[data]          Loaded "+json.name);
                gameData[game] = json;
            });
        }
    });
});

module.exports = function (game) {
    if (_.has(gameData, game))
        return gameData[game];
    return {
        
    };
};
