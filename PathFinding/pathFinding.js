var Map = require("./map");

var PathFinding = function (gameData) {
    this.G = null;
    this.maps = {};
};
/**
 *
 * @param start {object}
 * @param start.map {string}
 * @param start.x {number}
 * @param start.y {number}
 * @param end {object}
 * @param end.map {string}
 * @param end.x {number}
 * @param end.y {number}
 * @param options
 */
PathFinding.prototype.findPath = function (start, end, options) {

};

PathFinding.prototype.initialize = function (gameData) {
    this.G = gameData;
    for(let mapName in this.G.maps){
        if(!this.G.maps[mapName].ignore){
            console.log("Initializing map:"+mapName)
            console.log(gameData.maps.main.data)
            this.maps[mapName] = new Map().fromGateData(this.G.maps[mapName]);
        }

    }
};

module.exports = new PathFinding();