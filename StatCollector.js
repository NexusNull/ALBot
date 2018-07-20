/**
 * Created by Nexus on 12.11.2017.
 *
 */

var StatCollector = function (characterName) {
    this.stats = {
        beginTime: (new Date().getTime() / 1000) | 0,
        kills: {},
        playerKills: {},
        deaths: 0,
        items: {},
        upgrades: {},
        compounds: {},
        xp: 0,
        gold: 0,
    };
};

StatCollector.prototype.killed = function (creatureName, isPlayer) {
    if (typeof isPlayer === "undefined")
        isPlayer = false;

    if (isPlayer)
        this.stats.playerKills[creatureName] = (this.stats.playerKills[creatureName]) ? this.stats.playerKills[creatureName] + 1 : 1;
    else
        this.stats.kills[creatureName] = (this.stats.kills[creatureName]) ? this.stats.kills[creatureName] + 1 : 1;
};

StatCollector.prototype.gainedItem = function (item) {
    this.stats.items[item] = (this.stats.items[item]) ? this.items.items[item] + 1 : 1;
};

StatCollector.prototype.gainedGold = function (amount) {
    this.stats.gold = (this.stats.gold) ? this.items.gold + amount : amount;
};

StatCollector.prototype.gainedXp = function (amount) {
    this.stats.xp = (this.stats.xp) ? this.items.xp + amount : amount;
};

StatCollector.prototype.died = function () {
    this.stats.deaths = (this.stats.deaths) ? this.items.deaths + 1 : 1;
};

StatCollector.prototype.resetStats = function () {
    this.stats = {
        beginTime: (new Date().getTime() / 1000) | 0,
        kills: {},
        playerKills: {},
        deaths: 0,
        items: {},
        upgrades: {},
        compounds: {},
        xp: 0,
        gold: 0,
    };
};

StatCollector.prototype.upgrade = function (itemName, level, success) {
    if (!this.stats.upgrades[itemName]) {
        this.stats.upgrades[itemName] = {};
        for (let i = 1; i < 12; i++) {
            this.stats.upgrades[itemName][i] = {sucess: 0, fail: 0};
        }
    }

    this.stats.upgrades[itemName][level][(success) ? "success" : "fail"]++;
};

StatCollector.prototype.compound = function (itemName, level, success) {
    if (!this.stats.compounds[itemName]) {
        this.stats.compounds[itemName] = {};
        for (let i = 1; i < 12; i++) {
            this.stats.compounds[itemName][i] = {sucess: 0, fail: 0};
        }
    }
    this.stats.compounds[itemName][level][(success) ? "success" : "fail"]++;
};


module.exports = StatCollector;