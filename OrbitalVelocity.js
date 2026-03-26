import { ExponentialCost, FreeCost, LinearCost, StepwiseCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "orbital_velocity";
var name = "Orbital Velocity";
var description = "This theory is about space, specifically about the velocity needed to orbit a celestial body. With many upgrades and achievements, this theory is sure to be out of this world!";
var authors = "Ze Door";
var version = 1;

var currency;
var r, M, G, r_dot;
var rExp, MExp;
var t = BigNumber.ZERO;

var achievement1, achievement2;
var chapter1, chapter2;

var init = () => {
    currency = theory.createCurrency();

    ///////////////////
    // Regular Upgrades

    // r
    {
        let getDesc = (level) => "c=" + getr(level).toString(0);
        c = theory.createUpgrade(0, currency, new FirstFreeCost(new ExponentialCost(5, Math.log2(2))));
        c.getDescription = (_) => Utils.getMath(getDesc(c.level));
        c.getInfo = (amount) => Utils.getMathTo(getDesc(c.level), getDesc(c.level + amount));
    }

    // m
    {
        let getDesc = (level) => "M=2^{" + level + "}";
        M = theory.createUpgrade(1, currency, new ExponentialCost(5, 2));
        M.getDescription = (_) => Utils.getMath(getDesc(M.level));
        M.getInfo = (amount) => Utils.getMathTo(getDesc(M.level), getDesc(M.level + amount));
    }
    /////////////////////   
    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    ///////////////////////
    //// Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(25, 25));

    {
        cExp = theory.createMilestoneUpgrade(0, 3);
        cExp.description = Localization.getUpgradeIncCustomExpDesc("c", "0.05");
        cExp.info = Localization.getUpgradeIncCustomExpInfo("c", "0.05");
        cExp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }

    {
        MExp = theory.createMilestoneUpgrade(1, 3);
        MExp.description = Localization.getUpgradeIncCustomExpDesc("M", "0.05");
        MExp.info = Localization.getUpgradeIncCustomExpInfo("M", "0.05");
        MExp.boughtOrRefunded = (_) => theory.invalidatePrimaryEquation();
    }
    
    /////////////////
    //// Achievements
    achievement1 = theory.createAchievement(0, "Achievement 1", "Description 1", () => c.level > 1);
    achievement2 = theory.createSecretAchievement(1, "Achievement 2", "Description 2", "Maybe you should buy two levels of M?", () => M.level > 1);

    ///////////////////
    //// Story chapters
    chapter1 = theory.createStoryChapter(0, "My First Chapter", "This is line 1,\nand this is line 2.\n\nNice.", () => c.level > 0);
    chapter2 = theory.createStoryChapter(1, "My Second Chapter", "This is line 1 again,\nand this is line 2... again.\n\nNice again.", () => M.level > 0);

    updateAvailability();
}

var updateAvailability = () => {
    MExp.isAvailable = cExp.level > 0;
}


var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    currency.value += dt * bonus * getr(M.level).pow(getrExponent(MExp.level)) * getM(c.level).pow(getMExponent(cExp.level));
    let t = dt;
}

var getPrimaryEquation = () => {
    let result = "E = M";

    if (MExp.level == 1) result += "^{1.05}";
    if (MExp.level == 2) result += "^{1.1}";
    if (MExp.level == 3) result += "^{1.15}";

    result += "c";

    if (cExp.level == 1) result += "^{1.05}";
    if (cExp.level == 2) result += "^{1.1}";
    if (cExp.level == 3) result += "^{1.15}";

    return result;
}

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho";
var getTertiaryEquation = () => "\\dot{\\rho} = E";
var getQuaternaryEquation = () => t;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{2}}{3}";
var getTau = () => currency.value.pow(0.8);
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

var getr = (level) => Utils.getStepwisePowerSum(level, 2, 10, 0);
var getM = (level) => BigNumber.TWO.pow(level);
var getrExponent = (level) => BigNumber.from(1 + 0.05 * level);
var getMExponent = (level) => BigNumber.from(1 + 0.05 * level);

init();