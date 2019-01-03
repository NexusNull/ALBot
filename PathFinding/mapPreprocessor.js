/**
 * Created by nexus on 31/03/17.
 */
var Map = function (name, size, position, boxSize, spawns, doors) {
    this.data = new Array(Math.ceil(size.x / boxSize) * Math.ceil(size.y / boxSize)).fill(0);
    this.spawns = spawns;
    this.doors = doors;
    this.name = name;
    this.boxSize = boxSize;
    this.size = size;
    this.position = position;
};

Map.prototype.get = function (x, y) {
    return this.data[y * Math.ceil(this.size.x / this.boxSize) + x];
};

Map.prototype.set = function (x, y, value) {
    this.data[y * Math.ceil(this.size.x / this.boxSize) + x] = value;
};

function process(gameMap) {
    var mapData = gameMap.data;

    var spawns = gameMap.spawns;

    var xLines = mapData.x_lines;
    var yLines = mapData.y_lines;

    if (dotList == undefined)
        var dotList = [];


    var position = {x: mapData.min_x, y: mapData.min_y};
    var size = {x: mapData.max_x - position.x, y: mapData.max_y - position.y};
    var boxSize = 8;

    //Initialize rasterMap to 0
    var rasterMap = new Array(Math.ceil(size.x / boxSize)).fill(false);
    for (var pos in rasterMap) {
        rasterMap[pos] = new Array(Math.ceil(size.y / boxSize)).fill(0);
    }

    for (var pos in xLines) {
        var xpos = Math.floor((xLines[pos][0] - position.x) / boxSize);

        var starty = (xLines[pos][1] - position.y) / boxSize;
        var endy = (xLines[pos][2] - position.y) / boxSize;

        if (starty <= endy) {
            starty = Math.floor(starty);
            endy = Math.ceil(endy);
            for (var i = starty; i <= endy; i++) {
                rasterMap[xpos][i] = 1;
            }
        } else {
            starty = Math.ceil(starty);
            endy = Math.floor(endy);
            for (var i = endy; i <= starty; i++) {
                rasterMap[xpos][i] = 1;
            }
        }
    }

    for (var pos in yLines) {
        var ypos = Math.floor((yLines[pos][0] - position.y) / boxSize);

        var startx = (yLines[pos][1] - position.x) / boxSize;
        var endx = (yLines[pos][2] - position.x) / boxSize;

        if (startx <= endx) {
            startx = Math.floor(startx);
            endx = Math.ceil(endx);
            for (var i = startx; i <= endx; i++) {
                rasterMap[i][ypos] = 1;
            }
        } else {
            startx = Math.ceil(startx);
            endx = Math.floor(endx);
            for (var i = endx; i <= startx; i++) {
                rasterMap[i][ypos] = 1;
            }
        }
    }

    for (var k in spawns) {
        fill(Math.floor((spawns[k][0] - position.x) / boxSize), Math.floor((spawns[k][1] - position.y) / boxSize));
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

    for (var pos in rasterMap) {
        for (var pos1 in rasterMap[pos]) {

            /**
             *
             * @typedef {{x: number, y: number, open: boolean, hCost: Number, gCost: Number, fCost: Number, cameFrom: null, found: boolean}} Node
             */
            rasterMap[pos][pos1] = rasterMap[pos][pos1] == 2 ? {
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
    /**
     *
     * @typedef {{rasterMap: Array.<Array.<Node>>, spawns, name, doors, transporter: (*), boxSize: number, size: {x: number, y: number}, position: {x, y}}} Map
     */
    var Map = {
        rasterMap: rasterMap,
        spawns: spawns,
        name: gameMap.name,
        doors: gameMap.doors,
        transporter: gameMap.transporter,
        boxSize: boxSize,
        size: size,
        position: position
    };
    return Map;
}