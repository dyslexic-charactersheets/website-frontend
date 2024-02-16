const { log } = require('../log.js');
const { Document } = require('./Document.js');
const { has } = require('../util.js');

class All {
  constructor(primary) {
    this.primary = primary;
  }

  async create() {
    log("All", "Download all");
    let doc = await Document.create(this.primary);

    for (let page of doc.gameData.getAllPages()) {
      log("All", "Page", page);
      await doc.addPage(page);
    }
    
    let bytes = await doc.finishDocument();
    return bytes;
  }

  filename() {
    log("All", "Filename");
    return "All.pdf";
  }
}

module.exports = {
  All
}
