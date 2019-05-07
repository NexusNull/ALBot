const World = require("./World");
const output = require("./output");
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

var canMapMoveTo = function (x1, y1, x2, y2, lines, boxSize, position) {
    x1 = x1 * boxSize + position.x;
    y1 = y1 * boxSize + position.y;
    x2 = x2 * boxSize + position.x;
    y2 = y2 * boxSize + position.y;

    return canMoveTo(x1, y1, x2, y2, lines);
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

function preProcess(gameData) {
    var boxSize = 1;
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

    var toGameMapCoordinates = function (pos) {
        return {
            x: (pos.x * boxSize + position.x),
            y: (pos.y * boxSize + position.y)
        };
    };

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
    for (let k in spawns) {
        fill(Math.floor((spawns[k][0] - position.x) / boxSize), Math.floor((spawns[k][1] - position.y) / boxSize));
    }

    /**
     * Runs a pixel fill operation on a given image and coordinates.
     * The coordinates are based on the internal map format
     * @param {int} x
     * @param {int} y
     */
    function fill(x, y) {
        let open = [[x, y]];
        let c = 0;
        while (open.length - c > 0) {
            if (rasterMap[open[c][0] + size.x * open[c][1]] === 0) {
                rasterMap[open[c][0] + size.x * open[c][1]] = 2;
                open.push([open[c][0] + 1, open[c][1]]);
                open.push([open[c][0] - 1, open[c][1]]);
                open.push([open[c][0], open[c][1] + 1]);
                open.push([open[c][0], open[c][1] - 1]);
            }
            c++;
        }
    }

    /**
     *
     * @type {number}
     */
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
    /*
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
        qtn.push({x: i % size.x - .5, y: Math.floor(i / size.x) - 0.5});
    }
    */
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
                let line = [Math.floor(i / size.x), yLineBeginning % size.x, i % size.x];
                line[0] = line[0] * boxSize + position.y;
                line[1] = line[1] * boxSize + position.x - 1;
                line[2] = line[2] * boxSize + position.x + 1;
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
                let line = [(j % size.x), Math.floor(xLineBeginning / size.x), Math.floor(j / size.x)];
                line[0] = line[0] * boxSize + position.x;
                line[1] = line[1] * boxSize + position.y - 1;
                line[2] = line[2] * boxSize + position.y + 1;
                lines.x_lines.push(line);
                xLineBeginning = null;
            }
        }
    }
    /*
    console.log("  Creating quickTravel edges");
    for (let i = 0; i < qtn.length; i++) {
        for (let j = i + 1; j < qtn.length; j++) {
            if (canMapMoveTo(qtn[i].x, qtn[i].y, qtn[j].x, qtn[j].y, lines, boxSize, position)) {
                let i1 = qtn[i].x + ":" + qtn[i].y;
                let i2 = qtn[j].x + ":" + qtn[j].y;

                if (!qtg[i1])
                    qtg[i1] = [];
                qtg[i1].push(qtn[j]);

                if (!qtg[i2])
                    qtg[i2] = [];
                qtg[i2].push(qtn[i]);
            }
        }
    }
    */
    console.log("  Create Box Map");
    var boxMap = new Uint16Array(size.x * size.y).fill(0);

    /**
     * @param x
     * @param y
     * @returns {null|boxSize}
     */

    function detectBoxSize(x, y) {
        if (!rasterMap[x + y * size.x]) {
            return null;
        }

        /**
         * @typedef {{x: number, y: number}} boxSize
         */

        let boxSize = {
            x: 0,
            y: 0
        };
        let canExpand = {
            x: true,
            y: true,
        };
        while (canExpand.x || canExpand.y) {
            if (x + boxSize.x >= size.x) {
                canExpand.x = false;
                canExpand.y = false;
            }
            if (y + boxSize.y >= size.y) {
                canExpand.y = false;
                canExpand.x = false;
            }
            if (canExpand.x) {
                for (let i = 0; i < boxSize.y; i++) {
                    let lx = x + boxSize.x;
                    let ly = (y + i);
                    //console.log("x", lx, ly, boxSize)
                    if (rasterMap[lx + ly * size.x] !== 1 || boxMap[lx + ly * size.x] !== 0) {
                        canExpand.x = false;
                        canExpand.y = false;

                        break;
                    }
                }
                if (canExpand.x) {
                    boxSize.x++;
                }
            }
            if (canExpand.y) {
                for (let i = 0; i < boxSize.x; i++) {
                    let lx = x + i;
                    let ly = (y + boxSize.y);
                    //console.log("y", lx, ly, boxSize)
                    if (rasterMap[lx + ly * size.x] !== 1 || boxMap[lx + ly * size.x] !== 0) {
                        canExpand.y = false;
                        canExpand.x = false;
                        break;
                    }
                }
                if (canExpand.y) {
                    boxSize.y++;
                }
            }
        }
        return boxSize
    }

    let boxCount = 1;
    let boxes = [];
    for (let i = 0; i < rasterMap.length; i++) {
        let x = (i % size.x);
        let y = Math.floor(i / size.x);
        let boxSize;

        if (boxMap[x + y * size.x] === 0 && (boxSize = detectBoxSize(x, y)) !== null) {
            for (let j = 0; j < boxSize.x; j++) {
                for (let k = 0; k < boxSize.y; k++) {
                    boxMap[x + j + (y + k) * size.x] = boxCount;
                }
            }
            boxes[boxCount] = {
                x: x,
                y: y,
                size: boxSize,
                neighbors: []
            };
            boxCount++;
        }

    }

    console.log("  Create box neighbor Map");

    var links = [];
    for (let i = 1; i < boxes.length; i++) {
        let box = boxes[i];
        //TOP
        for (let j = 0; j < box.size.x; j++) {
            if (box.x + j > size.x - 1 || (box.y - 1) < 0)
                break;
            let otherBoxId = boxMap[box.x + j + (box.y - 1) * size.x];
            if (otherBoxId !== undefined && otherBoxId !== 0) {
                let otherBox = boxes[otherBoxId];
                if (links[i] === undefined) {
                    links[i] = [];
                }
                if (links[otherBoxId] === undefined) {
                    links[otherBoxId] = [];
                }

                let left = Math.max(box.x, otherBox.x);
                let right = Math.min(box.x + box.size.x, otherBox.x + otherBox.size.x);

                qtn.push({x: left + Math.floor((right - left) / 2), y: (box.y - 1)});
                links[i].push({x: left + Math.floor((right - left) / 2), y: (box.y - 1)});
                links[otherBoxId].push({x: left + Math.floor((right - left) / 2), y: (box.y - 1)});

                box.neighbors.push(otherBoxId);
                otherBox.neighbors.push(i);

                j += right - left - 1;
            }
        }

        for (let j = 0; j < box.size.y; j++) {
            if (box.x + box.size.x > size.x - 1 || (box.y + j) > size.y - 1)
                break;
            let otherBoxId = boxMap[box.x + box.size.x + (box.y + j) * size.x];
            if (otherBoxId !== undefined && otherBoxId !== 0) {
                let otherBox = boxes[otherBoxId];

                if (links[i] === undefined) {
                    links[i] = [];
                }
                if (links[otherBoxId] === undefined) {
                    links[otherBoxId] = [];
                }
                let top = Math.max(box.y, otherBox.y);
                let bottom = Math.min(box.y + box.size.y, otherBox.y + otherBox.size.y);

                qtn.push({x: box.x + box.size.x, y: (top + Math.floor((bottom - top) / 2))});
                links[i].push({x: box.x + box.size.x, y: (top + Math.floor((bottom - top) / 2))});
                links[otherBoxId].push({x: box.x + box.size.x, y: (top + Math.floor((bottom - top) / 2))});

                box.neighbors.push(otherBoxId);
                otherBox.neighbors.push(i);

                j += bottom - top - 1;
            }
        }
    }

    console.log("  Creating quick travel graph");
    for (let boxLink of links) {
        if (boxLink)
            for (let parent of boxLink) {
                if (!qtg[parent.x + ":" + parent.y]) {
                    qtg[parent.x + ":" + parent.y] = [];
                }
                for (let child of boxLink) {
                    qtg[parent.x + ":" + parent.y].push(child)
                }
            }
    }

    output.draw_funny_boxes({boxMap, size, map: rasterMap, qtg, qtn, filename: name + ".png"});

    console.log("  Done");

    let world = new World({name, size, position, boxSize, spawns, doors, rasterMap, boxMap, boxes, qtn, qtg, lines});
    world.meta.rasterMapCount = rasterMapNodeCount;
    world.meta.quickTravelMapNodeCount = qtn.length;
    world.meta.quickTravelMapEdgeCount = 0;
    return world;
}

module.exports = preProcess;
