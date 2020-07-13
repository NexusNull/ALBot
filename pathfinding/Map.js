/**
 * Created by nexus on 31/03/17.
 */
const output = require("./output");
const optimizer = new (require("./mapPreprocessor"))();
/**
 *
 * @param name
 * @param {object} size
 * @param {int} size.x
 * @param {int} size.y
 * @param {int} keenness
 * @constructor
 */
var Map = function (name, size, keenness) {
    this.name = name;
    this.size = size;
    this.base = new Int8Array(size.x * size.y).fill(0);
    this.meshes = {
        base: this.base,
        boxMap: new Int16Array(size.x * size.y).fill(0)
    };
    this.meta = {
        rasterMapCount: 0,
        quickTravelMapNodeCount: 0,
        quickTravelMapEdgeCount: 0
    };

    this.keenness = keenness;
    this.offset = {x: 0, y: 0};
    this.spawns = null;
    this.doors = null;
    this.x_lines = [];
    this.y_lines = [];
    this.optimizedLines = null;
    this.isPVP = false;
    this.monsters = [];
    this.traps = [];
    this.items = [];
    this.qtn = null;
    this.qtg = null;
};

Map.prototype.setOffset = function (x, y) {
    this.offset.x = x;
    this.offset.y = y;
};

Map.prototype.setDoors = function (doors) {
    this.doors = doors;
};

Map.prototype.setSpawns = function (spawns) {
    this.spawns = spawns;
};

Map.prototype.setWalls = function (x_lines, y_lines) {
    this.x_lines = x_lines;
    this.y_lines = y_lines;
};

Map.prototype.setPvP = function (pvp) {
    this.isPVP = !!pvp;
};

Map.prototype.setMonsters = function (monsters) {
    this.monsters = monsters;
};

Map.prototype.setTraps = function (traps) {
    this.traps = traps;
};

Map.prototype.setItems = function (items) {
    this.items = items;
};

Map.prototype.optimize = function () {
    optimizer.setCollisionBoxes(this);
    optimizer.discoverWalkableArea(this);
    optimizer.optimizeXYLines(this);
    optimizer.createBoxMap(this);
    optimizer.createBoxNeighborMap(this);
    //output.draw_funny_boxes(this);
    //let png = output.draw_base(this.base, this.size, this.name+".png");
    //png = output.draw_lines(png, this);
    //output.save(png,this.name+".png")
};

Map.serialize = function (map) {
    return mapData;
};

Map.deserialize = function (mapData) {


};
module.exports = Map;