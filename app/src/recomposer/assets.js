const fs = require('fs');
const path = require('path');

const { log } = require('./log.js');

let assetsDir = path.resolve(__dirname+'../../../../../assets');
log("assets", "Assets dir", assetsDir);

function setAssetsDir(dir) {
  assetsDir = path.resolve(dir);
  log("assets", "Assets dir", dir, "->", assetsDir);
}

function getAssetPath(asset) {
  return path.resolve(assetsDir+'/'+asset);
}

function loadAsset(asset) {
  let abs = getAssetPath(asset);
  log("assets", "Loading asset", abs);
  return fs.readFileSync(abs);
}

function loadInternalAsset(asset) {
  let abs = path.resolve(`${__dirname}/${asset}`);
  log("assets", "Loading internal asset", abs);
  return fs.readFileSync(abs);
}

module.exports = {
  setAssetsDir,
  getAssetPath,
  loadAsset,
  loadInternalAsset,
}
