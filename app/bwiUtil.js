const UIGenerator = require("./UIGenerator");

function toPrettyNum(a) {
    if (!a) {
        return "0"
    }
    a = Math.round(a);
    let sign = false;
    if (a < 0) {
        a = -1 * a;
        sign = true;
    }
    var b = "";
    while (a) {
        var c = a % 1000;
        if (!c) {
            c = "000"
        } else {
            if (c < 10 && c != a) {
                c = "00" + c
            } else {
                if (c < 100 && c != a) {
                    c = "0" + c
                }
            }
        }
        if (!b) {
            b = c
        } else {
            b = c + "," + b
        }
        a = (a - a % 1000) / 1000
    }
    return (sign ? "-" : "") + b
}


function registerListeners(gameContext) {
    let uiGenerator = new UIGenerator(gameContext)
    var damage = 0;
    var timeFrame = 60 * 5;
    var goldTimeline = [],
        xpTimeline = [],
        damageTimeline = [];
    gameContext.socket.on("hit", function (data) {
        if (data.hid && data.damage && gameContext.character) {
            if (data.hid == gameContext.character.id) {
                damage += data.damage;
            }
        }
    });
    var hitLog = [];
    gameContext.socket.on("hit", function (data) {
        hitLog.push(data);
    });
    if (uiGenerator.enableMiniMap)
        setInterval(function () {
            let buffer = uiGenerator.generateMiniMap(hitLog, gameContext.entities);
            hitLog = [];
            process.send({
                type: "bwiPush",
                name: "minimap",
                data: "data:image/png;base64," + buffer.toString("base64"),
            });
        }, uiGenerator.updateTiming);
    if (uiGenerator.enableBotWebInterface)
        setInterval(function () {
            if(!gameContext.character)
                return;
            var targetName = "nothing";
            if (gameContext.character.target && gameContext.entities[gameContext.character.target]) {
                if (gameContext.entities[gameContext.character.target].player) {
                    targetName = gameContext.entities[gameContext.character.target].id
                } else {
                    targetName = gameContext.entities[gameContext.character.target].mtype;
                }
            }
            //calculate damage per second
            damageTimeline.push(damage);
            var thenDamage;
            if (damageTimeline.length < timeFrame)
                thenDamage = damageTimeline[0];
            else
                thenDamage = damageTimeline.shift();
            var dps = (damage - thenDamage) / damageTimeline.length;
            //calculate gold per second
            goldTimeline.push(gameContext.character.gold);
            var thenGold;
            if (goldTimeline.length < timeFrame)
                thenGold = goldTimeline[0];
            else
                thenGold = goldTimeline.shift();
            var gps = (gameContext.character.gold - thenGold) / goldTimeline.length;
            //calculate xp per second
            xpTimeline.push(gameContext.character.xp);
            var thenXP;
            if (xpTimeline.length < timeFrame)
                thenXP = xpTimeline[0];
            else
                thenXP = xpTimeline.shift();
            var xpps = (gameContext.character.xp - thenXP) / xpTimeline.length;
            //calculate time until level up
            let time = Math.floor((gameContext.character.max_xp - gameContext.character.xp) / xpps);
            if (time > 0) {
                //prettify time
                let tmpTime = time;
                var days = Math.floor(tmpTime / (3600 * 24)) || 0;
                tmpTime -= 3600 * 24 * days;
                var hours = Math.floor(tmpTime / 3600) || 0;
                tmpTime -= 3600 * hours;
                var minutes = Math.floor(tmpTime / 60) || 0;
                tmpTime -= 60 * minutes;
                var seconds = tmpTime || 0;
                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
            }
            process.send({
                type: "bwiUpdate",
                data: {
                    name: gameContext.character.id,
                    level: gameContext.character.level,
                    inv: [(gameContext.character.isize - gameContext.character.esize) / gameContext.character.isize,
                        gameContext.character.isize - gameContext.character.esize + " / " + gameContext.character.isize],
                    xp: Math.floor(gameContext.character.xp * 10000 / gameContext.character.max_xp) / 100,
                    health: Math.floor(gameContext.character.hp * 10000 / gameContext.character.max_hp) / 100,
                    mana: Math.floor(gameContext.character.mp * 10000 / gameContext.character.max_mp) / 100,
                    status: gameContext.character.rip ? "Dead" : "Alive",
                    gold: toPrettyNum(gameContext.character.gold),
                    dps: Math.floor(dps),
                    gph: toPrettyNum(Math.floor(gps) * 3600),
                    xpph: toPrettyNum(Math.floor(xpps) * 3600),
                    tlu: (time > 0) ? days + "d " + hours + ":" + minutes + ":" + seconds : "Infinity",
                    party_leader: gameContext.character.party || "N/A",
                    realm: gameContext.server_region + gameContext.server_identifier,
                }
            })

        }, 1000);
}

exports.registerListeners = registerListeners;