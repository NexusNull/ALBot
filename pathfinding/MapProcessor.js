const Floor = require("./Floor")
const character = {
    h: 8, // left and right
    v: 7, // up
    vn: 2, // down
};

class MapProcessor {
    constructor(gameData, keenness = 1, padding = 1) {
        this.keenness = keenness;
        this.padding = padding;
        this.gameData = gameData;
        this.floors = new Map();
    }

    setCollisionBoxes(map) {
        for (let [name, floor] of this.floors) {
            const x_lines = floor.mapData.geometry.x_lines
            const y_lines = floor.mapData.geometry.y_lines
            for (let pos in x_lines) {
                let x = x_lines[pos][0] - floor.offset.x;
                let yTop = x_lines[pos][1] - floor.offset.y;
                let yBot = x_lines[pos][2] - floor.offset.y;
                let x1 = Math.floor((x - character.h - this.padding) / this.padding);
                let y1 = Math.floor((yTop - character.vn - this.padding) / this.padding);
                let x2 = Math.ceil((x + character.h + this.padding) / this.padding);
                let y2 = Math.ceil((yBot + character.v + this.padding) / this.padding);
                floor.setBox(x1, y1, x2, y2, floor.size, floor.matrices.base, 1);
            }

            for (let pos in y_lines) {
                let y = y_lines[pos][0] - floor.offset.y;
                let xLeft = y_lines[pos][1] - floor.offset.x;
                let xRight = y_lines[pos][2] - floor.offset.x;
                let x1 = Math.floor((xLeft - character.h - this.padding) / this.padding);
                let y1 = Math.floor((y - character.vn - this.padding) / this.padding);
                let x2 = Math.ceil((xRight + character.h + this.padding) / this.padding);
                let y2 = Math.ceil((y + character.v + this.padding) / this.padding);
                floor.setBox(x1, y1, x2, y2, floor.size, floor.matrices.base, 1);
            }
        }
        console.log("Set collision boxes")
    }

    createBoxNeighborMap() {
        for (let [name, floor] of this.floors) {
            var links = [];
            let qtn = [];
            let qtg = {};
            for (let i = 1; i < floor.boxes.length; i++) {
                let box = floor.boxes[i];
                //TOP
                for (let j = 0; j < box.size.x; j++) {
                    if (box.x + j > floor.size.x - 1 || (box.y - 1) < 0)
                        break;
                    let otherBoxId = floor.matrices.boxMap[box.x + j + (box.y - 1) * floor.size.x];
                    if (otherBoxId !== undefined && otherBoxId !== 0) {
                        let otherBox = floor.boxes[otherBoxId];
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
                    if (box.x + box.size.x > floor.size.x - 1 || (box.y + j) > floor.size.y - 1)
                        break;
                    let otherBoxId = floor.matrices.boxMap[box.x + box.size.x + (box.y + j) * floor.size.x];
                    if (otherBoxId !== undefined && otherBoxId !== 0) {
                        let otherBox = floor.boxes[otherBoxId];

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
            floor.qtn = qtn;
            floor.qtg = qtg;
        }
        console.log("created box neighbour map")
    };

    createBoxMap() {
        for (let [name, floor] of this.floors) {
            let boxes = [];
            let boxCount = 0;
            let boxMap = floor.matrices.boxMap;
            for (let i = 0; i < floor.matrices.base.length; i++) {
                if (boxMap[i] === 2) {
                    const x = (i % floor.size.x);
                    const y = Math.floor(i / floor.size.x);
                    let boxSize;
                    if ((boxSize = floor.detectBoxSize(x, y, boxMap)) !== null) {
                        for (let j = 0; j < boxSize.x; j++) {
                            for (let k = 0; k < boxSize.y; k++) {
                                boxMap[x + j + (y + k) * floor.size.x] = boxCount;
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
            }
            floor.boxes = boxes;
        }
        console.log("created box map")
    };

    resetXYLines() {
        for (let [name, floor] of this.floors) {
            let xLineStart = null, yLineStart = null;
            const base = floor.matrices.base;
            for (let i = 0; i < base.length - 1; i++) {
                if (
                    base[i] === 1 &&
                    base[i + floor.size.x] === 2
                    ||
                    base[i] === 2 &&
                    base[i + floor.size.x] === 1
                ) {
                    if (yLineStart == null) {
                        yLineStart = i;
                    }
                } else {
                    //create line
                    if (yLineStart !== null) {
                        let line = [Math.floor(i / floor.size.x), yLineStart % floor.size.x, i % floor.size.x];
                        line[0] = line[0] * this.keenness + floor.offset.y;
                        line[1] = line[1] * this.keenness + floor.offset.x - 1;
                        line[2] = line[2] * this.keenness + floor.offset.x;
                        floor.y_lines.push(line);
                        yLineStart = null;
                    }
                }
                let j = (i % floor.size.y) * floor.size.x + Math.floor(i / floor.size.y);
                if (
                    base[j] === 1 &&
                    base[j + 1] === 2
                    ||
                    base[j] === 2 &&
                    base[j + 1] === 1
                ) {
                    if (xLineStart == null) {
                        xLineStart = j;
                    }
                } else {
                    //create line
                    if (xLineStart !== null) {
                        let line = [(j % floor.size.x), Math.floor(xLineStart / floor.size.x), Math.floor(j / floor.size.x)];
                        line[0] = line[0] * this.keenness + floor.offset.x;
                        line[1] = line[1] * this.keenness + floor.offset.y - 1;
                        line[2] = line[2] * this.keenness + floor.offset.y;
                        floor.x_lines.push(line);
                        xLineStart = null;
                    }
                }
            }
        }
        console.log("optimized xy Lines");
    }

    discoverWalkableArea() {
        for (let [name, floor] of this.floors) {
            for (let k in floor.spawns) {
                floor.fill(
                    Math.floor((floor.spawns[k][0] - floor.offset.x) / this.keenness),
                    Math.floor((floor.spawns[k][1] - floor.offset.y) / this.keenness),
                    2
                );
            }
        }
        console.log("Discover walkable area")
    }

    createFloors() {
        for (let name in this.gameData.maps) {
            let map = this.gameData.maps[name];
            map.geometry = this.gameData.geometry[name];
            if (!map.ignore) {
                this.floors.set(name, new Floor(map, this.keenness));
            }
        }
        console.log("Create floors");
    }
}

module.exports = MapProcessor;