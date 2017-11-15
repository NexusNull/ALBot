/**
 * Created by Nexus on 12.11.2017.
 *
 */

var StatCollector = function () {
    this.stats = {};
    this.characters = [];
};

StatCollector.prototype.killed = function (characterName, creatureName, isPlayer) {
    if (typeof isPlayer == "undefined")
        isPlayer = false;

    if (!this.stats[characterName]) {
        this.createSkeleton(characterName);
    }

    if (isPlayer)
        this.stats[characterName].kills[creatureName] = (this.stats[characterName].kills[creatureName]) ? this.stats[characterName].kills[creatureName] + 1 : 1;
    else
        this.stats[characterName].playerKills[creatureName] = (this.stats[characterName].playerKills[creatureName]) ? this.stats[characterName].playerKills[creatureName] + 1 : 1;
};

StatCollector.prototype.gainedItem = function (characterName, item) {
    if (!this.stats[characterName]) {
        this.createSkeleton(characterName);
    }

    this.stats[characterName].items[item] = (this.stats[characterName].items[item]) ? this.items[characterName].items[item] + 1 : 1;
};

StatCollector.prototype.gainedGold = function (characterName, amount) {
    if (!this.stats[characterName]) {
        this.createSkeleton(characterName);
    }
    this.stats[characterName].gold = (this.stats[characterName].gold) ? this.items[characterName].gold + amount : amount;
};

StatCollector.prototype.gainedXp = function (characterName, amount) {
    if (!this.stats[characterName]) {
        this.createSkeleton(characterName);
    }

    this.stats[characterName].xp = (this.stats[characterName].xp) ? this.items[characterName].xp + amount : amount;
};

StatCollector.prototype.died = function (characterName) {
    if (!this.stats[characterName]) {
        this.createSkeleton(characterName);
    }

    this.stats[characterName].deaths = (this.stats[characterName].deaths) ? this.items[characterName].deaths + 1 : 1;
};

StatCollector.prototype.resetStats = function (characterName) {
    if (!this.stats[characterName]) {
        this.createSkeleton(characterName);
    }

    delete this.stats[characterName];
};

StatCollector.prototype.upgrade = function(characterName, itemName, level, success){
    if (!this.stats[characterName]) {
        this.createSkeleton(characterName);
    }
    if(!this.stats[characterName].upgrades[itemName]){
        this.stats[characterName].upgrades[itemName] = {};
        for(let i=1;i<12;i++){
            this.stats[characterName].upgrades[itemName][i] = {sucess:0,fail:0};
        }
    }

    this.stats[characterName].upgrades[itemName][level][(success)?"success":"fail"]++;

};

StatCollector.prototype.compound = function(characterName, itemName, level, success){
    if (!this.stats[characterName]) {
        this.createSkeleton(characterName);
    }
    if(!this.stats[characterName].compounds[itemName]){
        this.stats[characterName].compounds[itemName] = {};
        for(let i=1;i<12;i++){
            this.stats[characterName].compounds[itemName][i] = {sucess:0,fail:0};
        }
    }

    this.stats[characterName].compounds[itemName][level][(success)?"success":"fail"]++;

};

StatCollector.prototype.createSkeleton = function (characterName) {
    this.stats[characterName] = {
        beginTime: (new Date().getTime()/1000) | 0,
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
