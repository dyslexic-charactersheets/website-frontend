const fs = require('fs');
const CharacterSheets = require('dyslexic-charactersheets');

const puppeteer = require('puppeteer');
// const formdata = require('../../../lib-charactersheets/src/make/formdata');
var browser;

let systemFormData = null;
CharacterSheets.getFormData('pathfinder2').then((data) => {
    console.log("[pathfinder2]   System form data loaded");
    systemFormData = data;
});
CharacterSheets.getFormData('premium').then((data) => {
    console.log("[pathfinder2]   Premium form data loaded");
    premiumFormData = data;
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
        if (chromePDF) {
            (async () => {
                try {
                    browser = await puppeteer.launch({
                        args: ['--no-sandbox', '--disable-setuid-sandbox']
                    });
                    console.log("[pathfinder2]   Puppeteer browser launched");
                } catch (err) {
                    console.log("[pathfinder2]   Puppeteer browser error:", err);
                }
            })();
        }
    },
    formData: function (data, i18n, lang) {
        if (systemFormData === null) {
            console.log(" * No form data loaded :(");
            return data;
        }

        let formData = cloneDeep(systemFormData);
        let formData2 = cloneDeep(premiumFormData);
        formData.options = formData.options.concat(formData2.options);

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

        const rulebooks = [
            'advanced-players-guide',
            'secrets-of-magic',
            'guns-and-gears',
            'book-of-the-dead',
            'dark-archive',
        ]
        const paizoProducts = [
            'lost-omens'
        ]
        const paizoAdventures = [
            'age-of-ashes',
            'extinction-curse',
            'agents-of-edgewatch',
            'strength-of-thousands',
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

        function group2tier(group) {
            group = group.replace(/_\{(.*)\}/g, '$1');
            // console.log("Group:", group);

            switch (group) {
                case "Core Rulebook":
                case "Advanced Player's Guide":
                case "Secrets of Magic":
                case "Guns and Gears":
                case "Book of the Dead":
                case "Dark Archive":
                case "Gamemastery Guide":
                    return "rulebooks";

                case "Lost Omens Ancestry Guide":
                case "Lost Omens Character Guide":
                case "Lost Omens World Guide":
                case "Lost Omens Travel Guide":
                case "Lost Omens Legends":
                case "Lost Omens Firebrands":
                case "Lost Omens Gods and Magic":
                case "Lost Omens Gods & Magic":
                case "Lost Omens Knights of Lastwall":
                case "Lost Omens Pathfinder Society Guide":
                case "Absalom, City of Lost Omens":
                case "Lost Omens Grand Bazaar":
                case "Lost Omens Mwangi Expanse":
                    return "lost-omens"

                case "Pathfinder Beginner Box":
                case "Kingmaker":
                case "Age of Ashes":
                case "Extinction Curse":
                case "Agents of Edgewatch":
                case "Little Trouble in Big Absalom":
                case "Pathfinder Society":
                case "Strength of Thousands":
                case "Fists of the Ruby Phoenix":
                case "Blood Lords":
                case "Abomination Vaults":
                case "Quest for the Frozen Flame":
                case "Gatewalkers":
                case "Crown of the Kobold King":
                case "Outlaws of Alkenstar":
                case "Stolen Fate":
                case "The Fall of Plaguestone":
                    return "adventures";

                default:
                    return "third-party";
            }
        }

        function groupItems(items, altCore = "", expandFirst = true) {
            let groups = {};
            items.forEach(item => {
                item.tier = group2tier(item.group);
                let groupName = item.hasOwnProperty("group") ? item.group : "_{Other}";
                let groupId = slugify(groupName);
                if (!groups.hasOwnProperty(groupId)) {
                    let isCore = groupName == '_{Core Rulebook}' || groupName == altCore;
                    groups[groupId] = {id: groupId, name: groupName, items: [], core: isCore, tier: item.tier};
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
                group => group.id == "advanced-players-guide",
                group => group.core, // other "core" items
                group => rulebooks.includes(group.id), // main rulebooks
                group => paizoProducts.includes(group.id) || group.id.match(/lost-omens/), // Paizo Products
                group => paizoAdventures.includes(group.id),
            ].forEach(check => {
                let [match, other] = partition(groups, check);
                sorted = sorted.concat(match);
                groups = other;
            });
            let [extra, other] = partition(groups, group => group.id == "other" || group.id == "none");
            sorted = sorted.concat(other).concat(extra);
            if (expandFirst && !hasCore && sorted.length > 0)
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
        data.multiclass = [];
        data.multiclassGroups = [];
        data.archetypes = [];
        data.archetypeGroups = [];
        data.baseSelects = [];
        data.baseOptions = [];
        data.selects = formData.selects;
        data.options = formData.options;
        data.languages = formData.languages;
        data.hasDyslexie = false;

        if (formData.hasOwnProperty("selects")) {
            // translate and sort all the items first
            let selects = formData.selects.map(sel => {
                sel = translate(sel);
                if (sel.hasOwnProperty("values"))
                    sel.values = sortItems(sel.values);
                return sel;
            });

            let selectsByCode = {};
            selects.forEach(sel => {
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
            let versatileHeritagesSelect = null;
            let selBases = {};
            selects.forEach(sel => {
                // store the versatile heritages so we can add them to all ancestries
                if (sel.select == "heritage/versatile") {
                    versatileHeritagesSelect = sel;
                    // console.log("Versatile heritages:", versatileHeritages);
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
            selects.forEach(sel => {
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
                        data.backgroundGroups = groupItems(data.backgrounds, "", false);
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
                        data.multiclass = sel.values.filter(a => a.multiclass);
                        data.multiclassGroups = groupItems(data.multiclass);

                        data.archetypes = sel.values.filter(a => !a.multiclass);
                        data.archetypeGroups = groupItems(data.archetypes, "", false);
                        break;

                    default:
                        if (sel.hasOwnProperty("values") && isArray(sel.values)) {
                            // add the versatile heritages to every ancestry
                            // if (sel.select.match(/^heritage\//)) {
                            //     sel.values = sel.values.concat(excludeItems(versatileHeritages, sel.select));
                            // }
                            let selBase = selBases.hasOwnProperty(sel.select) ? selBases[sel.select] : '';
                            sel.valueGroups = groupItems(sel.values, selBase);
                        }
                        if (sel.base) {
                            data.baseSelects.push(sel);
                        }
                        console.og
                }
            });

            // Add versatile heritages
            if (versatileHeritagesSelect !== null) {
                versatileHeritagesSelect.versatile = true;
                // versatileHeritagesSelect.valueGroups = groupItems(versatileHeritagesSelect.values, '');
                // console.log("Versatile heritage select:", versatileHeritagesSelect);
                data.ancestries.forEach((ancestry) => {
                    let sel = cloneDeep(versatileHeritagesSelect);
                    // console.log("Versatile heritages for ancestry:", ancestry);
                    sel.select = 'heritage/'+ancestry.id.replace('ancestry/', '');
                    ancestry.selects.push(sel);
                });
            }
        }

        if (formData.hasOwnProperty("options")) {
            formData.options.forEach(opt => {
                if (opt.base) {
                    data.baseOptions.push(opt);
                }
                if (opt.option == 'dyslexie') {
                    data.hasDyslexie = true;
                }
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
                    res.set('Content-Disposition', 'attachment; filename="' + result.filename.replace(/\.html$/, '') + '.pdf"');
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
