var World = require("./world");
var process = require("./mapPreprocessor");
var aStar = require("./aStar");
var quickAStar = require("./quickAStar");

var PathFinding = function () {
    this.G = null;
    this.maps = {};
};

PathFinding.prototype.findPath = function (x, y, endX, endY, mapName) {
    return quickAStar.findPath(x, y, endX, endY, this.maps[mapName]);
};

PathFinding.prototype.initialize = function (gameData) {
    this.G = gameData;
    //for (let mapName in this.G.maps) {
        mapName = "winterland"
        if (!this.G.maps[mapName].ignore) {
            console.log("Initializing map: " + mapName);
            this.maps[mapName] = new process(this.G.maps[mapName]);
        }
    //}
};

module.exports = new PathFinding();