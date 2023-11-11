const { log, error } = require('../log.js');
const { Document } = require('./Document.js');
const { has } = require('../util.js');

class Starship {
  constructor(primary) {
    this.primary = primary;
  }

  async create() {
    // log("Starship", "Create starship", this.primary);
    let doc = await Document.create(this.primary);
    
    if (this.primary.attributes.permission) {
      await doc.addPage(doc.gameData.getPage("permission"));
    }
    
    // starship pages
    let clsInfo = doc.gameData.getClassInfo("Starship");
    for (let page of clsInfo.pages) {
      let pageInfo = doc.gameData.getPage(page);
      await doc.addPage(pageInfo);
    }

    let bytes = await doc.finishDocument();
    return bytes;
  }

  filename() {
    return "Starship.pdf";
  }
}

module.exports = {
  Starship
}
