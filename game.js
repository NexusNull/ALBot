/**
 * Created by nexus on 03/04/17.
 */


var LocalStorage = require('node-localstorage').LocalStorage;
var HttpWrapper = require("./httpWrapper");
localStorage = new LocalStorage('./localStorage');

function close(error) {
    console.error(error);
    process.exit(1);
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
    this.G = G

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

    var first_coords = false,
        first_x = 0,
        first_y = 0;

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

    eval(fs.readFileSync('modedGameFiles/game.js') + '');

    init_socket();
    this.socket = socket;

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
        calculate_move: calculate_move,
        chests: chests,
        entities: entities,
        calculate_vxy: calculate_vxy,
        show_json: show_json,
        next_potion: next_potion,
        send_code_message: send_code_message,
        drawings: drawings,
        move: move,
        show_modal: show_modal,
        prop_cache: prop_cache,
        next_attack: next_attack,
        bot_mode: true,
        botKey: botKey,
        game: this
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
    var timeFrame = 60*5;
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
        setTimeout(function () {
            setInterval(function () {
                var targetName = "nothing";
                if (character.target && entities[character.target]) {
                    if (entities[character.target].player) {
                        targetName = entities[character.target].id
                    } else {
                        targetName = entities[character.target].mtype;
                    }
                }
                damageTimeline.push(damage);
                var thenDamage;
                if(damageTimeline.length < timeFrame)
                    thenDamage = damageTimeline[0];
                else
                    thenDamage = damageTimeline.shift();
                var dps = (damage-thenDamage)/damageTimeline.length;

                goldTimeline.push(character.gold);
                var thenGold;
                if(goldTimeline.length < timeFrame)
                    thenGold = goldTimeline[0];
                else
                    thenGold = goldTimeline.shift();
                var gps = (character.gold-thenGold)/goldTimeline.length;

                xpTimeline.push(character.xp);
                var thenXP;
                if(xpTimeline.length < timeFrame)
                    thenXP = xpTimeline[0];
                else
                    thenXP = xpTimeline.shift();
                var xpps = (character.xp-thenXP)/xpTimeline.length;

                var time = Math.floor((character.max_xp-character.xp)/xpps);
                var days    = Math.floor(time / (3600*24));
                time -= 3600*24*days;
                var hours   = Math.floor(time / 3600);
                time -= 3600*hours;
                var minutes = Math.floor(time / 60);
                time -= 60*minutes;
                var seconds = time;

                if (hours   < 10) {hours   = "0"+hours;}
                if (minutes < 10) {minutes = "0"+minutes;}
                if (seconds < 10) {seconds = "0"+seconds;}
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
                        gold: character.gold,
                        dps: Math.floor(dps),
                        gps: Math.floor(gps),
                        xpps: Math.floor(xpps),
                        tlu: days+"d "+hours+":"+minutes+":"+seconds

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

