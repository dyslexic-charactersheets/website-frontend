/**
 * Dyslexic Character Sheets recomposer
 * @module dyslexic-charactersheets
 */

const { createCharacterSheet } = require('./create.js');

const { setAssetDir } = require('./assets.js');

module.exports = {
  setAssetDir,
  createCharacterSheet
};
