const pngUtil = require("./pngUtil");
const config = require("../userData").config;
const PNG = require('pngjs').PNG;

function clamp(x, low, high) {
    return Math.min(Math.max(x, low), high);
}

function bSearch(search, arr) {
    let low = 0, high = arr.length - 1;
    while (low + 1 !== high) {
        let mid = Math.floor((low + high) / 2);
        if (arr[mid][0] >= search) {
            high = mid;
        } else {
            low = mid;
        }
    }
    return high;
}

function get(from, what) {
    if (from === undefined || from === null)
        return undefined;
    let current = from;
    do {
        try {
            let index = what.splice(0, 1)[0];
            current = current[index]
        } catch (e) {
            console.log(e);
        }
    } while (!(current === undefined) && what.length !== 0);
    return current;
}

let uiGenerator = function () {
    this.miniMapHeight = get(config, ["botWebInterface", "minimap", "size", "height"]) || 200;
    this.miniMapWidth = get(config, ["botWebInterface", "minimap", "size", "width"]) || 376;
    this.enableMiniMap = get(config, ["botWebInterface", "minimap", "enabled"]) || false;
    this.enableBotWebInterface = get(config, ["botWebInterface", "enabled"]) || false;
    this.updateTiming = get(config, ["botWebInterface", "minimap", "speed"]) || 1000;

    this.defaultStructure = [
        {name: "name", type: "text", label: "name"},
        {name: "inv", type: "text", label: "Inventory"},
        {name: "level", type: "text", label: "Level"},
        {name: "gold", type: "text", label: "Gold"},
        {name: "xp", type: "progressBar", label: "Experience", options: {color: "green"}},
        {name: "health", type: "progressBar", label: "Health", options: {color: "red"}},
        {name: "mana", type: "progressBar", label: "Mana", options: {color: "blue"}},
        {name: "targets", type: "botUI", label: "Targets"},
        {name: "status", type: "text", label: "Status"},
        {name: "dps", type: "text", label: "Damage/s"},
        {name: "gph", type: "text", label: "Gold/h"},
        {name: "xpph", type: "text", label: "XP/h"},
        {name: "tlu", type: "text", label: "TLU"},
        {name: "party_leader", type: "text", label: "Party Leader"}
    ];

    if (this.enableMiniMap) {
        this.defaultStructure.push({
            name: "minimap", type: "image", label: "Minimap", options:
                {width: this.miniMapWidth, height: this.miniMapHeight}
        })
    }
};

uiGenerator.prototype.getDefaultStructure = function () {
    return this.defaultStructure;
};

uiGenerator.prototype.generateMiniMap = function (hitLog, entities) {
    //Minimap creation
    var png = new PNG({
        width: this.miniMapWidth,
        height: this.miniMapHeight,
        filterType: -1
    });
    for (let j = 0; j < Math.floor(png.data.length / 4); j++) {
        let idx = j << 2;
        png.data[idx] = 5;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 255;
    }
    var screenSize = {width: 800, height: 600};
    var pos = {
        x: character.real_x - Math.floor(screenSize.width / 2),
        y: character.real_y - Math.floor(screenSize.height / 2)
    };
    var map = character.in;

    if (G.maps[map]) {
        let xLines = G.maps[map].data.x_lines;
        let yLines = G.maps[map].data.y_lines;

        for (let i = bSearch(pos.x, xLines); i < xLines.length && xLines[i][0] < pos.x + screenSize.width; i++) {
            let line = xLines[i];
            let x = ((line[0] - pos.x) / screenSize.width) * png.width;
            let y1 = ((line[1] - pos.y) / screenSize.height) * png.height;
            let y2 = ((line[2] - pos.y) / screenSize.height) * png.height;
            pngUtil.draw_line(x, y1, x, y2, png, [255, 255, 255, 255]);
        }

        for (let i = bSearch(pos.y, yLines); i < yLines.length && yLines[i][0] < pos.y + screenSize.height; i++) {
            let line = yLines[i];
            let y = ((line[0] - pos.y) / screenSize.height) * png.height;
            let x1 = ((line[1] - pos.x) / screenSize.width) * png.width;
            let x2 = ((line[2] - pos.x) / screenSize.width) * png.width;
            pngUtil.draw_line(x1, y, x2, y, png, [255, 255, 255, 255]);
        }
    }
    // draw hit lines
    for (let hit of hitLog) {
        let source = entities[hit.hid];
        let target = entities[hit.id];
        if (hit.hid === character.id)
            source = character;
        if (hit.id === character.id)
            target = character;

        if (source && target) {
            let color = [255, 255, 255, 255];
            if (hit.anim === "heal") {
                color = [0, 250, 0, 255];
            } else
                color = [250, 0, 0, 255];
            pngUtil.draw_line(
                ((source.real_x - pos.x) / screenSize.width) * png.width,
                ((source.real_y - pos.y) / screenSize.height) * png.height,
                ((target.real_x - pos.x) / screenSize.width) * png.width,
                ((target.real_y - pos.y) / screenSize.height) * png.height,
                png, [200, 0, 0, 255]);
        }
    }
    //draw entities
    if (entities) {
        for (let id in entities) {
            let entity = entities[id];
            let color = [255, 255, 255, 255];
            if (entity.type === "monster") {
                if (!entity.dead) {
                    color = [200, 0, 0, 255];
                } else {
                    color = [100, 100, 100, 255];
                }
            } else {
                if (entity.npc) {
                    color = [224, 221, 38, 255];
                } else {
                    color = [38, 159, 224, 255];
                }
            }

            pngUtil.draw_dot(
                ((entity.real_x - pos.x) / screenSize.width) * png.width,
                ((entity.real_y - pos.y) / screenSize.height) * png.height,
                2,
                png, color);
            if (entity.hp && !(entity.hp<=0) && !entity.dead) {
                let percentage = Math.max(Math.min(Math.floor((entity.hp/entity.max_hp)*11),11),1);
                let startX = ((entity.real_x - pos.x) / screenSize.width) * png.width - 5;
                pngUtil.draw_line(
                    ((entity.real_x - pos.x) / screenSize.width) * png.width - 5,
                    ((entity.real_y - pos.y) / screenSize.height) * png.height - 3,
                    ((entity.real_x - pos.x) / screenSize.width) * png.width + 5,
                    ((entity.real_y - pos.y) / screenSize.height) * png.height - 3,
                    png,
                    [100, 100, 100, 255]
                );
                pngUtil.draw_line(
                    startX,
                    ((entity.real_y - pos.y) / screenSize.height) * png.height - 3,
                    startX+percentage,
                    ((entity.real_y - pos.y) / screenSize.height) * png.height - 3,
                    png,
                    [255, 0, 0, 255]
                );
            }
        }
    }

    var targetIds = [];
    if (character.target)
        targetIds.push(character.target);
    for (let id in entities) {
        let entity = entities[id];
        if (entity.target === character.id)
            if (!targetIds.includes(entity.id))
                targetIds.push(entity.id);
    }

    var targets = [];
    for (let id of targetIds) {
        if (entities[id])
            targets.push({
                name: entities[id].name,
                health: Math.floor(entities[id].hp * 10000 / entities[id].max_hp) / 100,
                level: entities[id].level,
            })
    }


    //draw character
    pngUtil.draw_dot(
        ((character.real_x - pos.x) / screenSize.width) * png.width,
        ((character.real_y - pos.y) / screenSize.height) * png.height,
        2,
        png, [0, 200, 0, 255]);


    return PNG.sync.write(png);
};


module.exports = new uiGenerator();

