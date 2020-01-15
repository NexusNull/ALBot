/**
 * Created by nexus on 03/04/17.
 */

process.on('uncaughtException', function (exception) {
    console.log(exception);
    console.log(exception.stack);
    process.exit(-1);
});
var LocalStorage = require('node-localstorage').LocalStorage;
var HttpWrapper = require("./httpWrapper");
const uiGenerator = require("./uiGenerator");
const pngUtil = require("./pngUtil");
const PNG = require('pngjs').PNG;
localStorage = new LocalStorage('./app/localStorage');

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
    var friends;
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
    var is_bot = false;
    var first_coords = false,
        first_x = 0,
        first_y = 0;
    var protocol = "https";
    var is_electron = false;
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
    var cr_items;
    game = this;

    server_addr = this.ip;
    port = this.port;
    user_id = this.userId;
    character_to_load = this.characterId;
    user_auth = this.socketAuth;
    var onLoad = function () {
        log_in(user_id, character_to_load, user_auth);
    }

    eval(fs.readFileSync('./app/moddedGameFiles/game.js') + '');
    gprocess_game_data();
    init_socket();
    this.socket = socket;
    /*
    game.pathfinding = require("./PathFinding/pathFinding");
    game.pathfinding.initialize(this.G);
    */
    var bwi = {};

    //static variables
    var glob = {
        localStorage: localStorage,
        gameplay: gameplay,
        is_pvp: is_pvp,
        server_region: server_region,
        server_identifier: server_identifier,
        is_electron: is_electron,
        current_map: current_map,
        ctarget: ctarget,
        transporting: transporting,
        party_list: party_list,
        G: G,
        entities: entities,
        next_potion: next_potion,
        drawings: drawings,
        prop_cache: prop_cache,
        next_attack: next_attack,
        botKey: botKey,
        require: require,
        bwi: bwi,
        activate: activate,
        shift: shift,
        use_skill: use_skill,
        can_use: can_use,
        socket: socket,
        add_log: add_log,
        send_target_logic: send_target_logic,
        distance: distance,
        is_disabled: is_disabled,
        player_attack: player_attack,
        player_heal: player_heal,
        open_chest: open_chest,
        buy: buy,
        sell: sell,
        trade: trade,
        trade_buy: trade_buy,
        upgrade: upgrade,
        compound: compound,
        exchange: exchange,
        say: say,
        private_say: private_say,
        calculate_move: calculate_move,
        calculate_vxy: calculate_vxy,
        show_json: show_json,
        send_code_message: send_code_message,
        call_code_function: call_code_function,
        move: move,
        show_modal: show_modal,
        bot_mode: true,
        game: this,
        close_merchant: close_merchant,
        open_merchant: open_merchant,
        start_character_runner: function () {
        },
        stop_character_runner: function () {
        },
        character_code_eval: function () {
        },
        get_active_characters: function () {
        },
        skill_timeout: skill_timeout,
        buy_with_gold: buy_with_gold,
        buy_with_shells: buy_with_shells,
        craft: craft,
        dismantle: dismantle,
        storage_get: storage_get,
        storage_set: storage_set,
        monster_attack: monster_attack,
        is_bot:true,


    };
    //non static variables
    Object.defineProperty(glob, "entities", {
        get: function () {
            return entities;
        }
    });
    Object.defineProperty(glob, "code_active", {
        get: function () {
            return code_active;
        },
        set: function (value) {
            code_active = value;
        }
    });
    Object.defineProperty(glob, "sandbox", {
        get: function () {
            return sandbox;
        },
        set: function (value) {
            sandbox = value;
        }
    });
    Object.defineProperty(glob, "character", {
        get: function () {
            return character;
        }
    });
    Object.defineProperty(glob, "map", {
        get: function () {
            return map;
        }
    });
    Object.defineProperty(glob, "M", {
        get: function () {
            return M;
        }
    });
    Object.defineProperty(glob, "party", {
        get: function () {
            return party;
        }
    });
    Object.defineProperty(glob, "is_pvp", {
        get: function () {
            return is_pvp;
        }
    });
    Object.defineProperty(glob, "pvp", {
        get: function () {
            return pvp;
        }
    });
    Object.defineProperty(glob, "next_skill", {
        get: function () {
            return next_skill;
        }
    });
    Object.defineProperty(glob, "chests", {
        get: function () {
            return chests;
        }
    });
    Object.defineProperty(glob, "friends", {
        get: function () {
            return friends;
        }
    });
    Object.defineProperty(glob, "cr_items", {
        get: function () {
            return cr_items;
        },
        set: function (value) {
            cr_items = value;
        }
    });
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
    });
    socket.on("start", function () {


        var hitLog = [];
        socket.on("hit", function (data) {
            hitLog.push(data);
        });

        setTimeout(function () {
            if (uiGenerator.enableMiniMap)
                setInterval(function () {
                    let buffer = uiGenerator.generateMiniMap(hitLog, entities);
                    hitLog = [];
                    process.send({
                        type: "bwiPush",
                        name: "minimap",
                        data: "data:image/png;base64," + buffer.toString("base64"),
                    });
                }, uiGenerator.updateTiming);
            if (uiGenerator.enableBotWebInterface)
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
            throw new Error("Event has to be a string");
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
};

Game.prototype.stop = function () {
    if (this.socket)
        this.socket.close();
};

async function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

async function main() {
    try {
        let args = process.argv.slice(2);
        let httpWrapper = new HttpWrapper(args[0], args[1], args[2]);
        let gameData;
        let success = false;
        while (!success) {
            try {
                gameData = await httpWrapper.getGameData();
                success = true;
            } catch (e) {
                console.log("Fetch for game data failed trying again in 10 seconds");
                await sleep(10000);
            }
        }
        let game = new Game(args[3], args[4], args[5], args[6], args[7], gameData, httpWrapper);
        game.init();
    } catch (e) {
        console.log(e)
    }
}

main();

