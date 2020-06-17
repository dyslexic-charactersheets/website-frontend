const fs = require('fs');
const CharacterSheets = require('dyslexic-charactersheets');

const puppeteer = require('puppeteer');
var browser;

let systemFormData = null;
CharacterSheets.getFormData('pathfinder2').then((data) => {
    console.log("[pathfinder2]   System form data loaded");
    systemFormData = data;
});

CharacterSheets.loadDefaultTranslations();

let chromePDF = false;

// Assets
var assetsDir = __dirname + '/../../../assets/iconics/large';
CharacterSheets.addAssetsDir(assetsDir);
var logosDir = __dirname + '/../../../assets/logos';
CharacterSheets.addAssetsDir(logosDir);

// Log
var logStream = fs.createWriteStream(__dirname + '/../../../pathfinder2.log', { flags: 'a' });
CharacterSheets.on('request', function (request) {
    var date = new Date();
    var ts = date.getTime();
    var isoDate = date.toISOString();

    var data = Object.assign({ date: isoDate, ts: ts }, request);

    // truncate embedded data like images
    if (data.request.hasOwnProperty("included")) {
        data.request.included.forEach(inc => {
            if (inc.type == "image" && inc.hasOwnProperty("attributes") && inc.attributes.hasOwnProperty("data")) {
                inc.attributes.data = "...";
            }
        });
    }
    
    var line = JSON.stringify(data) + "\n";

    logStream.write(line);
});

module.exports = {
    init: function (conf, i18n) {
        chromePDF = conf('chrome_pdf');
        (async () => {
            browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            console.log("[pathfinder2]   Puppeteer browser launched");
        })();
    },
    formData: function (data, i18n, lang) {
        if (systemFormData === null) {
            console.log(" * No form data loaded :(");
            return data;
        }

        data.title = "Build my character: Pathfinder 2e";

        function translate(item) {
            ["name", "group"].forEach(key => {
                if (item.hasOwnProperty(key)) {
                    item.name = i18n.apply(item.name, lang);
                }
            })

            if (item.hasOwnProperty("values")) {
                item.values = item.values.map(val => translate(val, i18n, lang));
            }

            if (item.hasOwnProperty("groups")) {
                var groups = {};
                Object.keys(item.groups).forEach(key => {
                    var key_translated = i18n.apply(key);
                    groups[key_translated] = item.groups[key];
                });
                item.groups = groups;
            }

            return item;
        }

        function sortItems(items) {
            if (items === null || items === undefined) {
                return items;
            }
            if (!Array.isArray(items)) {
                console.log("[pathfinder2] What are you asking me to sort?", items);
                return items;
            }

            return items.sort((a, b) => {
                return a.name.localeCompare(b.name, lang);
            });
        }

        function threeBlankColumns() {
            return [{ groups: [] }, { groups: [] }, { groups: [] }];
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
            var lens = [0, 0, 0];
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
            var columns = [{ values: [] }, { values: [] }, { values: [] }];
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
        data.languages = systemFormData.languages;

        if (systemFormData.hasOwnProperty("selects")) {
            // translate and sort all the items first
            systemFormData.selects = systemFormData.selects.map(sel => {
                sel = translate(sel);
                if (sel.hasOwnProperty("values"))
                    sel.values = sortItems(sel.values);
                return sel;
            })

            let selectsByCode = {};
            systemFormData.selects.forEach(sel => {
                selectsByCode[sel.select] = sel;
            });

            // ensure all the selects are filled in for display, however deep
            function fillInSelect(sel) {
                if (sel === null)
                    return null;

                if (sel.hasOwnProperty("values")) {
                    let hasOrder = false;
                    let hasLevel = false;
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
                        if (v.hasOwnProperty('order')) {
                            hasOrder = true;
                        }
                        if (v.hasOwnProperty('level')) {
                            hasLevel = true;
                        }
                        return v;
                    });
                    if (sel.values.length == 0)
                        return null;
                    // show the values in the right order
                    if (hasOrder || hasLevel) {
                        sel.values = sel.values.sort((a, b) => {
                            if (hasLevel) {
                                let la = a.hasOwnProperty('level') ? a.level : 1;
                                let lb = b.hasOwnProperty('level') ? b.level : 1;
                                if (la != lb) {
                                    return la - lb;
                                }
                            }
                            if (hasOrder) {
                                let oa = a.hasOwnProperty('order') ? a.order : 0;
                                let ob = b.hasOwnProperty('order') ? b.order : 0;
                                if (oa != ob) {
                                    return oa - ob;
                                }
                            }
                            return 0;
                        });
                        // console.log("[pathfinder2]   Sorted values for", sel.select, sel.values.map((v) => {
                        //     return {
                        //         code: v.code,
                        //         level: v.level,
                        //         order: v.order
                        //     };
                        // }));
                    }
                    sel.multiselect = sel.max > 1;
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
                        sel.values = sel.values.filter(value => {
                            if (value.code == "generic") return false;
                            return true;
                        });

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

        data.chromePDF = chromePDF;

        // console.log(" * Done processing form data");
        return data;
    },
    render: function (req, res, lang) {
        console.log("[pathfinder2]   Pathfinder 2e Character");
        var data = JSON.parse(req.body.request);

         CharacterSheets.create(data).then(result => {
            if (result.err) {
                console.log("Error:", result.err);
                res.status(500);
                res.send("Error");
                return;
            }

            let pdf = data.hasOwnProperty("data") && data.data.hasOwnProperty("attributes") && data.data.attributes.hasOwnProperty("downloadPDF") && data.data.attributes.downloadPDF;
            if (chromePDF && pdf) {
                var paperSize = data.data.attributes.downloadPaperSize;
                (async () => {
                    console.log("Writing PDF...");
                    // console.log("Browser:", browser);
                    let page = await browser.newPage();
                    // console.log("Page", page);
                    await page.setContent(result.data);

                    var pdfdata = await page.pdf({ format: paperSize });
                    res.set('Content-Type', 'application/pdf');
                    res.set('Content-Length', pdfdata.length);
                    res.set('Content-Disposition', 'attachment; filename="' + result.filename + '.pdf"');
                    res.send(pdfdata);
                    console.log("                Done");
                })();
            } else {
                let mimeType = result.mimeType;
                let userAgent = req.get('user-agent');
                if ((mimeType == 'text/html' || mimeType == 'text/html; charset=utf-8') && userAgent.match(/Android.*Chrome/)) {
                    mimeType = 'text/plain';
                }

                res.set('Content-Type', mimeType);
                res.set('Content-Length', result.data.length);
                res.set('Content-Disposition', 'attachment; filename="' + result.filename + '"');
                res.send(result.data);
                console.log("                Done");
            }
        });
    }
};
