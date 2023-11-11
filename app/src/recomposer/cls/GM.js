const { log, error } = require('../log.js');
const { Document } = require('./Document.js');
const { has } = require('../util.js');

class GM {
  constructor(primary) {
    this.primary = primary;
  }

  option(name) {
    log("Character", "option", name, this.primary[name])
    return has(this.primary.attributes, name) && this.primary.attributes[name];
  }

  async create() {
    // log("Character", "Create character sheet", this.primary);
    let doc = await Document.create(this.primary);

    if (this.option("permission")) {
      await doc.addPage(doc.gameData.getPage("permission"));
    }

    switch (this.primary.attributes.gmStartType) {
      case "characters":
        let partyPage = doc.gameData.getGMPage("characters", "party", this.primary.attributes.numPCs);
        await doc.addPage(partyPage);
        
        let characterPages = doc.gameData.getGMPagesExcept("characters", "party");
        for (let pageInfo of characterPages) {
          await doc.addPage(pageInfo);
        }
        break;
        
      case "campaign":
        let campaignPages = doc.gameData.getGMPages("campaign");
        for (let pageInfo of campaignPages) {
          await doc.addPage(pageInfo);
        }
        break;
        
      case "maps":
        let mapsPages = this.primary.attributes.maps3d ? doc.gameData.data.gm.maps['3d'] : doc.gameData.data.gm.maps['2d'];
        for (let pageInfo of mapsPages) {
          await doc.addPage(pageInfo);
        }
        break;
        
      case "kingdom":
        let kingdomPage = doc.gameData.getGMPage("kingdom", "kingdom");
        await doc.addPage(kingdomPage);
        
        let settlementPage = doc.gameData.getGMPage("kingdom", "settlement", this.primary.attributes.settlementStyle);
        await doc.addPage(settlementPage);
        break;

      default:
        error("GM", "Unknown GM type!", this.primary.attributes.gmStartType);
        break;
    }
    
    let bytes = await doc.finishDocument();
    return bytes;
  }

  filename() {
    return "GM.pdf";
  }
}

module.exports = {
  GM
}
