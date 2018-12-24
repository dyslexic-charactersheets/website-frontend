const fs = require('fs');
const _ = require('lodash');

function createId(code) {
    code = code.toLowerCase();
    code = code.replace(/[^a-z0-9]+/g, '-');
    code = code.replace(/^-*/, '');
    code = code.replace(/-*$/, '');
    return code;
}

function loadAssets(data, base) {
    var assets = [];
    var lines = data.split(/\n/);
    _.each(lines, (line) => {
        var parts = line.split(/=/);
        if (parts.length < 2) return;
        var code = parts[0].trim();
        var path = parts[1].trim();
        if (code == "" || path == "") return;
        
        var id = createId(code);
        var filename = code+".png";
        var url = base+filename;
        var name = path.replace(/^.*\//, '');
        assets.push({
            id: id,
            code: code,
            filename: filename,
            url: url,
            name: name,
            path: path
        });
    });
    return assets;
}

function groupAssets(assets) {
    var groups = {};

    _.each(assets, (asset) => {
        var groupCode = asset.code.replace(/\/[^/]*$/, '');

        if (!_.has(groups, groupCode)) {
            var groupPath = asset.path.replace(/\/[^/]*$/, '');
            var groupName = groupPath.replace(/^.*\//, '').replace(/^[0-9]+ /, '');
            var folderName = groupPath.replace(/\/[^/]*$/, '').replace(/^[0-9]+ /, '');
            var groupId = createId(groupCode);

            groups[groupCode] = {
                id: groupId,
                code: groupCode,
                name: groupName,
                folder: folderName,
                path: groupPath,
                assets: [],
            };
        }

        groups[groupCode].assets.push(asset);
    });

    return groups;
}

// Iconics
var iconics = [];
var iconicGroups = {};

fs.readFile('../../assets/iconics/iconics.txt', 'utf-8', (err, data) => {
    if (err) {
        console.log("[data] Error loading iconics", err);
        return;
    }

    iconics = loadAssets(data, '/iconics/');
    iconicGroups = groupAssets(iconics);

    // var lines = data.split(/\n/);
    // _.each(lines, (line) => {
    //     var parts = line.split(/=/);
    //     if (parts.length < 2) return;
    //     var code = parts[0].trim();
    //     var path = parts[1].trim();
    //     if (code == "" || path == "") return;
        
    //     var id = code.replace(/[^0-9a-zA-Z-]+/g, '-');
    //     var url = "/iconics/"+code;
    //     iconicGroups[group].push({
    //         id: id,
    //         url: url,
    //         path: path
    //     });
        
    //     var groupcode = code.replace(/\/[^/]?$/, '');
    //     var groupname = path.replace(/\/[^/]?$/, '');
    //     if (!_.has(iconicGroups, group))
    //         iconicGroups[group] = {
    //             group
    //         };

    //     var id = code.replace(/[^0-9a-zA-Z-]+/g, '-');
    //     var url = "/iconics/"+code;
    //     iconicGroups[group].push({
    //         id: id,
    //         url: url,
    //         path: path
    //     });
    //     // console.log("Iconic:", path);
    // });
    console.log("[data] Found", iconics.length, "iconics in", _.size(iconicGroups), "groups");
});

// Logos
var logos = [];
var logoGroups = {};

fs.readFile('../../assets/logos/logos.txt', 'utf-8', (err, data) => {
    if (err) {
        console.log("[data] Error loading logos", err);
        return;
    }

    logos = loadAssets(data, '/logos/');
    logoGroups = groupAssets(logos);

    // var lines = data.split(/\n/);
    // _.each(lines, (line) => {
    //     var parts = line.split(/=/);
    //     if (parts.length < 2) return;
    //     var code = parts[0].trim();
    //     var path = parts[1].trim();
    //     if (code == "" || path == "") return;

    //     var group = code.replace(/\/[^/]?$/, '');

    //     var id = code.replace(/[^0-9a-zA-Z-]+/g, '-');
    //     var url = "/iconics/"+code;
    //     logos.push({
    //         id: id,
    //         url: url,
    //         path: path
    //     });
    //     // console.log("Iconic:", path);
    // });
    console.log("[data] Found", logos.length, "logos in", _.size(logoGroups), "groups");
});


module.exports = {
    iconics: () => iconics,
    iconicGroups: () => iconicGroups,
    logos: () => logos,
    logoGroups: () => logoGroups,
};
