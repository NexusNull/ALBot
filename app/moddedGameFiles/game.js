var fs = require("fs")
eval(fs.readFileSync('app/moddedGameFiles/common_functions.js') + '');
eval(fs.readFileSync('app/moddedGameFiles/functions.js') + '');
var Socket = require("socket.io-client");
var auth_sent;
var border_mode = false;
var frame_ms;
var sound_sfx = false;
var screen = {
    width: 1920,
    height: 1020
}
var recording_mode = false
var width = 1920;
var height = 1020;
var no_html = true;
var no_graphics = true;
//Window properties
var last_draw;
var disconnect_reason = "";
var dtile;
var last_entities_received;
// ^custom properties v game properties
var is_sdk = false
var is_game = 1
    , is_server = 0
    , is_code = 0
    , is_pvp = 0
    , is_demo = 0
    , gameplay = "normal";
var inception = new Date();
var log_game_events = true;
var scale = 2;
var round_xy = true
    , floor_xy = false;
var round_entities_xy = false;
var offset_walking = true;
var antialias = false
    , mode_nearest = true;
var gtest = false;
var mode = {
    dom_tests: 0,
    dom_tests_pixi: 0,
    bitmapfonts: 0,
    debug_moves: 0,
    destroy_tiles: 1,
    log_incoming: 0,
    cosmetics: 0,
    empty_borders_darker: 1,
};
var paused = false;
var log_flags = {
    timers: 1,
    map: 0,
    entities: 0,
    xy_corrections: 0,
};
var ptimers = true;
var mdraw_mode = "redraw"
    , mdraw_border = 40;
var mdraw_tiling_sprites = false;
var manual_stop = false;
var manual_centering = true;
var high_precision = false;
var retina_mode = false;
var text_quality = 2;
var bw_mode = false;
var character_names = false;
var hp_bars = true;
var last_interaction = new Date()
    , afk_edge = 60
    , mm_afk = false;
var last_drag_start = new Date();
var last_npc_right_click = new Date();
var block_right_clicks = true;
var mouse_only = true;
var the_code = ""
    , code_slot = 0
    , new_code_slot = undefined;
var server_region = "EU"
    , server_identifier = "I"
    , server_name = ""
    , ipass = "";
var real_id = ""
    , character = null
    , map = null
    , resources_loaded = false
    , socket_ready = false
    , socket_welcomed = false
    , game_loaded = false
    , friends = [];
var ch_disp_x = 0
    , ch_disp_y = 0;
var head_x = 0
    , head_y = 0;
var tints = [];
var entities = {}
    , future_entities = {
    players: {},
    monsters: {}
}
    , pull_all = false
    , pull_all_next = false
    , pulling_all = true
    , prepull_target_id = null;
var text_layer, monster_layer, player_layer, chest_layer, map_layer, separate_layer, entity_layer;
var rip = false;
var heartbeat = new Date()
    , slow_heartbeats = 0;
var ctarget = null
    , ctoggled = null;
var xtarget = null;
var textures = {}
    , C = {}
    , FC = {}
    , SS = {};
var T = {};
var M = {}
    , GEO = {};
var total_map_tiles = 0;
var tiles = null
    , dtile = null;
var map_npcs = []
    , map_doors = []
    , map_animatables = {};
var map_tiles = []
    , map_entities = []
    , map_machines = {}
    , dtile_size = 32
    , dtile_width = 0
    , dtile_height = 0;
var map_animations = {};
var water_tiles = []
    , last_water_frame = -1;
var drawings = []
    , code_buttons = {};
var chests = {}
    , party_list = []
    , party = {};
var tracker = {};
var tile_sprites = {}
    , sprite_last = {};
var first_coords = false
    , first_x = 0
    , first_y = 0;
var last_refxy = 0
    , ref_x = 0
    , ref_y = 0;
var last_light = new Date(0);
var current_map = "main"
    , current_in = "main"
    , draw_map = "main";
var transporting = false;
var current_status = ""
    , last_status = "";
var topleft_npc = false
    , merchant_id = null
    , inventory = false
    , inventory_openef_for = null
    , code = false
    , pvp = false
    , skillsui = false
    , exchange_type = "";
var topright_npc = false;
var transports = false;
var purpose = "buying";
var next_minteraction = null;
var next_side_interaction = null;
var events = {
    abtesting: false,
    duel: false,
};
var code_run = false
    , code_active = false
    , actual_code = false
    , CC = {};
var reload_state = false
    , reload_timer = null
    , first_entities = false;
var blink_pressed = false
    , last_blink_pressed = new Date();
var arrow_up = false
    , arrow_right = false
    , arrow_down = false
    , arrow_left = false;
var force_draw_on = false;
var use_layers = false;
var draws = 0
    , in_draw = false;
var keymap = {}
    , skillbar = [];
var secondhands = []
    , s_page = 0
    , lostandfound = []
    , l_page = 0;
var page = {
    title: "Adventure Land",
    url: "/"
};
var I = {};
var S = {};
var CLI_OUT = [];
var CLI_IN = [];
var options = {
    move_with_arrows: true,
    code_fx: false,
    show_names: false,
    move_with_mouse: false,
    always_hpn: false,
    retain_upgrades: false,
    friendly_fire: false,
    bank_max: false,
    directional_sfx: false,
};
var SZ = {
    font: "Pixel",
    normal: 18,
    large: 24,
    huge: 36,
    chat: 18,
};

setInterval(function () {
    /* Reloading the game instance is handled by the main node process
    if (reload_state) {
        try {
            var c = storage_get("reload" + server_region + server_identifier);
            if (c) {
                c = JSON.parse(c);
                c.time = new Date(c.time);
                if (new Date() < c.time) {
                    if (reload_state != "synced") {
                        add_log("Reload Synced", colors.serious_green)
                    }
                    reload_state = "synced"
                }
                if (reload_state == "synced") {
                    reload_timer = c.time
                }
            }
        } catch (d) {
            console.log(d)
        }
        if (reload_state == "start") {
            reload_state = "schedule",
                reload_timer = future_s(45 + parseInt(Math.random() * 25));
            add_log("First Echo In " + parseInt(-ssince(reload_timer)) + " Seconds", "gray")
        }
        if (reload_state == "schedule" && new Date() > reload_timer) {
            api_call("can_reload", {
                region: server_region,
                pvp: is_pvp || "",
                name: server_identifier
            });
            add_log("Echo Sent", "gray");
            reload_timer = future_s(20 + parseInt(Math.random() * 20))
        }
        if (reload_state == "synced" && new Date() > reload_timer) {
            reload_state = false;
            location.reload()
        }
    }
    if (!game_loaded) {
        return
    }
    */

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
        //console.log("pull_all_next triggered");
        pull_all_next = false;
        pull_all = true;
        future_entities = {
            players: {},
            monsters: {}
        }
    }
    //removed window
    if (last_draw) {
        if ((code_run || sound_sfx) && mssince(last_draw) > 250) {
            draw(0, 1)
        } else {
            if (!(code_run || sound_sfx) && mssince(last_draw) > 15000) {
                draw(0, 1)
            }
        }
    }
    if (force_draw_on && force_draw_on < a) {
        if (current_map != drawn_map) {
            create_map()
        }
        draw(0, 1)
    }
    mm_afk = (ssince(last_interaction) > afk_edge / 2);
    if (character) {
        if (!character.afk && ssince(last_interaction) > afk_edge) {
            character.afk = true;
            socket.emit("property", {
                afk: true
            })
        }
        if (character.afk && ssince(last_interaction) <= afk_edge) {
            character.afk = false;
            socket.emit("property", {
                afk: false
            })
        }
        if (mode.debug_moves) {
            socket.emit("mreport", {
                x: character.real_x,
                y: character.real_y
            })
        }
    }
    heartbeat = new Date()
}, 100);
setInterval(function () {
    arrow_movement_logic()
}, 200);

function code_button() {
    add_log("Executed");
    add_tint(".mpui", {
        ms: 3000
    })
}

function log_in(a, e, c, f) {
    real_id = e;
    /*
    if (!f) {
        f = storage_get("passphrase") || ""
    }
    if (!game_loaded) {
        ui_log("Game hasn't loaded yet");
        return
    }
    */
    clear_game_logs();
    add_log("Authing ...");
    var b = no_html;
    /*if (no_html && parent && parent.character) {
        b = parent.character.name
    }*/
    var d = {
        user: a,
        character: e,
        auth: c,
        width: screen.width,
        height: screen.height,
        scale: scale,
        passphrase: f,
        no_html: b,
        no_graphics: ""
    };
    /* ALBot is not electron
    if (is_electron) {
        d.epl = electron_data.platform;
        if (d.epl == "mas") {
            d.receipt = electron_mas_receipt()
        }
        if (d.epl == "steam") {
            d.ticket = electron_steam_ticket()
        }
    }*/
    auth_sent = new Date();
    socket.emit("auth", d)
}

function disconnect() {
    var a = "DISCONNECTED"
        , b = "Disconnected";
    game_loaded = false;
    //removed window
    if (disconnect_reason == "limits") {
        a = "REJECTED";
        add_log("Oops. You exceeded the limitations.", "#83BDCF");
        add_log("You can have 3 characters and one merchant online at most.", "#CF888A")
    } else {
        if (disconnect_reason) {
            add_log("Disconnect Reason: " + disconnect_reason, "gray")
        }
    }
    /*
    if (character && (auto_reload == "on" || auto_reload == "auto" && (character.stand || code_run || 1))) {
        auto_reload = true;
        code_to_load = null;
        if (code_run && actual_code) {
            code_to_load = codemirror_render.getValue()
        }
        b = "Reloading";
        add_log("Auto Reload Active", colors.serious_red);
        reload_state = "start"
    } else {
        if (character_to_load) {
            add_log("Retrying in 7500ms", "gray");
            setTimeout(function() {
                location.reload(true)
            }, 7500)
        }
    }
    if (no_html) {
        $("iframe").remove();
        set_status("Disconnected");
        $("#name").css("color", "red")
    } else {
        hide_modals();
        $("body").children().each(function() {
            if (this.tagName != "CANVAS" && this.id != "bottomrightcorner" && this.id != "bottomleftcorner2") {
                $(this).remove()
            } else {
                if (this.id == "bottomrightcorner" || this.id == "bottomleftcorner2") {
                    this.style.zIndex = 2000
                }
            }
            $("iframe").remove()
        });
        $("body").append("<div style='position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; z-index: 999; background: rgba(0,0,0,0.85); text-align: center'><div onclick='refresh_page()' class='gamebutton clickable' style='margin-top: " + (round(height / 2) - 10) + "px'>" + a + "</div></div>")
    }
    if (character) {
        $("title").html(b + " - " + character.name)
    }
    */
    if (socket) {
        socket.disconnect()
    }
}

function position_map() {
    if (character) {
        map.real_x = character.real_x,
            map.real_y = character.real_y
    }
    var a = width / 2 - map.real_x * scale
        , c = height / 2 - map.real_y * scale
        , b = false;
    a = c_round(a);
    c = c_round(c);
    if (map.x != a) {
        map.x = a,
            b = true
    }
    if (map.y != c) {
        map.y = c,
            b = true
    }
    //removed window
    if (b && dtile_size && dtile) {
        dtile.x = round(map.real_x - width / (scale * 2));
        dtile.y = round(map.real_y - height / (scale * 2));
        dtile.x = ceil(dtile.x / (dtile_size / 1)) * (dtile_size / 1) - (dtile_size / 1);
        dtile.y = ceil(dtile.y / (dtile_size / 1)) * (dtile_size / 1) - (dtile_size / 1)
    }
    if (character) {
        if (manual_centering) {
            character.x = c_round(width / 2 + ch_disp_x),
                character.y = c_round(height / 2 + ch_disp_y)
        } else {
            character.x = c_round(character.real_x),
                character.y = c_round(character.real_y)
        }
    }
}

function ui_logic() {
    if (character && character.ctype == "mage") {
        if (b_pressed && map.cursor != "crosshair") {
            map.cursor = "crosshair"
        } else {
            if (!b_pressed && map.cursor == "crosshair") {
                map.cursor = "default"
            }
        }
    }
}

var rendered_target = {}
    , last_target_cid = null
    , last_xtarget_cid = null
    , dialogs_target = null;

function reset_topleft() {
    if (no_html) {
        return
    }
    var b = "NO TARGET";
    var l = ctarget;
    ctarget = xtarget || ctarget;
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
    /* UI stuff that ALBot doesn't need
    if (ctarget && ctarget.type == "monster" && last_target_cid != ctarget.cid) {
        var c = ctarget;
        var f = G.monsters[c.mtype]
            , e = ""
            , a = f.name;
        if (c.dead) {
            a += " X",
                c.hp = 0
        }
        if (c.level > 1) {
            a += " Lv." + c.level
        }
        var g = [{
            line: a,
            color: "gray"
        }, {
            name: "HP",
            color: colors.hp,
            value: c.hp + "/" + c.max_hp,
            cursed: c.s.cursed,
            stunned: !c.attack && c.s.stunned,
            poisoned: !c.attack && c.s.poisoned
        }, {
            name: "XP",
            color: "green",
            value: c.xp
        }, ];
        if (c.attack) {
            g.push({
                name: "ATT",
                color: "#316EE6",
                value: c.attack,
                stunned: c.s.stunned,
                poisoned: c.s.poisoned
            })
        }
        if (f.evasion) {
            g.push({
                name: "EVASION",
                color: "gray",
                value: f.evasion + "%"
            })
        }
        if (f.reflection) {
            g.push({
                name: "REFLECT.",
                color: "gray",
                value: f.reflection + "%"
            })
        }
        if (f.dreturn) {
            g.push({
                name: "D.RETURN",
                color: "gray",
                value: f.dreturn + "%"
            })
        }
        if (f.armor) {
            g.push({
                name: "ARMOR",
                color: "gray",
                value: f.armor
            })
        }
        if (f.resistance) {
            g.push({
                name: "RESIST.",
                color: "gray",
                value: f.resistance
            })
        }
        if (f.rpiercing) {
            g.push({
                name: "PIERCE.",
                color: "gray",
                value: f.rpiercing
            })
        }
        if (f.apiercing) {
            g.push({
                name: "PIERCE.",
                color: "gray",
                value: f.apiercing
            })
        }
        if (c.lifesteal) {
            g.push({
                name: "LIFESTEAL",
                color: colors.lifesteal,
                value: c.lifesteal + "%"
            })
        }
        if (f.immune) {
            g.push({
                line: "IMMUNE",
                color: "#AEAEAE"
            })
        }
        if (f.cooperative) {
            g.push({
                line: "COOPERATIVE",
                color: "#AEAEAE"
            })
        }
        if (f.spawns) {
            g.push({
                line: "SPAWNS",
                color: "#AEAEAE"
            })
        }
        if (f.abilities) {
            for (var h in f.abilities) {
                if (!G.skills[h]) {
                    continue
                }
                g.push({
                    name: "ABILITY",
                    color: "#FC5F39",
                    value: G.skills[h].name.toUpperCase()
                })
            }
        }
        if (c.target) {
            g.push({
                name: "TRG",
                color: "orange",
                value: c.target
            })
        }
        if (c.pet) {
            g = [{
                name: "NAME",
                value: c.name,
                color: "#5CBD97"
            }, {
                name: "PAL",
                value: c.owner,
                color: "#CF539B"
            }, ]
        }
        if (c.heal) {
            g.push({
                line: "SELF HEALING",
                color: "#9E6367"
            })
        }
        if (f.explanation) {
            g.push({
                line: f.explanation,
                color: "gray"
            });
            e = "max-width: 200px"
        }
        render_info(g, null, e);
        render_conditions(c)
    } else {
        if (ctarget && ctarget.npc) {
            var g = [{
                name: "NPC",
                color: "gray",
                value: ctarget.name
            }, {
                name: "LEVEL",
                color: "orange",
                value: ctarget.level
            }, ];
            render_info(g)
        } else {
            if (ctarget && ctarget.type == "character" && last_target_cid != ctarget.cid) {
                var b = ctarget;
                var g = [{
                    name: b.role && b.role.toUpperCase() || "NAME",
                    color: b.role && "#E14F8B" || "gray",
                    value: b.name
                }, {
                    name: "LEVEL",
                    color: "orange",
                    value: b.level,
                    afk: b.afk
                }, {
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
                }, {
                    name: "RANGE",
                    color: "gray",
                    value: b.range
                }, {
                    name: "RUNSPD",
                    color: "gray",
                    value: round(b.speed)
                }, {
                    name: "ARMOR",
                    color: "gray",
                    value: b.armor || 0
                }, {
                    name: "RESIST.",
                    color: "gray",
                    value: b.resistance || 0
                }, ]
                    , d = [];
                if (b.code) {
                    g.push({
                        name: "CODE",
                        color: "gold",
                        value: "Active"
                    })
                }
                if (b.party) {
                    g.push({
                        name: "PARTY",
                        color: "#FF4C73",
                        value: b.party
                    })
                } else {
                    if (character && !ctarget.me && !ctarget.stand) {
                        d.push({
                            name: "PARTY",
                            onclick: "socket.emit('party',{event:'invite',id:'" + ctarget.id + "'})",
                            color: "#6F3F87",
                            pm_onclick: "cpm_window('" + (ctarget.controller || ctarget.name) + "')"
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
                        pm_onclick: "cpm_window('" + (ctarget.controller || ctarget.name) + "')"
                    })
                }
                if (ctarget.me && !character.stand && character.slots.trade1 !== undefined) {
                    d.push({
                        name: "HIDE",
                        onclick: "socket.emit('trade',{event:'hide'});",
                        color: "#A99A5B"
                    })
                }
                if (ctarget.me && !character.stand && character.slots.trade1 === undefined) {
                    d.push({
                        name: "SHOW",
                        onclick: "socket.emit('trade',{event:'show'});",
                        color: "#A99A5B"
                    })
                }
                if (ctarget.stand) {
                    d.push({
                        name: "TOGGLE",
                        onclick: "$('.cmerchant').toggle()",
                        color: "#A99A5B",
                        pm_onclick: !ctarget.me && "cpm_window('" + (ctarget.controller || ctarget.name) + "')"
                    })
                }
                if (0 && character.role == "gm" && !b.me) {
                    d.push({
                        name: "SEND TO JAIL",
                        onclick: "socket.emit('jail',{id:'" + ctarget.id + "'})",
                        color: "#9525A3"
                    });
                    if (!b.s.mute) {
                        d.push({
                            name: "MUTE",
                            onclick: "socket.emit('mute',{id:'" + ctarget.id + "',state:1})",
                            color: "#A72379"
                        })
                    } else {
                        if (b.s.mute) {
                            d.push({
                                name: "UNMUTE",
                                onclick: "socket.emit('mute',{id:'" + ctarget.id + "',state:0})",
                                color: "#C45BAF"
                            })
                        }
                    }
                }
                if (character && !ctarget.me && character.slots.gloves && character.slots.gloves.name == "poker") {
                    d.push({
                        name: "POKE!",
                        onclick: "socket.emit('poke',{name:'" + ctarget.name + "'})",
                        color: "#DF962B"
                    })
                }
                render_info(g, d);
                render_conditions(b);
                render_slots(b)
            } else {
                if (!ctarget && rendered_target != null) {
                    $("#topleftcornerui").html('<div class="gamebutton">NO TARGET</div>')
                }
            }
        }
    }*/
    rendered_target = ctarget;
    last_target_cid = ctarget && ctarget.cid;
    ctarget = l;
}

function sync_entity(c, a) {
    adopt_soft_properties(c, a);
    if (c.resync) {
        c.real_x = a.x;
        c.real_y = a.y;
        if (a.moving) {
            c.engaged_move = -1,
                c.move_num = 0
        } else {
            c.engaged_move = c.move_num = a.move_num,
                c.angle = ((a.angle === undefined && 90) || a.angle),
                set_direction(c)
        }
        c.resync = c.moving = false
    }
    if (a.abs && !c.abs) {
        c.abs = true;
        c.moving = false
    }
    if (c.move_num != c.engaged_move) {
        var b = 1
            , d = simple_distance({
            x: c.real_x,
            y: c.real_y
        }, a);
        if (d > 120) {
            c.real_x = a.x;
            c.real_y = a.y;
            if (log_flags.xy_corrections) {
                console.log("manual x,y correction for: " + (c.name || c.id))
            }
        }
        b = simple_distance({
            x: c.real_x,
            y: c.real_y
        }, {
            x: a.going_x,
            y: a.going_y
        }) / (simple_distance(a, {
            x: a.going_x,
            y: a.going_y
        }) + EPS);
        if (b > 1.25 && log_flags.timers && log_flags.xy) {
            console.log(c.id + " speedm: " + b)
        }
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
                monster.drawn = false;
                monster.resync = true
            } catch (c) {
                console.log("EMAIL HELLO@ADVENTURE.LAND WITH THIS: " + JSON.stringify(future_monster))
                console.log(c)
                if (is_sdk) {
                    alert(c + " " + JSON.stringify(b))
                }
            }
            monster.drawn = false;
            monster.resync = true
        }
        if (future_monster.dead) {
            monster.dead = true;
            continue
        }
        sync_entity(monster, future_monster);
        (future_monster.events || []).forEach(function (g) {
            if (g.type == "mhit") {
                var h = get_entity(g.p)
                    , e = get_entity(g.m);
                if (!h) {
                    return
                }
                if (g.evade && h) {
                    sfx("whoosh", h.real_x, h.real_y);
                    return
                }
                if (g.combo && h && h.me && h.targets < 3) {
                    add_log(G.monsters[monster.mtype].name + " dealt combined damage", "#DF513D");
                    add_log("Scatter the party members!", "gray");
                    call_code_function("on_combined_damage")
                }
                if (g.reflect) {
                    if (!e) {
                        return
                    }
                    sfx("reflect", e.real_x, e.real_y);
                    d_text("-" + g.d, e, {
                        color: "damage"
                    });
                    start_animation(e, "explode_c");
                    d_line(h, e, {
                        color: "reflect"
                    })
                } else {
                    direction_logic(monster, h, "attack");
                    d_text("-" + g.d, h, {
                        color: "damage"
                    });
                    start_animation(h, monster.hit || "slash0");
                    d_line(monster, h);
                    if (in_arr(monster.hit, ["explode_a", "explode_c"])) {
                        sfx("explosion")
                    } else {
                        sfx("monster_hit")
                    }
                    if (g.k) {
                        start_animation(h, "spark0")
                    }
                }
            } else {
                if (g.type == "heal") {
                    var e = get_entity(g.m);
                    d_text("+" + g.heal, e, {
                        color: colors.heal
                    });
                    start_animation(e, "heal")
                }
            }
        })
    }
    for (var f in future_entities.players) {
        var a = future_entities.players[f];
        var monster = entities[a.id];
        if (character && character.id == a.id) {
            continue
        }
        if (!monster) {
            if (a.dead) {
                continue
            }
            a.external = true;
            a.player = true;
            monster = entities[a.id] = add_character(a);
            monster.drawn = false;
            monster.resync = true;
            if (mssince(last_light) < 500) {
                start_animation(monster, "light")
            }
        }
        if (a.dead) {
            monster.dead = true;
            continue
        }
        sync_entity(monster, a)
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
        setTimeout(function () {
            delete entities[event.id];
        }, 500);
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
        entity.stats = {};
        ["str", "dex", "int", "vit", "for"].forEach(function (f) {
            entity.stats[f] = data[f]
        });
        if (entity.moving && entity.speed && data.speed && entity.speed != data.speed) {
            entity.speed = data.speed;
            calculate_vxy(entity)
        }
        if (data.abs) {
            entity.moving = false
        }
        entity.bank = null
    } else {
        entity["in"] = current_in;
        entity.map = current_map
    }
    ["team"].forEach(function (f) {
        if (!data.p) {
            delete entity[f]
        }
    });
    if (entity.type == "monster" && G.monsters[entity.mtype]) {
        var c = G.monsters[entity.mtype];
        var a = [["hp", "hp"], ["max_hp", "hp"], ["mp", "mp"], ["max_mp", "mp"]];
        ["speed", "xp", "attack", "frequency", "rage", "aggro", "armor", "resistance", "damage_type", "respawn", "range", "name", "abilities", "evasion", "reflection", "dreturn", "immune", "cooperative", "spawns", "special", "1hp", "lifesteal"].forEach(function (f) {
            a.push([f, f])
        });
        a.forEach(function (f) {
            if (c[f[1]] !== undefined && (data[f[0]] === undefined || entity[f[0]] === undefined)) {
                entity[f[0]] = c[f[1]]
            }
        })
    }
    if (entity.type == "character" && entity.skin && entity.skin != data.skin && !entity.rip) {
        if (!XYWH[data.skin]) {
            data.skin = "naked"
        }
        entity.skin = data.skin;
        new_sprite(entity, "full", "renew");
        restore_dimensions(entity)
    }
    for (let prop in data) {
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
    /* no $ on ALBot
    if (character && !no_html) {
        $("#topmid").css("right", round(($("html").width() - $("#topmid").outerWidth()) / 2));
        $("#bottommid").css("right", round(($("html").width() - $("#bottommid").outerWidth()) / 2))
    }*/
}

function update_tutorial_ui() {
}

function update_overlays() {
    /* no $ on ALBot
    if (mode.dom_tests || no_html) {
        return
    }
    if (character) {
        if (!cached("att", character.attack)) {
            $(".attackui").html((character.ctype == "priest" && "HEAL " || "ATT ") + character.attack)
        }
        if (!cached("inv", character.esize + "|" + character.isize)) {
            $(".invui").html("INV " + (character.isize - character.esize) + "/" + character.isize)
        }
        if (!cached("hptop", character.hp, character.max_hp)) {
            $("#hptext").html(character.hp + "/" + character.max_hp);
            $("#hpslider").css("width", (character.hp * 100 / character.max_hp) + "%")
        }
        if (!cached("mptop", character.mp, character.max_mp)) {
            $("#mptext").html(character.mp + "/" + character.max_mp);
            $("#mpslider").css("width", (character.mp * 100 / character.max_mp) + "%")
        }
        var b = floor(character.xp / character.max_xp * 100);
        if (!cached("xptop", character.level + "|" + b)) {
            $("#xpui").html("LV" + character.level + " " + b + "%");
            $("#xpslider").css("width", (character.xp * 100 / character.max_xp) + "%")
        }
        if (!cached("tutorialtop", X.tutorial.step + "|" + X.tutorial.task)) {
            update_tutorial_ui()
        }
        if (inventory && !cached("igold", character.gold)) {
            $(".goldnum").html(to_pretty_num(character.gold + ((new Date()).getDate() == 1 && (new Date()).getMonth() == 3 ? 1014201800 : 0)))
        }
        if (inventory && !cached("icash", character.cash)) {
            $(".cashnum").html(to_pretty_num(character.cash))
        }
        if (!cached("coord", round(map.real_x) + "|" + round(map.real_y))) {
            $(".coords").html(round(map.real_x) + "," + round(map.real_y))
        }
        send_target_logic();
        if (!topleft_npc) {
            reset_topleft(ctarget)
        }
        if (topright_npc == "character" && !cached("chcid", character.cid)) {
            render_character_sheet()
        }
    }
    if (events.abtesting) {
        $(".scoreA").html(events.abtesting.A);
        $(".scoreB").html(events.abtesting.B);
        var c = -ssince(events.abtesting.end)
            , a = parseInt(c / 60)
            , c = parseInt(c) % 60;
        if (c == 0) {
            c = "00"
        } else {
            if (c < 10) {
                c = "0" + c
            }
        }
        $(".abtime").html("0" + a + ":" + c)
    }
    if (character && character.moving && options.code_fx && stage.cfilter_ascii) {
        remove_code_fx()
    }
    */
}

var last_loader = {
    progress: 0
};

function on_load_progress(a, b) {
    /* no $ on ALBot
    if (!a) {
        a = last_loader
    } else {
        last_loader = a
    }
    $("#progressui").html(round(a.progress) + "%");
    if ($("#progressui").html() == "100%") {
        $("#progressui").removeClass("loading")
    }
    */
}

function loader_click() {
    /* no $ on ALBot
    if (!server_addr) {
        show_modal("<div style='font-size: 48px'>No servers found, 3 possible scenarios: <br /><br />(1) The game is being updated <br />(2) All existing servers overloaded <br />(3) Someone found a bug that brought down all the servers<br /><br />Best to spend this time in our Discord to figure out what happened</div>")
    } else {
        if ($("#progressui").html() != "100%") {
            show_modal("<div style='font-size: 48px'>Game resources are loading<br /><br />This may take some time<br /><br />If the game got stuck at this stage, please email hello@adventure.land</div>")
        } else {
            show_modal("<div style='font-size: 48px'>All game resources have been loaded<br /><br />If you can't sign in, please email hello@adventure.land</div>")
        }
    }*/
}

function the_game(e) {
    /* set on top of the file
    width = $(window).width();
    height = $(window).height();
    */
    /*Loading and creating basic game infrastructure is handled by game.js
    if (bowser.mac && bowser.firefox) {
        renderer = new PIXI.CanvasRenderer(width,height,{
            antialias: antialias,
            transparent: false
        })
    } else {
        if (retina_mode) {
            renderer = new PIXI.autoDetectRenderer(width,height,{
                antialias: antialias,
                transparent: false,
                resolution: window.devicePixelRatio,
                autoResize: true
            })
        } else {
            if (force_webgl) {
                renderer = new PIXI.WebGLRenderer(width,height,{
                    antialias: antialias,
                    transparent: false
                })
            } else {
                if (force_canvas) {
                    renderer = new PIXI.CanvasRenderer(width,height,{
                        antialias: antialias,
                        transparent: false
                    })
                } else {
                    renderer = new PIXI.autoDetectRenderer(width,height,{
                        antialias: antialias,
                        transparent: false
                    })
                }
            }
        }
    }
    if (high_precision) {
        PIXI.PRECISION.DEFAULT = PIXI.PRECISION.HIGH
    }
    if (renderer.type == PIXI.RENDERER_TYPE.WEBGL) {
        console.log("WebGL Mode")
    } else {
        console.log("Canvas Mode")
    }
    renderer.plugins.interaction.cursorStyles.help = "help";
    renderer.plugins.interaction.cursorStyles.crosshair = "crosshair";
    if (!no_graphics) {
        document.body.appendChild(renderer.view)
    }
    $("canvas").css("position", "fixed").css("top", "0px").css("left", "0px").css("z-index", 1);
    if (PIXI.display && PIXI.display.Stage) {
        stage = new PIXI.display.Stage()
    } else {
        stage = new PIXI.Container()
    }
    if (bw_mode) {
        var d = new PIXI.filters.ColorMatrixFilter();
        d.desaturate();
        stage.cfilter_bw = d;
        regather_filters(stage)
    } else {
        delete stage.cfilter_bw;
        regather_filters(stage)
    }
    if (PIXI.DisplayList && !no_graphics) {
        if (window.inner_stage) {
            inner_stage.displayList = new PIXI.DisplayList()
        } else {
            stage.displayList = new PIXI.DisplayList()
        }
        map_layer = new PIXI.DisplayGroup(0,true);
        text_layer = new PIXI.DisplayGroup(3,true);
        chest_layer = new PIXI.DisplayGroup(2,true);
        separate_layer = new PIXI.DisplayGroup(0,true);
        monster_layer = new PIXI.DisplayGroup(1,function(g) {
                var f = 0;
                if (g.stand) {
                    f = -3
                }
                if ("real_y"in g) {
                    g.zOrder = -g.real_y + f + (g.y_disp || 0)
                } else {
                    g.zOrder = -g.position.y + f + (g.y_disp || 0)
                }
            }
        );
        player_layer = monster_layer;
        chest_layer = monster_layer
    } else {
        if (PIXI.display) {
            PIXI.Container.prototype.renderWebGL = function(f) {
                if (this._activeParentLayer && this._activeParentLayer != f._activeLayer) {
                    return
                }
                if (!this.visible) {
                    this.displayOrder = 0;
                    return
                }
                this.displayOrder = f.incDisplayOrder();
                if (this.worldAlpha <= 0 || !this.renderable) {
                    return
                }
                f._activeLayer = null;
                this.containerRenderWebGL(f);
                f._activeLayer = this._activeParentLayer
            }
            ;
            use_layers = true;
            stage.group.enableSort = true;
            var c = function(g) {
                var f = 0;
                if (g.stand) {
                    f = -3
                }
                if ("real_y"in g) {
                    g.zOrder = -g.real_y + f + (g.y_disp || 0)
                } else {
                    g.zOrder = -g.position.y + f + (g.y_disp || 0)
                }
            };
            var a = function(g) {
                var f = 0;
                if (g.parent.stand) {
                    f = -3
                }
                if ("real_y"in g.parent) {
                    g.zOrder = -g.parent.real_y + f + (g.parent.y_disp || 0)
                } else {
                    g.zOrder = -g.parent.position.y + f + (g.parent.y_disp || 0)
                }
            };
            map_layer = new PIXI.display.Group(0,true);
            stage.addChild(new PIXI.display.Layer(map_layer));
            animation_layer = new PIXI.display.Group(1,true);
            stage.addChild(new PIXI.display.Layer(animation_layer));
            entity_layer = new PIXI.display.Group(2,a);
            stage.addChild(new PIXI.display.Layer(entity_layer));
            below_layer = new PIXI.display.Group(2.99,c);
            stage.addChild(new PIXI.display.Layer(below_layer));
            monster_layer = new PIXI.display.Group(3,c);
            stage.addChild(new PIXI.display.Layer(monster_layer));
            above_layer = new PIXI.display.Group(3.01,c);
            stage.addChild(new PIXI.display.Layer(above_layer));
            hp_layer = new PIXI.display.Group(4,a);
            stage.addChild(new PIXI.display.Layer(hp_layer));
            text_layer = new PIXI.display.Group(5,true);
            stage.addChild(new PIXI.display.Layer(text_layer));
            player_layer = monster_layer;
            player_layer.sortPriority = 1;
            player_layer.useDoubleBuffer = true;
            chest_layer = monster_layer
        }
    }
    frame_ms = 16;
    C = PIXI.utils.BaseTextureCache;
    FC = {};
    FM = {};
    XYWH = {};
    T = {};
    loader = PIXI.loader;
    loader.on("progress", on_load_progress);
    for (name in G.animations) {
        G.animations[name].file = url_factory(G.animations[name].file);
        loader.add(G.animations[name].file)
    }
    for (name in G.tilesets) {
        G.tilesets[name] = url_factory(G.tilesets[name]);
        loader.add(G.tilesets[name])
    }
    for (name in G.sprites) {
        var b = G.sprites[name];
        if (b.skip) {
            continue
        }
        b.file = url_factory(b.file);
        loader.add(b.file)
    }
    for (name in G.imagesets) {
        if (!G.imagesets[name].load) {
            continue
        }
        G.imagesets[name].file = url_factory(G.imagesets[name].file);
        loader.add(G.imagesets[name].file)
    }
    gprocess_game_data();
    if (mode.bitmapfonts) {
        loader.add("/css/fonts/m5x7.xml")
    }
    set_status("75% ->Server");
    if (!e) {
        load_game();
        init_socket()
    } else {
        init_demo()
    }*/
}

function demo_entity_logic(b) {
    if (!b.demo) {
        return
    }
    if (b.moving) {
        return
    }
    if (b.pause && mssince(b.pause) < 800) {
        return
    }
    if (Math.random() < 0.1) {
        b.pause = new Date()
    }
    var a = [[1, 0], [0, 1], [-1, 0], [0, -1], [0.8, 0.8], [-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8]]
        , c = 12;
    if (Math.random() < 0.3) {
        c *= 2
    } else {
        if (Math.random() < 0.3) {
            c *= 3
        }
    }
    shuffle(a);
    b.going_x = b.x + a[0][0] * c;
    b.going_y = b.y + a[0][1] * c;
    if (b.boundary && (b.going_x < b.boundary[0] || b.going_x > b.boundary[2] || b.going_y < b.boundary[1] || b.going_y > b.boundary[3])) {
    } else {
        if (can_move(b)) {
            b.u = true;
            b.moving = true;
            b.from_x = b.x;
            b.from_y = b.y;
            calculate_vxy(b)
        } else {
            b.going_x = b.x;
            b.going_y = b.y
        }
    }
}

function init_demo() {
    is_demo = 1;
    current_map = current_in = "shellsisland";
    M = G.maps[current_map].data;
    GEO = G.geometry[current_map];
    reflect_music();
    load_game();
    G.maps[current_map].monsters.forEach(function (a) {
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
    if (!server_addr || !port) {
        add_log("server_addr isn't set, can't establish connection to nothing bro.")
        /*added own no connection messages
        add_log("Welcome");
        add_log("No live server found", "red");
        add_log("Please check again in 2-3 minutes");
        add_log("Spend this time in our Discord chat room", colors.codeblue);
        add_update_notes();
        */
        return
    }
    /*
    if (location.protocol == "https:") {
        window.socket = io("wss://" + server_addr + ":" + server_port, {
            secure: true,
            transports: ["websocket"]
        })
    } else {
        window.socket = io(server_addr + ":" + server_port, {
            transports: ["websocket"]
        })
    }
    */
    //TODO set config.userAgent
    console.log(server_addr, port)
    if (protocol === "https") {
        socket = new Socket("wss://" + server_addr + ":" + port, {
            autoConnect: false,
            extraHeaders: {
                "user-agent": "AdventureLandBot: (v1.0.0)",
                referer: "http://adventure.land/",
                "accept-language": "en-US,en;q=0.5"
            }
        });
    } else {
        socket = new Socket("ws://" + server_addr + ":" + port, {
            autoConnect: false,
            extraHeaders: {
                "user-agent": "AdventureLandBot: (v1.0.0)",
                referer: "http://adventure.land/",
                "accept-language": "en-US,en;q=0.5"
            }
        });

    }
    add_log("Connecting to the server.");
    socket_ready = false;
    socket_welcomed = false;
    socket.on("connect", function () {
        console.log("Socket connection established");
    });

    var original_onevent = socket.onevent;
    var original_emit = socket.emit;

    var logging = false;
    socket.emit = function (packet) {
        var is_transport = in_arr(arguments && arguments["0"], ["transport", "enter", "leave"]);
        if (logging) {
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
        if (logging) {
            console.log("INCOMING", JSON.stringify(arguments) + " " + new Date())
        }
        original_onevent.apply(socket, arguments)
    };
    socket.on("welcome", function (data) {
        socket_welcomed = true;
        is_pvp = data.pvp;

        gameplay = data.gameplay;
        server_region = data.region;
        server_identifier = data.name;
        server_name = server_names[data.region] + " " + data.name;
        clear_game_logs();
        add_log("Welcome to " + server_names[data.region] + " " + data.name);
        add_update_notes();
        current_map = data.map;
        current_in = data["in"];
        first_coords = true;
        first_x = data.x;
        first_y = data.y;
        //reflect_music();
        M = G.maps[current_map].data;
        GEO = G.geometry[current_map];
        //$(".servername").html(server_name);
        //$(".mapname").html(G.maps[current_map].name || "Unknown");

        launch_game()

        new_map_logic("welcome", data)
    });
    socket.on("new_map", function (data) {
        var create = false;
        transporting = false;
        if (current_map != data.name) {
            create = true;
            topleft_npc = false;
            data.redraw = true
        }
        current_map = data.name;
        current_in = data["in"];
        reflect_music();
        M = G.maps[current_map].data;
        GEO = G.geometry[current_map];
        //$(".mapname").html(G.maps[current_map].name || "Unknown");
        character.real_x = data.x;
        character.real_y = data.y;
        character.m = data.m;
        character.moving = false;
        var odir = character.direction;
        character.direction = data.direction || 0;
        character.map = current_map;
        character["in"] = data["in"];
        if (data.effect === "blink") {
            delete character.fading_out;
            delete character.s.blink;
            character.real_alpha = 0.5;
            restore_dimensions(character)
        }
        if (data.effect === "magiport") {
            delete character.fading_out;
            delete character.s.magiport;
            stop_filter(character, "bloom");
            character.real_alpha = 0.5;
            character.direction = odir;
            restore_dimensions(character)
        }
        if (data.effect) {
            unstuck_logic(character)
        }
        character.tp = data.effect;
        var cm_timer = new Date();
        if (create) {
            create_map()
        }
        console.log("create_map: " + mssince(cm_timer));
        pull_all = true;
        position_map();
        new_map_logic("map", data);
        call_code_function("trigger_event", "new_map", data)
    });
    socket.on("start", function (data) {
        /* no $ in ALBot
        if (!no_html) {
            $("#progressui").remove();
            $("#content").html("");
            $("#topmid,#bottommid,#toprightcorner,#bottomleftcorner2,#bottomleftcorner").show();
            $(".xpsui").show();
            $("body").append('<input id="chatinput" onkeypress="if(event.keyCode==13) say($(this).rfval())" type="text" autocomplete="off" name="alchatinput" placeholder=""/>')
        }
        if (gtest) {
            $("body").children().each(function() {
                if (this.tagName != "CANVAS") {
                    $(this).remove()
                }
            })
        }*/
        inside = "game";
        S = data.s_info;
        var m_info = data.info;
        delete data.info;
        delete data.s_info;
        G.base_gold = data.base_gold;
        delete data.base_gold;
        character = add_character(data, 1);
        character.ping = mssince(auth_sent);
        pings = [character.ping];
        if (!data.vision) {
            character.vision = [700, 500]
        }
        friends = data.friends;
        character.acx = data.acx;
        character.xcx = data.xcx;
        if (character.level == 1) {
            show_game_guide()
        }
        if (character.ctype == "merchant" || recording_mode) {
            options.show_names = true
        }
        clear_game_logs();
        add_log("Connected!");
        //add_holiday_log();
        if (gameplay == "hardcore") {
            add_log("Pro Tips: You can transport to anywhere from the Beach Cave, Water Spirits drop stat belts, 3 monsters drop 3 new unique items, 3 monsters drop 50 times the gold they usually do!", "#B2D5DF");
            //$(".saferespawn").show()
        } else {
            add_log("Note: Game dynamics and drops aren't final, they are evolving with every update", "gray")
        }
        //$(".charactername").html(character.name);
        var title = character.name;
        if (gameplay == "hardcore") {
            title = "Fierce " + character.name
        }
        try {
            var get = "";
            if (no_html) {
                get += (!get && "?" || "&") + "no_html=true"
            } else {
                if (no_graphics) {
                    get += (!get && "?" || "&") + "no_graphics=true"
                } else {
                    if (border_mode) {
                        get += (!get && "?" || "&") + "borders=true"
                    }
                }
            }
            //window.history.pushState(character.name, title, "/character/" + character.name + "/in/" + server_region + "/" + server_identifier + "/" + get);
            //$("title").html(title)
        } catch (e) {
            console.log(e)
        }
        reposition_ui();
        update_overlays();
        current_in = character["in"];
        if (character.map != current_map) {
            current_map = character.map;
            reflect_music();
            M = G.maps[current_map].data;
            GEO = G.geometry[current_map];
            //$(".mapname").html(G.maps[current_map].name || "Unknown");
            create_map();
            pull_all = true
        }
        /*
        if (!gtest) {
            if (manual_centering) {
                if (window.inner_stage) {
                    inner_stage.addChild(character)
                } else {
                    stage.addChild(character)
                }
            } else {
                map.addChild(character)
            }
        }*/
        position_map();
        rip_logic();
        new_map_logic("start", data);
        new_game_logic();
        /*
        if (code_to_load) {
            handle_information([{
                type: "code",
                code: code_to_load,
                run: true
            }]);
            code_to_load = false
        } else {
            if (gameplay == "hardcore" || gameplay == "test") {
                api_call("load_gcode", {
                    file: "/examples/hardcore.js",
                    run: true
                })
            } else {
                if (persist_code || explicit_code) {
                    try {
                        if (explicit_code) {
                            start_runner()
                        } else {
                            var data = storage_get("code_cache")
                                , the_code = ""
                                , to_run = false;
                            if (data) {
                                data = JSON.parse(data);
                                the_code = data["code_" + real_id] || "";
                                to_run = data["run_" + real_id];
                                code_slot = data["slot_" + real_id];
                                if (the_code.length) {
                                    handle_information([{
                                        type: "code",
                                        code: the_code,
                                        run: to_run,
                                        slot: code_slot,
                                        reset: true
                                    }])
                                }
                            }
                        }
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }*/
        /*
        var settings = get_settings(real_id);
        if (settings.skillbar) {
            skillbar = settings.skillbar
        }
        if (settings.keymap) {
            keymap = settings.keymap
        }
        if (!is_electron) {
            if (settings.music == "on" || sound_music) {
                sound_on()
            }
            if (settings.sfx == "on" || sound_sfx) {
                sfx_on()
            }
        }
        map_keys_and_skills();
        render_skillbar();
        if (!character.rip) {
            //$("#name").css("color", "#1AC506")
        }*/
    });
    socket.on("correction", function (data) {
        if (can_move({
            map: character.map,
            x: character.real_x,
            y: character.real_y,
            going_x: data.x,
            going_y: data.y,
            base: character.base
        })) {
            //add_log("Location corrected", "gray");
            console.log("Character correction");
            character.real_x = parseFloat(data.x);
            character.real_y = parseFloat(data.y);
            character.moving = false;
            character.vx = character.vy = 0
        }
    });
    socket.on("players", function (data) {
        //load_server_list(data)
    });
    socket.on("pvp_list", function (data) {
        if (data.code) {
            call_code_function("trigger_event", "pvp_list", data.list)
        }/* else {
            load_pvp_list(data.list)
        }*/
    });
    socket.on("ping_ack", function () {
        add_log("Ping: " + mssince(ping_sent) + "ms", "gray")
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
        draw_trigger(function () {
            if (is_string(data)) {
                ui_log(data, "gray")
            } else {
                if (data.sound) {
                    sfx(data.sound)
                }
                ui_log(data.message, data.color)
            }
            if (data.confetti && get_player(data.confetti)) {
                confetti_shower(get_player(data.confetti), 1)
            }
        })
    });
    socket.on("game_chat", function (data) {
        draw_trigger(function () {
            if (is_string(data)) {
                add_chat("", data, "gray")
            } else {
                if (data.sound) {
                    sfx(data.sound)
                }
                add_chat("", data.message, data.color)
            }
        })
    });
    socket.on("fx", function (data) {
        draw_trigger(function () {
            if (data.name == "the_door") {
                the_door()
            }
        })
    });
    socket.on("online", function (data) {
        draw_trigger(function () {
            add_chat("", data.name + " is on " + data.server, "white", "online|" + data.name)
        })
    });
    socket.on("light", function (data) {
        draw_trigger(function () {
            if (data.affected) {
                if (is_pvp) {
                    pvp_timeout(3600)
                }
                skill_timeout("invis")
            }
            if (data.affected) {
                start_animation(player, "light")
            }
            last_light = new Date();
            var player = get_player(data.name);
            if (!player) {
                return
            }
            d_text("LIGHT", player, {
                color: "white"
            });
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
            data = {
                name: data
            }
        }
        if (data.name == "pinkgoo") {
            add_chat("", "The 'Love Goo' has respawned in " + G.maps[data.map].name + "!", "#EDB0E0")
        }
        if (data.name == "snowman") {
        }
        if (data.name == "franky") {
        }
        if (data.name == "wabbit") {
            add_chat("", "Wabbit has respawned in " + G.maps[data.map].name + "!", "#78CFEF")
        }
        if (data.name == "goldenbat") {
            add_chat("", "The Golden Bat has spawned in " + G.maps[data.map].name + "!", "gold")
        }
        if (data.name == "ab_score") {
            if (!events.abtesting) {
                return
            }
            events.abtesting.A = data.A;
            events.abtesting.B = data.B
        }
        call_code_function("on_game_event", data);
        call_code_function("trigger_event", "event", data)
    });
    socket.on("game_response", function (data) {
        var response = data.response || data;
        if (response == "upgrade_success" || response == "upgrade_fail") {
            u_retain = options.retain_upgrades
        }
        draw_trigger(function () {
            if (response == "elixir") {
                ui_log("Consumed the elixir", "gray");
                d_text("YUM", character, {
                    color: "elixir"
                })
            } else {
                if (response == "storage_full") {
                    ui_log("Storage is full", "gray");
                    reopen()
                } else {
                    if (response == "inventory_full") {
                        ui_log("Inventory is full", "gray");
                        reopen()
                    } else {
                        if (response == "invalid") {
                            ui_log("Invalid", "gray")
                        } else {
                            if (response == "compound_success") {
                                ui_log("Item combination succeeded", data.up && "#1ABEFF" || "white");
                                resolve_deferred("compound", {
                                    success: true,
                                    level: data.level,
                                    num: data.num
                                })
                            } else {
                                if (response == "compound_fail") {
                                    ui_error("Item combination failed");
                                    resolve_deferred("compound", {
                                        failed: true,
                                        success: false,
                                        level: data.level,
                                        num: data.num
                                    })
                                } else {
                                    if (response == "compound_in_progress") {
                                        ui_log("Another combination in progress", "gray");
                                        reject_deferred("compound", {
                                            reason: "in_progress"
                                        })
                                    } else {
                                        if (response == "compound_invalid_offering") {
                                            ui_log("Offering not accepted", "gray");
                                            reject_deferred("compound", {
                                                reason: "offering"
                                            })
                                        } else {
                                            if (response == "compound_mismatch") {
                                                ui_log("Items are different", "gray");
                                                reject_deferred("compound", {
                                                    reason: "mismatch"
                                                })
                                            } else {
                                                if (response == "compound_no_item") {
                                                    reject_deferred("compound", {
                                                        reason: "no_item"
                                                    })
                                                } else {
                                                    if (response == "compound_cant") {
                                                        ui_log("Can't be combined", "gray");
                                                        reject_deferred("compound", {
                                                            reason: "not_combinable"
                                                        })
                                                    } else {
                                                        if (response == "compound_incompatible_scroll") {
                                                            set_uchance("?");
                                                            ui_log("Incompatible scroll", "gray");
                                                            reject_deferred("compound", {
                                                                reason: "scroll"
                                                            })
                                                        } else {
                                                            if (response == "misc_fail") {
                                                                ui_log(":)", "#FF5D54");
                                                                if (data.place) {
                                                                    reject_deferred(data.place, {
                                                                        reason: "misc"
                                                                    })
                                                                }
                                                            } else {
                                                                if (response == "upgrade_success") {
                                                                    ui_log("Item upgrade succeeded", "white");
                                                                    resolve_deferred("upgrade", {
                                                                        success: true,
                                                                        level: data.level,
                                                                        num: data.num
                                                                    })
                                                                } else {
                                                                    if (response == "upgrade_fail") {
                                                                        ui_error("Item upgrade failed");
                                                                        resolve_deferred("upgrade", {
                                                                            failed: true,
                                                                            success: false,
                                                                            level: data.level,
                                                                            num: data.num
                                                                        })
                                                                    } else {
                                                                        if (response == "upgrade_success_stat") {
                                                                            resolve_deferred("upgrade", {
                                                                                stat: true,
                                                                                stat_type: data.stat_type,
                                                                                num: data.num
                                                                            })
                                                                        } else {
                                                                            if (response == "upgrade_offerring_success") {
                                                                                resolve_deferred("upgrade", {
                                                                                    offering: true
                                                                                })
                                                                            } else {
                                                                                if (response == "upgrade_no_item") {
                                                                                    reject_deferred("upgrade", {
                                                                                        reason: "no_item"
                                                                                    })
                                                                                } else {
                                                                                    if (response == "upgrade_in_progress") {
                                                                                        ui_log("Another upgrade in progress", "gray");
                                                                                        reject_deferred("upgrade", {
                                                                                            reason: "in_progress"
                                                                                        })
                                                                                    } else {
                                                                                        if (response == "mail_sending") {
                                                                                            ui_log("Sending mail ...", "gray");
                                                                                            hide_modal(true)
                                                                                        } else {
                                                                                            if (response == "mail_failed") {
                                                                                                show_alert("Mail failed, reason: " + data.reason)
                                                                                            } else {
                                                                                                if (response == "mail_sent") {
                                                                                                    ui_log("Mail sent to " + data.to + "!", "#C06978")
                                                                                                } else {
                                                                                                    if (response == "upgrade_no_scroll") {
                                                                                                        reject_deferred("upgrade", {
                                                                                                            reason: "no_scroll"
                                                                                                        })
                                                                                                    } else {
                                                                                                        if (response == "upgrade_mismatch") {
                                                                                                            reject_deferred("upgrade", {
                                                                                                                reason: "mismatch"
                                                                                                            })
                                                                                                        } else {
                                                                                                            if (response == "upgrade_invalid_offering") {
                                                                                                                ui_log("Offering not accepted", "gray");
                                                                                                                reject_deferred("upgrade", {
                                                                                                                    reason: "offering"
                                                                                                                })
                                                                                                            } else {
                                                                                                                if (response == "upgrade_cant") {
                                                                                                                    ui_log("Can't be upgraded", "gray");
                                                                                                                    reject_deferred("upgrade", {
                                                                                                                        reason: "not_upgradeable"
                                                                                                                    })
                                                                                                                } else {
                                                                                                                    if (response == "upgrade_incompatible_scroll") {
                                                                                                                        set_uchance("?");
                                                                                                                        ui_log("Incompatible scroll", "gray");
                                                                                                                        reject_deferred("upgrade", {
                                                                                                                            reason: "scroll"
                                                                                                                        })
                                                                                                                    } else {
                                                                                                                        if (response == "upgrade_scroll_q") {
                                                                                                                            ui_log("Need " + data.q + " scrolls", "gray");
                                                                                                                            reject_deferred("upgrade", {
                                                                                                                                reason: "scroll_quantity",
                                                                                                                                need: data.q,
                                                                                                                                have: data.h
                                                                                                                            })
                                                                                                                        } else {
                                                                                                                            if (response == "upgrade_chance" || response == "compound_chance") {
                                                                                                                                set_uchance(data.chance);
                                                                                                                                if (response == "upgrade_chance") {
                                                                                                                                    resolve_deferred("upgrade", {
                                                                                                                                        calculate: true,
                                                                                                                                        chance: data.chance
                                                                                                                                    })
                                                                                                                                }
                                                                                                                                if (response == "compound_chance") {
                                                                                                                                    resolve_deferred("compound", {
                                                                                                                                        calculate: true,
                                                                                                                                        chance: data.chance
                                                                                                                                    })
                                                                                                                                }
                                                                                                                            } else {
                                                                                                                                if (response == "max_level") {
                                                                                                                                    set_uchance("?");
                                                                                                                                    if (data.place) {
                                                                                                                                        reject_deferred(data.place, {
                                                                                                                                            reason: "max_level"
                                                                                                                                        })
                                                                                                                                    }
                                                                                                                                    ui_log("Already +" + data.level, "white")
                                                                                                                                } else {
                                                                                                                                    if (response == "exception") {
                                                                                                                                        if (data.place) {
                                                                                                                                            reject_deferred(data.place, {
                                                                                                                                                reason: "exception"
                                                                                                                                            })
                                                                                                                                        }
                                                                                                                                        ui_error("ERROR!")
                                                                                                                                    } else {
                                                                                                                                        if (response == "nothing") {
                                                                                                                                            ui_log("Nothing happens", "gray")
                                                                                                                                        } else {
                                                                                                                                            if (response == "not_ready") {
                                                                                                                                                d_text("NOT READY", character)
                                                                                                                                            } else {
                                                                                                                                                if (response == "no_mp") {
                                                                                                                                                    if (data.place == "attack" || data.place == "heal") {
                                                                                                                                                        reject_deferred(data.place, {
                                                                                                                                                            reason: "no_mp"
                                                                                                                                                        })
                                                                                                                                                    }
                                                                                                                                                    d_text("NO MP", character)
                                                                                                                                                } else {
                                                                                                                                                    if (response == "friendly") {
                                                                                                                                                        var safe = false
                                                                                                                                                            ,
                                                                                                                                                            phrase = "FRIENDLY";
                                                                                                                                                        if (G.maps[character.map].safe) {
                                                                                                                                                            safe = true,
                                                                                                                                                                phrase = "SAFE ZONE"
                                                                                                                                                        }
                                                                                                                                                        if (data.place == "attack" || data.place == "heal") {
                                                                                                                                                            reject_deferred(data.place, {
                                                                                                                                                                reason: "friendly"
                                                                                                                                                            })
                                                                                                                                                        }
                                                                                                                                                        if (get_entity(data.id)) {
                                                                                                                                                            d_text(phrase, get_entity(data.id))
                                                                                                                                                        } else {
                                                                                                                                                            d_text(phrase, character)
                                                                                                                                                        }
                                                                                                                                                        if (safe) {
                                                                                                                                                            ui_log("You can't attack in a safe zone", "gray")
                                                                                                                                                        }
                                                                                                                                                    } else {
                                                                                                                                                        if (response == "cooldown") {
                                                                                                                                                            if (data.place == "attack" || data.place == "heal") {
                                                                                                                                                                reject_deferred(data.place, {
                                                                                                                                                                    reason: "cooldown",
                                                                                                                                                                    remaining: data.ms
                                                                                                                                                                })
                                                                                                                                                            }
                                                                                                                                                            if (data.id && get_entity(data.id)) {
                                                                                                                                                                d_text("WAIT", get_entity(data.id))
                                                                                                                                                            } else {
                                                                                                                                                                d_text("WAIT", character)
                                                                                                                                                            }
                                                                                                                                                        } else {
                                                                                                                                                            if (response == "too_far") {
                                                                                                                                                                if (data.place == "attack" || data.place == "heal") {
                                                                                                                                                                    reject_deferred(data.place, {
                                                                                                                                                                        reason: "too_far",
                                                                                                                                                                        distance: data.dist,
                                                                                                                                                                        origin: "server"
                                                                                                                                                                    })
                                                                                                                                                                }
                                                                                                                                                                if (data.id && get_entity(data.id)) {
                                                                                                                                                                    d_text("TOO FAR", get_entity(data.id))
                                                                                                                                                                } else {
                                                                                                                                                                    d_text("TOO FAR", character)
                                                                                                                                                                }
                                                                                                                                                            } else {
                                                                                                                                                                if (response == "miss") {
                                                                                                                                                                    if (data.place == "attack" || data.place == "heal") {
                                                                                                                                                                        reject_deferred(data.place, {
                                                                                                                                                                            reason: "miss"
                                                                                                                                                                        })
                                                                                                                                                                    }
                                                                                                                                                                    if (get_entity(data.id)) {
                                                                                                                                                                        d_text("MISS", get_entity(data.id))
                                                                                                                                                                    } else {
                                                                                                                                                                        d_text("MISS", character)
                                                                                                                                                                    }
                                                                                                                                                                } else {
                                                                                                                                                                    if (response == "disabled") {
                                                                                                                                                                        if (data.place) {
                                                                                                                                                                            reject_deferred(data.place, {
                                                                                                                                                                                reason: "disabled"
                                                                                                                                                                            })
                                                                                                                                                                        }
                                                                                                                                                                        d_text("DISABLED", character)
                                                                                                                                                                    } else {
                                                                                                                                                                        if (response == "attack_failed") {
                                                                                                                                                                            if (data.place == "attack" || data.place == "heal") {
                                                                                                                                                                                reject_deferred(data.place, {
                                                                                                                                                                                    reason: "failed"
                                                                                                                                                                                })
                                                                                                                                                                            }
                                                                                                                                                                            if (get_entity(data.id)) {
                                                                                                                                                                                d_text("FAILED", get_entity(data.id))
                                                                                                                                                                            } else {
                                                                                                                                                                                d_text("FAILED", character)
                                                                                                                                                                            }
                                                                                                                                                                        } else {
                                                                                                                                                                            if (response == "skill_too_far") {
                                                                                                                                                                                d_text("TOO FAR", character)
                                                                                                                                                                            } else {
                                                                                                                                                                                if (response == "skill_success") {
                                                                                                                                                                                    var name = data.name;
                                                                                                                                                                                    skill_timeout(name);
                                                                                                                                                                                    resolve_deferred("skill", {
                                                                                                                                                                                        success: true
                                                                                                                                                                                    })
                                                                                                                                                                                } else {
                                                                                                                                                                                    if (response == "target_alive") {
                                                                                                                                                                                        d_text("LOOKS LIVE?", character)
                                                                                                                                                                                    } else {
                                                                                                                                                                                        if (response == "slot_occuppied") {
                                                                                                                                                                                            ui_log("Slot occuppied", "gray")
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
                                                                                                                                                                                                    if (response == "challenge_sent") {
                                                                                                                                                                                                        add_chat("", "Challenged " + data.name + " to duel", "white")
                                                                                                                                                                                                    } else {
                                                                                                                                                                                                        if (response == "challenge_accepted") {
                                                                                                                                                                                                            add_chat("", data.name + " accepted the challenge!", "#DF231B")
                                                                                                                                                                                                        } else {
                                                                                                                                                                                                            if (response == "challenge_received") {
                                                                                                                                                                                                                add_challenge(data.name);
                                                                                                                                                                                                                call_code_function("trigger_character_event", "challenge", data.name)
                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                if (response == "duel_started") {
                                                                                                                                                                                                                    add_duel(data.challenger, data.vs, data.id);
                                                                                                                                                                                                                    call_code_function("trigger_character_event", "duel", {
                                                                                                                                                                                                                        challenger: data.challenger,
                                                                                                                                                                                                                        vs: data.vs,
                                                                                                                                                                                                                        id: data.id
                                                                                                                                                                                                                    })
                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                    if (response == "no_level") {
                                                                                                                                                                                                                        d_text("LOW LEVEL", character)
                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                        if (response == "not_in_pvp") {
                                                                                                                                                                                                                            d_text("NO", character)
                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                            if (response == "skill_cant_incapacitated") {
                                                                                                                                                                                                                                d_text("CAN'T USE", character)
                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                if (response == "skill_cant_use") {
                                                                                                                                                                                                                                    d_text("CAN'T USE", character)
                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                    if (response == "skill_cant_pve") {
                                                                                                                                                                                                                                        d_text("CAN'T USE", character)
                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                        if (response == "skill_cant_wtype") {
                                                                                                                                                                                                                                            ui_log("Wrong weapon", "gray");
                                                                                                                                                                                                                                            d_text("NOPE", character)
                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                            if (response == "skill_cant_slot") {
                                                                                                                                                                                                                                                ui_log("Item not equipped", "gray");
                                                                                                                                                                                                                                                d_text("NOPE", character)
                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                if (response == "skill_cant_requirements") {
                                                                                                                                                                                                                                                    ui_log("Skill requirements not met", "gray");
                                                                                                                                                                                                                                                    d_text("NOPE", character)
                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                    if (response == "cruise") {
                                                                                                                                                                                                                                                        ui_log("Cruise speed set at " + data.speed, "gray")
                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                        if (response == "exchange_full") {
                                                                                                                                                                                                                                                            d_text("NO SPACE", character);
                                                                                                                                                                                                                                                            ui_log("Inventory is full", "gray");
                                                                                                                                                                                                                                                            reopen()
                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                            if (response == "exchange_existing") {
                                                                                                                                                                                                                                                                d_text("WAIT", character);
                                                                                                                                                                                                                                                                ui_log("Existing exchange in progress", "gray");
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
                                                                                                                                                                                                                                                                        if (in_arr(response, ["donate_thx", "donate_gum", "donate_low"])) {
                                                                                                                                                                                                                                                                            var message;
                                                                                                                                                                                                                                                                            data.gold = to_pretty_num(data.gold);
                                                                                                                                                                                                                                                                            if (response == "donate_thx") {
                                                                                                                                                                                                                                                                                message = "Thanks kind sir. Thanks for helping the reserve."
                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                if (response == "donate_gum") {
                                                                                                                                                                                                                                                                                    message = data.gold + "? " + data.gold + "? " + data.gold + "?! Here, take this!"
                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                    if (response == "donate_low") {
                                                                                                                                                                                                                                                                                        message = "They say there's no small contribution.. BUT THEY ARE OBVIOUSLY WRONG. " + data.gold + "??!!! GET LOST"
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                            ui_log("Donated " + to_pretty_num(data.gold) + " gold", "gray");
                                                                                                                                                                                                                                                                            render_interaction({
                                                                                                                                                                                                                                                                                auto: true,
                                                                                                                                                                                                                                                                                skin: "goblin",
                                                                                                                                                                                                                                                                                message: message
                                                                                                                                                                                                                                                                            })
                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                            if (response == "lostandfound_info") {
                                                                                                                                                                                                                                                                                var message = "Hey there! I'm in charge of taking care of our gold reserve and making sure unlooted chests are 'recycled'! "
                                                                                                                                                                                                                                                                                    ,
                                                                                                                                                                                                                                                                                    xp = 3.2;
                                                                                                                                                                                                                                                                                if (data.gold < 500000000) {
                                                                                                                                                                                                                                                                                    message += "Currently the gold reserves are low, so I'm taking a small something something out of every chest :] ",
                                                                                                                                                                                                                                                                                        xp = 4.8
                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                    if (data.gold < 1000000000) {
                                                                                                                                                                                                                                                                                        message += "Currently the gold reserves are low, so I'm taking a small something out of every chest :] ",
                                                                                                                                                                                                                                                                                            xp = 4
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                message += "Donations are always welcome, merchants get " + xp + " XP for every gold they donate!";
                                                                                                                                                                                                                                                                                render_interaction({
                                                                                                                                                                                                                                                                                    auto: true,
                                                                                                                                                                                                                                                                                    skin: "goblin",
                                                                                                                                                                                                                                                                                    message: message,
                                                                                                                                                                                                                                                                                    button: "WHAT HAVE YOU FOUND?",
                                                                                                                                                                                                                                                                                    onclick: function () {
                                                                                                                                                                                                                                                                                        socket.emit("lostandfound")
                                                                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                                                                    button2: "DONATE",
                                                                                                                                                                                                                                                                                    onclick2: function () {
                                                                                                                                                                                                                                                                                        render_donate()
                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                if (response === "lostandfound_donate") {
                                                                                                                                                                                                                                                                                    var message = "Not feeling like showing my loots to cheapskates! Sorry not sorry..";
                                                                                                                                                                                                                                                                                    render_interaction({
                                                                                                                                                                                                                                                                                        auto: true,
                                                                                                                                                                                                                                                                                        skin: "goblin",
                                                                                                                                                                                                                                                                                        message: message
                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                    if (response === "cant_escape") {
                                                                                                                                                                                                                                                                                        d_text("CAN'T ESCAPE", character);
                                                                                                                                                                                                                                                                                        transporting = false
                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                        if (response === "cant_enter") {
                                                                                                                                                                                                                                                                                            ui_log("Can't enter", "gray");
                                                                                                                                                                                                                                                                                            transporting = false
                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                            if (response === "bank_opi") {
                                                                                                                                                                                                                                                                                                ui_log("Bank connection in progress", "gray");
                                                                                                                                                                                                                                                                                                transporting = false
                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                if (response === "bank_opx") {
                                                                                                                                                                                                                                                                                                    if (data.name) {
                                                                                                                                                                                                                                                                                                        ui_log(data.name + " is in the bank", "gray")
                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                        ui_log("Bank is busy right now", "gray")
                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                    transporting = false
                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                    if (response === "transport_failed") {
                                                                                                                                                                                                                                                                                                        transporting = false
                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                        if (response === "loot_failed") {
                                                                                                                                                                                                                                                                                                            close_chests();
                                                                                                                                                                                                                                                                                                            ui_log("Can't loot", "gray")
                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                            if (response === "loot_no_space") {
                                                                                                                                                                                                                                                                                                                close_chests();
                                                                                                                                                                                                                                                                                                                d_text("NO SPACE", character)
                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                if (response === "transport_cant_reach") {
                                                                                                                                                                                                                                                                                                                    ui_log("Can't reach", "gray");
                                                                                                                                                                                                                                                                                                                    transporting = false
                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                    if (response === "destroyed") {
                                                                                                                                                                                                                                                                                                                        ui_log("Destroyed " + G.items[data.name].name, "gray")
                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                        if (response === "get_closer" || response === "buy_get_closer" || response === "sell_get_closer" || response === "trade_get_closer" || response === "ecu_get_closer") {
                                                                                                                                                                                                                                                                                                                            if (data.place) {
                                                                                                                                                                                                                                                                                                                                reject_deferred(data.place, {
                                                                                                                                                                                                                                                                                                                                    reason: "distance"
                                                                                                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                            ui_log("Get closer", "gray")
                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                            if (response == "trade_bspace") {
                                                                                                                                                                                                                                                                                                                                ui_log("No space on buyer", "gray")
                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                if (response == "bank_restrictions") {
                                                                                                                                                                                                                                                                                                                                    if (data.place) {
                                                                                                                                                                                                                                                                                                                                        reject_deferred(data.place, {
                                                                                                                                                                                                                                                                                                                                            reason: "bank"
                                                                                                                                                                                                                                                                                                                                        })
                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                    ui_log("You can't buy, trade or upgrade in the bank.", "gray")
                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                    if (response == "tavern_too_late") {
                                                                                                                                                                                                                                                                                                                                        ui_log("Too late to bet!", "gray")
                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                        if (response == "tavern_not_yet") {
                                                                                                                                                                                                                                                                                                                                            ui_log("Not taking bets yet!", "gray")
                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                            if (response == "tavern_too_many_bets") {
                                                                                                                                                                                                                                                                                                                                                ui_log("You have too many active bets", "gray")
                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                if (response == "tavern_dice_exist") {
                                                                                                                                                                                                                                                                                                                                                    ui_log("You already have a bet", "gray")
                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                    if (response == "tavern_gold_not_enough") {
                                                                                                                                                                                                                                                                                                                                                        ui_log("Gold reserve insufficient to cover this bet", "gray")
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
                                                                                                                                                                                                                                                                                                                                                            if (response == "cx_new") {
                                                                                                                                                                                                                                                                                                                                                                ui_log("Cosmetics: " + data.name, "#DB7AA9");
                                                                                                                                                                                                                                                                                                                                                                character.acx = data.acx
                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                if (response == "cx_not_found") {
                                                                                                                                                                                                                                                                                                                                                                    ui_log("Cosmetics not found", "gray")
                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                    if (response == "ex_condition") {
                                                                                                                                                                                                                                                                                                                                                                        var def = G.conditions[data.name]
                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                        if (response == "buy_success") {
                                                                                                                                                                                                                                                                                                                                                                            var event = {
                                                                                                                                                                                                                                                                                                                                                                                cost: data.cost,
                                                                                                                                                                                                                                                                                                                                                                                num: data.num,
                                                                                                                                                                                                                                                                                                                                                                                name: data.name,
                                                                                                                                                                                                                                                                                                                                                                                q: data.q || 1
                                                                                                                                                                                                                                                                                                                                                                            };
                                                                                                                                                                                                                                                                                                                                                                            ui_log("Spent " + to_pretty_num(data.cost) + " gold", "gray");
                                                                                                                                                                                                                                                                                                                                                                            call_code_function("trigger_character_event", "buy", event);
                                                                                                                                                                                                                                                                                                                                                                            resolve_deferred("buy", event)
                                                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                                                            if (response == "buy_cant_npc") {
                                                                                                                                                                                                                                                                                                                                                                                ui_log("Can't buy this from an NPC", "gray");
                                                                                                                                                                                                                                                                                                                                                                                reject_deferred("buy", {
                                                                                                                                                                                                                                                                                                                                                                                    reason: "not_buyable"
                                                                                                                                                                                                                                                                                                                                                                                })
                                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                                if (response == "buy_cant_space") {
                                                                                                                                                                                                                                                                                                                                                                                    d_text("SPACE", character);
                                                                                                                                                                                                                                                                                                                                                                                    ui_log("No space", "gray");
                                                                                                                                                                                                                                                                                                                                                                                    reject_deferred("buy", {
                                                                                                                                                                                                                                                                                                                                                                                        reason: "space"
                                                                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                    if (response == "buy_cost") {
                                                                                                                                                                                                                                                                                                                                                                                        d_text("INSUFFICIENT", character);
                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Not enough gold", "gray");
                                                                                                                                                                                                                                                                                                                                                                                        reject_deferred("buy", {
                                                                                                                                                                                                                                                                                                                                                                                            reason: "cost"
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
                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "item_placeholder") {
                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Slot is occupied", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "item_locked") {
                                                                                                                                                                                                                                                                                                                                                                                                                        if (data.place) {
                                                                                                                                                                                                                                                                                                                                                                                                                            reject_deferred(data.place, "locked")
                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Item is locked", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                        if (response == "item_blocked") {
                                                                                                                                                                                                                                                                                                                                                                                                                            if (data.place) {
                                                                                                                                                                                                                                                                                                                                                                                                                                reject_deferred(data.place, "blocked")
                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                            ui_log("Item is in use", "gray")
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
                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "add_item") {
                                                                                                                                                                                                                                                                                                                                                                                                                                    var additional = ""
                                                                                                                                                                                                                                                                                                                                                                                                                                        ,
                                                                                                                                                                                                                                                                                                                                                                                                                                        prefix = "a ";
                                                                                                                                                                                                                                                                                                                                                                                                                                    if (data.item.q > 1) {
                                                                                                                                                                                                                                                                                                                                                                                                                                        additional = "(x" + data.item.q + ")",
                                                                                                                                                                                                                                                                                                                                                                                                                                            prefix = ""
                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                    add_log("Received " + prefix + G.items[data.item.name].name + additional, "#3B9358")
                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "log_gold_not_enough") {
                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Not enough gold", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                        if (response == "gold_not_enough") {
                                                                                                                                                                                                                                                                                                                                                                                                                                            add_chat("", "Not enough gold", colors.gold)
                                                                                                                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                            if (response == "gold_sent") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                add_chat("", "Sent " + to_pretty_num(data.gold) + " gold to " + data.name, colors.gold)
                                                                                                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "gold_received" && !data.name) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                    add_log("Received " + to_pretty_num(data.gold) + " gold", "gray")
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (response == "unfriend_failed") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                add_chat("", "Unfriend failed, reason: " + data.reason, "#409BDD")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "gold_use") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Used " + to_pretty_num(data.gold) + " gold", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "slots_success") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Machine went crazy", "#9733FF")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (response == "slots_fail") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ui_log("Machine got stuck", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (response == "craft") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                var def = G.craft[data.name];
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (def.cost) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Spent " + to_pretty_num(def.cost) + " gold", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ui_log("Received " + G.items[data.name].name, "white")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "dismantle") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    var def = G.dismantle[data.name];
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (data.level) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Spent " + to_pretty_num(10000) + " gold", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Spent " + to_pretty_num(def.cost) + " gold", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Dismantled " + G.items[data.name].name, "#CF5C65")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "defeated_by_a_monster") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Defeated by " + G.monsters[data.monster].name, "#571F1B");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Lost " + to_pretty_num(data.xp) + " experience", "gray")
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
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "charm_failed") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Couldn't charm ...", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "cooldown") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        d_text("NOT READY", character)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (response == "blink_failed") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            no_no_no();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            d_text("NO", character);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            last_blink_pressed = inception
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (response == "magiport_sent") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ui_log("Magiportation request sent to " + data.id, "white")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "magiport_gone") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Magiporter gone", "gray");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    no_no_no(2)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "magiport_failed") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Magiport failed", "gray"),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            no_no_no(2)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (response == "revive_failed") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ui_log("Revival failed", "gray"),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                no_no_no(1)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (response == "locksmith_cant") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ui_log("Can't lock/unlock this item", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "locksmith_aunlocked") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Already unlocked", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "locksmith_alocked") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Already locked", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (response == "locksmith_unsealed") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ui_log("Spent 250,000 gold", "gray");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ui_log("Unsealed the item", "gray");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ui_log("It can be unlocked in 7 days", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (response == "locksmith_unsealing") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ui_log("It can be unlocked in " + parseInt(data.hours) + " hours", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "locksmith_unlocked") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Spent 250,000 gold", "gray");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ui_log("Unlocked the item", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "locksmith_unseal_complete") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ui_log("Unlocked the item", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (response == "locksmith_locked") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ui_log("Spent 250,000 gold", "gray");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ui_log("Locked the item", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (response == "locksmith_sealed") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ui_log("Spent 250,000 gold", "gray");
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ui_log("Sealed the item", "gray")
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (response == "monsterhunt_started" || response == "monsterhunt_already") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (!character.s.monsterhunt) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        return
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (character.s.monsterhunt.c == 1) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        $("#merchant-item").html(render_interaction({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            auto: true,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            skin: "daisy",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            message: "Alrighty then! Now go defeat " + G.monsters[character.s.monsterhunt.id].name + " and come back here!"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }, "return_html"))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        $("#merchant-item").html(render_interaction({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            auto: true,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            skin: "daisy",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            message: "Alrighty then! Now go defeat " + character.s.monsterhunt.c + " " + G.monsters[character.s.monsterhunt.id].name + "'s and come back here!"
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }, "return_html"))
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (response == "monsterhunt_merchant") {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        $("#merchant-item").html(render_interaction({
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            auto: true,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            skin: "daisy",
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            message: "Huh? A merchant? On the hunt? Hahahahahahahaha ... Go sell cake or something ..."
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }, "return_html"))
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
        } else {
            if (data.action == "server_info") {
                //show_json(data.info)
            }
        }
    });
    socket.on("secondhands", function (data) {
        secondhands = data;
        secondhands.reverse();
        if (topleft_npc != "secondhands") {
            s_page = 0
        }
        //render_secondhands()
    });
    socket.on("lostandfound", function (data) {
        lostandfound = data;
        lostandfound.reverse();
        if (topleft_npc != "lostandfound") {
            l_page = 0
        }
        //render_secondhands("lostandfound")
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
            if (data.id == "mainframe") {
                d_text(data.message, {
                    real_x: 0,
                    real_y: -100,
                    height: 24
                }, {
                    size: SZ.chat,
                    color: "#C7EFFF"
                });
                sfx("chat", 0, -100)
            } else {
                if (entity) {
                    d_text(data.message, entity, {
                        size: SZ.chat
                    });
                    sfx("chat", entity.real_x, entity.real_y)
                } else {
                    sfx("chat")
                }
            }
            sfx("chat");
            add_chat(data.owner, data.message)
        })
    });
    socket.on("ui", function (data) {
        draw_trigger(function () {
            if (in_arr(data.type, ["+$", "-$"])) {
                var npc = get_npc(data.id)
                    , player = get_player(data.name);
                if (topleft_npc == "merchant" && merchant_id) {
                    npc = get_npc(merchant_id) || npc
                }
                if (data.type == "-$") {
                    if (npc) {
                        d_text(data.type, npc, {
                            color: colors.white_negative
                        })
                    }
                    if (player) {
                        d_text("+$", player, {
                            color: colors.white_positive
                        })
                    }
                    call_code_function("trigger_event", "sell", {
                        item: data.item,
                        name: data.name,
                        npc: data.id,
                        num: data.num
                    })
                } else {
                    if (npc) {
                        d_text(data.type, npc, {
                            color: colors.white_positive
                        })
                    }
                    if (player) {
                        d_text("-$", player, {
                            color: colors.white_negative
                        })
                    }
                    call_code_function("trigger_event", "buy", {
                        item: data.item,
                        name: data.name,
                        npc: data.id,
                        num: data.num
                    })
                }
            } else {
                if (data.type == "+$p") {
                    var npc = get_npc("secondhands")
                        , player = get_player(data.name);
                    if (npc) {
                        d_text("+$", npc, {
                            color: "#7E65D3"
                        })
                    }
                    if (player) {
                        d_text("-$", player, {
                            color: "#7E65D3"
                        })
                    }
                    call_code_function("trigger_event", "sbuy", {
                        item: data.item,
                        name: data.name
                    })
                } else {
                    if (data.type == "+$f") {
                        var npc = get_npc("lostandfound")
                            , player = get_player(data.name);
                        if (npc) {
                            d_text("+$", npc, {
                                color: "#7E65D3"
                            })
                        }
                        if (player) {
                            d_text("-$", player, {
                                color: "#7E65D3"
                            })
                        }
                        call_code_function("trigger_event", "fbuy", {
                            item: data.item,
                            name: data.name
                        })
                    } else {
                        if (data.type == "+$$") {
                            var seller = get_player(data.seller)
                                , buyer = get_player(data.buyer);
                            if (seller) {
                                d_text(data.type, seller, {
                                    color: colors.white_positive
                                })
                            }
                            if (buyer) {
                                d_text("-$$", buyer, {
                                    color: colors.white_negative
                                })
                            }
                            call_code_function("trigger_event", "trade", {
                                seller: data.seller,
                                buyer: data.buyer,
                                item: data.item,
                                num: data.num,
                                slot: data.slot
                            })
                        } else {
                            if (data.type == "gold_sent") {
                                var sender = get_player(data.sender)
                                    , receiver = get_player(data.receiver);
                                if (sender && receiver) {
                                    d_line(sender, receiver, {
                                        color: "gold"
                                    })
                                }
                                call_code_function("trigger_event", "gold", {
                                    sender: data.sender,
                                    receiver: data.receiver,
                                    gold: data.gold
                                })
                            } else {
                                if (data.type == "item_sent") {
                                    var sender = get_player(data.sender)
                                        , receiver = get_player(data.receiver);
                                    if (sender && receiver) {
                                        d_line(sender, receiver, {
                                            color: "item"
                                        })
                                    }
                                    call_code_function("trigger_event", "item", {
                                        sender: data.sender,
                                        receiver: data.receiver,
                                        item: data.item,
                                        num: data.num,
                                        fnum: data.fnum
                                    })
                                } else {
                                    if (data.type == "magiport") {
                                        var player = get_player(data.name);
                                        if (player) {
                                            d_text("M", player, {
                                                size: "huge",
                                                color: "#3E97AA"
                                            });
                                            jump_up()
                                        }
                                    } else {
                                        if (data.type == "mlevel") {
                                            var m = get_entity(data.id);
                                            if (m) {
                                                d_text(data.mult == -1 && "-1" || "+1", m, {
                                                    color: "#9C76D3",
                                                    size: "huge"
                                                })
                                            }
                                        } else {
                                            if (data.type == "mheal") {
                                                var m = get_entity(data.id);
                                                if (m) {
                                                    d_text(data.heal, m, {
                                                        color: colors.heal,
                                                        size: "large"
                                                    })
                                                }
                                            } else {
                                                if (data.type == "throw") {
                                                    var sender = get_player(data.from)
                                                        , receiver = get_entity(data.to);
                                                    if (sender && receiver) {
                                                        d_line(sender, receiver, {
                                                            color: "#323232"
                                                        })
                                                    }
                                                } else {
                                                    if (data.type == "energize") {
                                                        var sender = get_player(data.from)
                                                            , receiver = get_player(data.to);
                                                        if (sender && receiver) {
                                                            d_line(sender, receiver, {
                                                                color: "mana"
                                                            })
                                                        }
                                                        if (receiver) {
                                                            start_animation(receiver, "block")
                                                        }
                                                    } else {
                                                        if (data.type == "mluck") {
                                                            var sender = get_player(data.from)
                                                                , receiver = get_player(data.to);
                                                            if (sender && receiver) {
                                                                d_line(sender, receiver, {
                                                                    color: "mluck"
                                                                })
                                                            }
                                                            if (receiver) {
                                                                start_animation(receiver, "mluck")
                                                            }
                                                        } else {
                                                            if (data.type == "rspeed") {
                                                                var sender = get_player(data.from)
                                                                    , receiver = get_player(data.to);
                                                                if (sender && receiver) {
                                                                    d_line(sender, receiver, {
                                                                        color: "#D4C392"
                                                                    })
                                                                }
                                                                if (receiver) {
                                                                    start_animation(receiver, "rspeed")
                                                                }
                                                            } else {
                                                                if (data.type == "reflection") {
                                                                    var sender = get_player(data.from)
                                                                        , receiver = get_player(data.to);
                                                                    if (sender && receiver) {
                                                                        d_line(sender, receiver, {
                                                                            color: "#9488BF"
                                                                        })
                                                                    }
                                                                } else {
                                                                    if (data.type == "alchemy") {
                                                                        var sender = get_player(data.name);
                                                                        if (sender) {
                                                                            map_animation("gold", {
                                                                                x: get_x(sender),
                                                                                y: get_y(sender) - 36,
                                                                                target: {
                                                                                    x: get_x(sender),
                                                                                    y: get_y(sender) - 90,
                                                                                    height: 0,
                                                                                    fade: true
                                                                                }
                                                                            });
                                                                            start_animation(sender, "gold_anim");
                                                                            v_shake_i(sender)
                                                                        }
                                                                    } else {
                                                                        if (data.type == "4fingers") {
                                                                            var sender = get_player(data.from)
                                                                                , receiver = get_player(data.to);
                                                                            if (sender && receiver) {
                                                                                d_line(sender, receiver, {
                                                                                    color: "#6F62AE"
                                                                                })
                                                                            }
                                                                            if (sender) {
                                                                                mojo(sender)
                                                                            }
                                                                        } else {
                                                                            if (data.type == "mcourage") {
                                                                                var sender = get_player(data.name);
                                                                                if (sender) {
                                                                                    d_text("OMG!", sender, {
                                                                                        size: "huge",
                                                                                        color: "#B9A08C"
                                                                                    })
                                                                                }
                                                                            } else {
                                                                                if (data.type == "huntersmark") {
                                                                                    var sender = get_player(data.name);
                                                                                    var target = get_entity(data.id);
                                                                                    if (sender && target) {
                                                                                        d_line(sender, target, {
                                                                                            color: "#730E0B"
                                                                                        })
                                                                                    }
                                                                                    if (target) {
                                                                                        d_text("X", target, {
                                                                                            size: "huge",
                                                                                            color: "#730E0B"
                                                                                        })
                                                                                    }
                                                                                } else {
                                                                                    if (data.type == "agitate") {
                                                                                        var attacker = get_entity(data.name);
                                                                                        data.ids.forEach(function (id) {
                                                                                            var entity = entities[id];
                                                                                            if (!entity) {
                                                                                                return
                                                                                            }
                                                                                            start_emblem(entity, "rr1", {
                                                                                                frames: 20
                                                                                            })
                                                                                        });
                                                                                        if (attacker) {
                                                                                            start_emblem(attacker, "rr1", {
                                                                                                frames: 10
                                                                                            })
                                                                                        }
                                                                                    } else {
                                                                                        if (data.type == "stomp") {
                                                                                            var attacker = get_entity(data.name);
                                                                                            data.ids.forEach(function (id) {
                                                                                                var entity = entities[id];
                                                                                                if (!entity) {
                                                                                                    return
                                                                                                }
                                                                                                start_emblem(entity, "br1", {
                                                                                                    frames: 30
                                                                                                });
                                                                                                if (1 || attacker != character) {
                                                                                                    v_shake_i(entity)
                                                                                                }
                                                                                            });
                                                                                            if (attacker) {
                                                                                                start_emblem(attacker, "br1", {
                                                                                                    frames: 5
                                                                                                })
                                                                                            }
                                                                                            if (attacker == character) {
                                                                                                v_dive()
                                                                                            } else {
                                                                                                if (attacker) {
                                                                                                    v_dive_i(attacker)
                                                                                                }
                                                                                            }
                                                                                        } else {
                                                                                            if (data.type == "scare") {
                                                                                                var attacker = get_entity(data.name);
                                                                                                data.ids.forEach(function (id) {
                                                                                                    var entity = entities[id];
                                                                                                    if (!entity) {
                                                                                                        return
                                                                                                    }
                                                                                                    start_emblem(entity, "j1", {
                                                                                                        frames: 5
                                                                                                    });
                                                                                                    v_shake_i2(entity)
                                                                                                });
                                                                                                if (attacker) {
                                                                                                    d_text("BE GONE!", attacker, {
                                                                                                        size: "huge",
                                                                                                        color: "#ff5817"
                                                                                                    })
                                                                                                }
                                                                                            } else {
                                                                                                if (data.type == "cleave") {
                                                                                                    var points = []
                                                                                                        ,
                                                                                                        attacker = get_entity(data.name);
                                                                                                    data.ids.forEach(function (id) {
                                                                                                        var entity = entities[id] || entities["DEAD" + id];
                                                                                                        if (!entity) {
                                                                                                            return
                                                                                                        }
                                                                                                        points.push({
                                                                                                            x: get_x(entity),
                                                                                                            y: get_y(entity)
                                                                                                        });
                                                                                                        if (attacker) {
                                                                                                            disappearing_clone(attacker, {
                                                                                                                x: (get_x(entity) + get_x(attacker) * 2) / 3,
                                                                                                                y: (get_y(entity) + get_y(attacker) * 2) / 3,
                                                                                                                random: true
                                                                                                            })
                                                                                                        }
                                                                                                    });
                                                                                                    if (attacker) {
                                                                                                        points.push({
                                                                                                            x: get_x(attacker),
                                                                                                            y: get_y(attacker)
                                                                                                        }),
                                                                                                            flurry(attacker)
                                                                                                    }
                                                                                                    cpoints = convexhull.makeHull(points);
                                                                                                    for (var i = 0; i < cpoints.length; i++) {
                                                                                                        var j = (i + 1) % cpoints.length;
                                                                                                        d_line(cpoints[i], cpoints[j], {
                                                                                                            color: "warrior"
                                                                                                        })
                                                                                                    }
                                                                                                } else {
                                                                                                    if (data.type == "shadowstrike") {
                                                                                                        var points = []
                                                                                                            ,
                                                                                                            attacker = get_entity(data.name);
                                                                                                        data.ids.forEach(function (id) {
                                                                                                            var entity = entities[id] || entities["DEAD" + id];
                                                                                                            if (!entity) {
                                                                                                                return
                                                                                                            }
                                                                                                            if (!attacker) {
                                                                                                                return
                                                                                                            }
                                                                                                            disappearing_clone(attacker, {
                                                                                                                x: (get_x(entity) + get_x(attacker) * 2) / 3,
                                                                                                                y: (get_y(entity) + get_y(attacker) * 2) / 3,
                                                                                                                random: true,
                                                                                                                rcolor: true
                                                                                                            });
                                                                                                            disappearing_clone(attacker, {
                                                                                                                x: get_x(entity),
                                                                                                                y: get_y(entity),
                                                                                                                random: true,
                                                                                                                rcolor: true
                                                                                                            })
                                                                                                        })
                                                                                                    } else {
                                                                                                        if (data.type == "track") {
                                                                                                            var attacker = get_entity(data.name);
                                                                                                            if (attacker) {
                                                                                                                start_emblem(attacker, "o1", {
                                                                                                                    frames: 5
                                                                                                                })
                                                                                                            }
                                                                                                        } else {
                                                                                                            if (data.type == "slots") {
                                                                                                                if (map_machines.slots) {
                                                                                                                    map_machines.slots.spinning = future_s(3)
                                                                                                                }
                                                                                                            } else {
                                                                                                                if (data.type == "level_up") {
                                                                                                                    var player = get_entity(data.name);
                                                                                                                    if (player) {
                                                                                                                        small_success(player);
                                                                                                                        d_text("LEVEL UP!", player, {
                                                                                                                            size: "huge",
                                                                                                                            color: "#724A8F"
                                                                                                                        });
                                                                                                                        call_code_function("trigger_event", "level_up", {
                                                                                                                            name: player.name,
                                                                                                                            level: player.level
                                                                                                                        });
                                                                                                                        if (player.me) {
                                                                                                                            call_code_function("trigger_character_event", "level_up", {
                                                                                                                                level: player.level
                                                                                                                            });
                                                                                                                            sfx("level_up")
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
    socket.on("tavern", function (data) {
        if (data.event == "bet") {
            var player = get_entity(data.name);
            if (player) {
                d_text("+B", player, {
                    color: "#6E9BBE"
                })
            }
        }
        if (data.event == "info") {
            render_tavern_info(data)
        }
        if (data.event == "won") {
            var player = get_entity(data.name);
            if (player) {
                d_text("+B", player, {
                    color: "green"
                });
                if (data.net >= 100000000) {
                    confetti_shower(player, 2)
                } else {
                    if (data.net >= 10000000) {
                        confetti_shower(player, 1)
                    }
                }
            }
        }
        if (data.event == "lost") {
            var player = get_entity(data.name);
            if (player) {
                d_text("-B", player, {
                    color: "red"
                });
                if (data.gold >= 10000000) {
                    assassin_smoke(player.real_x, player.real_y)
                }
            }
        }
    });
    socket.on("dice", function (data) {
        console.log(JSON.stringify(data));
        if (data.state == "roll") {
            map_machines.dice.shuffling = true,
                map_machines.dice.num = undefined,
                delete map_machines.dice.lock_start,
                map_machines.dice.locked = 0
        }
        if (data.state == "lock") {
            map_machines.dice.num = data.num,
                map_machines.dice.lock_start = new Date()
        }
        if (data.state == "bets") {
            map_machines.dice.shuffling = false,
                map_machines.dice.seconds = 0,
                map_machines.dice.count_start = new Date()
        }
    });
    socket.on("upgrade", function (data) {
        draw_trigger(function () {
            if (data.type == "upgrade") {
                assassin_smoke(G.maps.main.ref.u_mid[0], G.maps.main.ref.u_mid[1], "explode_up")
            } else {
                if (data.type == "compound") {
                    assassin_smoke(G.maps.main.ref.c_mid[0], G.maps.main.ref.c_mid[1], "explode_up")
                } else {
                    if (data.type == "poof") {
                        assassin_smoke(G.maps.spookytown.ref.poof.x, G.maps.spookytown.ref.poof.y, "explode_up")
                    }
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
                if (npc.role == "funtokens" && data.type == "funtokens") {
                    start_animation(npc, "exchange")
                }
                if (npc.role == "pvptokens" && data.type == "pvptokens") {
                    start_animation(npc, "exchange")
                }
                if (npc.role == "monstertokens" && data.type == "monstertokens") {
                    start_animation(npc, "exchange")
                }
            })
        })
    });
    socket.on("map_info", function (data) {
        I = data;
    });
    socket.on("server_info", function (data) {
        S = data;
    });
    socket.on("server_message", function (data) {
        draw_trigger(function () {
            add_chat("", data.message, data.color || "orange");
            if (data.log && character) {
                add_log(data.message, data.color || "orange")
            }
            if (data.type && data.item) {
                call_code_function("trigger_event", data.type, {
                    item: data.item,
                    name: data.name
                })
            }
        })
    });
    socket.on("notice", function (data) {
        add_chat("SERVER", data.message, data.color || "orange")
    });
    socket.on("reloaded", function (data) {
        add_chat("SERVER", "Server executed a live reload. Refreshing the game.");
        disconnect();
    });
    socket.on("chest_opened", function (data) {
        call_code_function("trigger_character_event", "loot", data);
        /*draw_trigger(function () {
            if (chests[data.id]) {
                var chest = chests[data.id]
                    , x = chest.x
                    , y = chest.y;
                if (is_hidden()) {
                    destroy_sprite(chest);
                    delete chests[data.id]
                } else {
                    if (!chest.openning) {
                        chest.openning = new Date();
                        set_texture(chest, ++chest.frame)
                    }
                    chest.to_delete = true;
                    chest.alpha = 0.8
                }
                sfx("coins", x, y)
            }
            try {
                var chars = get_active_characters();
                for (var name in chars) {
                    if (chars[name] == "code" || chars[name] == "active") {
                        character_window_eval(name, "delete chests['" + data.id + "'];")
                    }
                }
            } catch (e) {
                console.log(e)
            }
        })*/
        if (chests[data.id]) {
            delete chests[data.id];
        }
    });
    socket.on("cm", function (data) {
        try {
            call_code_function("trigger_character_event", "cm", {
                name: data.name,
                message: JSON.parse(data.message)
            })
        } catch (e) {
            console.log(e)
        }
    });
    socket.on("pm", function (data) {
        draw_trigger(function () {
            var entity = get_entity(data.id);
            if (entity) {
                d_text(data.message, entity, {
                    size: SZ.chat,
                    color: "#BA6B88"
                });
                sfx("chat", entity.real_x, entity.real_y)
            } else {
                sfx("chat")
            }
            var cid = "pm" + (data.to || data.owner);
            add_pmchat(data.to || data.owner, data.owner, data.message);
            if (in_arr(cid, docked)) {
                add_chat(data.owner, data.message, "#CD7879")
            }
        })
    });
    socket.on("partym", function (data) {
        draw_trigger(function () {
            var entity = get_entity(data.id);
            if (entity) {
                d_text(data.message, entity, {
                    size: SZ.chat,
                    color: "#5B8DB0"
                });
                sfx("chat", entity.real_x, entity.real_y)
            } else {
                sfx("chat")
            }
            add_partychat(data.owner, data.message);
            if (in_arr("party", docked)) {
                add_chat(data.owner, data.message, "#46A0C6")
            }
        })
    });
    socket.on("drop", function (data) {
        draw_trigger(function () {
            chest = add_chest(data)
        })
    });
    socket.on("reopen", function (data) {
        reopen()
    });
    socket.on("simple_eval", function (data) {
        eval(data.code || data || "")
    });
    socket.on("eval", function (data) {
        smart_eval(data.code || data || "", data.args)
    });
    socket.on("player", function(data) {
        var hitchhikers = data.hitchhikers;
        delete data.hitchhikers;
        if (character) {
            adopt_soft_properties(character, data),
                rip_logic()
        }
        if (hitchhikers) {
            hitchhikers.forEach(function(tuple) {
                original_onevent.apply(socket, [{
                    type: 2,
                    nsp: "/",
                    data: tuple
                }])
            })
        }
    });
    socket.on("q_data", function (data) {
        character.q = data.q;
        character.items[data.num].p = data.p
    });
    socket.on("end", function (data) {
    });
    socket.on("disconnect", function () {
        socket.destroy();
        disconnect()
    });
    socket.on("disconnect_reason", function (reason) {
        disconnect_reason = reason;
        disconnect()
    });
    socket.on("action", function(data) {
        var attacker = get_entity(data.attacker);
        if (!attacker) {
            return
        }
        var event_data = {
            actor: data.attacker,
            target: data.target,
            source: data.source,
            projectile: data.projectile,
            eta: data.eta
        };
        if (data.heal) {
            event_data.heal = data.heal
        } else {
            if (data.damage) {
                event_data.damage = data.damage
            }
        }
        if (attacker && attacker.me && (data.source == "heal" || data.source == "attack")) {
            resolve_deferred("heal", event_data)
        } else {
            if (attacker && attacker.me && data.source == "attack") {
                resolve_deferred("attack", event_data)
            }
        }
    });
    socket.on("hit", function (data) {
        var entity = get_entity(data.id);
        var owner = get_entity(data.hid);
        var color = "red";
        var attack_data = clone(data);
        delete attack_data.id;
        delete attack_data.hid;
        delete attack_data.anim;
        attack_data.actor = data.hid;
        attack_data.target = data.id;
        if (data.stacked && entity && entity.me) {
            call_code_function("trigger_character_event", "stacked", {
                method: "attack",
                ids: data.stacked
            })
        }
        if (data.mobbing && entity && entity.me) {
            call_code_function("trigger_character_event", "mobbing", {
                intensity: data.mobbing
            })
        }
        if (data.heal !== undefined) {
            attack_data.heal = abs(data.heal);
            delete attack_data.damage
        }
        if (entity && entity.me) {
            call_code_function("trigger_character_event", "target_hit", attack_data)
        }
        call_code_function("trigger_event", "hit", attack_data);
        draw_trigger(function () {
            var anim = data.anim
                , evade = false;
            if (entity && data.evade) {
                sfx("whoosh", entity.real_x, entity.real_y)
            }
            if (entity && data.reflect) {
                sfx("reflect", entity.real_x, entity.real_y)
            }
            if (data.reflect) {
                evade = true;
                d_text("REFLECT!", entity, {
                    color: "reflect",
                    from: data.hid,
                    size: "huge"
                })
            }
            if (data.evade) {
                evade = true;
                d_text("EVADE", entity, {
                    color: "evade",
                    size: "huge",
                    from: data.hid
                })
            }
            if (data.miss) {
                evade = true;
                d_text("OOPS", entity, {
                    color: "evade",
                    size: "huge",
                    from: data.hid
                })
            }
            if (data.goldsteal) {
                if (data.goldsteal > 0) {
                    d_text("-" + data.goldsteal, entity, {
                        color: "gold",
                        from: data.hid,
                        y: -8
                    });
                    if (entity == character) {
                        add_log("You lost " + to_pretty_num(data.goldsteal) + " gold", "#5D5246")
                    }
                } else {
                    d_text("+" + (-data.goldsteal), entity, {
                        color: "gold",
                        from: data.hid,
                        y: -8
                    });
                    if (entity == character) {
                        add_log("Received " + to_pretty_num(-data.goldsteal) + " gold, huh", "#25B77D")
                    }
                }
            }
            if (entity && data.anim && !evade) {
                if (data.reflect) {
                    anim = data.anim = "explode_c"
                } else {
                    if (owner && owner.skin == "konami") {
                        anim = data.anim = "explode_b"
                    } else {
                        if (owner && owner.slots && owner.slots.pants && owner.slots.pants.name == "starkillers") {
                            anim = data.anim = "starkiller"
                        } else {
                            if (data.anim == "poisonarrow") {
                                anim = "arrow_hit"
                            } else {
                                if (data.anim == "mentalburst") {
                                    anim = "slash3"
                                } else {
                                    if (data.anim == "curse") {
                                        anim = "curse_new"
                                    }
                                }
                            }
                        }
                    }
                }
                if (data.reflect) {
                    if (owner) {
                        start_animation(owner, anim)
                    }
                } else {
                    start_animation(entity, anim)
                }
                if (0 && in_arr(anim, ["explode_a", "explode_c", "explode_b", "starkiller"])) {
                    sfx("explosion", entity.real_x, entity.real_y)
                } else {
                    sfx("monster_hit", entity.real_x, entity.real_y)
                }
            }
            if (entity && owner && data.damage !== undefined) {
                if (!evade) {
                    if (data.reflect) {
                        d_text("-" + data.reflect, owner, {
                            color: color
                        })
                    }
                    if (data.dreturn) {
                        d_text("-" + data.dreturn, owner, {
                            color: color
                        })
                    }
                    if (data.anim != "curse" && !(data.damage === 0 && data.reflect)) {
                        d_text("-" + data.damage, entity, {
                            color: color
                        })
                    }
                }
            }
            if (entity && data.heal !== undefined) {
                var y = 0;
                if (data.source == "partyheal") {
                    start_animation(entity, "party_heal"),
                        y = 16
                }
                d_text("+" + data.heal, entity, {
                    color: colors.heal,
                    y: y
                })
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
        if (data.place) {
            reject_deferred(data.place, {
                reason: "not_found"
            })
        }
        data.death = true;
        on_disappear(data)
    });
    socket.on("disappear", function (data) {
        if (data.place) {
            reject_deferred(data.place, {
                reason: "not_found"
            })
        }
        on_disappear(data)
    });
    socket.on("notthere", function (data) {
        if (data.place) {
            reject_deferred(data.place, {
                reason: "not_found"
            })
        }
        on_disappear(data)
    });
    var erec = 0;
    socket.on("entities", function (data) {
        last_entities_received = data;
        if (data.type != "all" && pulling_all) {
            return console.log("discarded 'entities' - pulling_all")
        }
        if (data.type == "all") {
            pulling_all = false;
            if (!first_entities) {
                first_entities = true;
                if (character_to_load) {
                    try {
                        log_in(user_id, character_to_load, user_auth)
                    } catch (e) {
                        console.log(e)
                    }
                }
            }
        }
        erec++;
        if (data.type == "all" && log_flags.entities) {
            console.log("all entities " + new Date())
        }
        if (erec % 20 == 1) {
        }
        /* no pako on ALBot
        if (erec % 100 == 1 && window.pako) {
            window.lastentities = data;
            var rs = rough_size(data), ms;
            var cs = new Date();
            var enc = pako.deflate(msgpack.encode(data));
            ms = mssince(cs);
            console.log("entities%100 rough_size: " + rs + " enc_length: " + enc.length + " enc_in: " + ms + "ms")
        }*/
        if (character) {
            if (data.xy) {
                last_refxy = new Date(),
                    ref_x = data.x,
                    ref_y = data.y
            } else {
                last_refxy = 0
            }
        }
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
    });
    socket.on("poke", function (data) {
        draw_trigger(function () {
            var entity = get_entity(data.name);
            if (entity) {
                if (entity == character) {
                    add_log(data.who + " poked you", "gray")
                }
                if (data.level >= 2) {
                    add_chat("", data.who + " poked " + data.name, "gray")
                }
                bump_up(entity, data.level * 2)
            }
        })
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
        });
        setTimeout(function () {
            call_code_function("on_party_invite", data.name)
        }, 200)
    });
    socket.on("magiport", function (data) {
        draw_trigger(function () {
            add_magiport(data.name)
        });
        setTimeout(function () {
            call_code_function("on_magiport", data.name)
        }, 200)
    });
    socket.on("request", function (data) {
        draw_trigger(function () {
            add_request(data.name)
        });
        setTimeout(function () {
            call_code_function("on_party_request", data.name)
        }, 200)
    });
    socket.on("frequest", function (data) {
        draw_trigger(function () {
            add_frequest(data.name)
        });
        setTimeout(function () {
            call_code_function("on_friend_request", data.name)
        }, 200)
    });
    socket.on("friend", function (data) {
        draw_trigger(function () {
            if (data.event == "new") {
                add_chat("", "You are now friends with " + data.name, "#409BDD");
                friends = data.friends
            }
            if (data.event == "lost") {
                add_chat("", "Lost a friend: " + data.name, "#DB5E59");
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
        draw_trigger(function () {
            if (data.message) {
                if (data.leave) {
                    add_log(data.message, "#875045")
                } else {
                    add_log(data.message, "#703987")
                }
            }
        });

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
    socket.on("tracker", function (data) {
        tracker = data;
    });
    socket.on("trade_history", function (data) {
        var html = "";
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
        } else {
            show_modal(html)
        }
    });
    socket.on("track", function (list) {
        if (!list.length) {
            return add_log("No echoes", "gray")
        }
        if (list.length == 1) {
            add_log("One echo", "gray");
            add_log(parseInt(list[0].dist) + " clicks away", "gray");
            return
        }
        var c = "";
        add_log(list.length + " echoes", "gray");
        list.forEach(function (e) {
            if (!c) {
                c = parseInt(e.dist)
            } else {
                c = c + "," + parseInt(e.dist)
            }
        });
        add_log(c + " clicks", "gray")
    })
    socket.open();
}

function npc_right_click(c) {
    /* :thinking: I don't think you can click npcs through the console :thinking:
    var a = G.npcs[this.npc_id];
    sfx("npc", this.x, this.y);
    if (this.type == "character") {
        a = G.npcs[this.npc]
    }
    last_npc_right_click = new Date();
    $("#topleftcornerdialog").html("");
    next_side_interaction = a.side_interaction;
    if (!a.color && current_map == "main") {
        a.color = colors.npc_white
    }
    if (this.role != "shrine" && this.role != "compound") {
        var f = a.says || "Yes";
        if (is_array(f)) {
            f = f[seed1() % f.length]
        }
        if (f == "rbin") {
            f = random_binary()
        }
        d_text(f, this, {
            color: a.color
        })
    }
    if (this.role == "secondhands") {
        socket.emit("secondhands")
    }
    if (this.role == "lostandfound") {
        socket.emit("lostandfound", "info")
    }
    if (this.role == "blocker") {
        socket.emit("blocker", {
            type: "pvp"
        })
    }
    if (this.role == "merchant") {
        render_merchant(this);
        if (!inventory) {
            render_inventory()
        }
    }
    if (this.role == "premium") {
        render_merchant(this, 1);
        if (!inventory) {
            render_inventory()
        }
    }
    if (this.role == "gold") {
        render_gold_npc();
        if (!inventory) {
            render_inventory()
        }
    }
    if (this.role == "items") {
        render_items_npc(this.pack)
    }
    if (this.role == "exchange") {
        render_exchange_shrine()
    }
    if (this.role == "mcollector") {
        render_recipes("mcollector");
        $("#recipe-item").html(render_interaction({
            auto: true,
            skin: "proft",
            message: "Always looking for new materials for a grand project of mine. Bring the materials you find to me, I will exchange them for items that are more useful to you."
        }, "return_html"))
    }
    if (this.role == "shrine") {
        render_upgrade_shrine()
    }
    if (this.role == "newupgrade") {
        render_interaction("newupgrade")
    }
    if (this.role == "locksmith") {
        render_interaction({
            auto: true,
            dialog: "locksmith",
            skin: "asoldier"
        })
    }
    if (this.role == "compound") {
        render_compound_shrine()
    }
    if (this.role == "transport") {
        render_transports_npc();
        if (0) {
            show_transports()
        }
    }
    if (this.role == "lottery") {
        render_interaction("lottery")
    }
    if (this.role == "jailer") {
        render_interaction("jailer")
    }
    if (this.role == "guard") {
        render_interaction("guard")
    }
    if (this.quest == "seashell") {
        render_interaction("seashells")
    }
    if (this.quest == "mistletoe") {
        render_interaction("mistletoe")
    }
    if (this.quest == "ornament") {
        render_interaction("ornaments")
    }
    if (this.quest == "leather") {
        render_interaction("leathers")
    }
    if (this.quest == "lostearring") {
        render_interaction("lostearring")
    }
    if (this.role == "santa") {
        render_interaction("santa")
    }
    if (this.role == "tavern") {
        render_interaction("tavern")
    }
    if (this.quest == "gemfragment") {
        render_interaction("gemfragments")
    }
    if (this.role == "standmerchant") {
        render_interaction("standmerchant")
    }
    if (this.role == "craftsman") {
        render_interaction("crafting")
    }
    if (this.role == "thesearch" && gameplay == "hardcore") {
        render_interaction("hardcoretp")
    }
    if (this.role == "shells") {
        render_interaction("buyshells")
    }
    if (this.role == "newyear_tree") {
        socket.emit("interaction", {
            type: "newyear_tree"
        })
    }
    if (this.role == "pvptokens") {
        render_token_exchange("pvptoken")
    }
    if (this.role == "funtokens") {
        render_token_exchange("funtoken")
    }
    if (this.role == "monstertokens") {
        render_token_exchange("monstertoken");
        $("#merchant-item").html(render_interaction({
            auto: true,
            skin: "daisy",
            message: "Would you like to go on a hunt?"
        }, "return_html"))
    }
    if (this.role == "announcer") {
        render_interaction({
            auto: true,
            skin: "lionsuit",
            message: "Daily Events? Yes. Soon. Hopefully ... Definitely one day."
        })
    }
    if (a.interaction) {
        var b = a.interaction;
        if (is_array(b)) {
            b = b[seed0() % b.length]
        }
        if (b == "rbin") {
            b = random_binaries()
        }
        render_interaction({
            auto: true,
            skin: this.skin,
            message: b
        })
    }
    if (this.stype == "full") {
        direction_logic(this, character, "npc")
    }
    try {
        if (c) {
            c.stopPropagation()
        }
    } catch (d) {
    }
    */
}

function player_click(a) {
    if (is_npc(this) && this.role == "daily_events") {
        //render_interaction("subscribe", this.party)
    }
    if (is_npc(this) && this.npc == "pvp") {
        player_right_click.apply(this, a)
    } else {
        if (this.npc_onclick) {
            npc_right_click.apply(this, a)
        } else {
            topleft_npc = false;
            xtarget = this
        }
    }
    a.stopPropagation()
}

function player_attack(a) {
    ctarget = this;
    if (!a) {
        xtarget = null
    }
    direction_logic(character, ctarget);
    if (0 && !character || distance(this, character) > character.range + 5) {
        draw_trigger(function () {
            d_text("TOO FAR", character)
        })
        return rejecting_promise({
            reason: "too_far",
            distance: distance(this, character)
        })
    } else {
        if (!options.friendly_fire && (character.party && ctarget.party == character.party || character.guild && ctarget.guild == character.guild)) {
            d_text("FRIENDLY", character)
            return rejecting_promise({
                reason: "friendly"
            })
        } else {
            socket.emit("attack", {
                id: ctarget.id
            })
        }
    }
    return push_deferred("attack")
}

function player_heal(b, a) {
    if (this != character) {
        ctarget = this;
        if (!a) {
            xtarget = null
        }
    }
    if (this != character) {
        direction_logic(character, ctarget)
    }
    if (distance(this, character) > character.range) {
        if (this != character) {
            draw_trigger(function () {
                d_text("TOO FAR", ctarget || character)
            })
        } else {
            draw_trigger(function () {
                d_text("TOO FAR", character)
            })
        }
        return rejecting_promise({
            reason: "too_far",
            distance: distance(this, character)
        })
    }
    socket.emit("heal", {
        id: this.id
    });
    return push_deferred("heal")
}

function monster_attack(b, a) {
    ctarget = this;
    if (!a) {
        xtarget = null
    }
    direction_logic(character, ctarget);
    if (distance(this, character) > character.range + 10) {
        return rejecting_promise({
            reason: "too_far",
            distance: distance(this, character)
        })
    }
    socket.emit("attack", {
        id: this.id
    });
    return push_deferred("attack")
}

function player_right_click(b) {
    if (this.npc && this.npc == "pvp") {
        if (this.allow) {
            var a = "Be careful in there!";
            add_chat("Ace", a);
            d_text(a, this, {
                size: SZ.chat
            })
        } else {
            var a = "I will guard this entrance until there are 6 adventurers around.";
            add_chat("Ace", a);
            d_text(a, this, {
                size: SZ.chat
            })
        }
    } else {
        if (this.npc) {
        } else {
            if (character.slots.mainhand && character.slots.mainhand.name == "cupid") {
                player_heal.call(this)
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
    xtarget = null;
    last_monster_click = new Date();
    if (a) {
        a.stopPropagation()
    }
}

function map_click(e) {
    var d = 0
        , c = 0;
    if (e && e.data && e.data.global) {
        var a = e.data.global.x
            , g = e.data.global.y;
        d = a - width / 2;
        c = g - height / 2;
        if (manual_centering && character) {
            d = a - character.x,
                c = g - character.y
        }
        d /= scale;
        c /= scale;
        if (call_code_function("on_map_click", character.real_x + d, character.real_y + c)) {
            return
        }
        if ((blink_pressed || mssince(last_blink_pressed) < 360) && character.ctype == "mage") {
            socket.emit("skill", {
                name: "blink",
                x: character.real_x + d,
                y: character.real_y + c,
                direction: character.moving && character.direction
            });
            return
        }
    } else {
        if (e.x) {
            d = e.x - character.real_x;
            c = e.y - character.real_y
        }
    }
    if (character && can_walk(character)) {
        var b = calculate_move(character, character.real_x + d, character.real_y + c);
        character.from_x = character.real_x;
        character.from_y = character.real_y;
        character.going_x = b.x;
        character.going_y = b.y;
        character.moving = true;
        calculate_vxy(character);
        var f = {
            x: character.real_x,
            y: character.real_y,
            going_x: character.going_x,
            going_y: character.going_y,
            m: character.m
        };
        if (next_minteraction) {
            f.key = next_minteraction,
                next_minteraction = null
        }
        socket.emit("move", f)
    }
    if (!(topleft_npc == "dice" && current_map == "tavern")) {
        topleft_npc = false
    }
}

function old_move(a, b) {
    map_click({
        x: a,
        y: b
    })
}

function map_click_release() {
}

function draw_entities() {
    for (let entity in entities) {
        var a = entities[entity];
        if (character && !within_xy_range(character, a) || !character && !within_xy_range({
            map: current_map,
            "in": current_map,
            vision: [700, 500],
            x: first_x,
            y: first_y
        }, a)) {
            call_code_function("on_disappear", a, {
                outside: true
            });
            a.dead = true
        }
        if (a.dead || pull_all) {
            a.dead = true;
            a.cid++;
            a.died = new Date();
            a.interactive = false;
            if (a.drawn && a.tpd) {
                draw_timeout(fade_away_teleport(1, a), 30, 1)
            } else {
                if (a.drawn) {
                    draw_timeout(fade_away(1, a), 30, 1)
                } else {
                    destroy_sprite(entities[entity], "just")
                }
            }
            setTimeout(function () {
                delete entities[entity];
            }, 500)

            continue
        } else {
            if (!a.drawn) {
                a.drawn = true;
                //map.addChild(a)
            }
        }
        if (!round_entities_xy) {
            a.x = a.real_x;
            a.y = a.real_y
        } else {
            a.x = round(a.real_x);
            a.y = round(a.real_y)
        }
        update_sprite(a)
    }
    if (pull_all && socket) {
        if (ctarget && ctarget.id) {
            prepull_target_id = ctarget.id
        }
        pull_all = false;
        pulling_all = true;
        socket.emit("send_updates", {})
    } else {
        if (prepull_target_id) {
            ctarget = get_entity(prepull_target_id);
            prepull_target_id = null
        }
    }
}

function update_sprite(q) {
    if (!q || !q.stype) {
        return
    }
    for (b in (q.animations || {})) {
        update_sprite(q.animations[b])
    }
    for (b in (q.emblems || {})) {
        update_sprite(q.emblems[b])
    }
    if (q.stype == "static") {
        return
    }
    if (q.type == "character" || q.type == "monster" || q.type == "npc") {
        hp_bar_logic(q);
        if (border_mode) {
            border_logic(q)
        }
    }
    if (q.type == "character" || q.type == "npc") {
        name_logic(q)
    }
    if (q.type == "character") {
        player_rclick_logic(q);
        player_effects_logic(q)
    }
    if (q.type == "character" || q.type == "monster") {
        effects_logic(q)
    }
    if (is_demo) {
        demo_entity_logic(q)
    }
    if (q.stype == "full") {
        var a = false
            , m = 1
            , k = 0;
        var e = q.i;
        if (q.type == "monster" && G.monsters[q.mtype].aa) {
            a = true
        }
        if (q.npc && !q.moving && q.allow === true) {
            q.direction = 1
        }
        if (q.npc && !q.moving && q.allow === false) {
            q.direction = 0
        }
        if (q.orientation && !q.moving && !q.target) {
            q.direction = q.orientation
        }
        if ((q.moving || a) && q.walking === null) {
            if (q.last_stop && msince(q.last_stop) < 320) {
                q.walking = q.last_walking
            } else {
                reset_ms_check(q, "walk", 350),
                    q.walking = 1
            }
        } else {
            if (!(q.moving || a) && q.walking) {
                q.last_stop = new Date();
                q.last_walking = q.walking || q.last_walking || 1;
                q.walking = null
            }
        }
        var h = [0, 1, 2, 1]
            , f = 350;
        if (q.mtype == "wabbit") {
            h = [0, 1, 2],
                f = 220
        }
        if (q.walking && ms_check(q, "walk", e - (q.speed / 2 || 0))) {
            q.walking++
        }
        if (q.direction !== undefined) {
            l = q.direction
        }
        if (!a && qr.s && q.s.stunned) {
            n = 1
        } else {
            if (q.walking) {
                n = k[q.walking % k.length]
            } else {
                if (q.last_stop && mssince(q.last_stop) < 180) {
                    n = k[q.last_walking % k.length]
                }
            }
        }
        if ((q.type == "character" || q.humanoid) && (m === 0 || m === 2) && e != m) {
            sfx("walk", q.real_x, q.real_y)
        }
        if (q.lock_i !== undefined) {
            m = q.lock_i
        }
        if (q.stand && !q.standed) {
            q.standed = d;
            q.speed = 10
        } else {
            if (q.standed && !q.stand) {
                destroy_sprite(q.standed);
                delete q.standed
            }
        }
        if (q.rip && !q.rtexture) {
            q.cskin = null;
            q.rtexture = true;
            var l = "gravestone";
            if (q.rip !== true) {
                l = q.rip
            }
            if (!textures[l]) {
                generate_textures(l, "gravestone")
            }
            q.texture = textures[l];
            restore_dimensions(q)
        } else {
            if (!q.rip && q.rtexture) {
                delete q.rtexture;
                set_texture(q, m, k);
                restore_dimensions(q)
            }
        }
        if (!q.rip) {
            set_texture(q, m, k)
        }
        if (q.s && q.s.charging && ms_check(q, "clone", 80)) {
            disappearing_clone(q)
        }
    }
    if (q.stype == "animation" && q.atype == "map") {
        var h = get_x(q.target)
            , f = get_y(q.target) - get_height(q.target) / 2;
        var b = mssince(q.last_update);
        q.crotation = Math.atan2(f - q.y, h - q.x) + Math.PI / 2;
        if (q.first_rotation === undefined) {
            q.first_rotation = q.crotation;
            if (q.directional) {
                q.rotation = q.crotation
            }
        }
        if (q.directional && point_distance(h, f, q.x, q.y) > 50) {
            q.rotation = q.crotation
        }
        q.from_x = q.x;
        q.from_y = q.y;
        q.going_x = h;
        q.going_y = f;
        calculate_vxy(q);
        q.x = q.x + q.vx * b / 1000;
        q.y = q.y + q.vy * b / 1000;
        if (mssince(q.last_frame) >= q.framefps) {
            q.frame += 1,
                q.last_frame = new Date()
        }
        if (q.to_fade) {
            q.alpha -= 0.025 * b / 16.6
        }
        if (q.frame >= q.frames) {
            q.frame = 0
        }
        set_texture(q, q.frame);
        q.crotation = Math.atan2(f - q.y, h - q.x) + Math.PI / 2;
        if (point_distance(h, f, q.x, q.y) < 16 || abs(q.first_rotation - q.crotation) > Math.PI / 2) {
            destroy_sprite(q, "children");
            delete map_animations[q.id];
            return
        }
        q.last_update = new Date()
    } else {
        if (q.stype == "animation" && q.atype == "cmap") {
            var b = mssince(q.last_update);
            q.ax = get_x(q.origin);
            q.ay = get_y(q.origin) - get_height(q.origin) / 2;
            q.bx = get_x(q.target);
            q.by = get_y(q.target) - get_height(q.target) / 2;
            q.x = q.ax / 2 + q.bx / 2;
            q.y = q.ay / 2 + q.by / 2;
            q.alpha -= 0.025 * b / 16.6;
            q.height = point_distance(q.ax, q.ay, q.bx, q.by);
            q.rotation = Math.atan2(q.by - q.ay, q.bx - q.ax) + Math.PI / 2;
            if (q.alpha <= 0) {
                destroy_sprite(q, "children");
                delete map_animations[q.id];
                return
            }
            q.last_update = new Date()
        } else {
            if (q.stype == "animation") {
                var p = q.aspeed;
                if (q.speeding) {
                    q.aspeed -= 0.003
                }
                if (ms_check(q, "anim" + q.skin, p * 16.5)) {
                    q.frame += 1
                }
                if (q.frame >= q.frames && q.continuous) {
                    q.frame = 0
                } else {
                    if (q.frame >= q.frames) {
                        var q = q.parent;
                        if (q) {
                            destroy_sprite(q, "children");
                            delete q.animations[q.skin]
                        }
                        return
                    }
                }
                set_texture(q, q.frame)
            }
        }
    }
    if (q.stype == "emblem") {
        if (!q.frames) {
            var p = q.parent;
            if (p) {
                destroy_sprite(q, "children");
                delete p.emblems[q.skin]
            }
            return
        }
        if (ms_check(q, "emblem" + q.skin, 60)) {
            q.frames -= 1
        }
        q.alpha = q.frame_list[q.frames % q.frame_list.length]
    }
    if (q.stype == "emote") {
        var o = (q.aspeed == "slow" && 17) || (q.aspeed == "slower" && 40) || 10;
        if (q.atype == "flow") {
            if (ms_check(q, "anim", o * 16.5)) {
                q.frame += 1
            }
            set_texture(q, [0, 1, 2, 1][q.frame % 4])
        } else {
            if (ms_check(q, "anim", o * 16.5) && q.atype != "once") {
                q.frame = (q.frame + 1) % 3
            }
            set_texture(q, q.frame)
        }
    }
    if (q.mtype && !(no_graphics || paused)) {
        if (q.mtype == "dice") {
            if (q.shuffling) {
                var g = false;
                if (!q.locked) {
                    if (q.line) {
                        remove_sprite(q.line),
                            delete q.line
                    }
                    q.line = draw_line(0, 0, 34, 0, 1, 8446584);
                    q.line.x = -17;
                    q.line.y = -35.5;
                    q.addChild(q.line)
                }
                for (var k = q.locked; k < 4; k++) {
                    if ((q.updates % (k + 1))) {
                        continue
                    }
                    m = 3 - k;
                    var n = parseInt(Math.random() * 10);
                    if (q.lock_start && k == q.locked && mssince(q.lock_start) > (q.locked + 1) * 300) {
                        if (m == 0) {
                            n = q.num[0]
                        } else {
                            if (m == 1) {
                                n = q.num[1]
                            } else {
                                if (m == 2) {
                                    n = q.num[3]
                                } else {
                                    if (m == 3) {
                                        n = q.num[4]
                                    }
                                }
                            }
                        }
                        q.locked++;
                        g = true;
                        q.cskin = "2";
                        q.texture = textures.dice[q.cskin];
                        if (q.line) {
                            remove_sprite(q.line),
                                delete q.line
                        }
                        q.seconds = (4 - q.locked) * 7;
                        q.line = draw_line(0, 0, min(34, q.seconds * 1.12), 0, 1, 8446584);
                        q.line.x = -17;
                        q.line.y = -35.5;
                        q.addChild(q.line);
                        if (!q.seconds) {
                            q.count_start = future_s(8);
                            q.snum = q.num;
                            q.shuffling = false
                        }
                        q.cskin = "5";
                        q.texture = textures.dice[q.cskin]
                    }
                    q.digits[m].texture = textures.dicesub[n]
                }
                if (g) {
                    v_shake_i_minor(q)
                }
                if (!q.locked && q.shuffling && !(q.updates % 40) || q.cskin != "0" && q.cskin != "1") {
                    q.cskin = "" + (parseInt(q.cskin) + 1) % 2;
                    q.texture = textures.dice[q.cskin]
                }
            } else {
                if (q.num != q.snum) {
                    q.snum = q.num;
                    for (var m = 0; m < 4; m++) {
                        var n = 0;
                        if (m == 0) {
                            n = q.num[0]
                        } else {
                            if (m == 1) {
                                n = q.num[1]
                            } else {
                                if (m == 2) {
                                    n = q.num[3]
                                } else {
                                    if (m == 3) {
                                        n = q.num[4]
                                    }
                                }
                            }
                        }
                        q.digits[m].texture = textures.dicesub[parseInt(n)]
                    }
                } else {
                    q.seconds = min(30, max(0, mssince(q.count_start)) / 1000);
                    if (q.line) {
                        remove_sprite(q.line),
                            delete q.line
                    }
                    q.line = draw_line(0, 0, q.seconds * 1.14, 0, 1, 8446584);
                    q.line.x = -17;
                    q.line.y = -35.5;
                    q.addChild(q.line);
                    if (q.cskin != "5") {
                        q.cskin = "5";
                        q.texture = textures.dice[q.cskin]
                    }
                    if (0 && !(q.updates % 20)) {
                        if (q.cskin == "3") {
                            q.cskin = "4"
                        } else {
                            if (q.cskin == "4") {
                                q.cskin = "5"
                            } else {
                                q.cskin = "3"
                            }
                        }
                        q.texture = textures.dice[q.cskin]
                    }
                }
            }
        }
        if (q.mtype == "slots" || q.mtype == "wheel") {
            if (q.spinning) {
                if (!(q.updates % 2)) {
                    q.cskin = "" + (parseInt(q.cskin) + 1) % 3;
                    q.texture = textures[q.mtype][q.cskin]
                }
                if (q.spinning < new Date()) {
                    q.spinning = false
                }
            }
        }
    }
    if (q.type == "chest" && q.openning) {
        if (mssince(q.openning) > 30 && q.frame != 3) {
            q.openning = new Date();
            set_texture(q, ++q.frame);
            if (q.to_delete) {
                q.alpha -= 0.1
            }
        } else {
            if (mssince(q.openning) > 30 && q.to_delete && q.alpha >= 0.5) {
                q.alpha -= 0.1
            } else {
                if (q.alpha < 0.5) {
                    destroy_sprite(chests[q.id]);
                    delete chests[q.id]
                }
            }
        }
    }
    if (q.type == "character" || q.slots || q.cx) {
        if (!q.cx) {
            q.cx = {}
        }
        cosmetics_logic(q)
    }
    if (q.last_ms && q.s) {
        var b = mssince(q.last_ms);
        ["s", "c", "q"].forEach(function (s) {
            if (!q[s]) {
                return
            }
            for (var j in q[s]) {
                if (q[s][j].ms) {
                    q[s][j].ms -= b;
                    if (q[s][j].ms <= 0) {
                        delete q[s][j]
                    }
                }
            }
        });
        q.last_ms = new Date()
    }
    if (q.real_alpha !== undefined) {
        alpha_logic(q)
    }
    update_filters(q);
    q.updates += 1
}

function add_monster(d) {
    var c = G.monsters[d.type]
    var monster = {visible: true};
    monster.type = "monster";
    monster.mtype = d.type;
    adopt_soft_properties(monster, d);
    monster.parentGroup = monster.displayGroup = monster_layer;
    monster.walking = null;
    monster.animations = {};
    monster.fx = {};
    monster.emblems = {};
    monster.move_num = d.move_num;
    monster.c = {};
    monster.real_alpha = 1;
    monster.x = monster.real_x = round(d.x);
    monster.y = monster.real_y = round(d.y);
    monster.vx = d.vx || 0;
    monster.vy = d.vy || 0;
    if (c.slots) {
        monster.slots = c.slots
    }
    monster.level = 1;
    if (monster.s.young) {
        monster.real_alpha = 0.4
    }
    monster.last_ms = new Date();
    if (c.hit) {
        monster.hit = c.hit
    }
    if (c.size) {
        monster.height *= c.size,
            monster.width *= c.size,
            monster.mscale = 2,
            monster.hpbar_wdisp = -5
    }
    if (c.orientation) {
        monster.orientation = c.orientation
    }
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
    /*
    if (no_graphics) {
        return
    }
    if (a.glow8) {
        if (a.updates % 3) {
            return
        }
        var b = a.filter_glow8;
        if (b.b > 1.2) {
            b.step = -abs(b.step)
        }
        if (b.b < 0.9) {
            b.step = abs(b.step)
        }
        b.b += b.step;
        if (a.stand || a.s.charging) {
            b.b = 1.05
        }
        b.brightness(b.b)
    }
    if (a.glow9) {
        if (a.updates % 3) {
            return
        }
        var b = a.filter_glow9;
        if (b.b > 1.3) {
            b.step = -abs(b.step)
        }
        if (b.b < 1.2) {
            b.step = abs(b.step)
        }
        b.b += b.step;
        if (a.stand || a.s.charging) {
            b.b = 1.075
        }
        b.brightness(b.b)
    }
    if (a.glow10) {
        if (a.updates % 3) {
            return
        }
        var b = a.filter_glow10;
        if (b.b > 1.4) {
            b.step = -abs(b.step)
        }
        if (b.b < 1.3) {
            b.step = abs(b.step)
        }
        b.b += b.step;
        if (a.stand || a.s.charging) {
            b.b = 1.2
        }
        b.brightness(b.b)
    }
    if (a.appearing) {
        a.real_alpha += 0.05;
        if (a.real_alpha >= 1 || mssince(a.appearing) > 900) {
            a.appearing = a.tp = false;
            a.real_alpha = 1;
            if (a.s && a.s.invis) {
                a.real_alpha = 0.5
            }
            stop_animation(a, "transport")
        }
    }
    if (a.disappearing) {
        if (a.real_alpha > 0.5) {
            a.real_alpha -= 0.0025
        }
    }
    */
}

function start_filter(c, a, b) {
    /*
    if (no_graphics) {
        return
    }
    var d = null;
    if (a == "darkgray") {
        d = new PIXI.filters.OutlineFilter(3, 6185310)
    } else {
        if (a == "fingered") {
            d = new PIXI.filters.OutlineFilter(3, 9654194)
        } else {
            if (a == "bloom") {
                d = new PIXI.filters.BloomFilter(1, 1, 1)
            } else {
                if (a == "cv") {
                    d = new PIXI.filters.ConvolutionFilter([0.3, 0.02, 0.1, 0.1, 0.1, 0.02, 0.02, 0.2, 0.02], 30, 40)
                } else {
                    if (a == "cv2") {
                        d = new PIXI.filters.ConvolutionFilter([0.1, 0.1, 0.1, 0.1, 0, 0.1, 0.1, 0.1, 0.1], 30, 40)
                    } else {
                        if (a == "rblur") {
                            d = new PIXI.filters.RadialBlurFilter(random_one([-0.75, -0.5, 0.5, 0.75]), [5, 10], 11, -1)
                        } else {
                            if (a == "glow") {
                                d = new PIXI.filters.GlowFilter(8, 4, 0, 5868543)
                            } else {
                                if (a == "alphaf") {
                                    d = new PIXI.filters.AlphaFilter();
                                    d.alpha = b || 1
                                } else {
                                    if (a == "rcolor") {
                                        d = new PIXI.filters.ColorMatrixFilter();
                                        d.desaturate()
                                    } else {
                                        d = new PIXI.filters.ColorMatrixFilter();
                                        d.step = 0.01;
                                        d.b = 1
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (a == "curse") {
        if (c.s && c.s.frozen) {
            d.hue(24)
        } else {
            if (c.s && c.s.poisoned) {
                d.hue(-24)
            } else {
                d.hue(20)
            }
        }
    } else {
        if (a == "xcolor") {
            d.desaturate(2);
            d.sepia(0.01)
        } else {
            if (a == "darken") {
                d.night()
            } else {
                if (a == "bw") {
                    d.desaturate()
                }
            }
        }
    }
    if (!c.filter_list) {
        c.filter_list = [d]
    } else {
        c.filter_list.push(d)
    }
    c.filters = c.filter_list;
    c["filter_" + a] = d;
    c[a] = true
    */
}

function stop_filter(b, a) {
    /*
    if (no_graphics) {
        return
    }
    if (!b["filter_" + a]) {
        return
    }
    b.filter_list.splice(b.filter_list.indexOf(b["filter_" + a]), 1);
    if (!b.filter_list.length) {
        b.filters = null
    } else {
        b.filters = b.filter_list
    }
    delete b["filter_" + a];
    delete b[a]
    */
}

function alpha_logic(a) {
    if ((!a.cx || !a.cx.length) && (!a.cxc || !Object.keys(a.cxc).length)) {
        if (a.alpha != a.real_alpha) {
            a.alpha = a.real_alpha
        }
    } else {
        if (a.filter_alphaf) {
            if (a.real_alpha == 1) {
                stop_filter(a, "alphaf")
            } else {
                if (a.filter_alphaf.alpha != a.real_alpha) {
                    a.filter_alphaf.alpha = a.real_alpha
                }
            }
        } else {
            if (a.real_alpha != 1) {
                start_filter(a, "alphaf", a.real_alpha)
            }
        }
    }
}

function player_effects_logic(a) {
    if (no_graphics || !a.s) {
        return
    }
    if (a.g10 && !a.filter_glow10) {
        start_filter(a, "glow10")
    } else {
        if (!a.g10 && a.filter_glow10) {
            stop_filter(a, "glow10")
        } else {
            if (a.g9 && !a.filter_glow9) {
                start_filter(a, "glow9")
            } else {
                if (!a.g9 && a.filter_glow9) {
                    stop_filter(a, "glow9")
                } else {
                    if (a.g8 && !a.filter_glow8) {
                        start_filter(a, "glow8")
                    } else {
                        if (!a.g8 && a.filter_glow8) {
                            stop_filter(a, "glow8")
                        }
                    }
                }
            }
        }
    }
    if (a.s.invis && (!a.fx.invis || a.real_alpha != 0.5)) {
        a.fx.invis = true;
        a.real_alpha = 0.5
    } else {
        if (!a.s.invis && a.fx.invis) {
            delete a.fx.invis;
            a.real_alpha = 1
        }
    }
    if (a.s.phasedout && !a.fx.phs) {
        a.fx.phs = true;
        a.real_alpha = 0.8;
        start_filter(a, "xcolor");
        if (a.me && 0) {
            stage.cfilter_rblur = new PIXI.filters.RadialBlurFilter(random_one([-0.5, -0.25, 0.25, 0.5]), [width / 2, height / 2], 3, -1);
            regather_filters(stage)
        }
    } else {
        if (!a.s.phasedout && a.fx.phs) {
            a.real_alpha += 0.02;
            if (a.real_alpha >= 1) {
                delete a.fx.phs;
                stop_filter(a, "xcolor")
            }
            if (a.me && 0) {
                delete stage.cfilter_rblur;
                regather_filters(stage)
            }
        }
    }
    if (a.s.darkblessing && !a.fx.db) {
        a.fx.db = true;
        start_emblem(a, "dp1", {
            frames: 1200,
            no_dip: false
        })
    } else {
        if (!a.s.darkblessing && a.fx.db) {
            delete a.fx.db;
            stop_emblem(a, "dp1")
        }
    }
    if (a.s.warcry && !a.fx.wcry) {
        a.fx.wcry = true;
        start_emblem(a, "r1", {
            frames: 1200,
            no_dip: false
        })
    } else {
        if (!a.s.warcry && a.fx.wcry) {
            delete a.fx.wcry;
            stop_emblem(a, "r1")
        }
    }
    if (a.s.blink && !a.fading_out) {
        a.fading_out = new Date();
        a.real_alpha = 1;
        draw_timeout(fade_out_blink(0, a), 0)
    }
    if (a.c.revival && !a.fx.revival) {
        a.fx.revival = true;
        start_animation(a, "revival")
    } else {
        if (!a.c.revival && a.fx.revival) {
            delete a.fx.revival;
            stop_animation(a, "revival");
            start_animation(a, "heal")
        }
    }
    if (a.c.town && !a.disappearing) {
        a.disappearing = new Date();
        a.real_alpha = 1;
        start_animation(a, "transport")
    } else {
        if (!a.c.town && a.disappearing) {
            delete a.disappearing;
            a.real_alpha = 1;
            stop_animation(a, "transport")
        }
    }
    if (a.tp && !a.appearing) {
        a.appearing = new Date();
        a.real_alpha = 0.5;
        start_animation(a, "transport")
    }
    if (a.me && a.targets >= 3 && (!a.last_targets || a.last_targets < a.targets) && character.ctype != "warrior") {
        if (a.targets > 5) {
            add_log("You are petrified", "#B03736")
        } else {
            if (a.targets > 3) {
                add_log("You are terrified", "#B04157")
            } else {
                if (a.targets == 3) {
                    add_log("You are getting scared", "gray")
                }
            }
        }
    }
    if (a.me) {
        a.last_targets = a.targets
    }
}

function effects_logic(b) {
    if (no_graphics || !b.s) {
        return
    }
    if ((b.s.cursed || b.s.poisoned || b.s.frozen) && !b.fx.cursed) {
        b.fx.cursed = true;
        start_filter(b, "curse")
    } else {
        if (!(b.s.cursed || b.s.poisoned || b.s.frozen) && b.fx.cursed) {
            delete b.fx.cursed;
            stop_filter(b, "curse")
        }
    }
    if (b.s.fingered && !b.filter_fingered) {
        start_filter(b, "fingered")
    } else {
        if (!b.s.fingered && b.filter_fingered) {
            stop_filter(b, "fingered")
        }
    }
    if (b.s.stoned && !b.filter_stoned) {
        start_filter(b, "stoned")
    } else {
        if (!b.s.stoned && b.filter_stoned) {
            stop_filter(b, "stoned")
        }
    }
    if (b.s.stunned && !b.fx.stunned && !b.s.fingered) {
        b.fx.stunned = true;
        start_animation(b, "stunned", "stun")
    } else {
        if (!b.s.stunned && b.fx.stunned && !b.s.fingered) {
            delete b.fx.stunned;
            stop_animation(b, "stunned")
        }
    }
    if (b.s.tangled && !b.fx.tangled) {
        b.fx.tangled = true;
        start_animation(b, "tangle")
    } else {
        if (!b.s.tangled && b.fx.tangled) {
            delete b.fx.tangled;
            stop_animation(b, "tangle")
        }
    }
    if (b.s.invincible && !b.fx.invincible) {
        var a = b.role == "gm" && "gm" || "invincible";
        b.fx.invincible = true;
        start_animation(b, a);
        b.real_alpha = 0.9
    } else {
        if (!b.s.invincible && b.fx.invincible) {
            var a = b.role == "gm" && "gm" || "invincible";
            delete b.fx.invincible;
            stop_animation(b, a);
            b.real_alpha = 1
        }
    }
    if (b.s.hardshell && !b.fx.hardshell) {
        b.fx.hardshell = true;
        start_animation(b, "hardshell")
    } else {
        if (!b.s.hardshell && b.fx.hardshell) {
            delete b.fx.hardshell;
            stop_animation(b, "hardshell")
        }
    }
    if (b.s.reflection && !b.fx.reflection) {
        b.fx.reflection = true;
        start_animation(b, "reflection")
    } else {
        if (!b.s.reflection && b.fx.reflection) {
            delete b.fx.reflection;
            stop_animation(b, "reflection")
        }
    }
    if (b.s.magiport && !b.fading_out) {
        b.fading_out = new Date();
        b.real_alpha = 1;
        draw_timeout(fade_out_magiport(0, b), 0);
        start_filter(b, "bloom")
    }
    if (b.type == "monster" && !Object.keys(b.fx).length && b.real_alpha < 1 && !b.dead && !(b.appearing || b.disappearing || b.fading_out)) {
        b.real_alpha = min(1, b.real_alpha + 0.05)
    }
}

function cosmetics_logic(l) {
}


function add_character(e, d) {
    if (log_flags.entities) {
        console.log("add character " + e.id)
    }
    var a = (d && manual_centering && 2) || 1;
    var c = {};
    /*if (!XYWH[e.skin]) {
        e.skin = "naked"
    }
    if (a != 1) {
        c.scale = new PIXI.Point(a, a)
    }*/
    c.cscale = a;
    adopt_soft_properties(c, e);
    //cosmetics_logic(c);
    c.name = c.id;
    //c.parentGroup = c.displayGroup = player_layer;
    c.walking = null;
    c.animations = {};
    c.fx = {};
    //c.emblems = {};
    //c.real_alpha = 1;
    c.x = round(e.x);
    c.real_x = parseFloat(e.x);
    c.y = round(e.y);
    c.real_y = parseFloat(e.y);
    c.last_ms = new Date();
    //c.anchor.set(0.5, 1);
    c.type = "character";
    c.me = d;
    c.base = {
        h: 8,
        v: 7,
        vn: 2
    };

    if (e.npc && G.npcs[e.npc]) {
        if (G.npcs[e.npc].role == "citizen" || G.npcs[e.npc].moving) {
            c.citizen = true,
                c.npc_onclick = true,
                c.role = G.npcs[e.npc].role
        }
    }

    c.awidth = c.width / a;
    c.aheight = c.height / a;
    if (!(d && manual_centering)) {
        c.interactive = true;
        //c.on("mousedown", player_click).on("touchstart", player_click);
        if (!d && pvp) {
            c.cursor = "crosshair"
        }
    }
    /*we don't center
    if (manual_centering && 0) {
        var f = [c.awidth, c.aheight]
            , b = c.anchor;
        c.hitArea = new PIXI.Rectangle(-f[0] * b.x - 2, -f[1] * b.y - 2, f[0] + 4, f[1] + 4)
    }
    */
    return c
}

function add_chest(c) {
    var a = {};
    //No PIXI
    //var a = new_sprite(c.chest, "v_animation");
    //a.parentGroup = a.displayGroup = chest_layer;
    a.x = round(c.x);
    a.y = round(c.y);
    a.items = c.items;
    //a.anchor.set(0.5, 1);
    a.type = "chest";
    a.interactive = true;
    a.buttonMode = true;
    a.cursor = "help";
    a.map = c.map;
    a.id = c.id;
    /*
    var b = function () {
        open_chest(c.id)
    };
    a.on("mousedown", b).on("touchstart", b).on("rightdown", b);
    */
    chests[c.id] = a;
    /*
    if (a.map == current_map) {
        map.addChild(a)
    }*/
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
    /* No PIXI
        if (d.type == "static") {
        e = new_sprite(d.skin, "static")
    } else {
        if (d.type == "fullstatic") {
            e = new_sprite(d.skin, "full")
        } else {
            e = new_sprite(d.skin, "emote")
        }
    }
     */
    e.npc_id = g;
    //e.parentGroup = e.displayGroup = player_layer;
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
    //e.anchor.set(0.5, 1);
    e.type = "npc";
    e.npc = true;
    e.animations = {};
    //e.fx = {};
    //e.emblems = {};
    adopt_soft_properties(e, d);
    /*
    if (d.stand) {
        var f = new PIXI.Sprite(textures[d.stand]);
        f.y = 7;
        f.anchor.set(0.5, 1);
        e.addChild(f)
    }*/
    if (e.stype == "emote") {
        var h = [26, 35]
            , b = e.anchor;
        if (e.role == "xmas_tree") {
            h = [32, 60]
        }
        //e.hitArea = new PIXI.Rectangle(-h[0] * b.x - 2, -h[1] * b.y - 2, h[0] + 4, h[1] + 4);
        e.awidth = h[0];
        e.aheight = h[1];
        if (d.atype) {
            e.atype = d.atype;
            e.frame = e.stopframe || e.frame
        }
    }
    //e.on("mousedown", npc_right_click).on("touchstart", npc_right_click).on("rightdown", npc_right_click);
    //e.onrclick = npc_right_click;
    return e
}

function add_machine(d) {
    var c = {};
    //var c = new_sprite(d, "machine");
    //c.parentGroup = c.displayGroup = player_layer;
    c.interactive = true;
    c.buttonMode = true;
    c.x = round(d.x);
    c.y = round(d.y);
    c.type = "machine";
    c.mtype = d.type;
    c.updates = 0;
    //c.anchor.set(0.5, 1);
    if (d.type == "dice") {
        c.digits = e_array(4);
        for (var b = 0; b < 4; b++) {
            //c.digits[b] = new PIXI.Sprite(textures.dicesub[8]);
            //c.digits[b].anchor.set(0.5, 1);
            c.digits[b] = {};
            c.digits[b].x = -11 + b * 7;
            if (b > 1) {
                c.digits[b].x += 1
            }
            c.digits[b].y = -17;
            //c.addChild(c.digits[b])
        }
        c.dot = {};
        //c.dot.anchor.set(0.5, 1);
        c.dot.x = 0;
        c.dot.y = -21;
        c.addChild(c.dot);
        c.seconds = 0;
        c.count_start = new Date();
        c.shuffle_speed = 100
    }
    /*
    function a(f) {
        if (d.type == "dice") {
            render_dice()
        }
        if (d.type == "wheel") {
            add_log("The hostess isn't around", "gray")
        }
        if (d.type == "slots") {
            render_interaction({
                auto: true,
                skin: character.skin,
                message: "Hmm. This machine seems broken. Still give it a try? [1,000,000 gold]",
                button: "YES!",
                onclick: function () {
                    socket.emit("bet", {
                        type: "slots"
                    })
                }
            })
        }
        try {
            if (f) {
                f.stopPropagation()
            }
        } catch (g) {
        }
    }

    c.on("mousedown", a).on("touchstart", a).on("rightdown", a);
    c.onrclick = a;
    */
    return c
}

function add_door(b) {
    //var c = new PIXI.Sprite();
    //c.parentGroup = c.displayGroup = player_layer;
    var c = {};
    c.interactive = true;
    c.buttonMode = true;
    c.x = round(b[0]);
    c.y = round(b[1]);
    //c.anchor.set(0.5, 1);
    //c.hitArea = new PIXI.Rectangle(-round(b[2] * 0.5), -round(b[3] * 1), round(b[2]), round(b[3]));
    c.type = "door";
    /*
    function a() {
        if (!is_door_close(character.map, b, character.real_x, character.real_y) || !can_use_door(character.map, b, character.real_x, character.real_y)) {
            add_log("Get closer", "gray");
            return
        }
        socket.emit("transport", {
            to: b[4],
            s: b[5]
        })
    }

    if (is_mobile) {
        c.on("mousedown", a).on("touchstart", a)
    }
    c.on("rightdown", a);
    c.onrclick = a;
    */
    return c
}

function add_quirk(c) {
    //var a = new PIXI.Sprite();
    //a.parentGroup = a.displayGroup = player_layer;
    var a = {};
    a.interactive = true;
    a.buttonMode = true;
    if (c[4] != "upgrade" && c[4] != "compound") {
        a.cursor = "help"
    }
    a.x = round(c[0]);
    a.y = round(c[1]);
    //a.anchor.set(0.5, 1);
    //a.hitArea = new PIXI.Rectangle(-round(c[2] * 0.5), -round(c[3] * 1), round(c[2]), round(c[3]));
    a.type = "quirk";
    /*
    function b(d) {
        if (c[4] == "sign") {
            add_log('Sign reads: "' + c[5] + '"', "gray")
        } else {
            if (c[4] == "note") {
                add_log('Note reads: "' + c[5] + '"', "gray")
            } else {
                if (c[4] == "tavern_info") {
                    socket.emit("tavern", {
                        event: "info"
                    })
                } else {
                    if (c[4] == "mainframe") {
                        render_mainframe()
                    } else {
                        if (c[4] == "the_lever") {
                            the_lever()
                        } else {
                            if (c[4] == "log") {
                                add_log(c[5], "gray")
                            } else {
                                if (c[4] == "upgrade") {
                                    render_upgrade_shrine()
                                } else {
                                    if (c[4] == "compound") {
                                        render_compound_shrine()
                                    } else {
                                        if (c[4] == "list_pvp") {
                                            socket.emit("list_pvp")
                                        } else {
                                            if (c[4] == "invisible_statue") {
                                                render_none_shrine(),
                                                    add_log("An invisible statue!", "gray")
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
        try {
            if (d) {
                d.stopPropagation()
            }
        } catch (f) {
        }
    }

    if (is_mobile || in_arr(c[4], ["upgrade", "compound", "invisible_statue"])) {
        a.on("mousedown", b).on("touchstart", b)
    }
    a.on("rightdown", b);
    a.on("mousedown", b).on("touchstart", b);
    */
    return a
}

function add_animatable(a, b) {
    //var c = new_sprite(b.position, "animatable");
    var c = {};
    c.x = b.x;
    c.y = b.y;
    //c.anchor.set(0.5, 1);
    c.type = "animatable";
    return c
}

function create_map() {
    pvp = G.maps[current_map].pvp || is_pvp;
    if (paused) {
        return
    }
    /*
    drawn_map = current_map;
    if (map) {
        if (inner_stage) {
            inner_stage.removeChild(window.map)
        } else {
            stage.removeChild(window.map)
        }
        for (var v in chests) {
            var c = chests[v];
            if (c.map == current_map) {
                map.removeChild(c)
            }
        }
        free_children(map);
        map.destroy();
        map_entities.forEach(function (a) {
            a.destroy({
                children: true
            })
        });
        if (dtile) {
            dtile.destroy(),
                dtile = null
        }
        if (tiles) {
            tiles.destroy(),
                tiles = null
        }
        (window.rtextures || []).forEach(function (a) {
            if (a) {
                a.destroy(true)
            }
        });
        (window.dtextures || []).forEach(function (a) {
            if (a) {
                a.destroy(true)
            }
        })
    }*/
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
    //map = new PIXI.Container();
    map = {};
    map.real_x = 0;
    map.real_y = 0;

    if (first_coords) {
        first_coords = false;
        map.real_x = first_x;
        map.real_y = first_y
    }
    map.speed = 80;
    /*
    map.hitArea = new PIXI.Rectangle(-20000, -20000, 40000, 40000);
    if (scale) {
        map.scale = new PIXI.Point(scale, scale)
    }*/
    map.interactive = true;
    /*
    map.on("mousedown", map_click).on("mouseup", map_click_release).on("mouseupoutside", map_click_release).on("touchstart", map_click).on("touchend", map_click_release).on("touchendoutside", map_click_release);
    if (window.inner_stage) {
        inner_stage.addChild(map)
    } else {
        stage.addChild(map)
    }
    if (G.maps[current_map].filter == "halloween" && !no_graphics) {
        var l = new PIXI.filters.ColorMatrixFilter();
        l.saturate(-0.1);
        stage.cfilter_halloween = l;
        regather_filters(stage)
    } else {
        delete stage.cfilter_halloween;
        regather_filters(stage)
    }
    if (cached_map) {
        for (var D = 0; D <= GEO.tiles.length; D++) {
            if (D == GEO.tiles.length) {
                element = GEO["default"]
            } else {
                element = GEO.tiles[D]
            }
            sprite_last[current_map][D] = 0;
            if (!tile_sprites[current_map][D]) {
                tile_sprites[current_map][D] = [];
                if (!element) {
                    continue
                }
                if (element[3].length) {
                    element[4] = element[3][1],
                        element[3] = element[3][0]
                } else {
                    if (element[4] === undefined) {
                        element[4] = element[3]
                    }
                }
                var K = new PIXI.Rectangle(element[1], element[2], element[3], element[4]);
                var t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                element[5] = t;
                if (element[0] == "water") {
                    element[5].type = "water";
                    K = new PIXI.Rectangle(element[1] + 48, element[2], element[3], element[4]);
                    t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                    element[6] = t;
                    K = new PIXI.Rectangle(element[1] + 48 + 48, element[2], element[3], element[4]);
                    t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                    element[7] = t
                }
                if (element[0] == "puzzle" || element[0] == "custom_a") {
                    element[5].type = "water";
                    K = new PIXI.Rectangle(element[1] + 16, element[2], element[3], element[4]);
                    t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                    element[6] = t;
                    K = new PIXI.Rectangle(element[1] + 16 + 16, element[2], element[3], element[4]);
                    t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                    element[7] = t
                }
            }
        }
        window.rtextures = [0, 0, 0];
        window.dtextures = [0, 0, 0];
        if (dtile_size) {
            recreate_dtextures()
        }
        var L = [new PIXI.Container(), new PIXI.Container(), new PIXI.Container()];
        var J = 0
            , I = 0;
        for (var e = 0; e < 3; e++) {
            rtextures[e] = PIXI.RenderTexture.create(GEO.max_x - GEO.min_x, GEO.max_y - GEO.min_y, PIXI.SCALE_MODES.NEAREST, 1);
            for (var D = 0; D < GEO.placements.length; D++) {
                var N = GEO.placements[D];
                if (N[3] === undefined) {
                    var s = GEO.tiles[N[0]]
                        , k = s[3]
                        , E = s[4];
                    if (sprite_last[current_map][N[0]] >= tile_sprites[current_map][N[0]].length) {
                        tile_sprites[current_map][N[0]][sprite_last[current_map][N[0]]] = new_map_tile(s)
                    }
                    var m = tile_sprites[current_map][N[0]][sprite_last[current_map][N[0]]++];
                    if (m.textures) {
                        m.texture = m.textures[e]
                    }
                    m.x = N[1] - GEO.min_x;
                    m.y = N[2] - GEO.min_y;
                    L[e].addChild(m)
                } else {
                    var s = GEO.tiles[N[0]]
                        , k = s[3]
                        , E = s[4];
                    if (abs(((N[3] - N[1]) / k + 1) * ((N[4] - N[2]) / E + 1)) > 3) {
                        var t = s[5];
                        if (s.length == 8) {
                            t = s[5 + e]
                        }
                        var m = new PIXI.extras.TilingSprite(t, N[3] - N[1] + k, N[4] - N[2] + E);
                        m.x = N[1] - GEO.min_x;
                        m.y = N[2] - GEO.min_y;
                        L[e].addChild(m);
                        J++
                    } else {
                        I++;
                        for (var g = N[1]; g <= N[3]; g += k) {
                            for (var f = N[2]; f <= N[4]; f += E) {
                                if (sprite_last[current_map][N[0]] >= tile_sprites[current_map][N[0]].length) {
                                    tile_sprites[current_map][N[0]][sprite_last[current_map][N[0]]] = new_map_tile(s)
                                }
                                var m = tile_sprites[current_map][N[0]][sprite_last[current_map][N[0]]++];
                                if (m.textures) {
                                    m.texture = m.textures[e]
                                }
                                m.x = g - GEO.min_x;
                                m.y = f - GEO.min_y;
                                L[e].addChild(m)
                            }
                        }
                    }
                }
            }
            L[e].x = 0;
            L[e].y = 0;
            renderer.render(L[e], rtextures[e]);
            if (!mode.destroy_tiles) {
                L[e].destroy()
            }
        }
        console.log("a: " + J + " b: " + I);
        if (dtile_size) {
            window.dtile = new PIXI.Sprite(dtextures[1]),
                dtile.x = -500,
                dtile.y = -500
        }
        window.tiles = new PIXI.Sprite(rtextures[0]);
        tiles.x = GEO.min_x;
        tiles.y = GEO.min_y;
        if (dtile_size) {
            map.addChild(dtile)
        }
        map.addChild(tiles);
        if (mode.destroy_tiles) {
            for (var D = 0; D < 3; D++) {
                L[D].destroy()
            }
            for (var D = 0; D <= GEO.tiles.length; D++) {
                for (var A = 0; A < tile_sprites[current_map][D].length; A++) {
                    tile_sprites[current_map][D][A].destroy()
                }
                tile_sprites[current_map][D] = null
            }
        }
    } else {
        for (var D = 0; D <= GEO.tiles.length; D++) {
            if (D == GEO.tiles.length) {
                element = GEO["default"]
            } else {
                element = GEO.tiles[D]
            }
            sprite_last[current_map][D] = 0;
            if (!tile_sprites[current_map][D]) {
                tile_sprites[current_map][D] = [];
                if (!element) {
                    continue
                }
                if (element[3].length) {
                    element[4] = element[3][1],
                        element[3] = element[3][0]
                } else {
                    element[4] = element[3]
                }
                var K = new PIXI.Rectangle(element[1], element[2], element[3], element[4]);
                var t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                element[5] = t;
                if (element[0] == "water") {
                    element[5].type = "water";
                    K = new PIXI.Rectangle(element[1] + 48, element[2], element[3], element[4]);
                    t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                    element[6] = t;
                    K = new PIXI.Rectangle(element[1] + 48 + 48, element[2], element[3], element[4]);
                    t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                    element[7] = t
                }
                if (element[0] == "puzzle" || element[0] == "custom_a") {
                    element[5].type = "water";
                    K = new PIXI.Rectangle(element[1] + 16, element[2], element[3], element[4]);
                    t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                    element[6] = t;
                    K = new PIXI.Rectangle(element[1] + 16 + 16, element[2], element[3], element[4]);
                    t = new PIXI.Texture(C[G.tilesets[element[0]]], K);
                    element[7] = t
                }
                tile_sprites[current_map][D][sprite_last[current_map][D]] = new_map_tile(element)
            }
        }
    }
    if (GEO.groups) {
        for (var u = 0; u < GEO.groups.length; u++) {
            if (!GEO.groups[u].length) {
                continue
            }
            var q = new PIXI.Container();
            q.type = "group";
            var o = 999999999
                , r = 99999999
                , F = -999999999;
            for (var D = 0; D < GEO.groups[u].length; D++) {
                var N = GEO.groups[u][D]
                    , s = GEO.tiles[N[0]];
                if (N[1] < r) {
                    r = N[1]
                }
                if (N[2] < o) {
                    o = N[2]
                }
                if (N[2] + s[4] > F) {
                    F = N[2] + s[4]
                }
            }
            for (var D = 0; D < GEO.groups[u].length; D++) {
                var N = GEO.groups[u][D];
                var m = new PIXI.Sprite(GEO.tiles[N[0]][5]);
                m.x = N[1] - r;
                m.y = N[2] - o;
                if (N[2] < o) {
                    o = N[2]
                }
                q.addChild(m)
            }
            q.x = r;
            q.y = o;
            q.real_x = r;
            q.real_y = F;
            q.parentGroup = q.displayGroup = player_layer;
            map.addChild(q);
            map_entities.push(q)
        }
    }*/
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
        //map.addChild(n);
        map_npcs.push(m);
        map_entities.push(m)
    }
    let doors = map_info.doors || [];
    for (var B = 0; B < doors.length; B++) {
        var v = doors[B];
        var m = add_door(v);
        console.log("Door: " + v);
        //map.addChild(n);
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
        //map.addChild(n);
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
        //map.addChild(n);
        map_entities.push(m);
        if (border_mode) {
            border_logic(m)
        }
    }
    console.log("Map created: " + current_map);
    let animatables = {};
    for (var v in map_info.animatables || {}) {
        animatables[v] = add_animatable(v, map_info.animatables[v]);
        //map.addChild(animatables[v]);
        map_entities.push(animatables[v]);
        if (border_mode) {
            border_logic(animatables[v])
        }
    }
    for (var v in chests) {
        var c = chests[v];
        //if (c.map == current_map) {
        //    map.addChild(c)
        //}
    }
    /*
    if (border_mode) {
        G.maps[current_map].spawns.forEach(function (a) {
            var b = draw_circle(a[0], a[1], 10, 16609672);
            map.addChild(b)
        });
        (G.maps[current_map].monsters || []).forEach(function (b) {
            if (b.boundary) {
                var a = empty_rect(b.boundary[0], b.boundary[1], b.boundary[2] - b.boundary[0], b.boundary[3] - b.boundary[1], 2, 16539449);
                map.addChild(a)
            }
            if (b.rage) {
                var a = empty_rect(b.rage[0] - 3, b.rage[1] - 3, b.rage[2] - b.rage[0] + 6, b.rage[3] - b.rage[1] + 6, 2, 9530301);
                map.addChild(a)
            }
            (b.boundaries || []).forEach(function (h) {
                if (h[0] != current_map) {
                    return
                }
                var j = empty_rect(h[1] + 2, h[2] + 2, h[3] - h[1], h[4] - h[2], 2, 5412095);
                map.addChild(j)
            })
        });
        M.x_lines.forEach(function (b) {
            var a = draw_line(b[0], b[1], b[0], b[2], 2);
            map.addChild(a)
        });
        M.y_lines.forEach(function (b) {
            var a = draw_line(b[1], b[0], b[2], b[0], 2);
            map.addChild(a)
        })
    }
    */
    console.log("Map created: " + current_map)
}

function retile_the_map() {
    /*
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
    var o = mdraw_border * scale
        , n = []
        , b = 0
        , p = {}
        , a = new Date()
        , m = 0
        , l = 0;
    var d = map.real_x
        , c = map.real_y
        , k = d - width / scale / 2 - o
        , B = d + width / scale / 2 + o
        , g = c - height / scale / 2 - o
        , A = c + height / scale / 2 + o;
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
    if (0) {
        start_timer("remove_sprite");
        for (var q = 0; q < map_tiles.length; q++) {
            if (map_tiles[q].to_delete) {
                remove_sprite(map_tiles[q])
            }
        }
        stop_timer("remove_sprite")
    } else {
        if (map_tiles.length) {
            //map.removeChildren(map.children.indexOf(map_tiles[0]), map.children.indexOf(map_tiles[map_tiles.length - 1]))
        }
    }
    for (var q = 0; q <= GEO.tiles.length; q++) {
        sprite_last[current_map][q] = 0
    }
    map_tiles = n;
    water_tiles = [];
    last_water_frame = water_frame();
    if (GEO["default"] && !mdraw_tiling_sprites) {
        for (var d = k; d <= B + 10; d += GEO["default"][3]) {
            for (var c = g; c <= A + 10; c += GEO["default"][4]) {
                var z = floor(d / GEO["default"][3])
                    , v = floor(c / GEO["default"][4])
                    , u = "d" + z + "-" + v;
                if (p[u]) {
                    continue
                }
                if (sprite_last[current_map][GEO.tiles.length] >= tile_sprites[current_map][GEO.tiles.length].length) {
                    tile_sprites[current_map][GEO.tiles.length][sprite_last[current_map][GEO.tiles.length]] = new_map_tile(GEO["default"]),
                        l++
                }
                var f = tile_sprites[current_map][GEO.tiles.length][sprite_last[current_map][GEO.tiles.length]++];
                if (f.textures) {
                    f.texture = f.textures[last_water_frame],
                        water_tiles.push(f)
                }
                f.x = z * GEO["default"][3];
                f.y = v * GEO["default"][4];
                if (mdraw_mode != "redraw") {
                    f.parentGroup = f.displayGroup = map_layer
                }
                f.zOrder = 0;
                f.tid = u;
                map.addChild(f);
                map_tiles.push(f)
            }
        }
    } else {
        if (GEO["default"]) {
            if (!window.default_tiling) {
                default_tiling = new PIXI.extras.TilingSprite(GEO["default"][5], floor((B - k) / 32) * 32 + 32, floor((A - g) / 32) * 32 + 32)
            }
            default_tiling.x = floor(k / GEO["default"][3]) * GEO["default"][3];
            default_tiling.y = floor(g / GEO["default"][4]) * GEO["default"][4];
            default_tiling.textures = [GEO["default"][5], GEO["default"][6], GEO["default"][7]];
            map.addChild(default_tiling);
            map_tiles.push(default_tiling)
        }
    }
    for (var q = 0; q < GEO.placements.length; q++) {
        var D = GEO.placements[q];
        if (D[3] === undefined) {
            if (p["p" + q]) {
                continue
            }
            var j = GEO.tiles[D[0]]
                , e = j[3]
                , t = j[4];
            if (D[1] > B || D[2] > A || D[1] + e < k || D[2] + t < g) {
                continue
            }
            if (sprite_last[current_map][D[0]] >= tile_sprites[current_map][D[0]].length) {
                tile_sprites[current_map][D[0]][sprite_last[current_map][D[0]]] = new_map_tile(j),
                    l++
            }
            var f = tile_sprites[current_map][D[0]][sprite_last[current_map][D[0]]++];
            if (f.textures) {
                f.texture = f.textures[last_water_frame],
                    water_tiles.push(f)
            }
            f.x = D[1];
            f.y = D[2];
            if (mdraw_mode != "redraw") {
                f.parentGroup = f.displayGroup = map_layer
            }
            f.zOrder = -(q + 1);
            f.tid = "p" + q;
            map.addChild(f);
            map_tiles.push(f)
        } else {
            var j = GEO.tiles[D[0]]
                , e = j[3]
                , t = j[4];
            if (!mdraw_tiling_sprites) {
                for (var d = D[1]; d <= D[3]; d += e) {
                    if (d > B || d + e < k) {
                        continue
                    }
                    for (c = D[2]; c <= D[4]; c += t) {
                        if (c > A || c + t < g) {
                            continue
                        }
                        if (sprite_last[current_map][D[0]] >= tile_sprites[current_map][D[0]].length) {
                            tile_sprites[current_map][D[0]][sprite_last[current_map][D[0]]] = new_map_tile(j),
                                l++
                        }
                        var f = tile_sprites[current_map][D[0]][sprite_last[current_map][D[0]]++];
                        if (f.textures) {
                            f.texture = f.textures[last_water_frame],
                                water_tiles.push(f)
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
                    window["defP" + q] = new PIXI.extras.TilingSprite(j[5], D[3] - D[1] + e, D[4] - D[2] + t)
                }
                var f = window["defP" + q];
                f.x = D[1];
                f.y = D[2];
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
    });*/
    //console.log("retile_map ms: " + mssince(a) + " min_x: " + k + " max_x: " + B + " entities: " + map_tiles.length + " removed: " + m + " new: " + l)
}

var fps_counter = null, frames = 0, last_count = null, last_frame, fps = 0;
var stop_rendering = false;

function calculate_fps() {
    /*
    if (!fps_counter) {
        return
    }
    if (mode.dom_tests_pixi || inside == "payments") {
        return
    }
    frames += 1;
    if (!last_count) {
        last_count = new Date(),
            last_frame = frames,
            frequency = 500
    }
    if (mssince(last_count) >= frequency) {
        last_count = new Date(),
            fps = (frames - last_frame) * (1000 / frequency),
            last_frame = frames
    }
    fps_counter.text = "" + round(fps);
    fps_counter.position.set(width - 340, height)
    */
}

function load_game(a) {
    /*
    loader.load(function (m, d) {
        if (mode_nearest) {
            for (file in PIXI.utils.BaseTextureCache) {
                PIXI.utils.BaseTextureCache[file].scaleMode = PIXI.SCALE_MODES.NEAREST
            }
        }
        for (name in G.sprites) {
            var g = G.sprites[name];
            if (g.skip) {
                continue
            }
            var e = 4
                , b = 3
                , k = "full";
            if (in_arr(g.type, ["animation"])) {
                e = 1,
                    k = g.type
            }
            if (in_arr(g.type, ["v_animation", "head", "hair", "hat", "s_wings"])) {
                b = 1,
                    k = g.type
            }
            if (in_arr(g.type, ["wings", "body"])) {
                k = g.type
            }
            if (in_arr(g.type, ["emblem", "gravestone"])) {
                e = 1,
                    b = 1,
                    k = g.type
            }
            var l = g.matrix;
            if (no_graphics) {
                C[g.file] = {
                    width: 20,
                    height: 20
                }
            }
            var c = C[g.file].width / (g.columns * b);
            var n = C[g.file].height / (g.rows * e);
            for (var h = 0; h < l.length; h++) {
                for (var f = 0; f < l[h].length; f++) {
                    if (!l[h][f]) {
                        continue
                    }
                    FC[l[h][f]] = g.file;
                    FM[l[h][f]] = [h, f];
                    XYWH[l[h][f]] = [f * b * c, h * e * n, c, n];
                    T[l[h][f]] = k
                }
            }
        }
        G.positions.textures.forEach(function (o) {
            var j = G.positions[o];
            textures[o] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[j[0]]], new PIXI.Rectangle(j[1], j[2], j[3], j[4]))
        });
        for (name in G.animations) {
            generate_textures(name, "animation")
        }
        set_status("Resources Loaded");
        resources_loaded = true;
        if (is_demo) {
            create_map();
            map.real_y = -105;
            draw()
        } else {
            if (window.socket_ready) {
                launch_game()
            }
        }
    });
    if (no_graphics) {
        loader.load_function()
    }
    */

    create_map();
    draw();

    game_loaded = true;
    console.log("Game loaded");

    socket.emit("loaded", {success: 1, width: screen.width, height: screen.height, scale: scale})
    if (typeof onLoad === "function") {
        onLoad();
    }
}

function launch_game() {
    create_map();
    if (!draws) {
        draw()
    }

    /*
    if (!mode.dom_tests_pixi && inside != "payments" && !window.fps_counter) {
        fps_counter = new PIXI.Text("0", {
            fontFamily: "Arial",
            fontSize: 32,
            fill: "green"
        });
        fps_counter.position.set(10, 10);
        fps_counter.anchor.set(1, 1);
        fps_counter.parentGroup = fps_counter.displayGroup = chest_layer;
        fps_counter.zOrder = -999999999;
        if (window.inner_stage) {
            inner_stage.addChild(fps_counter)
        } else {
            stage.addChild(fps_counter)
        }
    }
    game_loaded = true;*/
    socket.emit("loaded", {
        success: 1,
        width: screen.width,
        height: screen.height,
        scale: scale
    })
}

function on_resize() {
    /*
    width = $(window).width();
    height = $(window).height();
    if (window.renderer) {
        renderer.resize(width, height);
        renderer.antialias = antialias;
        if (window.map) {
            map.last_max_y = undefined
        }
    }
    $("#pagewrapped").css("margin-top", Math.floor(($(window).height() - $("#pagewrapped").outerHeight()) / 2) + "px");
    reposition_ui();
    position_modals();
    force_draw_on = future_s(1)
    */
}

function resize() {
    on_resize()
}

function pause() {
    if (paused) {
        paused = false;
        if (current_map != drawn_map) {
            create_map()
        }
    } else {
        paused = true;
    }
}

function draw(a, b) {
    if (manual_stop) {
        return
    }
    draws++;
    in_draw = true;
    if (last_draw) {
        frame_ms = mssince(last_draw)
    }
    last_draw = new Date();
    start_timer("draw");
    draw_timeouts_logic(2);
    stop_timer("draw", "timeouts");
    //calculate_fps();
    /*
    if (!(character && mouse_only) && 0) {
        var d = map.speed;
        if (character) {
            d = character.speed
        }
        d *= frame_ms / 1000;
        if ((left_pressed || right_pressed) && (down_pressed || up_pressed)) {
            d /= 1.41
        }
        if (left_pressed < right_pressed) {
            map.real_x += d
        }
        if (left_pressed > right_pressed) {
            map.real_x -= d
        }
        if (up_pressed < down_pressed) {
            map.real_y += d
        }
        if (up_pressed > down_pressed) {
            map.real_y -= d
        }
    }*/
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
    position_map();
    //ui_logic();
    call_code_function("on_draw");
    //retile_the_map();
    stop_timer("draw", "retile");
    update_overlays();
    stop_timer("draw", "uis");
    //tint_logic();
    draw_timeouts_logic();
    stop_timer("draw", "timeouts");
    draw_entities();
    stop_timer("draw", "draw_entities");
    if (character) {
        update_sprite(character)
    }
    map_npcs.forEach(function (e) {
        update_sprite(e)
    });
    for (var c in chests) {
        if (chests[c].openning) {
            update_sprite(chests[c])
        }
    }
    stop_timer("draw", "sprites");
    stop_timer("draw", "before_render");
    /*if (force_draw_on || !a && !is_hidden() && !paused) {
        renderer.render(stage);
        force_draw_on = false
    }
    if (current_status != last_status) {
        $("#status").html(current_status),
            last_status = current_status
    }*/
    stop_timer("draw", "after_render");
    /*if (!a && !no_html) {
        requestAnimationFrame(draw);
        try {
            var h = get_active_characters();
            for (var b in h) {
                if (h[b] != "self" && h[b] != "loading") {
                    character_window_eval(b, "draw()")
                }
            }
        } catch (g) {
            console.log(g)
        }
    }*/
    if (!b) {
        setTimeout(function () {
            draw();
        }, 16);
    }
};