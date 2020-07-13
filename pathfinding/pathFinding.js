var World = require("./Map");
var preProcess = require("./mapPreprocessor");
var aStar = require("./aStar");
var quickAStar = require("./quickAStar");
var boxAStar = require("./boxMapAStar");
var output = require("./output");
var PathFinding = function () {
    this.G = null;
    this.maps = {};
};

PathFinding.prototype.findPath = function (x, y, endX, endY, mapName) {
    return boxAStar.findPath(x, y, endX, endY, this.maps[mapName]);
};

PathFinding.prototype.findBoxPath = function (startBoxId, endBoxId, mapName) {
    return boxAStar.findPathFromBox(startBoxId, endBoxId, this.maps[mapName]);
};

PathFinding.prototype.initialize = function (gameData) {
    this.G = gameData;
    var startDate = new Date();
    for (let mapName in this.G.maps) {
        if (!this.G.maps[mapName].ignore) {
            console.log("Initializing map: " + mapName);
            this.G.maps[mapName].name = mapName;
            this.maps[mapName] = preProcess(this.G.maps[mapName]);
        }
        let high = 0;
        let total = 0;
        let amount = 1000;

        for (let i = 0; i < amount; i++) {
            let startTime = process.hrtime();
            let start = Math.floor(Math.random() * (this.maps[mapName].boxes.length - 2)) + 1;
            let end = Math.floor(Math.random() * (this.maps[mapName].boxes.length - 2)) + 1;
            this.findBoxPath(start, end, mapName);
            let time = process.hrtime(startTime)[1] / 1000000;
            total += time;
            if (time > high)
                high = time;
        }
        console.log("over " + amount + " paths:\navg: " + total / amount + "ms \nhigh: " + high + "ms");
    }
    console.log("map init took: " + (((new Date).getTime()) - startDate.getTime()) + "ms");


};

module.exports = new PathFinding();