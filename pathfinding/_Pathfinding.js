const fs = require("fs");
const HttpWrapper = require("../app/HttpWrapper");
const MapProcessor = require("./MapProcessor")
const output = require("./output")

class _Pathfinding {
    constructor() {
        this.httpWrapper = new HttpWrapper();
        this.gameData = null;
    }

    async loadCache() {
        throw new Error("Unable to load");
    }

    async loadData() {
        let gameVersion = await this.httpWrapper.getGameVersion();
        try {
            let buffer = fs.readFileSync("data/data." + gameVersion + ".json");
            this.gameData = JSON.parse(buffer.toString());
            console.log("Reading game data from cache for pathfinding");
        } catch (e) {
            console.log(`Unable to read data for version:${gameVersion} instance stopping.`);
            process.exit(1);
        }

    }

    async createMesh() {
        let mapProcessor = new MapProcessor(this.gameData, 1, 1);
        mapProcessor.createFloors();
        mapProcessor.setCollisionBoxes();
        mapProcessor.discoverWalkableArea();
        mapProcessor.resetXYLines();
        mapProcessor.createBoxMap();
        mapProcessor.createBoxNeighborMap()
        for (let [name, floor] of mapProcessor.floors) {
            floor.name = name;
            output.draw_funny_boxes(floor)
        }
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
    if (process.send)
        process.send("ready")

}

main();