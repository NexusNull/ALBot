/**
 * Created by nexus on 31/03/17.
 */

/**
 @typedef {{rasterMap: Array.<Array.<Node>>, spawns, name, doors, transporter: (*), boxSize: number, size: {x: number, y: number}, position: {x, y}}} Map
 */
var Map = function () {

};

Map.prototype.get = function (x, y) {
    return this.data[y * Math.ceil(this.size.x / this.boxSize) + x];
};

Map.prototype.set = function (x, y, value) {
    this.data[y * Math.ceil(this.size.x / this.boxSize) + x] = value;
};

Map.prototype.fromGateData = function (gameData) {
    this.boxSize = 8;
    this.spawns = gameData.spawns;
    this.doors = gameData.doors;
    this.name = gameData.name;
    this.position = gameData.position;

    var mapData = gameData.data;

    var spawns = gameData.spawns;

    var xLines = mapData.x_lines;
    var yLines = mapData.y_lines;

    if (dotList == undefined)
        var dotList = [];


    var position = {x: mapData.min_x, y: mapData.min_y};
    this.position = position;
    var size = {
        x: mapData.max_x - position.x,
        y: mapData.max_y - position.y
    };
    this.size = size;
    //Initialize rasterMap to 0

    var rasterMap = new Array(Math.ceil(size.x / this.boxSize)).fill(false);
    for (var pos in rasterMap) {
        rasterMap[pos] = new Array(Math.ceil(size.y / this.boxSize)).fill(0);
    }
    this.rasterMap = rasterMap;

    for (var pos in xLines) {
        var xpos = Math.floor((xLines[pos][0] - position.x) / this.boxSize);

        var starty = (xLines[pos][1] - position.y) / this.boxSize;
        var endy = (xLines[pos][2] - position.y) / this.boxSize;

        if (starty <= endy) {
            starty = Math.floor(starty);
            endy = Math.ceil(endy);
            for (var i = starty; i <= endy; i++) {
                this.rasterMap[xpos][i] = 1;
            }
        } else {
            starty = Math.ceil(starty);
            endy = Math.floor(endy);
            for (var i = endy; i <= starty; i++) {
                this.rasterMap[xpos][i] = 1;
            }
        }
    }

    for (var pos in yLines) {
        var ypos = Math.floor((yLines[pos][0] - position.y) / this.boxSize);

        var startx = (yLines[pos][1] - position.x) / this.boxSize;
        var endx = (yLines[pos][2] - position.x) / this.boxSize;

        if (startx <= endx) {
            startx = Math.floor(startx);
            endx = Math.ceil(endx);
            for (var i = startx; i <= endx; i++) {
                this.rasterMap[i][ypos] = 1;
            }
        } else {
            startx = Math.ceil(startx);
            endx = Math.floor(endx);
            for (var i = endx; i <= startx; i++) {
                this.rasterMap[i][ypos] = 1;
            }
        }
    }

    for (var k in spawns) {
        fill(Math.floor((spawns[k][0] - position.x) / this.boxSize), Math.floor((spawns[k][1] - position.y) / this.boxSize));
    }

    function fill(x, y) {
        var open = [{x: x, y: y}];
        var c = 0;
        while (open.length - c > 0) {
            if (rasterMap[open[c].x] && rasterMap[open[c].x][open[c].y] == 0) {
                rasterMap[open[c].x][open[c].y] = 2;
                open.push({x: open[c].x + 1, y: open[c].y});
                open.push({x: open[c].x - 1, y: open[c].y});
                open.push({x: open[c].x, y: open[c].y + 1});
                open.push({x: open[c].x, y: open[c].y - 1});
            }
            c++;
        }
    }

    for (var pos in this.rasterMap) {
        for (var pos1 in this.rasterMap[pos]) {
            /**
             *
             * @typedef {{x: number, y: number, open: boolean, hCost: Number, gCost: Number, fCost: Number, cameFrom: null, found: boolean}} Node
             */
            this.rasterMap[pos][pos1] = this.rasterMap[pos][pos1] == 2 ? {
                x: +pos,
                y: +pos1,
                open: true,
                hCost: Infinity,
                gCost: Infinity,
                fCost: Infinity,
                cameFrom: null,
                found: false
            } : null;
        }
    }
    return this;
};
module.exports = Map;