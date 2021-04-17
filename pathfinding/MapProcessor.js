const Floor = require("./Floor")
const character = {
    h: 8, // left and right
    v: 7, // up
    vn: 2, // down
};
const World = require("./World");

class MapProcessor {
    constructor(gameData, keenness = 1, padding = 1) {
        this.keenness = keenness;
        this.padding = padding;
        this.gameData = gameData;
    }

    setCollisionBoxes(world) {
        for (let [name, floor] of world.floors) {
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
                floor.setBox(x1, y1, x2, y2, floor.size, floor.matrices.base, 0xfffe);
            }

            for (let pos in y_lines) {
                let y = y_lines[pos][0] - floor.offset.y;
                let xLeft = y_lines[pos][1] - floor.offset.x;
                let xRight = y_lines[pos][2] - floor.offset.x;
                let x1 = Math.floor((xLeft - character.h - this.padding) / this.padding);
                let y1 = Math.floor((y - character.vn - this.padding) / this.padding);
                let x2 = Math.ceil((xRight + character.h + this.padding) / this.padding);
                let y2 = Math.ceil((y + character.v + this.padding) / this.padding);
                floor.setBox(x1, y1, x2, y2, floor.size, floor.matrices.base, 0xfffe);
            }
        }
        console.log("Set collision boxes")
    }

    createBoxNeighborMap(world) {
        for (let [name, floor] of world.floors) {
            for (let i = 0; i < floor.boxes.length; i++) {
                let box = world.boxes[floor.boxes[i]];
                //TOP
                for (let j = 0; j < box.size.x; j++) {
                    if (box.x + j > floor.size.x - 1 || (box.y - 1) < 0)
                        break;
                    let otherBoxId = floor.matrices.base[box.x + j + (box.y - 1) * floor.size.x];
                    if (otherBoxId < 0xfffd) {
                        let otherBox = world.boxes[otherBoxId];

                        let left = Math.max(box.x, otherBox.x);
                        let right = Math.min(box.x + box.size.x, otherBox.x + otherBox.size.x);
                        let dist = Math.sqrt(Math.pow(box.x - otherBox.x, 2) + Math.pow(box.y - otherBox.y, 2));
                        box.neighbors.push(otherBoxId, dist);
                        otherBox.neighbors.push(floor.boxes[i], dist);
                        j += right - left - 1;
                    }
                }
                //Right
                for (let j = 0; j < box.size.y; j++) {
                    if (box.x + box.size.x > floor.size.x - 1 || (box.y + j) > floor.size.y - 1)
                        break;
                    let otherBoxId = floor.matrices.base[box.x + box.size.x + (box.y + j) * floor.size.x];
                    if (otherBoxId < 0xfffd) {
                        let otherBox = world.boxes[otherBoxId];

                        let top = Math.max(box.y, otherBox.y);
                        let bottom = Math.min(box.y + box.size.y, otherBox.y + otherBox.size.y);
                        let dist = Math.sqrt(Math.pow(box.x - otherBox.x, 2) + Math.pow(box.y - otherBox.y, 2));
                        box.neighbors.push(otherBoxId, dist);
                        otherBox.neighbors.push(floor.boxes[i], dist);

                        j += bottom - top - 1;
                    }
                }
            }
        }
        console.log("created box neighbour map")
    };

    createBoxMap(world) {
        let boxCount = 0;
        for (let [name, floor] of world.floors) {
            let boxes = [];
            let base = floor.matrices.base;
            for (let i = 0; i < floor.matrices.base.length; i++) {
                if (base[i] === 0xfffd) {
                    const x = (i % floor.size.x);
                    const y = Math.floor(i / floor.size.x);
                    let boxSize;
                    if ((boxSize = floor.detectBoxSize(x, y, base)) !== null) {
                        for (let j = 0; j < boxSize.x; j++) {
                            for (let k = 0; k < boxSize.y; k++) {
                                base[x + j + (y + k) * floor.size.x] = boxCount;
                            }
                        }
                        boxes.push(boxCount);
                        world.boxes[boxCount] = {
                            x: x,
                            y: y,
                            size: boxSize,
                            neighbors: [],
                            doors: [],
                        };
                        boxCount++;
                    }
                }
            }
            floor.boxes = boxes;
        }
        console.log("created box map")
    };

    resetXYLines(world) {
        for (let [name, floor] of world.floors) {
            let xLineStart = null, yLineStart = null;
            const base = floor.matrices.base;
            for (let i = 0; i < base.length - 1; i++) {
                if (
                    base[i] === 0xfffe &&
                    base[i + floor.size.x] === 0xfffd
                    ||
                    base[i] === 0xfffd &&
                    base[i + floor.size.x] === 0xfffe
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
                    base[j] === 0xfffe &&
                    base[j + 1] === 0xfffd
                    ||
                    base[j] === 0xfffd &&
                    base[j + 1] === 0xfffe
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

    discoverWalkableArea(world) {
        for (let [name, floor] of world.floors) {
            for (let k in floor.mapData.spawns) {
                floor.fill(
                    Math.floor((floor.mapData.spawns[k][0] - floor.offset.x)),
                    Math.floor((floor.mapData.spawns[k][1] - floor.offset.y)),
                    0xfffd
                );
            }
        }
        console.log("Discover walkable area")
    }

    createFloors(world) {
        for (let name in this.gameData.maps) {
            let map = this.gameData.maps[name];
            map.geometry = this.gameData.geometry[name];
            if (!map.ignore) {
                world.floors.set(name, new Floor(name, map, this.keenness));
            }
        }
        console.log("Create floors");
    }

    detectingDoors(world) {
        let doorCount = 0;
        for (let [name, floor] of world.floors) {
            for (let doorData of floor.mapData.doors) {
                let doorId = doorCount++;
                const entryFloor = floor;
                const exitFloor = world.floors.get(doorData[4]);
                const entry = floor.mapData.spawns[doorData[6]];
                const entryX = Math.floor(entry[0] - floor.offset.x);
                const entryY = Math.floor(entry[1] - floor.offset.y);
                const exit = exitFloor.mapData.spawns[doorData[5]];
                const exitX = Math.floor(exit[0] - exitFloor.offset.x);
                const exitY = Math.floor(exit[1] - exitFloor.offset.y);
                if (!exitFloor)
                    continue;

                let entryBoxId = floor.matrices.base[entryX + entryY * floor.size.x];
                let exitBoxId = exitFloor.matrices.base[exitX + exitY * exitFloor.size.x];
                if (world.boxes[entryBoxId] && world.boxes[exitBoxId]) {
                    const door = {
                        entryId: entryBoxId,
                        exitId: exitBoxId,
                        entry: {
                            x: entry[0] - entryFloor.offset.x,
                            y: entry[1] - entryFloor.offset.y
                        },
                        exit: {
                            x: exit[0] - exitFloor.offset.x,
                            y: exit[1] - exitFloor.offset.y,
                            floor: exitFloor,
                            s: doorData[5]
                        }
                    }

                    world.boxes[entryBoxId].doors.push(doorId);
                    world.doors[doorId] = door;
                } else {
                    console.log(floor.name)
                    console.log(" ", entry[0], entry[1])
                }

            }
        }
        console.log("add doors");
    }

    createWorld() {
        const world = new World();
        this.createFloors(world);
        this.setCollisionBoxes(world);
        this.discoverWalkableArea(world);
        this.resetXYLines(world);
        this.createBoxMap(world);
        this.createBoxNeighborMap(world)
        this.detectingDoors(world);
        return world;
    }
}

module.exports = MapProcessor;