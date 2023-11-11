const { log } = require('../log.js');
const { Document } = require('./Document.js');
const { has } = require('../util.js');

class Character {
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

    if (this.option("buildMyCharacter")) {
      await doc.addPage(doc.gameData.getPage("build"));
    }

    let classPages = doc.gameData.inferClassPages(this.primary);
    doc.classPages = classPages;
    for (let pageInfo of classPages) {
      await doc.addPage(pageInfo);
    }

    if (this.option("optionBackground") || this.option("includeCharacterBackground")) {
      let pfs = this.option("isPathfinderSociety");
      await doc.addPage(doc.gameData.getPage("background", pfs ? "pathfindersociety" : null));
    }

    if (this.option("includeLycanthrope")) {
      await doc.addPage(doc.gameData.getPage("lycanthrope"));
    }

    if (this.option("includeIntelligentItem")) {
      await doc.addPage(doc.gameData.getPage("intelligent-item"));
    }

    if (this.option("includePartyFunds")) {
      await doc.addPage(doc.gameData.getPage("partyfunds"));
    }

    if (this.option("includeAnimalCompanion")) {
      await doc.addPage(doc.gameData.getPage("animalcompanion"));

      if (this.option("hasAnimalIconic")) {
        await doc.addPage(doc.gameData.getPage("mini-animal"));
      }
    }

    if (this.option("includeMini")) {
      await doc.addPage(doc.gameData.getPage("mini", this.primary.attributes.miniSize));
    }

    let bytes = await doc.finishDocument();
    return bytes;
  }

  filename() {
    let classes = (has(this.primary.attributes, "classes") && Array.isArray(this.primary.attributes.classes)) ? this.primary.attributes.classes : [];

    log("Character", "Filename? Classes", classes);

    if (classes.length == 0) {
      return "Generic.pdf";
    }
    return classes.map((cls) => {
      if (Array.isArray(cls)) {
        cls = cls[0];
      }
      return cls;
    }).join(", ")+".pdf";
  }
}

module.exports = {
  Character
}
