const { log, error } = require('../log.js');

class SkillsProfile {
  /*
  firstLine, lineIncrement, lineBottomOffset, lineBoxHeight, skillsAreaLeft, skillsAreaRight, 
    skillNameLeft, skillNameIndent, abilityMiddle, abilityOffset, ranksMiddle,
    useUntrainedMiddle, classSkillMiddle, classSkillIncrement, acpWidth, numSlots,
    rageMiddle, favouredEnemyMiddle
  */
  constructor(args) {
    Object.assign(this, {
      // defaults
      abilityMiddle: 0, abilityOffset: 0,
      ranksMiddle: 0, useUntrainedMiddle: 0,
      classSkillMiddle: 0, classSkillIncrement: 0,
      lineBottomOffset: -4.5,
      acpWidth: 0, numSlots: 0,
      rageMiddle: 0, favouredEnemyMiddle: 0,
      ...args,
    });

  }
}

function getSkillsProfile(pageInfo, settings) {
  let isBarbarian, isRanger, isDruidWorldWalker, isMore, isSimple;

  switch (pageInfo.slot) {
    case "party":
      return new SkillsProfile({
        firstLine: 496,
        lineIncrement: -13.55,
        skillsAreaLeft: 28,
        skillsAreaRight: (page.variant == "10") ? 39.5 : 40,
        skillNameLeft: 30,
        skillNameIndent: 16,
      });

    case "animalcompanion":
      return new SkillsProfile({
        firstLine: settings.isPathfinder ? 469 : 445,
        lineIncrement: -15,
        skillsAreaLeft: 189,
        skillsAreaRight: 300,
        skillNameLeft: 191,
        skillNameIndent: 16,
      });

    case "npc":
      switch (settings.game) {
        case "starfinder":
          return new SkillsProfile({
            firstLine: 281,
            lineIncrement: -13.7,
            skillsAreaLeft: 189,
            skillsAreaRight: 300,
            skillNameLeft: 191,
            skillNameIndent: 16,
          });
        default:
          return new SkillsProfile({
            firstLine: 512,
            lineIncrement: -13.7,
            skillsAreaLeft: 189,
            skillsAreaRight: 300,
            skillNameLeft: 191,
            skillNameIndent: 16,
          })
      }

    case "npc-group":
      return new SkillsProfile({
        firstLine: 452.25,
        lineIncrement: -13.55,
        skillsAreaLeft: 28,
        skillsAreaRight: 40,
        skillNameLeft: 30,
        skillNameIndent: 16,
      });

    case "eidolon":
    case "spiritual-phantom":
      return new SkillsProfile({
        firstLine: 616,
        lineIncrement: -13.51,
        lineBoxHeight: 13,
        skillsAreaLeft: 232,
        skillsAreaRight: 567,
        skillNameLeft: 234,
        skillNameIndent: 16,
        abilityMiddle: 420,
        abilityOffset: -1,
        ranksMiddle: 465,
        useUntrainedMiddle: 366,
        classSkillMiddle: 445,
        classSkillIncrement: 10,
        rageMiddle: 524,
        favouredEnemyMiddle: 524,
        acpWidth: 24,
        numSlots: 43
      });

    case "drone":
      return new SkillsProfile({
        firstLine: 196,
        lineIncrement: -13.51,
        skillsAreaLeft: 189,
        skillsAreaRight: 300,
        skillNameLeft: 191,
        skillNameIndent: 16,
        abilityMiddle: 354,
        abilityOffset: -1,
        useUntrainedMiddle: 290,
        classSkillMiddle: 332.5,
        classSkillIncrement: 10,
      })

    case "core":
      switch (settings.game) {
        case "pathfinder":
          isBarbarian = pageInfo.variant == "barbarian";
          isRanger = pageInfo.variant == "ranger";
          isDruidWorldWalker = pageInfo.variant == "worldwalker";
          
          return new SkillsProfile({
            isCorePage: true,
            isBarbarian,
            isRanger,
            isDruidWorldWalker,

            firstLine: 603,
            lineIncrement: -13.51,
            lineBoxHeight: 13,
            skillsAreaLeft: 231,
            skillsAreaRight: 567,

            skillNameLeft: 233,
            skillNameIndent: 16,
            abilityMiddle: 
              (isBarbarian ? 395 : 
                (isRanger ? 388 :
                  (isDruidWorldWalker ? 390 : 410))),
                  
            abilityOffset: -1,

            ranksMiddle: 
              (isBarbarian ? 448 :
                (isRanger || isDruidWorldWalker ? 443 : 465)),

            useUntrainedMiddle:
              (isBarbarian ? 341 :
                (isRanger ? 335 :
                  (isDruidWorldWalker ? 336 : 356))),

            classSkillMiddle:
              (isBarbarian ? 419 :
                (isRanger ? 413 :
                  (isDruidWorldWalker ? 414 : 435))),
            classSkillIncrement: 10,

            rageMiddle: 524,
            favouredEnemyMiddle: 524,
            acpWidth: 24,
            numSlots: 43
          });

        case "dnd35":
          isBarbarian = pageInfo.variant == "barbarian";
          isRanger = pageInfo.variant == "ranger";
          isMore = pageInfo.variant == "more";
          isSimple = pageInfo.variant == "simple";

          return new SkillsProfile({
            isCorePage: true,
            isBarbarian,
            isRanger,
            isDruidWorldWalker,
            isSimple,

            firstLine:
              (isSimple ? 615 :
                (isMore ? 588 : 617)),
            lineIncrement: -13.51,
            lineBoxHeight: 13,
      
            skillsAreaLeft: 231,
            skillsAreaRight: 567,
      
            skillNameLeft: 233,
            skillNameIndent: 16,
            abilityMiddle:
                (isMore ? 370 : 383),
            abilityOffset: -1,
      
            ranksMiddle:
              (isMore ? 455 : 465),
      
            useUntrainedMiddle:
              (isMore ? 317 : 330),
            classSkillMiddle:
              (isMore ? 384 : 397.7),
            classSkillIncrement: 8,
      
            rageMiddle: 524,
            favouredEnemyMiddle: 524,
            acpWidth: 24,
      
            numSlots:
              (isMore ? 42 : 44),
          });

        case "starfinder":
          return new SkillsProfile({
            isCorePage: true,

            firstLine: 386.6,
            lineIncrement: -13.51,
            lineBottomOffset: -4.3,
            lineBoxHeight: 13,
      
            skillsAreaLeft: 231,
            skillsAreaRight: 567,
            skillNameLeft: 233,
            skillNameIndent: 16,
            abilityMiddle: 398,
            abilityOffset: -1,
      
            ranksMiddle: 440.25,
            useUntrainedMiddle: 345,
            classSkillMiddle: 449,
            classSkillIncrement: 8,
            rageMiddle: 0,
            favouredEnemyMiddle: 0,
            acpWidth: 24,
      
            numSlots: 27,
          });
      }
  }

  error("SkillsProfile", `Unknown skill profile: game = ${settings.game} slot = ${pageInfo.slot}, variant = ${pageInfo.variant}`);
  return null;
}

module.exports = {
  SkillsProfile,
  getSkillsProfile
}
