// const fs = require('fs');
const Recomposer = require('./recomposer/lib');

function parseCharacter(req, game) {
  let values = {...req.body};
  let properties = Object.keys(req.body);
  console.log("[recomposer]    Request properties:", values);

  function get(property, defaultValue = '') {
    if (values.hasOwnProperty(property) && values[property] !== null && values[property] != "") {
      return values[property];
    }
    return defaultValue;
  }

  function has(property) {
    return values.hasOwnProperty(property) && values[property] !== null && values[property] != "";
  }

  function positive(property) {
    return values.hasOwnProperty(property) && values[property] == "on"
  }

  function getMatching(rex, remove = false, anyValue = false, returnValue = false) {
    let found = properties.filter(p => p.match(rex));
    if (anyValue) {
      found = found.filter((p) => get(p, "") != "");
    } else {
      found = found.filter((p) => positive(p))
    }

    if (returnValue) {
      found = found.map(p => values[p]);
    } else if (remove) {
      found = found.map(p => p.replace(rex, ''));
    }
    return found;
  }

  function multiSkill(base, name) {
    let skills = []
    if (positive("show-"+base)) {
      for (let n = 0; n < 30; n++) {
        let key = `${base}-skill-${n}`;
        if (has(key)) {
          let skill = get(`${base}-skill-${n}`);
          skills.push(`${name} (${skill})`);
        }
      }
    }
    return skills;
  }

  // is this a GM sheet?
  let requestType = get("start-type");
  if (requestType == "gm") {
    return {
      version: 0,
      data: {
        type: "gm",
        attributes: {
          game,
          language: get("language", "default"),
          isLoggedIn: positive("isLoggedIn"),
          
          gmStartType: get("gm-start-type"),
          printColour: get("colour", "normal"),
          watermark: positive("has-watermark") ? get("watermark", "") : "",
          logo: get("logo", game),

          permission: positive("permission"),
          gmCampaign: positive("gm-campaign"),
          numPCs: parseInt(get("num-pcs", "4")),
          maps: positive("maps"),
          maps3d: get("maps-view", (game == "starfinder" ? "2d" : "3d")),
          settlementStyle: get("settlement-style", "normal"),
          aps: getMatching(/ap-/, true),
        }
      }
    };
  }

  if (requestType == "starship") {
    return {
      version: 0,
      data: {
        type: "starship",
        attributes: {
          game,
          language: get("language", "default"),
          isLoggedIn: positive("isLoggedIn"),
          
          printColour: get("colour", "normal"),
          watermark: positive("has-watermark") ? get("watermark", "") : "",
          logo: get("logo", game),

          permission: positive("permission"),
        }
      }
    };
  }

  if (requestType == "all") {
    return {
      verion: 0,
      data: {
        type: "all",
        attributes: {
          game,
          language: get("language", "default"),
          isLoggedIn: positive("isLoggedIn"),
          
          printColour: get("colour", "normal"),
          watermark: positive("has-watermark") ? get("watermark", "") : "",
          logo: get("logo", game),
        }
      }
    }
  }


  // parse a character
  let matchClasses = getMatching(/^class-/, true);
  let switchClasses = getMatching(/^switch-/, true, true, true)
  console.log("[recomposer]    Classes (match):", matchClasses);
  console.log("[recomposer]    Classes (switch):", switchClasses);
  let classes = [...matchClasses, ...switchClasses];
  console.log("[recomposer]    Classes:", classes);

  classes = classes.map((cls) => {
    let variant = get(`variant-${cls}`, false);
    if (variant) {
      return [cls, variant];
    }
    let axis1 = get(`variant-${cls}-axis-0`, false);
    let axis2 = get(`variant-${cls}-axis-1`, false);
    if (axis1 || axis2) {
      return [cls, axis1, axis2];
    }
    return [cls];
  });

  let characterRequest = {
    version: 0,
    data: {
      type: "character",
      attributes: {
        game,
        language: get("language", "default"),
        isLoggedIn: positive("isLoggedIn"),
        race: "",
        classes,
        archetypes: [],
        simple: positive("simple"),
        more: positive("more"),
        inventoryStyle: get("inventory-style", "normal"),
        spellbookSize: get("spellbook-size", "medium"),
        printColour: get("colour", "normal"),
        inventoryIconic: get("inventory-iconic", "default"),
        customIconic: (get("inventory-iconic") == "custom") ? get("inventory-iconic-custom") : null,
        animalIconic: get("animal-iconic", "none"),
        logo: get("logo", game),
        customLogo: (get("logo") == "custom") ? get("logo-custom-file") : null,

        permission: positive("permission"),
        buildMyCharacter: positive("build-my-character"),
        includeGM: positive("gm"),
        partyDownload: positive("party-download"),
        hideInventory: positive("simple"),
        moreClasses: positive("more"),
        skillsStyle: get("skills-list-style", "normal"),
        allKnowledge: positive("all-knowledge"),

        performSkills: multiSkill("perform", "Perform"),
        craftSkills: multiSkill("craft", "Craft"),
        professionSkills: multiSkill("profession", "Profession"),

        includeCharacterBackground: positive("include-background"),
        isPathfinderSociety: (game == "pathfinder") && positive("include-pathfinder-society"),
        includeLycanthrope: positive("include-lycanthrope"),
        includeIntelligentItem: positive("include-intelligent-item"),
        includePartyFunds: positive("include-party-funds"),
        includeAnimalCompanion: positive("include-animal-companion"),
        includeMini: positive("include-mini"),
        miniSize: get("mini-size", "medium"),
        miniAnimalSize: get("mini-animal-size", "medium"),

        watermark: positive("has-watermark") ? get("watermark", "") : "",

        variantRules: getMatching(/variant-/)
      }
    }
  };

  return characterRequest;
}

function parsePathfinder(req) {
  let characterRequest = parseCharacter(req, "pathfinder");

  return characterRequest;
}

function parseStarfinder(req) {
  let characterRequest = parseCharacter(req, "starfinder");

  return characterRequest;
}

function parseDnD35(req) {
  let characterRequest = parseCharacter(req, "dnd35");

  return characterRequest;
}

function buildPdf(characterRequest, res) {
  Recomposer.createCharacterSheet(characterRequest)
    .then((result) => {
      if (result.err) {
        console.log("[recomposer]    Error:", result.err);
        res.status(500);
        res.send("Error");
        return;
      }
  
      console.log("[recomposer]    Data length", result.data.length);
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Length', result.data.length);
      res.set('Content-Disposition', 'attachment');
      res.set('Content-Disposition', 'attachment; filename="' + result.filename + '"');
      res.send(Buffer.from(result.data));
      console.log("[recomposer]    Sent");
    })
    .catch((x) => {
      console.log("[recomposer]    Error:", x);
      res.status(500);
      res.send("Error");
    });
}

module.exports = {
  renderPathfinder (req, res) {
    let char = parsePathfinder(req);
    buildPdf(char, res);
  },
  
  renderStarfinder (req, res) {
    let char = parseStarfinder(req);
    buildPdf(char, res);
  },
  
  renderDnD35 (req, res) {
    let char = parseDnD35(req);
    buildPdf(char, res);
  }
}