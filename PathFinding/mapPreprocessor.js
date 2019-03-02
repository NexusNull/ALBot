const World = require("./World");

//psst if the character hitboxes ever change just edit this, I got you bro.
var character = {
    h: 8, // left and right
    v: 7, // up
    vn: 2, // down
};

var canMoveTo = function (x1, y1, x2, y2, lines) {

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
};

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

function process(gameData) {
    var boxSize = 2;
    var padding = 1;
    var spawns = gameData.spawns;
    var doors = gameData.doors;
    var name = gameData.name;
    var geo = gameData.data;
    var mapData = gameData.data;


    var xLines = mapData.x_lines;
    var yLines = mapData.y_lines;

    var position = {x: mapData.min_x, y: mapData.min_y};

    var size = {
        x: Math.ceil((mapData.max_x - position.x) / boxSize),
        y: Math.ceil((mapData.max_y - position.y + 50) / boxSize)
    };

    //Initialize rasterMap to 0
    var rasterMap = new Int8Array(size.x * size.y).fill(0);
    var nodeMap = new Int8Array(size.x * size.y).fill(0);


    function box(x1, y1, x2, y2) {
        for (let x = x1; x <= x2; x++)
            for (let y = y1; y <= y2; y++) {
                if (rasterMap[size.x * y + x] !== undefined)
                    rasterMap[size.x * y + x] = 1;
            }
    }

    console.log("  Setting Lines");
    //Vertical lines
    for (let pos in xLines) {
        let x = (xLines[pos][0] - position.x);
        let yTop = xLines[pos][1] - position.y;
        let yBot = xLines[pos][2] - position.y;
        let x1 = Math.floor((x - character.h - padding) / boxSize);
        let y1 = Math.floor((yTop - character.vn - padding) / boxSize);
        let x2 = Math.ceil((x + character.h + padding) / boxSize);
        let y2 = Math.ceil((yBot + character.v + padding) / boxSize);
        box(x1, y1, x2, y2);
    }
    //Horizontal lines
    for (let pos in yLines) {
        let y = (yLines[pos][0] - position.y);
        let xLeft = yLines[pos][1] - position.x;
        let xRight = yLines[pos][2] - position.x;
        let x1 = Math.floor((xLeft - character.h - padding) / boxSize);
        let y1 = Math.floor((y - character.vn - padding) / boxSize);
        let x2 = Math.ceil((xRight + character.h + padding) / boxSize);
        let y2 = Math.ceil((y + character.v + padding) / boxSize);
        box(x1, y1, x2, y2);
    }

    console.log("  Running pixel fill");
    for (var k in spawns) {
        fill(Math.floor((spawns[k][0] - position.x) / boxSize), Math.floor((spawns[k][1] - position.y) / boxSize));
    }

    function fill(x, y) {
        var open = [{x: x, y: y}];
        var c = 0;
        while (open.length - c > 0) {
            if (rasterMap[open[c].x + size.x * open[c].y] == 0) {
                rasterMap[open[c].x + size.x * open[c].y] = 2;
                open.push({x: open[c].x + 1, y: open[c].y});
                open.push({x: open[c].x - 1, y: open[c].y});
                open.push({x: open[c].x, y: open[c].y + 1});
                open.push({x: open[c].x, y: open[c].y - 1});
            }
            c++;
        }
    }

    let rasterMapNodeCount = 0;
    for (let i = 0; i < rasterMap.length; i++) {
        if (rasterMap[i] === 2) {
            rasterMapNodeCount++;
            rasterMap[i] = 1;
        } else
            rasterMap[i] = 0
    }
    console.log("  Detecting corners");
    let qtn = [];
    let qtg = {};

    var lines = {
        x_lines: [],
        y_lines: []
    };

    var nodeCandidates = [];
    for (let i = 0; i < rasterMap.length - 1; i++) {
        if (size.x - 1 === i)
            continue;
        let sum = rasterMap[i] + rasterMap[i + 1] + rasterMap[i + size.x] + rasterMap[i + 1 + size.x];
        if (sum === 3) {
            if (rasterMap[i] === 0) {
                nodeCandidates.push(i + size.x + 1);
            } else if (rasterMap[i + 1] === 0) {
                nodeCandidates.push(i + size.x)
            } else if (rasterMap[i + size.x] === 0) {
                nodeCandidates.push(i + 1)
            } else {
                nodeCandidates.push(i)
            }
        } else if (sum === 2) {
            if (rasterMap[i] === 0 && rasterMap[i + size.x + 1] === 0) {
                nodeCandidates.push(i + 1);
                nodeCandidates.push(i + size.x);
            } else if (rasterMap[i + 1] === 0 && rasterMap[i + size.x] === 0) {
                nodeCandidates.push(i);
                nodeCandidates.push(i + size.x + 1);
            }
        } else if (sum === 1) {
            if (rasterMap[i] === 1) {
                nodeCandidates.push(i);
            } else if (rasterMap[i + 1] === 1) {
                nodeCandidates.push(i + 1)
            } else if (rasterMap[i + size.x] === 1) {
                nodeCandidates.push(i + size.x)
            } else {
                nodeCandidates.push(i + size.x + 1)
            }
        }
    }

    for (let i of nodeCandidates) {
        qtn.push({x: i % size.x, y: Math.floor(i / size.x)});
    }
    console.log("  Recalculating collision lines");

    let xLineBeginning = null, yLineBeginning = null;
    for (let i = 0; i < rasterMap.length - 1; i++) {
        if (!!rasterMap[i] === !rasterMap[i + size.x]) {
            if (yLineBeginning == null) {
                yLineBeginning = i;
            }
        } else {
            //create line
            if (yLineBeginning !== null) {
                let line = [Math.floor(i / size.x), yLineBeginning % size.x - 1, i % size.x - 1];
                line[0] = line[0] * boxSize + position.y;
                line[1] = line[1] * boxSize + position.x;
                line[2] = line[2] * boxSize + position.x;
                lines.y_lines.push(line);
                yLineBeginning = null;
            }
        }
        let j = (i % size.y) * size.x + Math.floor(i / size.y);
        if (!!rasterMap[j] === !rasterMap[j + 1]) {
            if (xLineBeginning == null) {
                xLineBeginning = j;
            }
        } else {
            //create line
            if (xLineBeginning !== null) {
                let line = [(j % size.x), Math.floor(xLineBeginning / size.x) - 1, Math.floor(j / size.x) - 1];
                line[0] = line[0] * boxSize + position.x;
                line[1] = line[1] * boxSize + position.y;
                line[2] = line[2] * boxSize + position.y;
                lines.x_lines.push(line);
                xLineBeginning = null;
            }
        }
    }

    console.log("  Magic");
    for (let j = 0; j < spawns.length; j++) {
        let spawn = spawns[j];
        for (let i = 0; i < rasterMap.length; i++) {
            if (canMoveTo(spawn[0]* boxSize + position.x, spawn[1]* boxSize + position.y, (j % size.x), Math.floor(i / size.x), lines)) {
                nodeMap[i] = j;
            }
        }
    }

    console.log("  Done");
    let world = new World({name, size, position, boxSize, spawns, doors, rasterMap, nodeMap, lines});
    world.meta.rasterMapCount = rasterMapNodeCount;
    world.meta.quickTravelMapNodeCount = qtn.length;
    world.meta.quickTravelMapEdgeCount = 0;
    return world;
}

module.exports = process;
