const httpWrapper = new (require("../app/httpWrapper"))();
const ProgressBar = require("./consoleProgress");
const boxMapAStar = require("./boxMapAStar");
const io = (require('socket.io'));
const fs = require("fs");
const pf = {
    Map: require("./Map"),
};

const logPrefix = "PF: ";


var Module = function () {
    this.maps = new Map();
    this.gameData = null;
    this.gameVersion = 0;
    this.version = 0;
    this.io = null;
    this.sockets = [];
};

Module.prototype.loadMap = function () {

};

/**
 * load gameData
 * @param gameData
 */
Module.prototype.loadData = function (gameData) {


};

Module.prototype.startServer = function (port) {
    this.serverSocket = new io(port, {pingTimeout: 2000});
    this.serverSocket.sockets.on('connection', function (socket) {
        console.log("Connected");
        sockets.push(socket);
        socket.on("disconnect", function () {
            sockets.splice(sockets.indexOf(socket), 1);
            console.log("Disconnected");
        });
        socket.on("path", function (data) {
            console.log(data)
        });
    });
};

Module.prototype.benchmark = function () {
    let maps = this.maps.values();
    for (let map of maps) {
        let total = 0;
        let high = 0;
        let amount = 10000;
        for (let i = 0; i < amount; i++) {
            let pointA = null;
            while (pointA === null) {
                let x = Math.floor(Math.random() * map.size.x);
                let y = Math.floor(Math.random() * map.size.y);
                if (map.base[x + map.size.x * y] === 2) {
                    pointA = {x: x, y: y};
                }
            }
            let pointB = null;
            while (pointB === null) {
                let x = Math.floor(Math.random() * map.size.x);
                let y = Math.floor(Math.random() * map.size.y);
                if (map.base[x + map.size.x * y] === 2) {
                    pointB = {x: x, y: y};
                }
            }
            let startTime = process.hrtime();
            boxMapAStar.findPath(pointA.x, pointA.y, pointB.x, pointB.y, map);
            let time = process.hrtime(startTime)[1] / 1000000;
            total += time;
            if (time > high)
                high = time;
        }
        console.log(map.name + ":")
        console.log("over " + amount + " paths:\navg: " + total / amount + "ms \nhigh: " + high + "ms");
    }
};

Module.prototype.gameDataProcessing = function () {

    let i = 0;
    for (let mapName in this.gameData.maps) {
        if (!this.gameData.maps[mapName].ignore)
            i++;
    }

    let progressBar = new ProgressBar("Progress something", "loading all data ...", 100, i);
    for (let mapName in this.gameData.maps) {
        if (this.gameData.maps.hasOwnProperty(mapName)) {
            let mapData = this.gameData.maps[mapName];
            let geo = this.gameData.geometry[mapName];
            if (!mapData.ignore) {
                let keenness = 1;
                var size = {
                    x: Math.ceil((geo.max_x - geo.min_x) / keenness),
                    y: Math.ceil((geo.max_y - geo.min_y + 50) / keenness)
                };
                let map = new pf.Map(mapName, size, keenness);
                this.maps.set(mapName, map);
                map.setOffset(geo.min_x, geo.min_y);
                map.setDoors(mapData.doors);
                map.setSpawns(mapData.spawns);
                map.setWalls(geo.x_lines, geo.y_lines);
                map.setPvP(mapData.pvp);
                map.setMonsters(mapData.monsters);
                map.setTraps(mapData.traps);
                map.setItems(mapData.items);
                map.optimize();
                progressBar.advance(1);
            }
        }
    }
};


async function main() {
    console.log("Pathfinding process started");
    let args = process.argv.slice(2);
    let port = args[0];
    let module = new Module();
    let gameVersion = "";
    {
        let tries = 0;
        while (gameVersion === "" && tries < 10) {
            try {
                gameVersion = "" + await httpWrapper.getGameVersion();
            } catch (e) {
                console.log(e)
            }
            tries++;
        }

    }

    if (!gameVersion) {
        console.error("Could not retrieve game version for pathfinder");
        process.exit(-1)
    }
    module.gameVersion = gameVersion;
    if (fs.existsSync("data/" + gameVersion + "")) {
        console.log("Found cached version, loading ...");
        //TODO once we can actually save data
    } else {
        console.log("Unable to find cached map version, creating from game data ...");
        let gameData = null;
        {
            let tries = 0;
            while (gameData === null && tries < 10) {
                try {
                    gameData = await httpWrapper.getGameData();
                } catch (e) {
                    console.log(e)
                }
                tries++;
            }

        }
        if (!gameData) {
            console.error("Could not retrieve game data for pathfinder this might be caused by missing login data, please contact the Author");
            process.exit(-1)
        }
        module.gameData = gameData;
        try {
            module.gameDataProcessing();
        } catch (e) {
            console.error(e, e.stack)
        }
        module.startServer(port);
    }
}

main();

async function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    })
}
