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


// Utility funcitons
function isNull(val) {
    return val === null || val === undefined;
}

function isArray(val) {
    return Array.isArray(val);
}

function isObject(val) {
    return val instanceof Object;
}

function cloneDeep(original) {
    if (isNull(original)) {
        return null;
    }

    if (isArray(original)) {
        let product = [];
        for (let i = 0; i < original.length; ++i) {
        product.push(cloneDeep(original[i]));
        }
        return product;
    }

    if (isObject(original)) {
        let product = {};
        for (const key in original) {
        product[cloneDeep(key)] = cloneDeep(original[key]);
        }
        return product;
    }

    return original;
}

function slugify(str) {
    str = str.replace(/_\{(.*?)\}/, '$1');
    str = str.replace('\'', '');
    str = str.replace(/[^A-Za-z0-9]+/g, '-');
    str = str.toLowerCase();
    return str;
}

// Log
var logStream = fs.createWriteStream(__dirname + '/../../../pathfinder2.log', { flags: 'a' });
CharacterSheets.on('request', function (request) {
    var date = new Date();
    var ts = date.getTime();
    var isoDate = date.toISOString();

    var data = Object.assign({ date: isoDate, ts: ts }, cloneDeep(request));

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

        const paizoProducts = [
            'advanced-players-guide',
            'lost-omens'
        ]

        function partition(array, check) {
            return array.reduce(([pass, fail], elem) => {
                return check(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
            }, [[], []]);
        }

        function excludeItems(items, select) {
            return items.filter(item => {
                if (item.hasOwnProperty("exclude-from")) {
                    let ok = true;
                    if (item['exclude-from'].includes(select)) {
                        return false;
                    }
                    return ok;
                }
                return true;
            });
        }

        function groupItems(items, altCore = "") {
            let groups = {};
            items.forEach(item => {
                let groupName = item.hasOwnProperty("group") ? item.group : "_{Other}";
                let groupId = slugify(groupName);
                if (!groups.hasOwnProperty(groupId)) {
                    let isCore = groupName == '_{Core Rulebook}' || groupName == altCore;
                    groups[groupId] = {id: groupId, name: groupName, items: [], core: isCore};
                }
                groups[groupId].items.push(item);
            });
            let hasCore = groups.hasOwnProperty("core-rulebook");
            groups = Object.values(groups);
            // groups.forEach(group => console.log("Group:", group.name ));

            // Sort the groups: Core Rulebook first, then Paizo products, then third parties, then extras
            let sorted = [];
            [
                group => group.id == "core-rulebook", // Core Rulebook
                group => group.core, // other "core" items
                group => paizoProducts.includes(group.id) // Paizo Products
            ].forEach(check => {
                let [match, other] = partition(groups, check);
                sorted = sorted.concat(match);
                groups = other;
            });
            let [extra, other] = partition(groups, group => group.id == "other" || group.id == "none");
            sorted = sorted.concat(other).concat(extra);
            if (!hasCore && sorted.length > 0)
                sorted[0].core = true;

            // sorted.forEach(group => console.log("Sorted:", group.name ));
            return sorted;
        }

        // blank data
        data.isPathfinder2 = true;
        data.ancestries = [];
        data.ancestryGroups = [];
        data.backgrounds = [];
        data.backgroundGroups = [];
        data.classes = [];
        data.classGroups = [];
        data.archetypes = [];
        data.archetypeGroups = [];
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

            // store some data we'll need later
            let versatileHeritages = [];
            let selBases = {};
            systemFormData.selects.forEach(sel => {
                // store the versatile heritages so we can add them to all ancestries
                if (sel.select == "heritage/versatile") {
                    versatileHeritages = sel.values;
                }

                // store the ancestry group
                if (sel.select == "ancestry") {
                    sel.values.forEach(ancestry => {
                        if (ancestry.hasOwnProperty("selects")) {
                            ancestry.selects.forEach(sel2 => {
                                if (sel2.match(/^heritage\//)) {
                                    selBases[sel2] = ancestry.group;
                                }
                            })
                        }
                    });
                }
            });

            // group the items for each selectable
            systemFormData.selects.forEach(sel => {
                sel = fillInSelect(sel);
                if (sel === null) {
                    return;
                }

                // console.log("Select:", sel.select);
                // console.log(" * Sel: "+JSON.stringify(sel));

                switch (sel.select) {
                    case "ancestry":
                        data.ancestries = sel.values;
                        data.ancestryGroups = groupItems(data.ancestries);
                        break;

                    case "background":
                        data.backgrounds = sel.values;
                        data.backgroundGroups = groupItems(data.backgrounds);
                        break;

                    case "class":
                        sel.values = sel.values.filter(value => {
                            if (value.code == "generic") return false;
                            return true;
                        });

                        data.classes = sel.values;
                        data.classGroups = groupItems(data.classes);
                        break;

                    case "archetype":
                        data.archetypes = sel.values;
                        data.archetypeGroups = groupItems(data.archetypes);
                        break;

                    default:
                        if (sel.hasOwnProperty("values") && isArray(sel.values)) {
                            // add the versatile heritages to every ancestry
                            if (sel.select.match(/^heritage\//)) {
                                sel.values = sel.values.concat(excludeItems(versatileHeritages, sel.select));
                            }
                            let selBase = selBases.hasOwnProperty(sel.select) ? selBases[sel.select] : '';
                            sel.valueGroups = groupItems(sel.values, selBase);
                        }
                        if (sel.base) {
                            data.baseSelects.push(sel);
                        }
                        console.og
                }
            });

            // // add the versatile heritages to every ancestry
            // data.ancestries.forEach(ancestry => {
            //     ancestry.selects.forEach(sel => {
            //         if (sel.select.match(/^heritage\//)) {

            //         }
            //     })
            // });
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

        // console.log("[pathfinder2]   Request", data);

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
                    page.close();
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
