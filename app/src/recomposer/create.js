const { log } = require('./log.js');
const { inferPages, inferSettings } = require('./cls/GameData.js');
const { has } = require('./util.js');
// const compose = require('./compose.js');
const { Document } = require('./cls/Document.js');
const { Character } = require('./cls/Character.js');
const { GM } = require('./cls/GM.js');
const { Starship } = require('./cls/Starship.js');
const { All } = require('./cls/All.js');

function createCharacterSheet(request) {
  return new Promise((resolve, reject) => {
    try {
      let character = interpretPrimary(request.data);

      character.create()
        .then((bytes) => {
          resolve({
            data: bytes,
            filename: character.filename(),
          });
        })
        .catch((e) => {
          reject(e);
        });
    } catch (e) {
      reject(e);
    }
  });
}

function interpretPrimary(primary) {
  log("create", "Primary type", primary.type);
  switch (primary.type) {
    case "all":
      return new All(primary);
    case "character":
      return new Character(primary);
    case "gm":
      return new GM(primary);
    case "starship":
      return new Starship(primary);
  }
}

module.exports = {
  createCharacterSheet
}
