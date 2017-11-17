/**
 * Created by nexus on 03/04/17.
 */
function close(error) {
    console.error(error);
    process.exit(1);
}

var Game = function (ip, port, userId, characterId, socketAuth, httpWrapper, script, botKey) {
    var fs = require("fs")
    var cheerio = require("cheerio");
    var G = require("./gameData");
    var Executor = require("./Executor");

    eval(fs.readFileSync('modedGameFiles/game.js') + '');

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
    var request;
    var server_addr, port;
    var last_draw = new Date();

    var entities = {},
        future_entities = {
            players: {},
            monsters: {}
        };
    var character;

    var game = null;

    game = this;
    var M;
    server_addr = ip;
    port = port;
    user_id = userId;
    character_to_load = characterId;
    user_auth = socketAuth;

    init_socket();

    this.start = function () {
        setTimeout(function () {
            socket.emit("loaded", {success: 1, width: screen.width, height: screen.height, scale: scale})
            game_loaded = true;


            socket.on("start", function () {
                var global = {
                    gameplay: gameplay,
                    is_pvp: is_pvp,
                    server_region: server_region,
                    server_identifier: server_identifier,
                    G: G,
                    character: character,
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
                    //u_item:u_item,
                    //u_scroll:u_scroll,
                    //u_offering:u_offering,
                    upgrade: upgrade,
                    //c_items:c_items,
                    //c_last:c_last,
                    //c_scroll:c_scroll,
                    //c_offering:c_offering,
                    compound: compound,
                    //cr_items:cr_items,
                    //craft:craft,
                    //e_item:e_item,
                    exchange: exchange,
                    say: say,
                    map: map,
                    calculate_move: calculate_move,
                    M: M,
                    chests: chests,
                    entities: entities,
                    calculate_vxy: calculate_vxy,
                    show_json: show_json,
                    next_potion: next_potion,
                    send_code_message: send_code_message,
                    drawings: drawings,
                    //code_buttons:code_buttons,
                    show_modal: show_modal,
                    prop_cache: prop_cache,
                    next_attack: next_attack,
                    bot_mode: true,
                    botKey: botKey
                };

                Object.defineProperty(global, "entities", {
                    get: function () {
                        return entities;
                    }
                })
                var executor = new Executor(global, script);
                executor.execute();
            });

            socket.on("game_error", function (data) {
                console.log(data);
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
            log_in(user_id, character_to_load, user_auth);
        }, 500);
    };
}

module.exports = Game;