const fs = require('fs');
const CharacterSheets = require('dyslexic-charactersheets');

// Assets
var assetsDir = __dirname+'/../../../assets/iconics/large';
CharacterSheets.addAssetsDir(assetsDir);

// Log
var logStream = fs.createWriteStream(__dirname+'/../../../pathfinder2.log', {flags: 'a'});
CharacterSheets.onCreate(function (request) {
    var date = new Date();
    var ts = date.getTime();
    var isoDate = date.toISOString();

    var data = Object.assign({date: isoDate, ts: ts}, request);
    var line = JSON.stringify(data)+"\n";

    logStream.write(line);
});

module.exports = {
    render: function (req, res, lang) {
        console.log("Pathfinder 2e Character");
        var data = JSON.parse(req.body.request);

        var characterSheet = CharacterSheets.create(data);
        characterSheet.render(result => {
            if (result.err) {
                console.log("Error:", result.err);
                res.status(500);
                res.send("Error");
                return;
            }

            res.set('Content-Type', result.mimeType);
            res.set('Content-Length', result.data.length);
            res.set('Content-Disposition', 'attachment; filename="'+result.filename+'"');
            res.send(result.data);
        });
    }
};
