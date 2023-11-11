const fs = require('fs');
const path = require('path');

const { log, error } = require('../log.js');
const { getAssetPath, loadAsset } = require('../assets.js');
const { has, isEmpty } = require('../util.js');
const { degrees } = require('pdf-lib');

class PortraitProfile {
  constructor(args) {
    Object.assign(this, {
      rotate: 0,
      ...args
    });
  }

  scale(image) {
    let dims = image.scaleToFit(this.width, this.height);

    if (this.rotate) {
      return {
        x: this.x + (dims.width / 2),
        y: this.y + (dims.height / 2),
        width: dims.width,
        height: dims.height,
        rotate: degrees(180)
      }
    }
    
    return {
      x: this.x - (dims.width / 2),
      y: this.y - (dims.height / 2),
      width: dims.width,
      height: dims.height,
    };
  }
}

function getPortraitProfile(pageInfo, settings) {
  switch (pageInfo.slot) {
    case "core":
      if (settings.isStarfinder) {
        return [new PortraitProfile({
          x: 127,
          y: 462,
          width: 180,
          height: 215
        })];
      }
      break;

    case "inventory":
      return [new PortraitProfile({
        x: 315,
        y: 522,
        width: 180,
        height: 215
      })];

    case "background":
      return [new PortraitProfile({
        x: 127,
        y: 425,
        width: 180,
        height: 215
      })];

    case "mini":
      let profiles = [
        new PortraitProfile({
          x: 410.5,
          y: 720,
          width: 36,
          height: 36
        }),
        new PortraitProfile({
          x: 518,
          y: 585,
          width: 55,
          height: 55
        }),
        new PortraitProfile({
          x: 455,
          y: 585,
          width: 55,
          height: 55,
          rotate: 180
        }),
        new PortraitProfile({
          x: 122,
          y: 646,
          width: 140,
          height: 150,
          rotate: true
        })
      ];

      switch (settings.miniSize) {
        case "small":
          profiles = [...profiles,
            new PortraitProfile({
              x: 294,
              y: 726,
              width: 48,
              height: 62,
              rotate: true
            }),
            new PortraitProfile({
              x: 294,
              y: 656,
              width: 48,
              height: 62
            }),
            new PortraitProfile({
              x: 514.5,
              y: 127,
              width: 48,
              height: 48
            }),
            new PortraitProfile({
              x: 514.5,
              y: 181,
              width: 48,
              height: 48,
              rotate: true
            })
          ];
          break;
        case "medium":
          profiles = [...profiles,
            new PortraitProfile({
              x: 295,
              y: 714,
              width: 66,
              height: 89,
              rotate: true
            }),
            new PortraitProfile({
              x: 295,
              y: 620,
              width: 66,
              height: 89
            }),
            new PortraitProfile({
              x: 514.5,
              y: 126,
              width: 66,
              height: 66
            }),
            new PortraitProfile({
              x: 514.5,
              y: 198,
              width: 66,
              height: 66,
              rotate: true
            })
          ];
          break;
        case "large":
          profiles = [...profiles,
            new PortraitProfile({
              x: 294,
              y: 632,
              width: 135,
              height: 180,
              rotate: true
            }),
            new PortraitProfile({
              x: 294,
              y: 445,
              width: 135,
              height: 180
            }),
            new PortraitProfile({
              x: 475,
              y: 220,
              width: 135,
              height: 135
            }),
            new PortraitProfile({
              x: 475,
              y: 364,
              width: 135,
              height: 135,
              rotate: true
            })
          ];
          break;
      }

      return profiles;
  }
  return [];
}

let iconicFiles = {};
(() => {
  let indexPath = getAssetPath("iconics/iconics.txt");
  fs.readFile(indexPath, 'utf-8', (err, data) => {
    if (err) {
      error("PortraitProfile", "Error reading iconic info", err);
      return;
    }
    let lines = data.split(/\n/);
    lines[0]
    for (let line of lines) {
      let [code, name] = line.split(/=/, 2);
      let assetCode = code.replaceAll('/', '-');
      let assetPath = getAssetPath('iconics/large/'+code+'.png');
      // log("PortraitProfile", `Iconic [${assetCode}] [${assetPath}]`);
      if (assetCode != "") {
        iconicFiles[assetCode] = assetPath;
      }
    }
    log("PortraitProfile", `Read ${Object.keys(iconicFiles).length} iconics`);
  });
})();

function getPortraitPath(settings) {
  if (has(settings, "inventoryIconic")) {
    log("PortraitProfile", "Looking for iconic", settings.inventoryIconic);
    if (has(iconicFiles, settings.inventoryIconic)) {
      log("PortraitProfile", "Found", iconicFiles[settings.inventoryIconic]);
      return iconicFiles[settings.inventoryIconic];
    }
  }
  return null;
}

module.exports = {
  PortraitProfile,
  getPortraitPath,
  getPortraitProfile
}
