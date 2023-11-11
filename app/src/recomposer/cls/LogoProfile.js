const { log, error } = require('../log.js');
const { getAssetPath, loadAsset } = require('../assets.js');

class LogoProfile {
  constructor(args) {
    Object.assign(this, {
      ...args
    });
  }

  scale(image) {
    let dims = image.scaleToFit(this.width, this.height);
    
    return {
      x: this.x - (dims.width / 2),
      y: this.y - (dims.height / 2),
      width: dims.width,
      height: dims.height
    };
  }
}

function getLogoProfile(pageInfo) {
  switch (pageInfo.slot) {
    case "core":
    case "eidolon":
    case "spiritualist-phantom":
      return new LogoProfile({
        x: 127,
        y: 800,
        width: 170,
        height: 50
      });

    case "hex-a4-landscape":
      return new LogoProfile({
        x: 80,
        y: 570,
        width: 120, 
        height: 35
      });

    case "iso-a4":
    case "grid-a4":
      return new LogoProfile({
        x: 90,
        y: 810,
        width: 120,
        height: 35
      });

    case "kingdom":
    case "hex-a4":
    case "hex-a3":
      return new LogoProfile({
        x: 127,
        y: 800,
        width: 170,
        height: 50
      });
  }

  return null;
}

function getLogoPath(settings) {
  switch (settings.game) {
    case "pathfinder":
      return getAssetPath("logos/pathfinder/Pathfinder.png");

    case "dnd35":
      return getAssetPath("logos/dnd35/dnd35.png");

    case "starfinder":
      return getAssetPath("logos/starfinder/Starfinder.png");
  }
}

module.exports = {
  LogoProfile,
  getLogoPath,
  getLogoProfile
}
