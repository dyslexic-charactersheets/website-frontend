const fs = require('fs');
const path = require('path');

const { drawImage, PDFFont, decodeFromBase64DataUri } = require('pdf-lib');

const { getGameData } = require('./cls/GameData.js');
const { log, warn, error } = require('./log.js');
const { isEmpty, has } = require('./util.js');

const { getLogoPath, getLogoProfile } = require('./cls/LogoProfile.js');
const { getPortraitPath, getPortraitProfile } = require('./cls/PortraitProfile.js');


async function writeLogo(doc, pageInfo) {
  let profile = getLogoProfile(pageInfo);

  if (profile != null) {
    const logoPath = getLogoPath(doc.settings);
    const imageBytes = fs.readFileSync(logoPath);
    const logoImage = await doc.document.embedPng(imageBytes);
    
    let dims = profile.scale(logoImage);
    doc.canvas.drawImage(logoImage, dims);
  }
}

async function writePortrait(doc, pageInfo) {
  if (isEmpty(doc.settings.inventoryIconic)) {
    return;
  }

  let profiles = getPortraitProfile(pageInfo, doc.settings);
  for (let profile of profiles) {
    let imageBytes = null;
    let format = "png";
    
    if (has(doc.settings, "inventoryIconic")) {
      if (doc.settings.inventoryIconic == "custom") {
        imageData = doc.settings.customIconic;
        if (imageData.match(/^data:image\/jpeg/)) {
          format = "jpeg";
        }

        imageBytes = decodeFromBase64DataUri(imageData);
      } else {
        const iconicPath = getPortraitPath(doc.settings);
        if (iconicPath !== null) {
          imageBytes = fs.readFileSync(iconicPath);
        }
      }

      if (imageBytes != null) {
        let image;
        switch (format) {
          case "png":
            image = await doc.document.embedPng(imageBytes);
            break;
          case "jpeg":
            image = await doc.document.embedJpg(imageBytes);
            break;
        }
        let dims = profile.scale(image);
        doc.canvas.drawImage(image, dims);
      }
    }

  }
}

module.exports = {
  writeLogo,
  writePortrait
}
