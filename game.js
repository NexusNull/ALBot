/**
 * Created by nexus on 03/04/17.
 */

process.on('uncaughtException', function (exception) {
    console.log(exception);
    console.log(exception.stack);
});

var LocalStorage = require('node-localstorage').LocalStorage;
var HttpWrapper = require("./httpWrapper");
const pngUtil = require("./pngUtil");
const PNG = require('pngjs').PNG;
localStorage = new LocalStorage('./localStorage');

function close(error) {
    console.error(error);
    process.exit(1);
}

function toPrettyNum(a) {
    if (!a) {
        return "0"
    }
    a = Math.round(a);
    let sign = false;
    if (a < 0) {
        a = -1 * a;
        sign = true;
    }
    var b = "";
    while (a) {
        var c = a % 1000;
        if (!c) {
            c = "000"
        } else {
            if (c < 10 && c != a) {
                c = "00" + c
            } else {
                if (c < 100 && c != a) {
                    c = "0" + c
                }
            }
        }
        if (!b) {
            b = c
        } else {
            b = c + "," + b
        }
        a = (a - a % 1000) / 1000
    }
    return (sign ? "-" : "") + b
}

var Game = function (ip, port, characterId, script, botKey, G, httpWrapper) {
    this.ip = ip;
    this.port = port;
    this.userId = httpWrapper.userId;
    this.characterId = characterId;
    this.socketAuth = httpWrapper.userAuth;
    this.httpWrapper = httpWrapper;
    this.script = script;
    this.botKey = botKey;
    this.excutor = null;
    this.interface = null;
    this.events = {};
    this.socket = null;
    this.executor = null;
    this.G = G;
    this.pathfinding = null;
}

Game.prototype.init = function () {
    let self = this;
    var fs = require("fs")
    var cheerio = require("cheerio");
    var G = this.G;
    var Executor = require("./Executor");

    var character_to_load;
    var first_entities = false;
    var inside = "selection";
    var user_id, user_auth;
    var server_names = {"US": "Americas", "EU": "Europas", "ASIA": "Eastlands"};
    var perfect_pixels = '';
    var cached_map = '1', scale = '2';
    var d_lines = '1';
    var sd_lines = '1';
    var c_enabled = '1', stripe_enabled = '';
    var auto_reload = "auto", reload_times = '0', code_to_load = null, mstand_to_load = null;
    var EPS = 1e-16;
    var no_graphics = true;
    var first_coords = false,
        first_x = 0,
        first_y = 0;
    var protocol = "https";

    var code_active = false;
    var current_map = "";
    var pull_all_next = false;
    var pull_all = false;
    var heartbeat = new Date();
    var slow_heartbeats = 0;
    var game_loaded = false;
    var prepull_target_id = null;
    var is_pvp = false;
    var server_region = "";
    var server_identifier = "";
    var server_name = "";
    var socket;
    var server_addr, port;
    var last_draw = new Date();
    var M;
    var GMO;
    var entities = {}
    var future_entities = {
        players: {},
        monsters: {}
    };
    var character;

    var game = null;

    var httpWrapper = this.httpWrapper;
    var script = this.script;
    var botKey = this.botKey;
    var sandbox;

    game = this;

    server_addr = this.ip;
    port = this.port;
    user_id = this.userId;
    character_to_load = this.characterId;
    user_auth = this.socketAuth;
    var onLoad = function () {
        log_in(user_id, character_to_load, user_auth);
    }

    eval(fs.readFileSync('moddedGameFiles/game.js') + '');
    gprocess_game_data();
    init_socket();
    this.socket = socket;
    /*
    game.pathfinding = require("./PathFinding/pathFinding");
    game.pathfinding.initialize(this.G);
    */
    var bwi = {};
    var glob = {
        localStorage: localStorage,
        gameplay: gameplay,
        is_pvp: is_pvp,
        server_region: server_region,
        server_identifier: server_identifier,
        G: G,
        activate: activate,
        shift: shift,
        use_skill: use_skill,
        can_use: can_use,
        socket: socket,
        current_map: current_map,
        add_log: add_log,
        ctarget: ctarget,
        send_target_logic: send_target_logic,
        distance: distance,
        is_disabled: is_disabled,
        transporting: transporting,
        player_attack: player_attack,
        monster_attack: monster_attack,
        player_heal: player_heal,
        buy: buy,
        sell: sell,
        trade: trade,
        trade_buy: trade_buy,
        upgrade: upgrade,
        compound: compound,
        exchange: exchange,
        say: say,
        private_say: private_say,
        party_list: party_list,
        party: party,
        calculate_move: calculate_move,
        chests: chests,
        entities: entities,
        calculate_vxy: calculate_vxy,
        show_json: show_json,
        next_potion: next_potion,
        send_code_message: send_code_message,
        call_code_function: call_code_function,
        drawings: drawings,
        move: move,
        show_modal: show_modal,
        prop_cache: prop_cache,
        next_attack: next_attack,
        bot_mode: true,
        botKey: botKey,
        require: require,
        game: this,
        close_merchant: close_merchant,
        open_merchant: open_merchant,
        bwi: bwi
    };
    Object.defineProperty(glob, "entities", {
        get: function () {
            return entities;
        }
    })
    Object.defineProperty(glob, "code_active", {
        get: function () {
            return code_active;
        },
        set: function (value) {
            code_active = value;
        }
    })
    Object.defineProperty(glob, "sandbox", {
        get: function () {
            return sandbox;
        },
        set: function (value) {
            sandbox = value;
        }
    })
    Object.defineProperty(glob, "character", {
        get: function () {
            return character;
        }
    })
    Object.defineProperty(glob, "map", {
        get: function () {
            return map;
        }
    })
    Object.defineProperty(glob, "M", {
        get: function () {
            return M;
        }
    })
    var damage = 0;
    var timeFrame = 60 * 5;
    var goldTimeline = [],
        xpTimeline = [],
        damageTimeline = [];

    var damageStart = Date.now();
    socket.on("hit", function (data) {
        if (data.hid && data.damage && character) {
            if (data.hid == character.id) {
                damage += data.damage;
            }
        }
    })
    socket.on("start", function () {
        function clamp(x, low, high) {
            return Math.min(Math.max(x, low), high);
        }

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

        var hitLog = [];
        socket.on("hit", function (data) {
            hitLog.push(data);
        });

        setTimeout(function () {
            setInterval(function () {
                //Minimap creation
                var png = new PNG({
                    width: 188 * 2,
                    height: 100 * 2,
                    filterType: -1
                });
                for (let j = 0; j < Math.floor(png.data.length / 4); j++) {
                    let idx = j << 2;
                    png.data[idx] = 5;
                    png.data[idx + 1] = 0;
                    png.data[idx + 2] = 0;
                    png.data[idx + 3] = 255;
                }
                var screenSize = {width: 800, height: 600};
                var pos = {
                    x: character.real_x - Math.floor(screenSize.width / 2),
                    y: character.real_y - Math.floor(screenSize.height / 2)
                };
                var map = character.in;

                if (G.maps[map]) {
                    let xLines = G.maps[map].data.x_lines;
                    let yLines = G.maps[map].data.y_lines;

                    for (let i = bSearch(pos.x, xLines); i < xLines.length && xLines[i][0] < pos.x + screenSize.width; i++) {
                        let line = xLines[i];
                        let x = ((line[0] - pos.x) / screenSize.width) * png.width;
                        let y1 = ((line[1] - pos.y) / screenSize.height) * png.height;
                        let y2 = ((line[2] - pos.y) / screenSize.height) * png.height;
                        pngUtil.draw_line(x, y1, x, y2, png, [255, 255, 255, 255]);
                    }

                    for (let i = bSearch(pos.y, yLines); i < yLines.length && yLines[i][0] < pos.y + screenSize.height; i++) {
                        let line = yLines[i];
                        let y = ((line[0] - pos.y) / screenSize.height) * png.height;
                        let x1 = ((line[1] - pos.x) / screenSize.width) * png.width;
                        let x2 = ((line[2] - pos.x) / screenSize.width) * png.width;
                        pngUtil.draw_line(x1, y, x2, y, png, [255, 255, 255, 255]);
                    }
                }
                // draw hit lines
                for (let hit of hitLog) {
                    let source = entities[hit.hid];
                    let target = entities[hit.id];
                    if (hit.hid === character.id)
                        source = character;
                    if (hit.id === character.id)
                        target = character;

                    if (source && target) {
                        let color = [255, 255, 255, 255];
                        if (hit.anim === "heal") {
                            color = [0, 250, 0, 255];
                        } else
                            color = [250, 0, 0, 255];
                        pngUtil.draw_line(
                            ((source.real_x - pos.x) / screenSize.width) * png.width,
                            ((source.real_y - pos.y) / screenSize.height) * png.height,
                            ((target.real_x - pos.x) / screenSize.width) * png.width,
                            ((target.real_y - pos.y) / screenSize.height) * png.height,
                            png, [200, 0, 0, 255]);
                    }
                }
                hitLog = [];
                //draw entities
                if (entities) {
                    for (let id in entities) {
                        let entity = entities[id];
                        let color = [255, 255, 255, 255];
                        if (entity.type === "monster") {
                            if (!entity.dead) {
                                color = [200, 0, 0, 255];
                            } else {
                                color = [100, 100, 100, 255];
                            }
                        }
                        pngUtil.draw_dot(
                            ((entity.real_x - pos.x) / screenSize.width) * png.width,
                            ((entity.real_y - pos.y) / screenSize.height) * png.height,
                            png, color);
                    }
                }
                //draw character
                pngUtil.draw_dot(
                    ((character.real_x - pos.x) / screenSize.width) * png.width,
                    ((character.real_y - pos.y) / screenSize.height) * png.height,
                    png, [0, 200, 0, 255]);


                let buffer = PNG.sync.write(png, options);

                process.send({
                    type: "bwiPush",
                    name: "minimap",
                    data: "data:image/png;base64," + buffer.toString("base64"),
                });
            }, 200);
            setInterval(function () {
                var targetName = "nothing";
                if (character.target && entities[character.target]) {
                    if (entities[character.target].player) {
                        targetName = entities[character.target].id
                    } else {
                        targetName = entities[character.target].mtype;
                    }
                }
                //calculate damage per second
                damageTimeline.push(damage);
                var thenDamage;
                if (damageTimeline.length < timeFrame)
                    thenDamage = damageTimeline[0];
                else
                    thenDamage = damageTimeline.shift();
                var dps = (damage - thenDamage) / damageTimeline.length;

                //calculate gold per second
                goldTimeline.push(character.gold);
                var thenGold;
                if (goldTimeline.length < timeFrame)
                    thenGold = goldTimeline[0];
                else
                    thenGold = goldTimeline.shift();
                var gps = (character.gold - thenGold) / goldTimeline.length;

                //calculate xp per second
                xpTimeline.push(character.xp);
                var thenXP;
                if (xpTimeline.length < timeFrame)
                    thenXP = xpTimeline[0];
                else
                    thenXP = xpTimeline.shift();
                var xpps = (character.xp - thenXP) / xpTimeline.length;

                //calculate time until level up
                var time = Math.floor((character.max_xp - character.xp) / xpps);
                if (time > 0) {
                    //prettify time
                    var days = Math.floor(time / (3600 * 24));
                    time -= 3600 * 24 * days;
                    var hours = Math.floor(time / 3600);
                    time -= 3600 * hours;
                    var minutes = Math.floor(time / 60);
                    time -= 60 * minutes;
                    var seconds = time;

                    if (hours < 10) {
                        hours = "0" + hours;
                    }
                    if (minutes < 10) {
                        minutes = "0" + minutes;
                    }
                    if (seconds < 10) {
                        seconds = "0" + seconds;
                    }
                }


                process.send({
                    type: "bwiUpdate",
                    data: {
                        name: character.id,
                        level: character.level,
                        inv: character.isize - character.esize + " / " + character.isize,
                        xp: Math.floor(character.xp * 10000 / character.max_xp) / 100,
                        health: Math.floor(character.hp * 10000 / character.max_hp) / 100,
                        mana: Math.floor(character.mp * 10000 / character.max_mp) / 100,
                        target: targetName,
                        status: character.rip ? "Dead" : "Alive",
                        gold: toPrettyNum(character.gold),
                        dps: Math.floor(dps),
                        gph: toPrettyNum(Math.floor(gps) * 3600),
                        xpph: toPrettyNum(Math.floor(xpps) * 3600),
                        tlu: (time > 0) ? days + "d " + hours + ":" + minutes + ":" + seconds : "Infinity",
                    }
                })
            }, 1000);


            self.executor = new Executor(glob, script);
            self.executor.execute();
            code_active = true;
        }, 3000)
    });
    socket.on("disconnect", function () {
        self.emit("disconnected", "nothing");
        process.send({type: "status", status: "disconnected"});
        self.stop();
    });
    socket.on("game_error", function (data) {
        if ("Failed: ingame" == data) {
            setTimeout(function () {
                console.log("Retrying for " + character_to_load);
                log_in(user_id, character_to_load, user_auth);
            }, 30 * 1000);
        } else if (/Failed: wait_(\d+)_seconds/g.exec(data) != null) {
            let time = /Failed: wait_(\d+)_seconds/g.exec(data)[1];
            setTimeout(function () {
                console.log("Retrying for " + character_to_load);
                log_in(user_id, character_to_load, user_auth);
            }, time * 1000 + 1000);
        }
    });
}
/**
 * Register's an event in the game
 * @param event string the name f the event
 * @param callback function the function to be called
 */
Game.prototype.on = function (event, callback) {
    if (typeof event == "string" && typeof callback == "function") {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    } else {
        if (typeof event != "string")
            throw new Error("Event has to be a string")
        if (typeof callback == "function")
            throw new Error("Callback has to be a function")
    }
};

Game.prototype.emit = function (event, arguments) {
    if (typeof event == "string") {
        if (this.events[event]) {
            this.events[event].forEach(function (current) {
                current.apply(Array.from(arguments).slice(1))
            });
        }
    }
}

Game.prototype.stop = function () {
    if (this.socket)
        this.socket.close();
};

async function main() {
    try {
        let args = process.argv.slice(2);
        let httpWrapper = new HttpWrapper(args[0], args[1], args[2]);
        let gameData = await httpWrapper.getGameData();
        let game = new Game(args[3], args[4], args[5], args[6], args[7], gameData, httpWrapper);
        game.init();
    } catch (e) {
        console.log(e)
    }
}

main();

