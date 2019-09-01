const fs = require('fs');
const CharacterSheets = require('dyslexic-charactersheets');

let systemFormData = null;
CharacterSheets.getFormData('pathfinder2', data => {
    console.log("[pathfinder2]   System form data loaded");
    systemFormData = data;
});

// Assets
var assetsDir = __dirname+'/../../../assets/iconics/large';
CharacterSheets.addAssetsDir(assetsDir);
var logosDir = __dirname+'/../../../assets/logos';
CharacterSheets.addAssetsDir(logosDir);

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
    formData: function (data) {
        if (systemFormData === null) {
            console.log(" * No form data loaded :(");
            return data;
        }

        function threeBlankColumns() {
            return [ { groups: [] }, { groups: [] }, { groups: [] } ];
        }

        function allocateToColumns(groups) {
            var columns = threeBlankColumns();
            var len = 0;
            groups.forEach(group => {
                len += group.values.length;
            });
            // console.log(" * Total length:"+len);

            var collen = Math.ceil(len / 3.0);
            // console.log(" * Column length:"+collen);

            var c = 0;
            var lens = [0,0,0];
            groups.forEach(group => {
                if (lens[c] >= collen && c < 2) c++;
                columns[c].groups.push(group);
            });

            // console.log(" * Allocated groups:"+JSON.stringify(columns));
            return columns;
        }

        function selectGroups(sel) {
            if (sel.hasOwnProperty("groups")) {
                return Object.keys(sel.groups).map(groupname => {
                    var values = [];
                    sel.groups[groupname].forEach(value => {
                        if (sel.values.hasOwnProperty(value)) {
                            values.push(sel.values[value]);
                        }
                    });
                    var group = {
                        name: groupname,
                        values: values
                    };
                    return group;
                });
            }

            // console.log(" * Reconciled groups: "+JSON.stringify(sel.groups));
            return [];
        }

        function splitIntoColumns(values) {
            var columns = [ { values: [] }, { values: [] }, { values: [] } ];
            var len = values.length;
            var collen = Math.ceil(len / 3.0);
            
            columns[0].values = values.slice(0, collen);
            columns[1].values = values.slice(collen, collen * 2);
            columns[2].values = values.slice(collen * 2);

            return columns;
        }

        // blank data
        data.isPathfinder2 = true;
        data.ancestries = [];
        data.ancestryData = threeBlankColumns();
        data.ancestryColumns = [];
        data.backgrounds = [];
        data.backgroundData = threeBlankColumns();
        data.classes = [];
        data.classData = threeBlankColumns();
        data.classColumns = [];
        data.archetypes = [];
        data.archetypeData = threeBlankColumns();
        data.archetypeColumns = [];
        data.baseSelects = [];
        data.baseOptions = [];
        data.selects = systemFormData.selects;
        data.options = systemFormData.options;

        if (systemFormData.hasOwnProperty("selects")) {
            let selectsByCode = {};
            systemFormData.selects.forEach(sel => {
                selectsByCode[sel.select] = sel;
            });

            // ensure all the selects are filled in for display, however deep
            function fillInSelect(sel) {
                if (sel === null)
                    return null;
                    
                if (sel.hasOwnProperty("values")) {
                    // console.log(" - Filling in select values for", sel.select);
                    sel.values = sel.values.map(v => {
                        // console.log("   "+JSON.stringify(v));
                        if (v.hasOwnProperty("selects")) {
                            v.selects = v.selects.map(s => {
                                if (typeof s === 'string' || s instanceof String) {
                                    // console.log(" - Replacing select", s);
                                    if (!selectsByCode.hasOwnProperty(s))
                                        return null;
                                    s = selectsByCode[s];
                                }
                                return fillInSelect(s);
                            });
                            v.selects = v.selects.filter(s => s !== null);
                        }
                        return v;
                    });
                    if (sel.values.length == 0)
                        return null;
                    return sel;
                } else {
                    return null;
                }
            }

            systemFormData.selects.forEach(sel => {
                sel = fillInSelect(sel);
                if (sel === null) {
                    return;
                }

                // console.log(" * Sel: "+JSON.stringify(sel));

                switch (sel.select) {
                    case "ancestry":
                        data.ancestries = sel.values;
                        var groups = selectGroups(sel);
                        data.ancestryData = allocateToColumns(groups);
                        data.ancestryColumns = splitIntoColumns(Object.values(sel.values));
                        break;

                    case "background":
                        data.backgrounds = sel.values;
                        var groups = selectGroups(sel);
                        data.backgroundData = allocateToColumns(groups);
                        break;

                    case "class":
                        data.classes = sel.values;
                        var groups = selectGroups(sel);
                        data.classData = allocateToColumns(groups);
                        data.classColumns = splitIntoColumns(Object.values(sel.values));
                        break;

                    case "archetype":
                        data.archetypes = sel.values;
                        var groups = selectGroups(sel);
                        data.archetypeData = allocateToColumns(groups);
                        data.archetypeColumns = splitIntoColumns(Object.values(sel.values));
                        break;

                    default:
                        if (sel.base)
                            data.baseSelects.push(sel);
                }
            });
        }

        if (systemFormData.hasOwnProperty("options")) {
            systemFormData.options.forEach(opt => {
                if (opt.base)
                    data.baseOptions.push(opt);
            });
        }

        // console.log(" * Done processing form data");
        return data;
    },
    render: function (req, res, lang) {
        console.log("                Pathfinder 2e Character");
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
