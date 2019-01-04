var fs = require("fs")
eval(fs.readFileSync('modedGameFiles/common_functions.js') + '');
eval(fs.readFileSync('modedGameFiles/functions.js') + '');
var Socket = require("socket.io-client");

var u_item = null
    , u_scroll = null
    , u_offering = null
    , c_items = e_array(3)
    , c_scroll = null
    , c_offering = null
    , c_last = 0
    , e_item = null
    , cr_items = e_array(9)
    , cr_last = 0;
var skillmap = {
    "1": {
        name: "use_hp"
    },
    "2": {
        name: "use_mp"
    },
    R: {
        name: "burst"
    }
}
    , skillbar = [];
var disconnect_reason = "";
var settings_shown = 0;
var is_game = 1, is_server = 0, is_code = 0, is_pvp = 0, is_demo = 0, gameplay = "normal";
var inception = new Date();
var log_game_events = true;
var scale = 2;
var round_xy = true, floor_xy = false;
var round_entities_xy = false;
var offset_walking = true;
var antialias = false, mode_nearest = true;
var force_webgl = false, force_canvas = false;
var gtest = false;
var mode = {dom_tests: 0, dom_tests_pixi: 0, bitmapfonts: 0, debug_moves: 0, destroy_tiles: 1,};
var paused = false;
var log_flags = {timers: 1,};
var ptimers = true;
var mdraw_mode = "redraw", mdraw_border = 40;
var mdraw_tiling_sprites = false;
var manual_stop = false;
var manual_centering = true;
var high_precision = false;
var retina_mode = false;
var bot_mode = false;
var text_quality = 2;
var bw_mode = false, border_mode = false;
var character_names = false;
var hp_bars = true;
var next_attack = new Date(), next_potion = new Date(), next_transport = new Date();
var last_interaction = new Date();
var afk_edge = 60, mm_afk = false;
var last_drag_start = new Date();
var last_npc_right_click = new Date();
var block_right_clicks = true;
var mouse_only = true;
var show_names = 0;
var the_code = "";
var server_region = "EU", server_identifier = "I", server_name = "", ipass = "";
var real_id = "", character = null, map = null, friends = [];
var tints = [];
var pull_all = false, pull_all_next = false,
    prepull_target_id = null;
var text_layer, monster_layer, player_layer, chest_layer, map_layer;
var rip = false, rip_texture = null;
var heartbeat = new Date(), slow_heartbeats = 0;
var ctarget = null;
var textures = {};
var total_map_tiles = 0;
var tiles = null, dtile = null;
var map_npcs = [], map_doors = [], map_animatables = {};
var map_tiles = [], map_entities = [], dtile_size = 32, dtile_width = 0, dtile_height = 0;
var water_tiles = [], last_water_frame = -1;
var drawings = [], code_buttons = {};
var chests = {}, party_list = [], party ={};
var tile_sprites = {}, sprite_last = {};
var first_coords = false, first_x = 0, first_y = 0;
var last_refxy = 0, ref_x = 0, ref_y = 0;
var last_light = new Date(0);
var transporting = false;
var topleft_npc = false, merchant_id = null, inventory = false, code = false, pvp = false, skillsui = false,
    exchange_type = "";
var topright_npc = false;
var transports = false;
var purpose = "buying";
var next_minteraction = null;
var abtesting = null, abtesting_ui = false;
var code_run = false, code_active = false;
var reload_state = false, reload_timer = null, first_entities = false;
var draws = 0;
var S = {font: "Pixel", normal: 18, large: 24, huge: 36, chat: 18,};
var rendered_target = {}, last_target_cid = null, dialogs_target = null;
var screen = {width: 1920, height: 1080}
var current_map;
var width = 1920;
var height = 1080;
var frame_ms;

setInterval(function () {

    if (!game_loaded) {
        return
    }

    var a = mssince(heartbeat);
    if (a > 900) {
        slow_heartbeats++
    } else {
        if (a < 600) {
            slow_heartbeats = 0
        }
    }
    if (is_hidden() && !is_demo) {
        pull_all_next = true
    }
    if (!is_hidden() && pull_all_next) {
        pull_all_next = false;
        pull_all = true;
        future_entities = {players: {}, monsters: {}}
    }
    if (last_draw) {
        if (code_run && mssince(last_draw) > 500) {
            draw(0, 1)
        } else {
            if (!code_run && mssince(last_draw) > 15000) {
                draw(0, 1)
            }
        }
    }
    mm_afk = (ssince(last_interaction) > afk_edge / 2);
    if (character) {
        if (!character.afk && ssince(last_interaction) > afk_edge) {
            character.afk = true;
            socket.emit("property", {afk: true})
        }
        if (character.afk && ssince(last_interaction) <= afk_edge) {
            character.afk = false;
            socket.emit("property", {afk: false})
        }
        if (mode.debug_moves) {
            socket.emit("mreport", {x: character.real_x, y: character.real_y})
        }
    }
    heartbeat = new Date()
}, 100);

function code_button() {
    add_log("Executed");
    add_tint(".mpui", {ms: 3000})
}

function log_in(a, c, b) {
    real_id = c;
    if (!game_loaded) {
        ui_log("Game hasn't loaded yet");
        return
    }
    clear_game_logs();
    add_log("Authing ...");
    socket.emit("auth", {
        user: a,
        character: c,
        auth: b,
        width: screen.width,
        height: screen.height,
        scale: scale,
        passphrase: "",
        no_html: true,
        no_graphics: true,
        bot: botKey + "",
    })
}

function disconnect() {
    var a = "DISCONNECTED", b = "Disconnected";
    game_loaded = false;
    if (disconnect_reason == "limits") {
        a = "REJECTED";
        add_log("Oops. You exceeded the limitations.");
        add_log("You can use one character on a normal server, one additional character on a PVP server and one merchant.", "#CF888A")
    } else if (disconnect_reason) {
        add_log("Disconnect Reason: " + disconnect_reason)
    } else {
        add_log("Disconnected with unknown reason");
    }


    if (socket) {
        socket.disconnect();
    }
}

function position_map() {
    if (character) {
        map.real_x = character.real_x, map.real_y = character.real_y
    }
    var a = width / 2 - map.real_x * scale, c = height / 2 - map.real_y * scale, b = false;
    a = c_round(a);
    c = c_round(c);
    if (map.x != a) {
        map.x = a, b = true
    }
    if (map.y != c) {
        map.y = c, b = true
    }
    if (b && dtile_size && dtile) {
        dtile.x = round(map.real_x - width / (scale * 2));
        dtile.y = round(map.real_y - height / (scale * 2));
        dtile.x = ceil(dtile.x / (dtile_size / 1)) * (dtile_size / 1) - (dtile_size / 1);
        dtile.y = ceil(dtile.y / (dtile_size / 1)) * (dtile_size / 1) - (dtile_size / 1)
    }
    if (character) {
        character.x = c_round(character.real_x), character.y = c_round(character.real_y)
    }
}

function reset_topleft() {
    var a = "NO TARGET";
    if (exchange_animations && topleft_npc != "exchange") {
        exchange_animations = false
    }
    if (ctarget && ctarget.dead && (!ctarget.died || ssince(ctarget.died) > 3)) {
        ctarget = null
    }
    if (ctarget != rendered_target) {
        last_target_cid = null;
        reset_inventory(1)
    }
    if (dialogs_target && dialogs_target != ctarget) {
        // $("#topleftcornerdialog").html("")
        dialogs_target = null
    }
    if (ctarget && topleft_npc) {
        topleft_npc = false;
        reset_inventory()
    }
    send_target_logic();
    if (ctarget && ctarget.type == "monster" && last_target_cid != ctarget.cid) {
        var c = ctarget;
        var e = G.monsters[c.mtype];
        if (c.dead) {
            a += " X", c.hp = 0
        }
        var f = [{line: e.name, color: "gray"}, {
            name: "HP",
            color: colors.hp,
            value: c.hp + "/" + c.max_hp,
            cursed: c.cursed
        }, {name: "XP", color: "green", value: round(c.xp * (character && character.xpm || 1))},];
        if (c.attack) {
            f.push({name: "ATT", color: "#316EE6", value: c.attack, stunned: c.stunned, poisoned: c.poisoned})
        }
        if (e.evasion) {
            f.push({name: "EVASION", color: "gray", value: e.evasion + "%"})
        }
        if (e.reflection) {
            f.push({name: "REFLECT.", color: "gray", value: e.reflection + "%"})
        }
        if (e.dreturn) {
            f.push({name: "D.RETURN", color: "gray", value: e.dreturn + "%"})
        }
        if (e.armor) {
            f.push({name: "ARMOR", color: "gray", value: e.armor})
        }
        if (e.resistance) {
            f.push({name: "RESIST.", color: "gray", value: e.resistance})
        }
        if (e.rpiercing) {
            f.push({name: "PIERCE.", color: "gray", value: e.rpiercing})
        }
        if (e.apiercing) {
            f.push({name: "PIERCE.", color: "gray", value: e.apiercing})
        }
        if (e.immune) {
            f.push({line: "IMMUNE", color: "#4EB7DE"})
        }
        if (c.target) {
            f.push({name: "TRG", color: "orange", value: c.target})
        }
        if (c.pet) {
            f = [{name: "NAME", value: c.name, color: "#5CBD97"}, {name: "PAL", value: c.owner, color: "#CF539B"},]
        }
        //render_info(f)
    } else {
        if (ctarget && ctarget.npc) {
            var f = [{name: "NPC", color: "gray", value: ctarget.name}, {
                name: "LEVEL",
                color: "orange",
                value: ctarget.level
            },];
            //render_info(f)
        } else {
            if (ctarget && ctarget.type == "character" && last_target_cid != ctarget.cid) {
                var b = ctarget;
                var f = [{
                    name: b.role && b.role.toUpperCase() || "NAME",
                    color: b.role && "#E14F8B" || "gray",
                    value: b.name
                }, {name: "LEVEL", color: "orange", value: b.level, afk: b.afk}, {
                    name: "HP",
                    color: colors.hp,
                    value: b.hp + "/" + b.max_hp
                }, {
                    name: "MP",
                    color: "#365DC5",
                    value: b.mp + "/" + b.max_mp
                }, {
                    name: (b.ctype == "priest" && "HEAL" || "ATT"),
                    color: "green",
                    value: round(b.attack),
                    cursed: b.s.cursed
                }, {
                    name: "ATTSPD",
                    color: "gray",
                    value: round(b.frequency * 100),
                    poisoned: b.s.poisoned
                }, {name: "RANGE", color: "gray", value: b.range}, {
                    name: "RUNSPD",
                    color: "gray",
                    value: round(b.speed)
                }, {name: "ARMOR", color: "gray", value: b.armor || 0}, {
                    name: "RESIST.",
                    color: "gray",
                    value: b.resistance || 0
                },], d = [];
                if (b.code) {
                    f.push({name: "CODE", color: "gold", value: "Active"})
                }
                if (b.party) {
                    f.push({name: "PARTY", color: "#FF4C73", value: b.party})
                } else {
                    if (character && !ctarget.me && !ctarget.stand) {
                        d.push({
                            name: "PARTY",
                            onclick: "socket.emit('party',{event:'invite',id:'" + ctarget.id + "'})",
                            color: "#6F3F87",
                            pm_onclick: "cpm_window('" + ctarget.name + "')"
                        })
                    }
                }
                if (character && !ctarget.me && (character.party && ctarget.party == character.party && party_list.indexOf(character.name) < party_list.indexOf(ctarget.name))) {
                    d.push({
                        name: "KICK",
                        onclick: "socket.emit('party',{event:'kick',name:'" + ctarget.name + "'})",
                        color: "#875045"
                    })
                }
                if (character && !ctarget.me && !character.party && ctarget.party) {
                    d.push({
                        name: "REQUEST",
                        onclick: "socket.emit('party',{event:'request',id:'" + ctarget.id + "'})",
                        color: "#6F3F87",
                        pm_onclick: "cpm_window('" + ctarget.name + "')"
                    })
                }
                if (ctarget.me && !character.stand && character.slots.trade1 !== undefined) {
                    d.push({name: "HIDE", onclick: "socket.emit('trade',{event:'hide'});", color: "#A99A5B"})
                }
                if (ctarget.me && !character.stand && character.slots.trade1 === undefined) {
                    d.push({name: "SHOW", onclick: "socket.emit('trade',{event:'show'});", color: "#A99A5B"})
                }
                if (ctarget.stand) {
                    d.push({
                        name: "TOGGLE",
                        onclick: "$('.cmerchant').toggle()",
                        color: "#A99A5B",
                        pm_onclick: !ctarget.me && "cpm_window('" + ctarget.name + "')"
                    })
                }
                if (character.role == "gm" && !b.me) {
                    d.push({
                        name: "SEND TO JAIL",
                        onclick: "socket.emit('jail',{id:'" + ctarget.id + "'})",
                        color: "#9525A3"
                    });
                    if (!b.mute) {
                        d.push({
                            name: "MUTE",
                            onclick: "socket.emit('mute',{id:'" + ctarget.id + "',state:1})",
                            color: "#A72379"
                        })
                    } else {
                        if (b.mute) {
                            d.push({
                                name: "UNMUTE",
                                onclick: "socket.emit('mute',{id:'" + ctarget.id + "',state:0})",
                                color: "#C45BAF"
                            })
                        }
                    }
                }
                //render_info(f, d);
                //render_slots(b)
            } else {
                if (!ctarget && rendered_target != null) {
                    //$("#topleftcornerui").html('<div class="gamebutton">NO TARGET</div>')
                }
            }
        }
    }
    rendered_target = ctarget;
    last_target_cid = ctarget && ctarget.cid
}

function sync_entity(c, a) {
    adopt_soft_properties(c, a);
    if (c.resync) {
        c.real_x = a.x;
        c.real_y = a.y;
        if (a.moving) {
            c.engaged_move = -1, c.move_num = 0
        } else {
            c.engaged_move = c.move_num = a.move_num, c.angle = ((a.angle === undefined && 90) || a.angle), set_direction(c)
        }
        c.resync = c.moving = false
    }
    if (a.abs && !c.abs) {
        c.abs = true;
        c.moving = false
    }
    if (c.move_num != c.engaged_move) {
        var b = 1, d = simple_distance({x: c.real_x, y: c.real_y}, a);
        if (d > 120) {
            c.real_x = a.x;
            c.real_y = a.y;
            if (log_game_events) {
                console.log("manual x,y correction for: " + (c.name || c.id))
            }
        }
        b = simple_distance({x: c.real_x, y: c.real_y}, {
            x: a.going_x,
            y: a.going_y
        }) / (simple_distance(a, {x: a.going_x, y: a.going_y}) + EPS);
        c.moving = true;
        c.abs = false;
        c.engaged_move = c.move_num;
        c.from_x = c.real_x;
        c.from_y = c.real_y;
        c.going_x = a.going_x;
        c.going_y = a.going_y;
        calculate_vxy(c, b)
    }
}

function process_entities() {
    for (var key in future_entities.monsters) {
        var future_monster = future_entities.monsters[key];
        var monster = entities[future_monster.id];
        if (!monster) {
            if (future_monster.dead) {
                continue
            }
            if (gtest) {
                return
            }
            try {
                monster = entities[future_monster.id] = add_monster(future_monster);

            } catch (c) {
                console.log("EMAIL HELLO@ADVENTURE.LAND WITH THIS: " + JSON.stringify(future_monster))
            }
            monster.drawn = false;
            monster.resync = true
        }
        if (future_monster.dead) {
            monster.dead = true;
            continue
        }
        sync_entity(monster, future_monster);
    }
    for (var f in future_entities.players) {
        var a = future_entities.players[f];
        var d = entities[a.id];
        if (character && character.id == a.id) {
            continue
        }
        if (!d) {
            if (a.dead) {
                continue
            }
            a.external = true;
            a.player = true;
            d = entities[a.id] = add_character(a);
            d.drawn = false;
            d.resync = true;
            if (mssince(last_light) < 500) {
                //start_animation(d, "light")
            }
        }
        if (a.dead) {
            d.dead = true;
            continue
        }
        sync_entity(d, a)
    }
}

function on_disappear(event) {
    if (future_entities.players[event.id]) {
        delete future_entities.players[event.id]
    }
    if (future_entities.monsters[event.id]) {
        delete future_entities.monsters[event.id]
    }
    if (entities[event.id]) {
        if (event.invis) {
            assassin_smoke(entities[event.id].real_x, entities[event.id].real_y)
        }
        if (event.effect === 1) {
            start_animation(entities[event.id], "transport")
        }
        entities["DEAD" + event.id] = entities[event.id];
        entities[event.id].dead = true;
        if (event.teleport) {
            entities[event.id].tpd = true
        }
        call_code_function("on_disappear", entities[event.id], event);
        delete entities[event.id]
    } else {
        if (character && character.id == event.id) {
            if (event.invis) {
                assassin_smoke(character.real_x, character.real_y)
            }
            call_code_function("on_disappear", character, event)
        }
    }
}

var asp_skip = {};
["x", "y", "vx", "vy", "moving", "abs", "going_x", "going_y", "from_x", "from_y", "width", "height", "type", "events", "angle", "skin"].forEach(function (a) {
    asp_skip[a] = true
});

function adopt_soft_properties(entity, data) {
    if (entity && entity.me) {
        if (entity.moving && entity.speed && data.speed && entity.speed != data.speed) {
            entity.speed = data.speed;
            calculate_vxy(entity)
        }
        if (data.abs) {
            entity.moving = false
        }
        entity.bank = null
    }
    if (entity.type == "monster" && G.monsters[entity.mtype]) {
        var c = G.monsters[entity.mtype];
        [["speed", "speed"], ["hp", "hp"], ["max_hp", "hp"], ["mp", "mp"], ["max_mp", "mp"], ["attack", "attack"], ["xp", "xp"], ["frequency", "frequency"], ["heal", "heal"]].forEach(function (e) {
            if (c[e[1]] !== undefined && (data[e[0]] === undefined || entity[e[0]] === undefined)) {
                entity[e[0]] = c[e[1]]
            }
        })
    }
    if (entity.type == "character" && entity.skin && entity.skin != c.skin && !entity.rip) {
        entity.skin = c.skin;
    }
    for (prop in data) {
        if (asp_skip[prop]) {
            continue
        }
        entity[prop] = data[prop]
    }
    if (entity.slots) {
        entity.g10 = entity.g9 = entity.g8 = undefined;
        for (var c in entity.slots) {
            if ((c == "chest" || c == "mainhand") && entity.slots[c]) {
                if (entity.slots[c].level == 10) {
                    entity.g10 = true
                }
                if (entity.slots[c].level == 9) {
                    entity.g9 = true
                }
                if (entity.slots[c].level == 8) {
                    entity.g8 = true
                }
            }
        }
        if (entity.g10) {
            entity.g9 = entity.g8 = undefined
        }
        if (entity.g9) {
            entity.g8 = undefined
        }
    }
    if (entity.me) {
        entity.bank = entity.user
    }
    entity.last_ms = new Date();
}

function reposition_ui() {
    if (character) {
        //$("#topmid").css("right", round(($("html").width() - $("#topmid").outerWidth()) / 2));
        //$("#bottommid").css("right", round(($("html").width() - $("#bottommid").outerWidth()) / 2))
    }
}

function update_overlays() {

}

function on_load_progress(a, b) {
    //$("#progressui").html(round(a.progress) + "%")
}

function init_demo() {
    is_demo = 1;
    current_map = "shellsisland";
    M = G.maps[current_map].data;
    GEO = G.geometry[current_map];
    reflect_music();
    load_game();
    G.maps[current_map].monsters.forEach(function(a) {
        future_entities.monsters[a.type] = {
            type: a.type,
            speed: 8,
            id: a.type,
            x: a.boundary[0] + (a.boundary[2] - a.boundary[0]) * Math.random(),
            y: a.boundary[1] + (a.boundary[3] - a.boundary[1]) * Math.random(),
            boundary: a.boundary,
            s: {},
            "in": current_map,
            map: current_map,
            moving: false,
            demo: true,
        }
    })
}

function init_socket() {

    socket = new Socket("wss://" + server_addr + ":" + port, {
        autoConnect: false,
        extraHeaders: {
            "user-agent": "AdventureLandBot: (v1.0.0)",
            referer: "http://adventure.land/",
            "accept-language": "en-US,en;q=0.5"
        }
    });

    socket.on("connect", function () {
        console.log("Socket connection established");
    });


    var original_onevent = socket.onevent;
    var original_emit = socket.emit;


    socket.emit = function (packet) {
        var is_transport = in_arr(arguments && arguments["0"], ["transport", "enter", "leave"]);
        if (false) {
            console.log("CALL", JSON.stringify(arguments) + " " + new Date())
        }
        if (!(transporting && is_transport && ssince(transporting) < 8)) {
            original_emit.apply(socket, arguments);
            if (is_transport) {
                transporting = new Date()
            }
        }
    };
    socket.onevent = function (packet) {
        if (false) {
            console.log("INCOMING", JSON.stringify(arguments) + " " + new Date())
        }
        original_onevent.apply(socket, arguments)
    };
    socket.on("welcome", function (data) {
        is_pvp = data.pvp;
        gameplay = data.gameplay;
        server_region = data.region;
        server_identifier = data.name;
        server_name = server_names[data.region] + " " + data.name;
        clear_game_logs();
        add_log("Welcome to " + server_names[data.region] + " " + data.name);
        add_update_notes();
        M = G.maps[data.map].data;
        current_map = data.map;
        first_coords = true;
        first_x = data.x;
        first_y = data.y;

        M = G.maps[current_map].data;
        GEO = G.geometry[current_map];

        if (!game_loaded) {
            load_game()
        } else {
            create_map();
            socket.emit("loaded", {success: 1, width: screen.width, height: screen.height, scale: scale})
        }
        new_map_logic("welcome", data)
    });
    socket.on("observing", function (data) {
        var create = false;
        if (current_map != data.map) {
            create = true
        }
        current_map = data.map;
        reflect_music();
        M = G.maps[current_map].data;
        GEO = G.geometry[current_map];
        if (create) {
            create_map()
        }
        map.x = parseInt(data.x);
        map.y = parseInt(data.y);
        position_map()
    });
    socket.on("new_map", function (data) {
        var create = false;
        transporting = false;
        if (current_map != data.name) {
            create = true;
            topleft_npc = false
        }
        current_map = data.name;
        reflect_music();
        M = G.maps[current_map].data;
        GEO = G.geometry[current_map];
        character.real_x = data.x;
        character.real_y = data.y;
        character.m = data.m;
        character.moving = false;
        character.direction = data.direction || 0;
        character.map = current_map;
        character["in"] = data["in"];
        if (data.effect === "blink") {
            delete character.fading_out;
            delete character.s.blink;
        }
        if (data.effect === "magiport") {
            delete character.fading_out;
            delete character.s.magiport;
        }
        character.tp = data.effect;
        var cm_timer = new Date();
        if (create) {
            create_map()
        }
        pull_all = true;
        position_map();
        new_map_logic("map", data)
    });
    socket.on("start", function (data) {
        inside = "game";
        var ipass = data.ipass;
        character = add_character(data, 1);
        if (!data.vision) {
            character.vision = [700, 500]
        }
        friends = data.friends;
        clear_game_logs();
        add_log("Connected!");
        update_overlays();
        if (character.map != current_map) {
            current_map = character.map;
            reflect_music();
            M = G.maps[current_map].data;
            GEO = G.geometry[current_map];
            create_map();
            pull_all = true
        }
        position_map();
        rip_logic();
        new_map_logic("start", data);
        new_game_logic();


        if (character.ctype == "mage") {
            skill_timeout("burst", 10000)
        }
        if (character.ctype == "ranger") {
            skill_timeout("supershot", 10000)
        }

    });
    socket.on("correction", function (data) {
        if (can_move({
                map: character.map,
                x: character.real_x,
                y: character.real_y,
                going_x: data.x,
                going_y: data.y
            })) {
            console.log("Character correction");
            character.real_x = parseFloat(data.x);
            character.real_y = parseFloat(data.y);
            character.moving = false;
            character.vx = character.vy = 0
        }
    });
    socket.on("players", function (data) {
        load_server_list(data)
    });
    socket.on("pvp_list", function (data) {
        if (data.code) {
            call_code_function("trigger_event", "pvp_list", data.list)
        } else {
            load_pvp_list(data.list)
        }
    });
    socket.on("requesting_ack", function () {
        socket.emit("requested_ack", {})
    });
    socket.on("game_error", function (data) {
        draw_trigger(function () {
            if (is_string(data)) {
                ui_error(data)
            } else {
                ui_error(data.message)
            }
        })
    });
    socket.on("game_log", function (data) {
    });
    socket.on("fx", function (data) {
        draw_trigger(function () {
            if (data.name == "the_door") {
                the_door()
            }
        })
    });
    socket.on("online", function (data) {
    });
    socket.on("light", function (data) {
        if (data.affected) {
            if (is_pvp) {
                pvp_timeout(3600)
            }
            skill_timeout("invis", 12000)
        }
        draw_trigger(function () {
            if (data.affected) {
                start_animation(player, "light")
            }
            last_light = new Date();
            var player = get_player(data.name);
            if (!player) {
                return
            }
            d_text("LIGHT", player, {color: "white"});
            if (player.me) {
                start_animation(player, "light")
            }
            for (var id in entities) {
                var entity = entities[id];
                if (is_player(entity) && distance(entity, player) < 300) {
                    start_animation(entity, "light")
                }
            }
        })
    });
    socket.on("game_event", function (data) {
        if (!data.name) {
            data = {name: data}
        }
        if (data.name == "pinkgoo") {
            add_chat("", "The 'Love Goo' has respawned in " + G.maps[data.map].name + "!", "#EDB0E0")
        }
        if (data.name == "wabbit") {
            add_chat("", "Wabbit has respawned in " + G.maps[data.map].name + "!", "#78CFEF")
        }
        if (data.name == "goldenbat") {
            add_chat("", "The Golden Bat has spawned in " + G.maps[data.map].name + "!", "gold")
        }
        if (data.name == "ab_score") {
            if (!abtesting) {
                return
            }
            abtesting.A = data.A;
            abtesting.B = data.B
        }
        call_code_function("on_game_event", data)
    });
    socket.on("game_response", function (data) {
        draw_trigger(function () {
            var response = data.response || data;
            if (response == "elixir") {
                ui_log("Consumed the elixir", "gray");
                d_text("YUM", character, {
                    color: "elixir"
                })
            } else {
                if (response == "nothing") {
                    ui_log("Nothing happens", "gray")
                } else {
                    if (response == "not_ready") {
                        d_text("NOT READY", character)
                    } else {
                        if (response == "no_mp") {
                            d_text("NO MP", character)
                        } else {
                            if (response == "skill_too_far") {
                                d_text("TOO FAR", character)
                            } else {
                                if (response == "target_alive") {
                                    d_text("LOOKS LIVE?", character)
                                } else {
                                    if (response == "no_target") {
                                        if (!ctarget) {
                                            d_text("NO TARGET", character)
                                        } else {
                                            d_text("INVALID TARGET", character)
                                        }
                                    } else {
                                        if (response == "non_friendly_target") {
                                            d_text("NON FRIENDLY", character)
                                        } else {
                                            if (response == "no_level") {
                                                d_text("LOW LEVEL", character)
                                            } else {
                                                if (response == "skill_cant_use") {
                                                    d_text("CAN'T USE", character)
                                                } else {
                                                    if (response == "skill_cant_wtype") {
                                                        ui_log("Wrong weapon", "gray");
                                                        d_text("NOPE", character)
                                                    } else {
                                                        if (response == "exchange_full") {
                                                            d_text("NO SPACE", character);
                                                            ui_log("Inventory is full", "gray");
                                                            reopen()
                                                        } else {
                                                            if (response == "exchange_notenough") {
                                                                d_text("NOT ENOUGH", character);
                                                                ui_log("Need more", "gray");
                                                                reopen()
                                                            } else {
                                                                if (in_arr(response, ["mistletoe_success", "leather_success", "candycane_success", "ornament_success", "seashell_success", "gemfragment_success"])) {
                                                                    render_interaction(response)
                                                                } else {
                                                                    if (response == "cant_escape") {
                                                                        d_text("CAN'T ESCAPE", character);
                                                                        transporting = false
                                                                    } else {
                                                                        if (response == "cant_enter") {
                                                                            ui_log("Can't enter", "gray");
                                                                            transporting = false
                                                                        } else {
                                                                            if (response == "bank_opi") {
                                                                                ui_log("Bank connection in progress", "gray");
                                                                                transporting = false
                                                                            } else {
                                                                                if (response == "bank_opx") {
                                                                                    if (data.name) {
                                                                                        ui_log(data.name + " is in the bank", "gray")
                                                                                    } else {
                                                                                        ui_log("Bank is busy right now", "gray")
                                                                                    }
                                                                                    transporting = false
                                                                                } else {
                                                                                    if (response == "transport_failed") {
                                                                                        transporting = false
                                                                                    } else {
                                                                                        if (response == "loot_failed") {
                                                                                            close_chests();
                                                                                            ui_log("Can't loot", "gray")
                                                                                        } else {
                                                                                            if (response == "loot_no_space") {
                                                                                                close_chests();
                                                                                                d_text("NO SPACE", character)
                                                                                            } else {
                                                                                                if (response == "transport_cant_reach") {
                                                                                                    ui_log("Can't reach", "gray");
                                                                                                    transporting = false
                                                                                                } else {
                                                                                                    if (response == "destroyed") {
                                                                                                        ui_log("Destroyed " + G.items[data.name].name, "gray")
                                                                                                    } else {
                                                                                                        if (response == "buy_get_closer" || response == "sell_get_closer" || response == "trade_get_closer" || response == "ecu_get_closer") {
                                                                                                            if (response == "buy_get_closer") {
                                                                                                                call_code_function("trigger_event", "buy_fail", {
                                                                                                                    rxd: rxd,
                                                                                                                    reason: "distance"
                                                                                                                })
                                                                                                            }
                                                                                                            ui_log("Get closer", "gray")
                                                                                                        } else {
                                                                                                            if (response == "condition") {
                                                                                                                var def = G.conditions[data.name]
                                                                                                                    ,
                                                                                                                    from = data.from;
                                                                                                                if (def.bad) {
                                                                                                                    ui_log("Afflicted by " + def.name, "gray")
                                                                                                                } else {
                                                                                                                    if (from) {
                                                                                                                        ui_log(from + " buffed you with " + def.name, "gray")
                                                                                                                    } else {
                                                                                                                        ui_log("Buffed with " + def.name, "gray")
                                                                                                                    }
                                                                                                                }
                                                                                                            } else {
                                                                                                                if (response == "ex_condition") {
                                                                                                                    var def = G.conditions[data.name];
                                                                                                                    ui_log(def.name + " faded away ...", "gray")
                                                                                                                } else {
                                                                                                                    if (response == "buy_cant_npc") {
                                                                                                                        ui_log("Can't buy this from an NPC", "gray"),
                                                                                                                            call_code_function("trigger_event", "buy_fail", {
                                                                                                                                rxd: rxd,
                                                                                                                                reason: "not_buyable"
                                                                                                                            })
                                                                                                                    } else {
                                                                                                                        if (response == "buy_cost") {
                                                                                                                            d_text("INSUFFICIENT", character),
                                                                                                                                ui_log("Not enough gold", "gray"),
                                                                                                                                call_code_function("trigger_event", "buy_fail", {
                                                                                                                                    rxd: rxd,
                                                                                                                                    reason: "gold"
                                                                                                                                })
                                                                                                                        } else {
                                                                                                                            if (response == "cant_reach") {
                                                                                                                                ui_log("Can't reach", "gray")
                                                                                                                            } else {
                                                                                                                                if (response == "no_item") {
                                                                                                                                    ui_log("No item provided", "gray")
                                                                                                                                } else {
                                                                                                                                    if (response == "op_unavailable") {
                                                                                                                                        add_chat("", "Operation unavailable", "gray")
                                                                                                                                    } else {
                                                                                                                                        if (response == "send_no_space") {
                                                                                                                                            add_chat("", "No space on receiver", "gray")
                                                                                                                                        } else {
                                                                                                                                            if (response == "send_no_item") {
                                                                                                                                                add_chat("", "Nothing to send", "gray")
                                                                                                                                            } else {
                                                                                                                                                if (response == "signed_up") {
                                                                                                                                                    ui_log("Signed Up!", "#39BB54")
                                                                                                                                                } else {
                                                                                                                                                    if (response == "item_received" || response == "item_sent") {
                                                                                                                                                        var additional = "";
                                                                                                                                                        if (data.q > 1) {
                                                                                                                                                            additional = "(x" + data.q + ")"
                                                                                                                                                        }
                                                                                                                                                        if (response == "item_received") {
                                                                                                                                                            add_chat("", "Received " + G.items[data.item].name + additional + " from " + data.name, "#6AB3FF")
                                                                                                                                                        } else {
                                                                                                                                                            add_chat("", "Sent " + G.items[data.item].name + additional + " to " + data.name, "#6AB3FF")
                                                                                                                                                        }
                                                                                                                                                    } else {
                                                                                                                                                        if (response == "gold_not_enough") {
                                                                                                                                                            add_chat("", "Not enough gold", colors.gold)
                                                                                                                                                        } else {
                                                                                                                                                            if (response == "gold_sent") {
                                                                                                                                                                add_chat("", "Sent " + to_pretty_num(data.gold) + " gold to " + data.name, colors.gold)
                                                                                                                                                            } else {
                                                                                                                                                                if (response == "gold_received") {
                                                                                                                                                                    add_chat("", "Received " + to_pretty_num(data.gold) + " gold from " + data.name, colors.gold)
                                                                                                                                                                } else {
                                                                                                                                                                    if (response == "friend_already") {
                                                                                                                                                                        add_chat("", "You are already friends", "gray")
                                                                                                                                                                    } else {
                                                                                                                                                                        if (response == "friend_rleft") {
                                                                                                                                                                            add_chat("", "Player left the server", "gray")
                                                                                                                                                                        } else {
                                                                                                                                                                            if (response == "friend_rsent") {
                                                                                                                                                                                add_chat("", "Friend request sent", "#409BDD")
                                                                                                                                                                            } else {
                                                                                                                                                                                if (response == "friend_expired") {
                                                                                                                                                                                    add_chat("", "Request expired", "#409BDD")
                                                                                                                                                                                } else {
                                                                                                                                                                                    if (response == "friend_failed") {
                                                                                                                                                                                        add_chat("", "Friendship failed, reason: " + data.reason, "#409BDD")
                                                                                                                                                                                    } else {
                                                                                                                                                                                        if (response == "craft") {
                                                                                                                                                                                            var def = G.craft[data.name];
                                                                                                                                                                                            ui_log("Spent " + to_pretty_num(def.cost) + " gold", "gray");
                                                                                                                                                                                            ui_log("Received " + G.items[data.name].name, "white")
                                                                                                                                                                                        } else {
                                                                                                                                                                                            if (response == "dismantle") {
                                                                                                                                                                                                var def = G.dismantle[data.name];
                                                                                                                                                                                                ui_log("Spent " + to_pretty_num(def.cost) + " gold", "gray");
                                                                                                                                                                                                ui_log("Dismantled " + G.items[data.name].name, "#CF5C65")
                                                                                                                                                                                            } else {
                                                                                                                                                                                                if (response == "dismantle_cant") {
                                                                                                                                                                                                    ui_log("Can't dismantle", "gray")
                                                                                                                                                                                                } else {
                                                                                                                                                                                                    if (response == "inv_size") {
                                                                                                                                                                                                        ui_log("Need more empty space", "gray")
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        if (response == "craft_cant") {
                                                                                                                                                                                                            ui_log("Can't craft", "gray")
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                            if (response == "craft_cant_quantity") {
                                                                                                                                                                                                                ui_log("Not enough materials", "gray")
                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                if (response == "craft_atleast2") {
                                                                                                                                                                                                                    ui_log("You need to provide at least 2 items", "gray")
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                    if (response == "target_lock") {
                                                                                                                                                                                                                        ui_log("Target Acquired: " + G.monsters[data.monster].name, "#F00B22")
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        if (response == "cooldown") {
                                                                                                                                                                                                                            d_text("NOT READY", character)
                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                            if (response == "blink_failed") {
                                                                                                                                                                                                                                no_no_no();
                                                                                                                                                                                                                                d_text("NO", character);
                                                                                                                                                                                                                                last_blink_pressed = inception
                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                if (response == "magiport_failed") {
                                                                                                                                                                                                                                    ui_log("Magiport failed", "gray"),
                                                                                                                                                                                                                                        no_no_no(2)
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                    if (response == "revive_failed") {
                                                                                                                                                                                                                                        ui_log("Revival failed", "gray"),
                                                                                                                                                                                                                                            no_no_no(1)
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                        console.log("Missed game_response: " + response)
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                }
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    });
    socket.on("gm", function (data) {
        if (data.ids && data.action == "jump_list") {
            var buttons = [];
            hide_modal();
            data.ids.forEach(function (id) {
                buttons.push({
                    button: id,
                    onclick: function () {
                        socket.emit("gm", {
                            action: "jump",
                            id: id
                        })
                    }
                })
            });
            get_input({
                no_wrap: true,
                elements: buttons
            })
        }
    });
    socket.on("secondhands", function (data) {
        secondhands = data;
    });
    socket.on("tavern", function (data) {
    });
    socket.on("game_chat_log", function (data) {
        draw_trigger(function () {
            if (is_string(data)) {
                add_chat("", data)
            } else {
                add_chat("", data.message, data.color)
            }
        })
    });
    socket.on("chat_log", function (data) {
        draw_trigger(function () {
            var entity = get_entity(data.id);
            if (entity) {
                d_text(data.message, entity, {size: S.chat})
            }
            sfx("chat");
            add_chat(data.owner, data.message)
        })
    });
    socket.on("ui", function (data) {
        draw_trigger(function () {
            if (in_arr(data.type, ["+$", "-$"])) {
                var npc = get_npc(data.id), player = get_player(data.name);
                if (topleft_npc == "merchant" && merchant_id) {
                    npc = get_npc(merchant_id) || npc
                }
                if (data.type == "-$") {
                    if (npc) {
                        d_text(data.type, npc, {color: colors.white_negative})
                    }
                    if (player) {
                        d_text("+$", player, {color: colors.white_positive})
                    }
                    call_code_function("trigger_event", "sell", {
                        item: data.item,
                        name: data.name,
                        npc: data.id,
                        num: data.num
                    })
                } else {
                    if (npc) {
                        d_text(data.type, npc, {color: colors.white_positive})
                    }
                    if (player) {
                        d_text("-$", player, {color: colors.white_negative})
                    }
                    call_code_function("trigger_event", "buy", {
                        item: data.item,
                        name: data.name,
                        npc: data.id,
                        num: data.num
                    })
                }
            }
        })
    });
    socket.on("upgrade", function (data) {
        draw_trigger(function () {
            if (data.type == "upgrade") {
                assassin_smoke(G.maps.main.ref.u_mid[0], G.maps.main.ref.u_mid[1], "explode_up")
            } else {
                if (data.type == "compound") {
                    assassin_smoke(G.maps.main.ref.c_mid[0], G.maps.main.ref.c_mid[1], "explode_up")
                }
            }
            map_npcs.forEach(function (npc) {
                if (data.type == "exchange" && npc.role == data.type) {
                    start_animation(npc, "exchange")
                }
                if (npc.role == "newupgrade" && (data.type == "upgrade" || data.type == "compound")) {
                    if (data.success) {
                        start_animation(npc, "success")
                    } else {
                        start_animation(npc, "failure")
                    }
                }
            })
        })
    });
    socket.on("server_message", function (data) {
        console.log(data.message);
    });
    socket.on("notice", function (data) {
        add_chat("SERVER", data.message, data.color || "orange")
    });
    socket.on("reloaded", function (data) {
        add_chat("SERVER", "Executed a live reload. (Optional) Refresh the game.", "orange");
        if (data.change) {
            add_chat("CHANGES", data.change, "#59CAFF")
        }
        reload_data()
    });
    socket.on("chest_opened", function (data) {
        if (chests[data.id]) {
            delete chests[data.id];
        }
    });
    socket.on("cm", function (data) {
        try {
            call_code_function("on_cm", data.name, JSON.parse(data.message))
        } catch (e) {
            console.log(e)
        }
    });
    socket.on("pm", function (data) {
        draw_trigger(function () {
             add_chat(data.owner, data.message, "#CD7879")
        })
    });
    socket.on("partym", function (data) {
        draw_trigger(function () {
            add_chat(data.owner, data.message, "#46A0C6")
        })
    });
    socket.on("drop", function (data) {
        draw_trigger(function () {
            add_chest(data)
        })
    });
    socket.on("reopen", function (data) {
        reopen()
    });
    socket.on("simple_eval", function (data) {
        eval(data.code)
    });
    socket.on("eval", function (data) {
        smart_eval(data.code, data.args)
    });
    socket.on("player", function (data) {
        if (character) {
            adopt_soft_properties(character, data);
            rip_logic()
        }
    });
    socket.on("player_nr", function (data) {
        if (data.events) {
            game_events_logic(data.events);
            delete data.events
        }
        if (character) {
            adopt_soft_properties(character, data);
                rip_logic()
        }
        reopen()
    });
    socket.on("end", function (data) {
    });
    socket.on("disconnect", function () {
        disconnect()
    });
    socket.on("disconnect_reason", function (reason) {

        console.log(disconnect_reason, reason);
        disconnect_reason = reason
    });
    socket.on("hit", function (data) {
        var entity = get_entity(data.id), owner = get_entity(data.hid);
        draw_trigger(function () {
            if (owner && entity && owner != entity) {
                direction_logic(owner, entity, "attack")
            }
            if (entity && data.anim) {
                var anim = data.anim;
                if (data.reflect) {
                    data.anim = "explode_c"
                }
                start_animation(entity, data.anim);
                if (in_arr(data.anim, ["explode_a", "explode_c"])) {
                    sfx("explosion")
                } else {
                    sfx("monster_hit")
                }
            }
            if (entity && data.damage !== undefined) {
                var color = "red";
                if (data.reflect) {
                    d_line(owner, entity, {color: "reflect"})
                } else {
                    if (data.anim == "taunt") {
                        d_line(owner, entity, {color: "taunt"})
                    } else {
                        if (data.anim == "burst") {
                            d_line(owner, entity, {color: "burst"}), color = "burst"
                        } else {
                            if (data.anim == "supershot") {
                                d_line(owner, entity, {color: "supershot"})
                            } else {
                                if (data.anim == "curse") {
                                    d_line(owner, entity, {color: "curse"}), start_animation(entity, "curse")
                                } else {
                                    if (owner && owner.me) {
                                        if (sd_lines) {
                                            d_line(owner, entity, {color: "my_hit"})
                                        }
                                    } else {
                                        if (owner) {
                                            d_line(owner, entity)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (data.anim != "curse") {
                    d_text("-" + data.damage, entity, {color: color})
                }
            }
            if (entity && data.heal !== undefined) {
                if (owner) {
                    d_line(owner, entity, {color: "heal"})
                }
                data.heal = abs(data.heal);
                d_text("+" + data.heal, entity, {color: "#EE4D93"})
            }
        })
    });
    socket.on("disappearing_text", function (data) {
        draw_trigger(function () {
            if (!data.args) {
                data.args = {}
            }
            if (data.args.sz) {
                data.args.size = data.args.sz
            }
            if (data.args.c) {
                data.args.color = data.args.c
            }
            var entity = (data.id && get_entity(data.id));
            if (entity) {
                d_text(data.message, entity, data.args)
            } else {
                d_text(data.message, data.x, data.y, data.args)
            }
        })
    });
    socket.on("death", function (data) {
        data.death = true;
        on_disappear(data)
    });
    var erec = 0;
    socket.on("entities", function (data) {
        if (data.type == "all") {
            if (!first_entities) {
                first_entities = true;
            }
        }
        erec++;
        if (data.type == "all") {
            //console.log("all entities " + new Date())
        }
        if (character) {
            if (data.xy) {
                last_refxy = new Date(), ref_x = data.x, ref_y = data.y
            } else {
                last_refxy = 0
            }
        }
        if (!pull_all) {
            for (var i = 0; i < data.players.length; i++) {
                future_entities.players[data.players[i].id] = data.players[i]
            }
            for (var i = 0; i < data.monsters.length; i++) {
                var old_events = future_entities.players[data.monsters[i].id] && future_entities.players[data.monsters[i].id].events;
                future_entities.monsters[data.monsters[i].id] = data.monsters[i];
                if (old_events) {
                    future_entities.monsters[data.monsters[i].id].events = old_events + future_entities.monsters[data.monsters[i].id].events
                }
            }
        }
    });
    socket.on("disappear", function (data) {
        on_disappear(data)
    });
    socket.on("info", function (info) {
        render_info(info)
    });
    socket.on("test", function (data) {
        console.log(data.date)
    });
    socket.on("invite", function (data) {
        draw_trigger(function () {
            add_invite(data.name)
        })
    });
    socket.on("request", function (data) {
        draw_trigger(function () {
            add_request(data.name)
        })
    });
    socket.on("frequest", function (data) {
        draw_trigger(function () {
            add_frequest(data.name)
        })
    });
    socket.on("friend", function (data) {
        draw_trigger(function () {
            if (data.event == "new") {
                add_chat("", "You are now friends with " + data.name, "#409BDD");
                friends = data.friends
            }
            if (data.event == "request") {
                add_frequest(data.name)
            }
            if (data.event == "update") {
                friends = data.friends
            }
        })
    });
    socket.on("party_update", function (data) {
        if (data.message) {
            if (data.leave) {
                add_log(data.message, "#875045")
            } else {
                add_log(data.message, "#703987")
            }
        }
        party_list = data.list || [];
        party = data.party || {};
    });
    socket.on("blocker", function (data) {
        if (data.type == "pvp") {
            if (data.allow) {
                add_chat("Ace", "Be careful in there!", "#62C358");
                draw_trigger(function () {
                    var npc = get_npc("pvpblocker");
                    if (npc) {
                        map_npcs.splice(map_npcs.indexOf(get_npc("pvpblocker")), 1);
                        draw_timeout(fade_away(1, npc), 30, 1)
                    }
                })
            } else {
                add_chat("Ace", "I will leave when there are 6 adventurers around.", "#C36348")
            }
        }
    });
    socket.on("trade_history", function (data) {
        data.forEach(function (h) {
            var item = G.items[h[2].name].name;
            if (h[2].level) {
                item += " +" + h[2].level
            }
            if (h[0] == "buy") {
                add_log("- Bought '" + item + "' from " + h[1] + " for " + to_pretty_num(h[3]) + " gold", "gray")
            } else {
                add_log("- Sold '" + item + "' to " + h[1] + " for " + to_pretty_num(h[3]) + " gold", "gray")
            }
        });
        if (!data.length) {
            add_log("No trade recorded yet.", "gray")
        }
    });
    socket.open();
}

function player_click(a) {
    if (is_npc(this) && this.name == "Bean") {
        render_interaction("subscribe", this.party)
    } else {
        ctarget = this
    }
    a.stopPropagation()
}

function player_attack(a) {
    ctarget = this;
    direction_logic(character, ctarget);
    if (!character || distance(this, character) > character.range) {
        draw_trigger(function () {
            d_text("TOO FAR", character)
        })
    } else {
        socket.emit("attack", {
            id: this.id
        })
    }
    if (a) {
        a.stopPropagation()
    }
}

function player_heal(a) {
    if (this != character) {
        ctarget = this
    }
    if (this != character) {
        direction_logic(character, ctarget)
    }
    if (!character || distance(this, character) > character.range) {
        draw_trigger(function () {
            d_text("TOO FAR", character)
        })
    } else {
        socket.emit("heal", {
            id: this.id
        })
    }
    if (a) {
        a.stopPropagation()
    }
}

function player_right_click(b) {
    if (this.npc && this.id == "pvp") {
        if (this.allow) {
            var a = "Be careful in there!";
            add_chat("Ace", a);
            d_text(a, this, {size: S.chat})
        } else {
            var a = "I will guard this entrance until there are 6 adventurers around.";
            add_chat("Ace", a);
            d_text(a, this, {size: S.chat})
        }
    } else {
        if (character.slots.mainhand && character.slots.mainhand.name == "cupid") {
            player_attack.call(this)
        } else {
            if (character.ctype == "priest") {
                if (!pvp || character.party && this.party == character.party) {
                    player_heal.call(this)
                } else {
                    if (pvp) {
                        player_attack.call(this)
                    } else {
                        return
                    }
                }
            } else {
                if (!pvp || character.party && this.party == character.party) {
                    return
                } else {
                    if (pvp) {
                        player_attack.call(this)
                    } else {
                        return
                    }
                }
            }
        }
    }
    if (b) {
        b.stopPropagation()
    }
}

function monster_click(a) {
    if (ctarget == this) {
        map_click(a)
    }
    ctarget = this;
    last_monster_click = new Date();
    if (a) {
        a.stopPropagation()
    }
}

function monster_attack(a) {
    ctarget = this;
    direction_logic(character, ctarget);
    if (!character || distance(this, character) > character.range) {
        draw_trigger(function () {
            d_text("TOO FAR", character)
        })
    } else {
        socket.emit("attack", {
            id: this.id
        })
    }
    if (a) {
        a.stopPropagation()
    }
}

function map_click(e) {
    var a = e.data.global.x, f = e.data.global.y;
    var d = a - width / 2, c = f - height / 2;
    if (manual_centering && character) {
        d = a - character.x, c = f - character.y
    }
    d /= scale;
    c /= scale;
    if (call_code_function("on_map_click", character.real_x + d, character.real_y + c)) {
        return
    }
    if (character && can_walk(character)) {
        var b = calculate_move(M, character.real_x, character.real_y, character.real_x + d, character.real_y + c);
        character.from_x = character.real_x;
        character.from_y = character.real_y;
        character.going_x = b.x;
        character.going_y = b.y;
        character.moving = true;
        calculate_vxy(character);
        socket.emit("move", {
            x: character.real_x,
            y: character.real_y,
            going_x: character.going_x,
            going_y: character.going_y,
            m: character.m
        })
    }
    topleft_npc = false
}

function map_click_release() {
}

function draw_entities() {
    for (entity in entities) {
        var a = entities[entity];
        if (character && !within_xy_range(character, a) || !character && !within_xy_range({
                map: current_map,
                "in": current_map,
                vision: [700, 500],
                x: first_x,
                y: first_y
            }, a)) {
            call_code_function("on_disappear", a, {outside: true});
            a.dead = true
        }
        if (a.dead || pull_all) {
            a.dead = true;
            a.cid++;
            a.died = new Date();
            a.interactive = false;
            if (a.drawn) {
                draw_timeout(fade_away(1, a), 30, 1)
            } else {
            }
            delete entities[entity];
            continue;
        } else {
            if (!a.drawn) {
                a.drawn = true;
            }
        }
        a.x = round(a.real_x);
        a.y = round(a.real_y);
        if (!round_entities_xy) {
            a.x = a.real_x
        }
        a.y = a.real_y;
    }
    if (pull_all && socket) {
        if (ctarget && ctarget.id) {
            prepull_target_id = ctarget.id
        }
        pull_all = false;
        socket.emit("send_updates", {})
    } else {
        if (prepull_target_id) {
            ctarget = get_entity(prepull_target_id);
            prepull_target_id = null
        }
    }
}

function update_sprite(entity) {
    if (!entity || !entity.stype) {
        return
    }
    if (entity.stype == "static") {
        return
    }
    if (entity.type == "character" || entity.type == "monster") {
        hp_bar_logic(entity);
        if (border_mode) {
            border_logic(entity)
        }
    }
    if (entity.type == "character" || entity.type == "monster") {
        effects_logic(entity)
    }
    if (entity.stype == "full") {
        var a = false, f = 1, e = 0;
        if (entity.type == "monster" && G.monsters[entity.mtype].aa) {
            a = true
        }
        if (entity.npc && !entity.moving && entity.allow === true) {
            entity.direction = 1
        }
        if (entity.npc && !entity.moving && entity.allow === false) {
            entity.direction = 0
        }
        if ((entity.moving || a) && entity.walking === null) {
            if (entity.last_stop && msince(entity.last_stop) < 320) {
                entity.walking = entity.last_walking
            } else {
                reset_ms_check(entity, "walk", 350), entity.walking = 1
            }
        } else {
            if (!(entity.moving || a) && entity.walking) {
                entity.last_stop = new Date();
                entity.last_walking = entity.walking || entity.last_walking || 1;
                entity.walking = null
            }
        }
        var d = [0, 1, 2, 1], c = 350;
        if (entity.mtype == "wabbit") {
            d = [0, 1, 2], c = 220
        }
        if (entity.walking && ms_check(entity, "walk", c - (entity.speed / 2 || 0))) {
            entity.walking++
        }
        if (entity.direction !== undefined) {
            e = entity.direction
        }
        if (!a && entity.stunned) {
            f = 1
        } else {
            if (entity.walking) {
                f = d[entity.walking % d.length]
            } else {
                if (entity.last_stop && mssince(entity.last_stop) < 180) {
                    f = d[entity.last_walking % d.length]
                }
            }
        }
        if (entity.stand && !entity.standed) {
            entity.standed = b;
            entity.speed = 10
        } else {
            if (entity.standed && !entity.stand) {
                entity.standed = false
            }
        }
        if (entity.rip && !entity.rtexture) {
            entity.cskin = null;
            entity.rtexture = true;
            entity.texture = rip_texture
        } else {
            if (!entity.rip) {
                entity.rtexture = false;
                set_texture(entity, f, e)
            }
        }
        if (entity.charging && ms_check(entity, "clone", 80)) {
            disappearing_clone(entity)
        }
    }
    if (entity.stype == "animation") {
        var g = (entity.aspeed == "slow" && 3) || 2;
        if (ms_check(entity, "anim", g * 16.5)) {
            entity.frame += 1
        }
        if (entity.frame >= entity.frames && entity.continuous) {
            entity.frame = 0
        } else {
            if (entity.frame >= entity.frames) {
                var h = entity.parent;
                if (h) {
                    delete h.animations[entity.skin]
                }
                return
            }
        }
        set_texture(entity, entity.frame)
    }
    if (entity.stype == "emote") {
        var g = (entity.aspeed == "slow" && 17) || (entity.aspeed == "slower" && 40) || 10;
        if (entity.atype == "flow") {
            if (ms_check(entity, "anim", g * 16.5)) {
                entity.frame += 1
            }
            set_texture(entity, [0, 1, 2, 1][entity.frame % 4])
        } else {
            if (ms_check(entity, "anim", g * 16.5) && entity.atype != "once") {
                entity.frame = (entity.frame + 1) % 3
            }
            set_texture(entity, entity.frame)
        }
    }
    //update_filters(entity);
    entity.updates += 1
}

function add_monster(d) {
    var monster = {};
    adopt_soft_properties(monster, d);
    monster.walking = null;
    monster.animations = {};
    monster.move_num = d.move_num;
    monster.c = {};
    monster.x = monster.real_x = round(d.x);
    monster.y = monster.real_y = round(d.y);
    monster.vx = d.vx || 0;
    monster.vy = d.vy || 0;
    monster.speed = d.speed;
    monster.type = "monster";
    monster.mtype = d.type;
    monster.interactive = true;
    monster.buttonMode = true;
    if (0 && G.dimensions[d.type]) {
        var e = G.dimensions[d.type];
        monster.awidth = e[0];
        monster.aheight = e[1]
    }
    return monster;
}

function update_filters(a) {
}

function start_filter(b, a) {
}

function stop_filter(b, a) {
}

function player_effects_logic(a) {
    if (a.me) {
        a.last_targets = a.targets
    }
}

function effects_logic(a) {
}

function add_character(e, d) {
    var a = (d && manual_centering && 2) || 1;
    var c = {};
    adopt_soft_properties(c, e);
    c.name = c.id;
    c.walking = null;
    c.animations = {};
    c.x = round(e.x);
    c.real_x = parseFloat(e.x);
    c.y = round(e.y);
    c.real_y = parseFloat(e.y);
    c.type = "character";
    c.me = d;
    if (e.npc && G.npcs[e.npc] && G.npcs[e.npc].role == "citizen") {
        c.citizen = true
    }
    c.awidth = c.width / a;
    c.aheight = c.height / a;
    if (!(d && manual_centering)) {
        c.interactive = true;
        if (!d && pvp) {
            c.cursor = "crosshair"
        }
    }
    if (manual_centering && 0) {
        var f = [c.awidth, c.aheight];
    }
    return c
}

function add_chest(c) {
    var a = {};
    a.x = round(c.x);
    a.y = round(c.y);
    a.items = c.items;
    a.type = "chest";
    a.interactive = true;
    a.buttonMode = true;
    a.cursor = "help";
    chests[c.id] = a;
}

function get_npc(b) {
    var a = null;
    map_npcs.forEach(function (c) {
        if (c.npc_id == b) {
            a = c
        }
    });
    return a
}

function add_npc(d, a, c, g) {
    var e = {};
    e.npc_id = g;
    e.displayGroup = player_layer;
    e.interactive = true;
    e.buttonMode = true;
    e.real_x = e.x = round(a[0]);
    e.real_y = e.y = round(a[1]);
    if (d.type == "fullstatic" && a.length == 3) {
        d.direction = a[2]
    }
    if (d.role == "citizen") {
        e.citizen = true
    }
    e.type = "npc";
    e.npc = true;
    e.animations = {};
    adopt_soft_properties(e, d);
    if (e.stype == "emote") {
        var h = [26, 35];
        e.awidth = h[0];
        e.aheight = h[1];
        if (d.atype) {
            e.atype = d.atype;
            e.frame = e.stopframe || e.frame
        }
    }
    return e
}
function add_machine(d) {
    var c = {};
    c.interactive = true;
    c.buttonMode = true;
    c.x = round(d.x);
    c.y = round(d.y);
    c.type = "machine";
    c.mtype = d.type;
    c.updates = 0;
    if (d.type == "dice") {
        c.digits = e_array(4);
        for (var b = 0; b < 4; b++) {
            c.digits[b] = {};
            c.digits[b].x = -11 + b * 7;
            if (b > 1) {
                c.digits[b].x += 1
            }
            c.digits[b].y = -17;
        }
        c.dot = {};
        c.dot.x = 0;
        c.dot.y = -21;
        c.shuffle_speed = 100
    }
    c.onrclick = a;
    return c
}

function add_door(b) {
    var c = {};
    c.interactive = true;
    c.buttonMode = true;
    c.x = round(b[0]);
    c.y = round(b[1]);
    c.type = "door";
    return c
}

function add_quirk(c) {
    var a = {};
    a.interactive = true;
    a.buttonMode = true;
    if (c[4] != "upgrade" && c[4] != "compound") {
        a.cursor = "help"
    }
    a.x = round(c[0]);
    a.y = round(c[1]);
    a.type = "quirk";
    return a
}

function add_animatable(a, b) {
    var c = {};
    c.x = b.x;
    c.y = b.y;
    c.type = "animatable";
    return c
}

function create_map() {
    pvp = G.maps[current_map].pvp || is_pvp;

    map = {};
    map_npcs = [];
    map_doors = [];
    map_tiles = [];
    map_entities = [];
    map_machines = {};
    water_tiles = [];
    entities = {};
    if (!tile_sprites[current_map]) {
        tile_sprites[current_map] = {},
            sprite_last[current_map] = []
    }
    dtile_size = GEO["default"] && GEO["default"][3];
    if (dtile_size && is_array(dtile_size)) {
        dtile_size = dtile_size[0]
    }

    map.real_x = 0;
    map.real_y = 0;

    if (first_coords) {
        first_coords = false;
        map.real_x = first_x;
        map.real_y = first_y
    }
    map.speed = 80;

    map.interactive = true;

    map_info = G.maps[current_map];
    let npcs = map_info.npcs;
    for (var B = 0; B < npcs.length; B++) {
        var F = npcs[B]
            , r = G.npcs[F.id];
        if (r.type == "full" || r.role == "citizen") {
            continue
        }
        console.log("NPC: " + F.id);
        var m = add_npc(r, F.position, F.name, F.id);
        map_npcs.push(m);
        map_entities.push(m)
    }
    let doors = map_info.doors || [];
    for (var B = 0; B < doors.length; B++) {
        var v = doors[B];
        var m = add_door(v);
        console.log("Door: " + v);
        map_doors.push(m);
        map_entities.push(m);
        if (border_mode) {
            border_logic(m)
        }
    }
    let machines = map_info.machines || [];
    for (var B = 0; B < machines.length; B++) {
        var c = machines[B];
        var m = {};
        console.log("Machine: " + c.type);
        map_npcs.push(m);
        map_entities.push(m);
        map_machines[m.mtype] = m;
        if (border_mode) {
            border_logic(m)
        }
    }
    let quirks = map_info.quirks || [];
    for (var B = 0; B < quirks.length; B++) {
        var A = quirks[B];
        var m = add_quirk(A);
        console.log("Quirk: " + A);
        map_entities.push(m);
        if (border_mode) {
            border_logic(m)
        }
    }
    console.log("Map created: " + current_map);
    let animatables = {};
    for (var s in map_info.animatables || {}) {
        animatables[s] = add_animatable(s, map_info.animatables[s]);
        map_entities.push(animatables[s])
    }

    console.log("Map created: " + current_map)
}

function retile_the_map() {
    if (cached_map) {
        if (dtile_size && (dtile_width < width || dtile_height < height)) {
            recreate_dtextures()
        }
        if (last_water_frame != water_frame()) {
            last_water_frame = water_frame();
            tiles.texture = rtextures[last_water_frame];
            if (dtile_size) {
                dtile.texture = dtextures[last_water_frame]
            }
        }
        return
    }
    var o = mdraw_border * scale, n = [], b = 0, p = {}, a = new Date(), m = 0, l = 0;
    var d = map.real_x, c = map.real_y, k = d - width / scale / 2 - o, B = d + width / scale / 2 + o,
        g = c - height / scale / 2 - o, A = c + height / scale / 2 + o;
    if (!(map.last_max_y == undefined || abs(map.last_max_y - A) >= o || abs(map.last_max_x - B) >= o)) {
        if (last_water_frame != water_frame()) {
            last_water_frame = water_frame();
            for (var q = 0; q < water_tiles.length; q++) {
                water_tiles[q].texture = water_tiles[q].textures[last_water_frame]
            }
            if (mdraw_tiling_sprites) {
                default_tiling.texture = default_tiling.textures[last_water_frame]
            }
        }
        return
    }
    map.last_max_y = A;
    map.last_max_x = B;
    for (var q = 0; q < map_tiles.length; q++) {
        var f = map_tiles[q];
        if (mdraw_mode == "redraw" || f.x > B || f.y > A || f.x + f.width < k || f.y + f.height < g) {
            f.to_delete = true;
            m++
        } else {
            n.push(f);
            p[f.tid] = true
        }
    }


    for (var q = 0; q <= M.tiles.length; q++) {
        sprite_last[current_map][q] = 0
    }
    map_tiles = n;
    water_tiles = [];
    last_water_frame = water_frame();
    if (M["default"] && !mdraw_tiling_sprites) {
        for (var d = k; d <= B + 10; d += M["default"][3]) {
            for (var c = g; c <= A + 10; c += M["default"][4]) {
                var z = floor(d / M["default"][3]), v = floor(c / M["default"][4]), u = "d" + z + "-" + v;
                if (p[u]) {
                    continue
                }
                if (sprite_last[current_map][M.tiles.length] >= tile_sprites[current_map][M.tiles.length].length) {
                    tile_sprites[current_map][M.tiles.length][sprite_last[current_map][M.tiles.length]] = new_map_tile(M["default"]), l++
                }
                var f = tile_sprites[current_map][M.tiles.length][sprite_last[current_map][M.tiles.length]++];
                if (f.textures) {
                    f.texture = f.textures[last_water_frame], water_tiles.push(f)
                }
                f.x = z * M["default"][3];
                f.y = v * M["default"][4];
                if (mdraw_mode != "redraw") {
                    f.displayGroup = map_layer
                }
                f.zOrder = 0;
                f.tid = u;
                map.addChild(f);
                map_tiles.push(f)
            }
        }
    } else {

    }
    for (var q = 0; q < M.placements.length; q++) {
        var E = M.placements[q];
        if (E[3] === undefined) {
            if (p["p" + q]) {
                continue
            }
            var j = M.tiles[E[0]], e = j[3], t = j[4];
            if (E[1] > B || E[2] > A || E[1] + e < k || E[2] + t < g) {
                continue
            }
            if (sprite_last[current_map][E[0]] >= tile_sprites[current_map][E[0]].length) {
                tile_sprites[current_map][E[0]][sprite_last[current_map][E[0]]] = new_map_tile(j), l++
            }
            var f = tile_sprites[current_map][E[0]][sprite_last[current_map][E[0]]++];
            if (f.textures) {
                f.texture = f.textures[last_water_frame], water_tiles.push(f)
            }
            f.x = E[1];
            f.y = E[2];
            if (mdraw_mode != "redraw") {
                f.displayGroup = map_layer
            }
            f.zOrder = -(q + 1);
            f.tid = "p" + q;
            map.addChild(f);
            map_tiles.push(f)
        } else {
            var j = M.tiles[E[0]], e = j[3], t = j[4];
            if (!mdraw_tiling_sprites) {
                for (var d = E[1]; d <= E[3]; d += e) {
                    if (d > B || d + e < k) {
                        continue
                    }
                    for (c = E[2]; c <= E[4]; c += t) {
                        if (c > A || c + t < g) {
                            continue
                        }
                        if (sprite_last[current_map][E[0]] >= tile_sprites[current_map][E[0]].length) {
                            tile_sprites[current_map][E[0]][sprite_last[current_map][E[0]]] = new_map_tile(j), l++
                        }
                        var f = tile_sprites[current_map][E[0]][sprite_last[current_map][E[0]]++];
                        if (f.textures) {
                            f.texture = f.textures[last_water_frame], water_tiles.push(f)
                        }
                        f.x = d;
                        f.y = c;
                        f.tid = "p" + q + "-" + d + "-" + c;
                        map.addChild(f);
                        map_tiles.push(f)
                    }
                }
            } else {
                if (!window["defP" + q]) {
                    window["defP" + q] = new PIXI.extras.TilingSprite(j[5], E[3] - E[1] + e, E[4] - E[2] + t)
                }
                var f = window["defP" + q];
                f.x = E[1];
                f.y = E[2];
                map.addChild(f);
                map_tiles.push(f)
            }
        }
    }
    drawings.forEach(function (s) {
        try {
            var r = s && s.parent;
            if (r) {
                r.removeChild(s);
                r.addChild(s)
            }
        } catch (h) {
            console.log("User drawing exception: " + h)
        }
    });
    console.log("retile_map ms: " + mssince(a) + " min_x: " + k + " max_x: " + B + " entities: " + map_tiles.length + " removed: " + m + " new: " + l)
}

var fps_counter = null, frames = 0, last_count = null, last_frame, fps = 0;
var stop_rendering = false;

function calculate_fps() {

}

function load_game(a) {
    create_map();
    draw();

    game_loaded = true;
    console.log("Game loaded");

    socket.emit("loaded", {success: 1, width: screen.width, height: screen.height, scale: scale})
    if (typeof onLoad === "function") {
        onLoad();
    }
}

function draw(a, b) {
    if (manual_stop) {
        return
    }
    draws++;
    if (last_draw) {
        frame_ms = mssince(last_draw)
    }
    last_draw = new Date();
    start_timer("draw");
    draw_timeouts_logic(2);
    stop_timer("draw", "timeouts");
    calculate_fps();

    process_entities();
    future_entities = {
        players: {},
        monsters: {}
    };
    stop_timer("draw", "entities");
    if (gtest && character) {
        map.real_x -= 0.1,
            map.real_y -= 0.001
    }
    var d = frame_ms;
    while (d > 0) {
        var c = false;
        if (character && character.moving) {
            c = true;
            if (character.vx) {
                character.real_x += character.vx * min(d, 50) / 1000
            }
            if (character.vy) {
                character.real_y += character.vy * min(d, 50) / 1000
            }
            set_direction(character);
            stop_logic(character)
        }
        for (var i in entities) {
            var entity = entities[i];
            if (entity && !entity.dead && entity.moving) {
                c = true;
                entity.real_x += entity.vx * min(d, 50) / 1000;
                entity.real_y += entity.vy * min(d, 50) / 1000;
                set_direction(entity);
                stop_logic(entity)
            }
        }
        d -= 50;
        if (!c) {
            break
        }
    }
    stop_timer("draw", "movements");
    draw_entities();
    stop_timer("draw", "draw_entities");
    position_map();
    call_code_function("on_draw");
    stop_timer("draw", "retile");
    if (character) {
        update_sprite(character)
    }
    map_npcs.forEach(function (f) {
        update_sprite(f)
    });
    stop_timer("draw", "sprites");
    update_overlays();
    if (exchange_animations) {
        exchange_animation_logic()
    }
    stop_timer("draw", "uis");
    draw_timeouts_logic();
    stop_timer("draw", "before_render");
    stop_timer("draw", "after_render");
    if (!b) {
        setTimeout(function () {
            draw();
        }, 16);
    }

};
function cut(number) {
    return Math.floor(number * 100) / 100;
}