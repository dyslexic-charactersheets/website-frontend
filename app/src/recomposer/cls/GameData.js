const { rgb, BlendMode } = require('pdf-lib');
const { log, warn, error } = require('../log.js');
const { getAssetPath, loadAsset } = require('../assets.js');
const { has, isEmpty, isString } = require('../util.js');

class GameData {
  constructor(data) {
    this.data = JSON.parse(data);
  }
  
  mergeClassVariant(variant, classInfo) {
    // log("GameData", "Merging variant", variant.name, "into", classInfo.name);
    // log("GameData", "Variant", variant);
    // log("GameData", "Class", classInfo);

    classInfo = {
      skills: [],
      ...classInfo
    };

    variant = {
      pages: [],
      skills: [],
      notSkills: [],
      skillBonus: {},
      ...variant
    };

    let merged = {
      ...classInfo,
      ...variant,
      pages: [...classInfo.pages, ...variant.pages],
      skills: [...classInfo.skills.filter((s) => !variant.notSkills.includes(s)), ...variant.skills],
      skillBonus: {...classInfo.skillBonus, ...variant.skillBonus},
      variants: [],
      baseName: classInfo.name,
    };

    // log("GameData", "Merged", merged);
    return merged;
  }

  // get a class's data
  getClassInfo(className) {
    // log("GameData", "getClassInfo", className);
    if (Array.isArray(className)) {
      let [baseName, axis1, axis2] = className;
      className = baseName;
      
      // get base class info
      className = className.replace(/^class-/, '');
      let classInfo = this.data.classes.filter((cls) => cls.name == className)[0];

      if ('variants' in classInfo && axis1) {
        // 2-axis class variants
        if (axis2) {
          for (let variant of classInfo.variants) {
            if ('axes' in variant && variant.axes[0] == axis1 && variant.axes[1] == axis2) {
              return this.mergeClassVariant(variant, classInfo);
            }
          }
        } else if (axis1) {
          for (let variant of classInfo.variants) {
            if (variant.name == axis1) {
              return this.mergeClassVariant(variant, classInfo);
            }
          }
        }
      }
      return classInfo;
    }
    
    className = className.replace(/^class-/, '');
    return this.data.classes.filter((cls) => cls.name == className)[0];
  }

  // Get a page for a given slot and optionally variant
  getPage(slot, variant = null) {
    if (variant === null && slot.match(/\//)) {
      [slot, variant] = slot.split(/\//, 2);
    }

    if (variant !== null) {
      variant = String(variant);
      let pages = this.data.pages.filter((page) => page.slot == slot && page.variant == variant);
      if (pages.length > 0) {
        return pages[0];
      }
    } else {
      let pages = this.data.pages.filter((page) => page.slot == slot && (page.variant == "" || page.variant === null || page.variant === undefined));
      if (pages.length > 0) {
        return pages[0];
      }
    }

    let pages = this.data.pages.filter((page) => page.slot == slot);
    if (pages.length > 0) {
      return pages[0];
    }

    error("GameData", "Page not found:", slot, variant);
    return null;
  }

  getGMPage(group, slot, variant = null) {
    let groupPages = this.data.gm[group];

    if (variant === null && isString(slot) && slot.match(/\//)) {
      [slot, variant] = slot.split(/\//, 2);
    }

    if (variant !== null) {
      variant = String(variant);
      let pages = groupPages.filter((page) => page.slot == slot && page.variant == variant);
      if (pages.length > 0) {
        return pages[0];
      }
    }

    let pages = groupPages.filter((page) => page.slot == slot);
    if (pages.length > 0) {
      return pages[0];
    }
    
    error("GameData", "GM page not found:", slot, variant);
    return null;
  }

  getGMPages(group) {
    return this.data.gm[group];
  }

  getGMPagesExcept(group, ...exceptSlot) {
    let groupPages = this.data.gm[group];
    return groupPages.filter((p) => !exceptSlot.includes(p.slot));
  }

  getAllPages() {
    let pages = this.data.pages;
    return pages;
  }

  inferClassPages(primary) {
    let gameData = systemGameData[primary.attributes.game];
    if (isEmpty(gameData)) {
      error("GameData", "No game data", primary.attributes.game);
    }
  
    let pages = new Set();
    let pageVariants = {};

    function addPageSlot(pageSlot) {
      let [page, variant] = pageSlot.split('/', 2);
      pages.add(page);
      if (!isEmpty(variant)) {
        pageVariants[page] = variant;
      }
    }
  
    for (let page of gameData.data.base.pages) {
      pages.add(page);
    }

    if (primary.attributes.simple) {
      addPageSlot("core", "simple");
      addPageSlot("combat", "simple");
    }
  
    for (let className of primary.attributes.classes) {
      let classInfo = gameData.getClassInfo(className);
      log("GameData", "Class", className, classInfo);
      if (!isEmpty(classInfo) && has(classInfo, "pages")) {
        for (let page of classInfo.pages) {
          addPageSlot(page);
        }
      }
    }

    let inventoryStyle = primary.attributes.inventoryStyle;
    if (inventoryStyle && inventoryStyle != "auto") {
      addPageSlot('inventory/'+inventoryStyle);
    }

    if (pages.has("spellbook")) {
      let spellbookSize = primary.attributes.spellbookSize;
      log("GameData", "Spellbook size", spellbookSize);
      if (spellbookSize == "none") {
        pages.delete("spellbook");
      } else if (spellbookSize && spellbookSize != "medium") {
        addPageSlot("spellbook/"+spellbookSize);
      }
    }

    log("GameData", "Pages", pages, pageVariants);

    let pageData = [];
    pages.forEach((page) => {
      pageData.push(gameData.getPage(page, pageVariants[page]));
    });

    pageData.sort((a, b) => {
      let ordera = has(a, "position") ? parseInt(a.position) : 1;
      let orderb = has(b, "position") ? parseInt(b.position) : 1;
      return ordera < orderb;
    });
  
    return pageData;
  }

  getSkillInfo(skillName) {
    let skill = this.data.skills.filter((skill) => skill.name == skillName)[0];
    if (isEmpty(skill)) {
      let match = skillName.match(/(Perform|Craft|Profession) \(.*\)/);
      if (match) {
        // log("GameData", "Dynamic skill", match);
        let ability = (match[1] == "Perform") ? "CHA" : ((match[1] == "Craft") ? "INT" : "WIS");
        skill = {
          name: skillName,
          ability: ability,
          noRage: true,
          afterFold: true
        };
      } else {
        error("GameData", "Skill not found:", skillName);
        return null;
      }
    }
    skill = {
      subSkillOf: null,
      optional: false,
      useUntrained: false,
      acp: false,
      noRanks: false,
      noRage: false,
      afterFold: false,
      favouredEnemy: false,
      favouredTerrain: false,
      ...skill,
    }
    return skill;
  }

  // Find the skills for various selected classes
  getSkills(pageInfo, settings) {
    let skills = {};
    let self = this;

    let skillsStyle = settings.skillsStyle;
    log("GameData", "Skills style:", skillsStyle, " slot:", pageInfo.slot);
    if (skillsStyle == "blank") {
      return [];
    }
    let isConsolidated = skillsStyle == "consolidated" && has(this.data, "consolidatedSkills");
    log("GameData", "Consolidated skills", isConsolidated);

    function addSkills(skillNames) {
      // log("GameData", "Skill names", skillNames);
      if (isEmpty(skillNames)) {
        return;
      }
      for (let skillName of skillNames) {
        let skill = self.getSkillInfo(skillName);
        if (skill !== null) {
          if (isConsolidated && has(self.data.consolidatedSkills, skillName)) {
            for (let altSkill of self.data.consolidatedSkills[skillName]) {
              log("GameData", "Consolidated skill?", altSkill);
              skill = self.getSkillInfo(altSkill);
              log("GameData", "Consolidated skill", skill);

              skillName = skill.name;
              skills[skillName] = {
                plusLevel: false,
                plusHalfLevel: false,
                skillBonus: 0,
                classSkill: {},
                ...skill,
                displayName: ('displayName' in skill) ? skill.displayName : skill.name,
              }
            }
            
            continue;
          }

          skills[skillName] = {
            plusLevel: false,
            plusHalfLevel: false,
            skillBonus: 0,
            classSkill: {},
            ...skill,
            displayName: ('displayName' in skill) ? skill.displayName : skill.name,
          }
        }
      }
    }

    function setClassSkills(cls, skillNames) {
      if (skillNames === null) {
        return;
      }
      for (let skillName of skillNames) {
        if (skillName in skills) {
          if (Array.isArray(cls)) {
            cls = cls[0];
          }
          skills[skillName].classSkill[cls] = true;
        }
      }
    }

    // add skills
    switch (pageInfo.slot) {
      case "core":
        // find all the skills
        log("GameData", "Core skills!");
        addSkills(this.data.coreSkills);
        for (let className of settings.classes) {
          let cls = this.getClassInfo(className);
          // log("GameData", "Skills for class", className, cls.skills);
          if (cls != null) {
            addSkills(cls.skills);
            setClassSkills(className, cls.skills);
          }
        }
        break;

      // pathfinder
      case "eidolon":
        let eidolon = this.getClassInfo("Eidolon");
        if (eidolon != null) {
          addSkills(eidolon.skills);
          setClassSkills("eidolon", eidolon.skills);
        }
        break;

      case "spiritualist-phantom":
        let phantom = this.getClassInfo("Phantom");
        if (phantom != null) {
          addSkills(phantom.skills);
          setClassSkills("phantom", phantom.skills);
        }

      case "animalcompanion":
        addSkills(this.data.animalSkills);
        // setClassSkills("animalcompanion", this.data.animalSkills);
        break;

      // starfinder
      case "drone":
        addSkills(this.data.droneSkills);
        // setClassSkills("drone", this.data.droneSkills);
        break;
    }

    if (settings.allKnowledge) {
      addSkills(this.data.knowledgeSkills);
    }
    addSkills(settings.performSkills);
    addSkills(settings.craftSkills);
    addSkills(settings.professionSkills);

    // add bonuses per class/variant
    /*
    for (let className of settings.classes) {
      let cls = this.getClassInfo(className);
      if (cls != null) {
        if ('plusHalfLevel' in cls) {
          for (let skill of cls.plusHalfLevel) {
            if (skill in skills) {
              skills[skill].plusHalfLevel = true;
            } else {
              warn("GameData", "What skill?", skill);
            }
          }
        }
        if ('plusLevel' in cls) {
          for (let skill of cls.plusLevel) {
            if (skill in skills) {
              skills[skill].plusLevel = true;
            } else {
              warn("GameData", "What skill?", skill);
            }
          }
        }
        if ('skillBonus' in cls) {
          for (let skill in cls.skillBonus) {
            if (skill in skills) {
              skills[skill].skillBonus += cls.skillBonus[skill];
            } else {
              warn("GameData", "What skill?", skill);
            }
          }
        }
      }
    }
    */

    return Object.values(skills);
  }
}

log("gamedata", "Loading game data");
let systemGameData = {
  pathfinder: new GameData(loadAsset('data/pathfinder.json')),
  starfinder: new GameData(loadAsset('data/starfinder.json')),
  dnd35: new GameData(loadAsset('data/dnd35.json')),
}

function getGameData(game) {
  if (!has(systemGameData, game)) {
    error("GameData", "System not found:", game);
  }
  return systemGameData[game];
}

function interpretColour(colour) {
  switch (colour) {
    case "light": return rgb(0.3, 0.3, 0.3);
    case "dark": return rgb(0.35, 0.35, 0.35);
    case "black": return rgb(0, 0, 0);
    case "red": return rgb(0.6, 0.2, 0.2);
    case "orange": return rgb(0.72, 0.47, 0.30);
    case "yellow": return rgb(1.0, 0.92, 0.55);
    case "lime": return rgb(0.77, 0.85, 0.55);
    case "green": return rgb(0.5, 0.7, 0.5);
    case "cyan": return rgb(0.6, 0.75, 0.75);
    case "blue": return rgb(0.55, 0.63, 0.80);
    case "purple": return rgb(0.80, 0.6, 0.70);
    case "pink": return rgb(1.0, 0.60, 0.65);
    default: return false;
  }
}

function interpretColourMode(colour) {
  switch (colour) {
    case "light": return BlendMode.Screen;
    case "dark": return BlendMode.Overlay;
    case "black": return BlendMode.Overlay;
    default:
      // when in doubt, cheat!
      BlendMode["Color"] = "Color";
      return BlendMode.Color;
  }
}

function inferSettings(primary) {
  let attrs = {
    id: primary.id,
    game: 'pathfinder',
    language: 'english',
    printColour: 'gray',
    ...primary.attributes,
  }

  let settings = {
    game: attrs.game,
    isPathfinder: attrs.game == "pathfinder",
    isStarfinder: attrs.game == "starfinder",
    isDnD35: attrs.game == "dnd35",
    isBarbarian: false,
    language: attrs.language,
    colour: interpretColour(attrs.printColour),
    colourMode: interpretColourMode(attrs.printColour),
    ...attrs,
  };

  log("GameData", "Settings", settings);

  return settings;
}

function locatePage(pageInfo, settings) {
  if (pageInfo === null) {
    error("GameDate", "Cannot locate: null");
  }
  let game = settings.game;
  let language = settings.language;

  let file = getAssetPath(`${(language == 'english' || language == 'default') ? '' : `languages/${language}/`}${game}/${pageInfo.file}`);
  log("GameData", "Locate file", file);
  return file;
}

module.exports = {
  GameData,
  getGameData,
  inferSettings,
  locatePage
};
