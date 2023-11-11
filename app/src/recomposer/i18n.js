const fs = require('fs');
const { log, warn } = require('./log.js'); 
const { getAssetPath, loadAsset } = require('./assets.js');
const { has, isEmpty } = require('./util.js');

// load the 
const translations = (() => {
  let data = JSON.parse(loadAsset('data/translations.json'));
  let translations = {};
  for (let lang of data.languages) {
    log("i18n", `Loaded ${lang.translations.length} ${lang.name} translations`);
    translations[lang.name] = {};
    for (let item of lang.translations) {
      translations[lang.name][item.original] = item.translation;
    }
  }
  return translations;
})();


function t(string, language) {
  if (language === null || language == "" || language == "english" || language == "default") {
    return string;
  }

  if (!has(translations, language)) {
    warn("i18n", "Unknown language", language);
    return string;
  }

  if (!has(translations[language], string)) {
    warn("i18n", `Unknown ${language} translation`, string);
    return string;
  }

  let translation = translations[language][string];
  if (isEmpty(translation)) {
    warn("i18n", "Blank translation", language, string, translation);
    return string;
  }
  // log("i18n", "Translation", language, string, translation);
  return translation;
}

module.exports = {
  t
}
