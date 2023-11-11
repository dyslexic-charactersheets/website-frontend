
const { log } = require('./log.js');
const { t } = require('./i18n.js');

async function writeCopyright(doc, pageInfo, settings) {
  // log("copyright", "Writing copyright", pageInfo);
  // pageInfo

  await doc.canvas.drawText("© 2009-2023 Marcus Downing    https://www.dyslexic-charactersheets.com/", {
    x: 30.0,
    y: 22.0,
    font: doc.textFont,
    size: 5.5,
    color: doc.textColour,
  });
  
  let copyright1 = "";
  let copyright2 = "";

  if (pageInfo.a5) {
    if (doc.settings.isPathfinder || doc.settings.isStarfinder) {
      copyright1 = "This character sheet uses trademarks and/or copyrights owned by Paizo Publishing, LLC, which are used under";
      copyright2 = "Paizo's Community Use Policy. We are expressly prohibited from charging you to use or access this content. This character sheet is not published, endorsed, or specifically approved by Paizo Publishing.\n"
        + "For more information about Paizo's Community Use Policy, please visit paizo.com/communityuse. For more information about Paizo Publishing and Paizo products, please visit paizo.com.";
    } else {
      copyright1 = "This character sheet is not affiliated with, endorsed, sponsored, or specifically approved by Wizards of the Coast LLC.";
      copyright2 = "This character sheet may use the trademarks and other intellectual property of Wizards of the Coast LLC, which is permitted under Wizards' Fan Site Policy. For example, DUNGEONS & DRAGONS®, D&D®,\n"
        + "PLAYER'S HANDBOOK 2®, and DUNGEON MASTER'S GUIDE® are trademark[s] of Wizards of the Coast and D&D® core rules, game mechanics, characters and their distinctive likenesses are the property of\n"
        + "the Wizards of the Coast. For more information about Wizards of the Coast or any of Wizards' trademarks or other intellectual property, please visit their website.";
    }
  } else { 
    if (doc.settings.isPathfinder || doc.settings.isStarfinder) {
      copyright1 = "This character sheet uses trademarks and/or copyrights owned by Paizo Publishing, LLC, which are used under Paizo's Community Use Policy. We are expressly prohibited from charging you to use or access";
      copyright2 = "this content. This character sheet is not published, endorsed, or specifically approved by Paizo Publishing. For more information about Paizo's Community Use Policy, please visit paizo.com/communityuse. For more information about Paizo Publishing and Paizo products, please visit paizo.com.";
    } else {
      copyright1 = "This character sheet is not affiliated with, endorsed, sponsored, or specifically approved by Wizards of the Coast LLC. This character sheet may use the trademarks and other intellectual property of";
      copyright2 = "Wizards of the Coast LLC, which is permitted under Wizards' Fan Site Policy. For example, DUNGEONS & DRAGONS®, D&D®, PLAYER'S HANDBOOK 2®, and DUNGEON MASTER'S GUIDE® are trademark[s] of Wizards of the Coast and D&D® core rules, game mechanics, characters and their\n"
        + "distinctive likenesses are the property of the Wizards of the Coast. For more information about Wizards of the Coast or any of Wizards' trademarks or other intellectual property, please visit their website.";
    }
  }

  await doc.canvas.drawText(copyright1, {
    x: 200.0,
    y: 22.0,
    font: doc.textFont,
    size: 4.5,
    color: doc.textColour,
  });
  await doc.canvas.drawText(copyright2, {
    x: 30.0,
    y: 17.0,
    font: doc.textFont,
    size: 4.5,
    color: doc.textColour,
    lineHeight: 5.0,
  });
}

module.exports = {
  writeCopyright
}
