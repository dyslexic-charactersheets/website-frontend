// const { StandardFonts, rgb } = require('pdf-lib');

const { inferSkills, getGameData } = require('./cls/GameData.js');
const { log, warn, error } = require('./log.js');
const { t } = require('./i18n.js');
const { getSkillsProfile } = require('./cls/SkillsProfile.js');
const { has, isEmpty } = require('./util.js');
const { drawText } = require('pdf-lib');


const skillFontSize = 8;
const attrFontSize = 10.4;

async function writeSkills(doc, pageInfo) {
  let skills = doc.gameData.getSkills(pageInfo, doc.settings);
  if (skills.length == 0) {
    return;
  }

  let profile = getSkillsProfile(pageInfo, doc.settings);
  if (profile == null) {
    error("skills", "No skill profile for page:", pageInfo);
    return;
  }

  // log("skills", "Writing skills", skills, profile);

  // pull out the subskills
  let topSkills = [];
  let subskillsBySkill = {};
  for (let skill of skills) {
    if (has(skill, 'subSkillOf') && skill.subSkillOf) {
      if (!has(subskillsBySkill, skill.subSkillOf)) {
        subskillsBySkill[skill.subSkillOf] = [];
      }
      subskillsBySkill[skill.subSkillOf].push(skill);
    } else {
      topSkills.push(skill);
    }
  }

  // sort with translation and fold
  function sortSkills(skills) {
    let above = [], below = [];
    for (let skill of skills) {
      skill.translation = t(skill.name, doc.settings.language);
      if (skill.afterFold) {
        below.push(skill);
      } else {
        above.push(skill);
      }
    }

    above.sort((a, b) => (a.translation > b.translation) ? 1 : -1 );
    below.sort((a, b) => (a.translation > b.translation) ? 1 : -1);
    return [...above, ...below];
  }

  topSkills = sortSkills(topSkills);
  
  // write a skill line
  async function drawCheckbox(pos, left, checked) {
    let baseline = profile.firstLine + pos * profile.lineIncrement;
    await doc.canvas.drawRectangle({
      x: left,
      y: baseline,
      width: 4.8,
      height: 4.8,
      borderWidth: 0.5,
      borderColor: doc.textColour,
      color: checked ? doc.fillColour : doc.white,
      // opacity: 0.5,
      // borderOpacity: 0.75,
      opacity: 1,
      borderOpacity: 1,
    });
  }

  async function drawSubskillCurve(pos) {
    let base = profile.firstLine + pos * profile.lineIncrement + 2;
    let left = profile.skillsAreaLeft + 5;

    let curvelen = 3.5;
    let outerlen = 6.7;
    let linelen = outerlen - curvelen;

    let svgPath = `M 0,0 l 0,${linelen} a ${curvelen},${curvelen} 0 0,0 ${curvelen},${curvelen} l ${linelen},${0}`;
    doc.canvas.drawSvgPath(svgPath, {
      x: left,
      y: base + outerlen,
      borderWidth: 0.6,
      borderColor: doc.textColour,
    });
  }

  async function writeSkillLine(pos, skill, isSubskill) {
    if (skill === null) {
      error("skills", "No skill");
    }
    if (!has(skill, "name")) {
      error("skills", "Skill with no name:", pos, skill);
    }

    let baseline = profile.firstLine + pos * profile.lineIncrement;
    let left = isSubskill ? profile.skillNameLeft + 12 : profile.skillNameLeft;

    if (isSubskill) {
      drawSubskillCurve(pos);
    }

    // name
    let name = t(skill.displayName, doc.settings.language);
    let skillColour = (skill.noRanks || isSubskill) ? doc.fillColour : doc.textColour
    await doc.canvas.drawText(name, {
      x: left,
      y: baseline,
      font: doc.textFont,
      size: skillFontSize,
      color: skillColour,
    });
    
    let isCorePage = pageInfo.slot == "core" || pageInfo.slot == "eidolon" || pageInfo.slot == "spiritualist-phantom" || pageInfo.slot == "drone"
    if (isCorePage) {
      // use untrained
      if (skill.useUntrained) {
        drawCheckbox(pos, profile.useUntrainedMiddle, true);
      }

      // ability
      let ability = t(skill.ability, doc.settings.language);
      if (!isEmpty(ability)) {
        let abilityWidth = doc.altFont.widthOfTextAtSize(ability, 10.4);
        doc.canvas.drawText(ability, {
          x: profile.abilityMiddle - abilityWidth / 2,
          y: baseline + profile.abilityOffset,
          font: doc.altFont,
          size: attrFontSize,
          opacity: 0.2,
        });
      }

      // box ranks
      if (skill.boxRanks) {
        doc.canvas.drawRectangle({
          x: profile.ranksMiddle - profile.acpWidth,
          y: baseline + profile.lineBottomOffset,
          width: profile.acpWidth,
          height: -profile.lineIncrement,
          borderWidth: 0.5,
          borderColor: doc.textColour,
        });
      }

      // class skill checkbox
      let classes = doc.settings.classes.map((cls) => doc.gameData.getClassInfo(cls));
      
      if (!isSubskill && !skill.noRanks) {
        if (doc.settings.isPathfinder || doc.settings.isStarfinder) {
          // log("skills", `Class skill checkbox at ${profile.classSkillMiddle}, line ${pos}`);
          // log("skills", "isClassSkill", skill);
          let isClassSkill = false;
          for (let cls of classes) {
            // log("skills", "isClassSkill", skill.name, "in", cls.name, cls.skills);
            if ('skills' in cls && cls.skills.includes(skill.name)) {
            // if (skill.classSkill[cls.name] || skill.classSkill[cls.baseName] || skill.classSkill[cls.shortName]) {
              isClassSkill = true;
            }
          }
          drawCheckbox(pos, profile.classSkillMiddle, isClassSkill);
        } else if (doc.settings.isDnD35) {
          let n = (pageInfo.variant == "more") ? 7 : 5;
          for (let i = 0; i < n; i++) {
            let cls = classes[i];
            let isClassSkill = (cls !== undefined && cls !== null && 'skills' in cls && skill.name in cls.skills); // skill.classSkill[doc.settings.classes[i]];
            drawCheckbox(pos, profile.classSkillMiddle + i * profile.classSkillIncrement, isClassSkill);
          }
        }
      }
     
      // Level bonuses
      let skillBonus = 0;
      let plusLevelClasses = new Set();
      let plusHalfLevelClasses = new Set();
      if (isSubskill || skill.noRanks) {
        if (skill.plusLevel) {
          plusLevelClasses.add({
            name: "Character"
          });
        } else if (skill.plusHalfLevel) {
          plusHalfLevelClasses.add({
            name: "Character"
          });
        }
      }

      for (let cls of classes) {
        // log("skills", "Class plus level", skill.name, "in", cls.name, cls.plusLevel, cls.plusHalfLevel);
        if ('skillBonus' in cls && skill.name in cls.skillBonus) {
          skillBonus += cls.skillBonus[skill.name];
        }
        if ('plusLevel' in cls && cls.plusLevel.includes(skill.name)) {
          plusLevelClasses.add(cls);
        }
        if ('plusHalfLevel' in cls && cls.plusHalfLevel.includes(skill.name)) {
          plusHalfLevelClasses.add(cls);
        }
      }

      // log("skills", "Skill bonus", skill.name, skillBonus);
      // log("skills", "Plus level", skill.name, "in", plusLevelClasses, plusHalfLevelClasses);

      if (plusLevelClasses.size > 0 || plusHalfLevelClasses.size > 0 || skillBonus > 0) {
        let [plusLevelPlusX, plusLevelX] = 
          isSubskill ? [profile.abilityMiddle - 6, profile.abilityMiddle + 14] :
            (skill.noRanks ? [profile.classSkillMiddle + 2.5, profile.ranksMiddle - 1.5] :
              [profile.ranksMiddle + 12, profile.ranksMiddle + 27]);

        if (skillBonus > 0) {
          doc.canvas.drawText("+ "+skillBonus+" +", {
            x: plusLevelPlusX - 3,
            y: baseline - 2,
            font: doc.altFont,
            size: 10.4,
            color: doc.textColour,
          });
        } else {
          doc.canvas.drawText("+", {
            x: plusLevelPlusX - 3,
            y: baseline - 2,
            font: doc.altFont,
            size: 10.4,
            color: doc.textColour,
          });
        }

        if (plusHalfLevelClasses.size > 0) {
          if (plusLevelClasses.size > 0) {
            doc.canvas.drawText("(", {
              x: plusLevelX - 10,
              y: baseline - 2,
              font: doc.altFont,
              size: 10.4,
              color: doc.textColour,
            });
            plusLevelX += 7;
          }

          for (let cls of plusHalfLevelClasses) {
            try {
              let shortName = ('baseName' in cls) ? cls.baseName : cls.name;
              shortName = shortName.replace(/^Unchained */, "").replace(/ *\\(.*\\)$/, "");
              let width = doc.textFont.widthOfTextAtSize(shortName, 6);
              plusLevelX += width / 2 + 1;
              doc.canvas.drawText(shortName, {
                x: plusLevelX - width / 2,
                y: baseline + 2.5,
                font: doc.textFont,
                size: 6,
                color: doc.fillColour,
                opacity: 0.5,
              });
              doc.canvas.drawText("Level", {
                x: plusLevelX - doc.textFont.widthOfTextAtSize("Level", 6) / 2,
                y: baseline - 2.5,
                font: doc.textFont,
                size: 6,
                color: doc.fillColour,
                opacity: 0.5,
              });
              plusLevelX += width / 2 + 1;
              
            } catch (e) {
              error("skills", "Plus level class", cls);
              error("skills", "Error", e);
            }
          }
          doc.canvas.drawText("÷ 2", {
            x: plusLevelX - 2,
            y: baseline - 2,
            font: doc.altFont,
            size: 10.4,
            color: doc.textColour,
          });
          plusLevelX += 9;
          
          if (plusLevelClasses.size > 0) {
            doc.canvas.drawText(")", {
              x: plusLevelX,
              y: baseline - 2,
              font: doc.altFont,
              size: 10.4,
              color: doc.textColour,
            });
            plusLevelX += 20;
          }
        }

        if (plusLevelClasses.size > 0) {
          for (let cls of plusLevelClasses) {
            let shortName = ('baseName' in cls) ? cls.baseName : cls.name;
            shortName = shortName.replace(/^Unchained */, "").replace(/ *\\(.*\\)$/, "");
            let width = doc.textFont.widthOfTextAtSize(shortName, 6);
            plusLevelX += width / 2 + 1;
            doc.canvas.drawText(shortName, {
              x: plusLevelX - width / 2,
              y: baseline + 2.5,
              font: doc.textFont,
              size: 6,
              color: doc.fillColour,
              opacity: 0.5,
            });
            doc.canvas.drawText("Level", {
              x: plusLevelX - doc.textFont.widthOfTextAtSize("Level", 6) / 2,
              y: baseline - 2.5,
              font: doc.textFont,
              size: 6,
              color: doc.fillColour,
              opacity: 0.5,
            });
            plusLevelX += width / 2 + 1;
          }
        }
      }

      // class-specific marks
      if (profile.isRanger || profile.isDruidWorldWalker) {
        // draw ranger favoured terrain circle
        if (skill.favouredTerrain) {
          let r = 4.6;
          doc.canvas.drawCircle({
            x: profile.favouredEnemyMiddle,
            y: baseline + 2,
            size: r,
            borderWidth: 1.2,
            borderColor: doc.textColour,
          });
        }
      }

      if (profile.isRanger) {
        // draw ranger favoured enemy sigil
        if (skill.favouredEnemy) {
          let r = 1.6;
          doc.canvas.drawRectangle({
            x: profile.favouredEnemyMiddle - r,
            y: baseline + 2 - r,
            width: r * 2,
            height: r * 2,
            color: doc.textColour,
          });
        }
      } else if (profile.isBarbarian) {
        try {
          if (skill.noRage) {
            // draw barbarian non-rage X
            // log("skills", "Barbarian: Profile", profile);
            let args = {
              x: profile.rageMiddle - 3,
              y: baseline - 1,
              font: doc.barbarianFont,
              size: 8,
              color: doc.black,
            };
            // log("skills", "args", args);
            doc.canvas.drawText("X", args);
          }
        } catch (e) {
          error("skills", "Error", e);
        }
      }

      // skill-specific bonuses
      function annotateSkill(sigil, line1, line2) {
        // log("skills", "Annotating", sigil, line1, line2);
        let x = profile.skillsAreaRight - profile.acpWidth + 3;
        doc.canvas.drawText(sigil, {
          x: x - 10,
          y: baseline - 1,
          font: doc.textFont,
          size: 8,
          color: doc.textColour,
        });
        doc.canvas.drawText(line1, {
          x: x,
          y: baseline + 3,
          font: doc.textFont,
          size: 4.5,
          color: doc.textColour,
        });
        doc.canvas.drawText(line2, {
          x: x,
          y: baseline - 2,
          font: doc.textFont,
          size: 4.5,
          color: doc.textColour,
        })
      }

      if (doc.settings.isPathfinder) {
        // log("skills", "Original name", skill.name);
        if (skill.name == "Intimidate") annotateSkill("±4", "if larger/", "smaller");
      } else if (doc.settings.isDnD35) {
        if (skill.name == "Intimidate") annotateSkill("+", "size", "diff x4");
        if (skill.name == "Hide") annotateSkill("+", "size", "mod x4");
        if (skill.name == "Swim") annotateSkill("-1", "per 5lb", "carried");
      }
      
      // Armour Check Penalty
      if (profile.isCorePage && skill.acp) {
        let acpLeft = profile.skillsAreaRight - profile.acpWidth;
        doc.canvas.drawText("-", {
          x: profile.skillsAreaRight - profile.acpWidth - 8,
          y: baseline - 1,
          font: doc.textFont,
          size: attrFontSize + 3,
          color: doc.textColour,
        });

        // if (doc.settings.isDnD35) log("skills", "Is skill double?", skill);
        let isAcpDouble = doc.settings.isDnD35 && skill.name == "Swim";

        doc.canvas.drawRectangle({
          x: acpLeft,
          y: baseline + profile.lineBottomOffset,
          width: profile.acpWidth,
          height: profile.lineBoxHeight,
          borderWidth: isAcpDouble ? 1 : 0.5,
          borderColor: doc.textColour,
          borderDashArray: [2, 2],
          borderDashPhase: 0,
        });

        if (isAcpDouble) {
          doc.canvas.drawText("×2", {
            x: profile.skillsAreaRight - 10,
            y: baseline - 1,
            font: doc.textFont,
            size: skillFontSize,
            color: doc.textColour,
          });
        }
      }

    }
  }

  // draw a line between core and extra skills
  async function drawFold(pos) {
    let liney = profile.firstLine + (pos - 1) * profile.lineIncrement + profile.lineBottomOffset;

    doc.canvas.drawLine({
      start: { x: profile.skillsAreaLeft, y: liney },
      end: { x: profile.skillsAreaRight, y: liney },
      thickness: 1,
      color: doc.textColour,
      opacity: 1,
    });
  }

  // do it!
  let pos = 0;
  let foldWritten = false;
  for (let skill of topSkills) {
    if (skill.afterFold && !foldWritten) {
      drawFold(pos);
      foldWritten = true;
    }

    writeSkillLine(pos, skill, false);
    pos++;

    if (has(subskillsBySkill, skill.name)) {
      subSkills = sortSkills(subskillsBySkill[skill.name]);
      for (let subSkill of subSkills) {
        writeSkillLine(pos, subSkill, true);
        pos++;
      }
    }
  }

  // fill in the blanks
  while (pos < profile.numSlots) {
    drawCheckbox(pos, profile.useUntrainedMiddle, false);
    drawCheckbox(pos, profile.classSkillMiddle, false);
    pos++;
  }
}

module.exports = {
  writeSkills
}
