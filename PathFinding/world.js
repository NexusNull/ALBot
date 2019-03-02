/**
 * Created by nexus on 31/03/17.
 */
const fs = require("fs");
var G = {
    geometry: {}
};
var canMove;
(function () {
    var common_functions = fs.readFileSync("./modedGameFiles/common_functions.js") + "";
    eval(common_functions);
    canMove = can_move;
})();


/**
 *
 * @param name
 * @param size
 * @param position
 * @param boxSize
 * @param spawns
 * @param doors
 * @param map
 * @constructor
 */
var World = function ({name, size, position, boxSize, spawns, doors, rasterMap,nodeMap, geo, lines}) {
    this.name = name;
    this.size = size;
    this.position = position;
    this.boxSize = boxSize;
    this.spawns = spawns;
    this.doors = doors;
    this.map = rasterMap;
    this.geometry = geo;
    this.nodeMap = nodeMap;
    this.lines = lines;
    this.meta = {
        rasterMapCount: 0,
        quickTravelMapNodeCount: 0,
        quickTravelMapEdgeCount: 0
    };
    G.geometry[name] = geo;
    this.overlay = Array(this.size.x * this.size.y);
};

World.prototype.get = function (x, y) {
    if (this.size.y <= y || y < 0)
        return null;
    if (this.size.x <= x || x < 0)
        return null;

    if (this.overlay[x + y * this.size.x]) {
        return this.overlay[x + y * this.size.x];
    } else {
        let tmp = {
            pos: {x, y},
            cost: this.map[x + y * this.size.x],
        };
        this.overlay[x + y * this.size.x] = tmp;
        return tmp;
    }
};

World.prototype.open = function (x, y) {
    this.overlay[x + y * this.size.x].open = true;
};

World.prototype.resetOverlay = function () {
    this.overlay = Array(this.size.y * this.size.x);
};


World.prototype.canMoveTo = function (x1, y1, x2, y2) {
    return (function (x1, y1, x2, y2, lines) {
        let x = Math.min(x1, x2);
        let y = Math.min(y1, y2);
        let X = Math.max(x1, x2);
        let Y = Math.max(y1, y2);

        for (let i = bSearch(x, lines.x_lines); i < lines.x_lines.length; i++) {
            let line = lines.x_lines[i];
            if (line[0] > X)
                break;
            let y_com = ((y2 - y1) / (x2 - x1)) * (line[0] - x1);
            if (y_com + y1 < line[2] && y_com + y1 > line[1])
                return false;
        }
        for (let i = bSearch(y, lines.y_lines); i < lines.y_lines.length; i++) {
            let line = lines.y_lines[i];
            if (line[0] > Y)
                break;
            let x_com = ((x2 - x1) / (y2 - y1)) * (line[0] - y1);
            if (x_com + x1 < line[2] && x_com + x1 > line[1])
                return false;
        }
        return true;
    }(x1, y1, x2, y2, this.lines));

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
};
World.prototype.canMapMoveTo = function (x1, y1, x2, y2) {
    return this.canMoveTo(
        (x1 * this.boxSize + this.position.x),
        (y1 * this.boxSize + this.position.y),
        (x2 * this.boxSize + this.position.x),
        (y2 * this.boxSize + this.position.y))
};

World.prototype.toGameMapCoordinates = function (pos) {
    return {
        x: (pos.x * this.boxSize + this.position.x),
        y: (pos.y * this.boxSize + this.position.y)
    };
};
World.prototype.toMapCoordinates = function (pos) {
    return {
        x: Math.floor((pos.x - this.position.x) / this.boxSize),
        y: Math.floor((pos.y - this.position.y) / this.boxSize)
    };
};
module.exports = World;