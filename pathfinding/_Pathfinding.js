const fs = require("fs");
const HttpWrapper = require("../app/HttpWrapper");
const MapProcessor = require("./MapProcessor")
const PriorityQueue = require("./PriorityQueue")
const io = require("socket.io")(3000)
const vm = require("vm");

class _Pathfinding {
    constructor() {
        this.httpWrapper = new HttpWrapper();
        this.gameData = null;
        this.world = null;
    }

    async loadCache() {
        throw new Error("Unable to load");
    }

    async loadData() {
        let gameVersion = await this.httpWrapper.getGameVersion();
        try {
            const buffer = fs.readFileSync(`data/${gameVersion}/data.js`);
            const context = {};
            vm.runInNewContext(buffer.toString("utf-8"), context);
            this.gameData = context.G;
            console.log("Reading game data from cache for pathfinding");
        } catch (e) {
            console.log(`Unable to read data form version: ${gameVersion} path finding instance stopping.`);
            process.exit(1);
        }
    }

    async createMesh() {
        this.mapProcessor = new MapProcessor(this.gameData, 1, 1);
        this.world = this.mapProcessor.createWorld();
    }

    findPath(startX, startY, startMap, endX, endY, endMap) {
        let startFloor = this.world.floors.get(startMap);
        let endFloor = this.world.floors.get(endMap);
        startX -= startFloor.offset.x
        startY -= startFloor.offset.y
        endX -= endFloor.offset.x
        endY -= endFloor.offset.y


        let startBox = startFloor.matrices.base[startX + startFloor.size.x * startY];
        let endBox = endFloor.matrices.base[endX + endFloor.size.x * endY];

        if (!startBox || startBox > 0xfffd)
            return [];
        if (!endBox || endBox > 0xfffd)
            return [];


        let open = new Uint8Array(this.world.boxes.length).fill(1);
        let openDoors = new Uint16Array(this.world.doors.length).fill(1);
        let previous = new Array(this.world.boxes.length).fill(undefined);
        let dist = new Uint16Array(this.world.boxes.length).fill(0xffff);

        let found = new PriorityQueue((boxA, boxB) => {
            return dist[boxA] < dist[boxB];
        });

        dist[startBox] = 0;
        found.push(startBox);
        while (found.size() > 0) {
            let currentId = found.pop();
            if (!open[currentId])
                continue;
            let current = this.world.boxes[currentId];
            for (let i = 0; i < current.neighbors.length; i += 2) {
                const neighborId = current.neighbors[i];
                if (!open[neighborId])
                    continue;
                const nodeDist = current.neighbors[i + 1];
                if (dist[currentId] + nodeDist < dist[neighborId]) {
                    dist[neighborId] = dist[currentId] + nodeDist;
                    found.push(neighborId);
                    previous[neighborId] = currentId;
                }
                if (neighborId == endBox)
                    break;
            }
            for (let i = 0; i < current.doors.length; i++) {
                const doorId = current.doors[i];
                const door = this.world.doors[current.doors[i]];
                const neighborId = door.exitId;
                if (!open[neighborId])
                    continue;
                openDoors[doorId] = 0;
                if (dist[currentId] < dist[neighborId]) {
                    dist[neighborId] = dist[currentId];
                    found.push(neighborId);
                    previous[neighborId] = door;
                }
            }
            open[currentId] = 0;
        }

        let current = endBox;
        let path = [];
        while (current !== undefined) {
            if (typeof current == "object") {
                path.push(current)
                path.push(current.entryId)
                current = previous[current.entryId];
            } else {
                path.push(current);
                current = previous[current];
            }
        }
        return path.reverse();
    }
}

async function main() {
    let pathfinding = new _Pathfinding();
    try {
        await pathfinding.loadCache();
    } catch (e) {
        await pathfinding.loadData();
        await pathfinding.createMesh();
    }
    io.on("connection", (socket) => {
        socket.on("findPath", (data, cb) => {
                let {startX, startY, startMap, endX, endY, endMap} = data;
                let path = pathfinding.findPath(startX, startY, startMap, endX, endY, endMap);
                let currentMap = pathfinding.world.floors.get(startMap);
                for (let i = 0; i < path.length; i++) {
                    if (typeof path[i] == "number") {
                        let box = pathfinding.world.boxes[path[i]];
                        path[i] = {
                            x: box.x + currentMap.offset.x + box.size.x / 2,
                            y: box.y + currentMap.offset.y + box.size.y / 2
                        }
                    } else {
                        currentMap = path[i].exit.floor;
                        path[i] = {
                            entry: path[i].entry,
                            transition: path[i].exit.floor.name,
                            s: path[i].exit.s,
                        }
                    }
                }
                cb(path);
            }
        )
    })

    if (process.send)
        process.send("ready")

}

main();