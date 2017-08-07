var is_game = 1, is_server = 0, is_code = 0, is_pvp = 0, is_demo = 0, gameplay = "normal";
var inception = new Date();
var log_game_events = true;
var scale = parseInt(scale);
var round_xy = true, floor_xy = false;
var round_entities_xy = false;
var offset_walking = true;
var antialias = false, mode_nearest = true;
var force_webgl = false, force_canvas = false;
var gtest = false;
var mode = {dom_tests: 0, dom_tests_pixi: 0, bitmapfonts: 0, debug_moves: 0, destroy_tiles: 1,};
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
var last_interaction = new Date(), afk_edge = 60, mm_afk = false;
var last_drag_start = new Date();
var last_npc_right_click = new Date();
var block_right_clicks = true;
var mouse_only = true;
var show_names = 0;
var the_code = "";
var server_region = "EU", server_identifier = "I", server_name = "", ipass = "";
var real_id = "", character = null, map = null, game_loaded = false, friends = [];
var tints = [];
var entities = {}, future_entities = {players: {}, monsters: {}}, pull_all = false, pull_all_next = false,
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
var chests = {}, party_list = [];
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
var abtesting = null, abtesting_ui = false;
var code_run = false, code_active = false;
var reload_state = false, reload_timer = null, first_entities = false;
var draws = 0;
var S = {font: "Pixel", normal: 18, large: 24, huge: 36, chat: 18,};
setInterval(function () {
    if (reload_state) {
        try {
            var c = window.localStorage.getItem("reload" + server_region + server_identifier);
            if (c) {
                c = JSON.parse(c);
                c.time = new Date(c.time);
                if (new Date() < c.time) {
                    if (reload_state != "synced") {
                        var b = {ip: c.ip, port: c.port, code: code_to_load, mstand: mstand_to_load};
                        window.localStorage.setItem("character_" + real_id, JSON.stringify(b));
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
            reload_state = "schedule", reload_timer = future_s(45 + parseInt(Math.random() * 25));
            add_log("First Echo In " + parseInt(-ssince(reload_timer)) + " Seconds", "gray")
        }
        if (reload_state == "schedule" && new Date() > reload_timer) {
            api_call("can_reload", {region: server_region, pvp: is_pvp || "", name: server_identifier});
            add_log("Echo Sent", "gray");
            reload_timer = future_s(20 + parseInt(Math.random() * 20))
        }
        if (reload_state == "synced" && new Date() > reload_timer) {
            reload_state = false;
            window.location = window.location.origin + "?load=" + real_id + "&times=" + (parseInt(reload_times) + 1)
        }
    }
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
        console.log("pull_all_next triggered");
        pull_all_next = false;
        pull_all = true;
        future_entities = {players: {}, monsters: {}}
    }
    if (window.last_draw) {
        if (code_run && mssince(last_draw) > 500) {
            draw(0, 1)
        } else {
            if (!code_run && mssince(last_draw) > 15000) {
                draw(0, 1)
            }
        }
    }
    mm_afk = (ssince(window.last_interaction) > afk_edge / 2);
    if (character) {
        if (!character.afk && ssince(window.last_interaction) > afk_edge) {
            character.afk = true;
            socket.emit("property", {afk: true})
        }
        if (character.afk && ssince(window.last_interaction) <= afk_edge) {
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
    add_log("Connecting ...");
    socket.emit("auth", {user: a, character: c, auth: b, width: screen.width, height: screen.height, scale: scale})
}
function disconnect() {
    var a = "DISCONNECTED", b = "Disconnected";
    game_loaded = false;
    if (window.disconnect_reason == "limits") {
        a = "REJECTED";
        add_log("Oops. You exceeded the limitations.", "#83BDCF");
        add_log("You can use one character on a normal server, one additional character on a PVP server and one merchant.", "#CF888A")
    } else {
        if (window.disconnect_reason) {
            add_log("Disconnect Reason: " + window.disconnect_reason, "gray")
        }
    }
    if (character && (auto_reload == "on" || auto_reload == "auto" && (character.stand || code_run))) {
        auto_reload = true;
        mstand_to_load = character.stand || null;
        code_to_load = null;
        if (code_run) {
            code_to_load = codemirror_render.getValue()
        }
        b = "Reloading";
        add_log("Auto Reload Active", colors.serious_red);
        reload_state = "start"
    }
    $("body").children().each(function () {
        if (this.tagName != "CANVAS" && this.id != "bottomrightcorner" && this.id != "bottomleftcorner2") {
            $(this).remove()
        } else {
            if (this.id == "bottomrightcorner" || this.id == "bottomleftcorner2") {
                this.style.zIndex = 2000
            }
        }
    });
    $("body").append("<div style='position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; z-index: 999; background: rgba(0,0,0,0.85); text-align: center'><div onclick='refresh_page()' class='gamebutton clickable' style='margin-top: " + (round(height / 2) - 10) + "px'>" + a + "</div></div>");
    if (character) {
        $("title").html(b + " - " + character.name)
    }
    if (socket) {
        socket = null, socket.disconnect()
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
    if (b && dtile_size && window.dtile) {
        dtile.x = round(map.real_x - width / (scale * 2));
        dtile.y = round(map.real_y - height / (scale * 2));
        dtile.x = ceil(dtile.x / (dtile_size / 1)) * (dtile_size / 1) - (dtile_size / 1);
        dtile.y = ceil(dtile.y / (dtile_size / 1)) * (dtile_size / 1) - (dtile_size / 1)
    }
    if (character) {
        if (manual_centering) {
            character.x = c_round(width / 2), character.y = c_round(height / 2)
        } else {
            character.x = c_round(character.real_x), character.y = c_round(character.real_y)
        }
    }
}
var rendered_target = {}, last_target_cid = null, dialogs_target = null;
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
        $("#topleftcornerdialog").html(""), dialogs_target = null
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
        render_info(f)
    } else {
        if (ctarget && ctarget.npc) {
            var f = [{name: "NPC", color: "gray", value: ctarget.name}, {
                name: "LEVEL",
                color: "orange",
                value: ctarget.level
            },];
            render_info(f)
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
                    cursed: b.cursed
                }, {
                    name: "ATTSPD",
                    color: "gray",
                    value: round(b.frequency * 100),
                    poisoned: b.poisoned
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
                render_info(f, d);
                render_slots(b)
            } else {
                if (!ctarget && rendered_target != null) {
                    $("#topleftcornerui").html('<div class="gamebutton">NO TARGET</div>')
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
        if (b > 1.25 && log_flags.timers) {
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
    for (var f in future_entities.monsters) {
        var b = future_entities.monsters[f];
        var d = entities[b.id];
        if (!d) {
            if (b.dead) {
                continue
            }
            if (gtest) {
                return
            }
            try {
                d = entities[b.id] = add_monster(b)
            } catch (c) {
                console.log("EMAIL HELLO@ADVENTURE.LAND WITH THIS: " + JSON.stringify(b))
            }
            d.drawn = false;
            d.resync = true
        }
        if (b.dead) {
            d.dead = true;
            continue
        }
        sync_entity(d, b);
        (b.events || []).forEach(function (g) {
            if (g.type == "mhit") {
                var h = get_entity(g.p), e = get_entity(g.m);
                if (!h) {
                    return
                }
                if (g.evade) {
                    return
                }
                if (g.combo && h && h.me && h.targets < 3) {
                    add_log(G.monsters[d.mtype].name + " dealt combined damage", "#DF513D");
                    add_log("Scatter the party members!", "gray");
                    call_code_function("on_combined_damage")
                }
                if (g.reflect) {
                    if (!e) {
                        return
                    }
                    d_text("-" + g.d, e, {color: "damage"});
                    start_animation(e, "explode_c");
                    d_line(h, e, {color: "reflect"})
                } else {
                    direction_logic(d, h, "attack");
                    d_text("-" + g.d, h, {color: "damage"});
                    start_animation(h, d.hit || "slash0");
                    d_line(d, h);
                    if (in_arr(d.hit, ["explode_a", "explode_c"])) {
                        sfx("explosion")
                    } else {
                        sfx("monster_hit")
                    }
                    if (g.k) {
                        start_animation(h, "spark0")
                    }
                }
            }
        })
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
                start_animation(d, "light")
            }
        }
        if (a.dead) {
            d.dead = true;
            continue
        }
        sync_entity(d, a)
    }
}
function on_disappear(a) {
    if (future_entities.players[a.id]) {
        delete future_entities.players[a.id]
    }
    if (future_entities.monsters[a.id]) {
        delete future_entities.monsters[a.id]
    }
    if (entities[a.id]) {
        if (a.invis) {
            assassin_smoke(entities[a.id].real_x, entities[a.id].real_y)
        }
        if (a.effect) {
            start_animation(entities[a.id], "transport")
        }
        entities["DEAD" + a.id] = entities[a.id];
        entities[a.id].dead = true;
        call_code_function("on_disappear", entities[a.id], a);
        delete entities[a.id]
    } else {
        if (character && character.id == a.id) {
            if (a.invis) {
                assassin_smoke(character.real_x, character.real_y)
            }
            call_code_function("on_disappear", character, a)
        }
    }
}
var asp_skip = {};
["x", "y", "vx", "vy", "moving", "abs", "going_x", "going_y", "from_x", "from_y", "width", "height", "type", "events", "angle", "skin"].forEach(function (a) {
    asp_skip[a] = true
});
function adopt_soft_properties(a, b) {
    if (a.me) {
        if (a.moving && a.speed && b.speed && a.speed != b.speed) {
            a.speed = b.speed;
            calculate_vxy(a)
        }
        if (b.abs) {
            a.moving = false
        }
        a.bank = null
    }
    for (prop in b) {
        if (asp_skip[prop]) {
            continue
        }
        a[prop] = b[prop]
    }
    if (a.slots) {
        a.g10 = a.g9 = a.g8 = undefined;
        for (var c in a.slots) {
            if ((c == "chest" || c == "mainhand") && a.slots[c]) {
                if (a.slots[c].level == 10) {
                    a.g10 = true
                }
                if (a.slots[c].level == 9) {
                    a.g9 = true
                }
                if (a.slots[c].level == 8) {
                    a.g8 = true
                }
            }
        }
        if (a.g10) {
            a.g9 = a.g8 = undefined
        }
        if (a.g9) {
            a.g8 = undefined
        }
    }
    ["stunned", "cursed", "poisoned", "poisonous", "frozen"].forEach(function (d) {
        if (a[d]) {
            a[d] = false
        }
    });
    if (is_player(a)) {
        ["charging", "invis", "invincible", "mute"].forEach(function (d) {
            if (a[d]) {
                a[d] = false
            }
        })
    }
    for (prop in b.s || {}) {
        a[prop] = b.s[prop]
    }
    if (a.me) {
        a.bank = a.user
    }
}
function reposition_ui() {
    if (character) {
        $("#topmid").css("right", round(($("html").width() - $("#topmid").outerWidth()) / 2));
        $("#bottommid").css("right", round(($("html").width() - $("#bottommid").outerWidth()) / 2))
    }
}
function update_overlays() {
    if (mode.dom_tests) {
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
        if (inventory && !cached("igold", character.gold)) {
            $(".goldnum").html(to_pretty_num(character.gold))
        }
        if (inventory && !cached("icash", character.cash)) {
            $(".cashnum").html(to_pretty_num(character.cash))
        }
        if (!cached("coord", round(map.real_x) + "|" + round(map.real_y))) {
            $(".coords").html(round(map.real_x) + "," + round(map.real_y))
        }
        if (!topleft_npc) {
            reset_topleft()
        }
        if (topright_npc == "character" && !cached("chcid", character.cid)) {
            render_character_sheet()
        }
    }
    if (abtesting_ui) {
        $(".scoreA").html(abtesting.A);
        $(".scoreB").html(abtesting.B);
        var c = -ssince(abtesting.end), a = parseInt(c / 60), c = parseInt(c) % 60;
        if (c == 0) {
            c = "00"
        } else {
            if (c < 10) {
                c = "0" + c
            }
        }
        $(".abtime").html("0" + a + ":" + c)
    }
}
function on_load_progress(a, b) {
    $("#progressui").html(round(a.progress) + "%")
}
function the_game(c) {
    width = $(window).width();
    height = $(window).height();
    if (bowser.mac && bowser.firefox) {
        renderer = new PIXI.CanvasRenderer(width, height, {antialias: antialias, transparent: false})
    } else {
        if (retina_mode) {
            renderer = new PIXI.autoDetectRenderer(width, height, {
                antialias: antialias,
                transparent: false,
                resolution: window.devicePixelRatio,
                autoResize: true
            })
        } else {
            if (force_webgl) {
                renderer = new PIXI.WebGLRenderer(width, height, {antialias: antialias, transparent: false})
            } else {
                if (force_canvas) {
                    renderer = new PIXI.CanvasRenderer(width, height, {antialias: antialias, transparent: false})
                } else {
                    renderer = new PIXI.autoDetectRenderer(width, height, {antialias: antialias, transparent: false})
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
    if (!bot_mode) {
        document.body.appendChild(renderer.view)
    }
    $("canvas").css("position", "fixed").css("top", "0px").css("left", "0px").css("z-index", 1);
    stage = new PIXI.Container();
    inner_stage = new PIXI.Container();
    if (bw_mode) {
        var b = new PIXI.filters.ColorMatrixFilter();
        stage.filters = [b];
        b.desaturate()
    }
    stage.addChild(inner_stage);
    if (PIXI.DisplayList) {
        if (window.inner_stage) {
            inner_stage.displayList = new PIXI.DisplayList()
        } else {
            stage.displayList = new PIXI.DisplayList()
        }
        map_layer = new PIXI.DisplayGroup(0, true);
        text_layer = new PIXI.DisplayGroup(3, true);
        chest_layer = new PIXI.DisplayGroup(2, true);
        monster_layer = new PIXI.DisplayGroup(1, function (e) {
            var d = 0;
            if (e.stand) {
                d = -3
            }
            if ("real_y" in e) {
                e.zOrder = -e.real_y + d + (e.y_disp || 0)
            } else {
                e.zOrder = -e.position.y + d + (e.y_disp || 0)
            }
        });
        player_layer = monster_layer;
        chest_layer = monster_layer
    }
    frame_ms = 16;
    C = PIXI.utils.BaseTextureCache;
    FC = {};
    D = {};
    T = {};
    loader = PIXI.loader;
    loader.on("progress", on_load_progress);
    for (name in G.animations) {
        loader.add(G.animations[name].file)
    }
    for (name in G.tilesets) {
        loader.add(G.tilesets[name])
    }
    for (name in G.sprites) {
        var a = G.sprites[name];
        if (a.skip) {
            continue
        }
        loader.add(a.file)
    }
    process_game_data();
    if (mode.bitmapfonts) {
        loader.add("/css/fonts/m5x7.xml")
    }
    if (!c) {
        init_socket()
    } else {
        init_demo()
    }
}
function init_demo() {
    is_demo = 1;
    current_map = "shellsisland";
    M = G.maps[current_map].data;
    reflect_music();
    load_game()
}
function init_socket() {
    if (!server_addr) {
        add_log("Welcome");
        add_log("No live server found", "red");
        add_log("Please check again in 2-3 minutes");
        add_log("Spend this time in our Discord chat room", "#3386CF");
        add_update_notes();
        return
    }
    if (window.socket) {
        window.socket.destroy()
    }
    window.socket = io(server_addr + ":" + server_port);
    var original_onevent = socket.onevent;
    var original_emit = socket.emit;
    socket.emit = function (packet) {
        var is_transport = in_arr(arguments && arguments["0"], ["transport", "enter", "leave"]);
        if (mode.log_calls) {
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
        if (mode.log_incoming) {
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
        reflect_music();
        $(".servername").html(server_name);
        $(".mapname").html(G.maps[current_map].name || "Unknown");
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
        $(".mapname").html(G.maps[current_map].name || "Unknown");
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
        $(".mapname").html(G.maps[current_map].name || "Unknown");
        character.real_x = data.x;
        character.real_y = data.y;
        character.m = data.m;
        character.moving = false;
        character.direction = data.direction || 0;
        character.map = current_map;
        character["in"] = data["in"];
        if (data.effect) {
            character.tp = true
        }
        var cm_timer = new Date();
        if (create) {
            create_map()
        }
        console.log("create_map: " + mssince(cm_timer));
        pull_all = true;
        position_map();
        new_map_logic("map", data)
    });
    socket.on("start", function (data) {
        $("#progressui").remove();
        $("#content").html("");
        $("#topmid,#bottommid,#toprightcorner,#bottomleftcorner2,#bottomleftcorner").show();
        $(".xpsui").show();
        $("body").append('<input id="chatinput" onkeypress="if(event.keyCode==13) say($(this).rfval())" placeholder=""/>');
        if (gtest) {
            $("body").children().each(function () {
                if (this.tagName != "CANVAS") {
                    $(this).remove()
                }
            })
        }
        inside = "game";
        character = add_character(data, 1);
        if (!data.vision) {
            character.vision = [700, 500]
        }
        friends = data.friends;
        if (character.level == 1) {
            show_modal($(gameplay == "hardcore" && "#hardcoreguide" || "#gameguide").html())
        }
        if (character.ctype == "merchant") {
            show_names = 1
        }
        clear_game_logs();
        add_log("Connected!");
        if (gameplay == "hardcore") {
            add_log("Pro Tips: You can transport to anywhere from the Beach Cave, Water Spirits drop stat belts, 3 monsters drop 3 new unique items", "#B2D5DF");
            $(".saferespawn").show()
        } else {
            add_log("Note: Game dynamics and drops aren't final, they are evolving with every update", "gray")
        }
        $(".charactername").html(character.name);
        if (gameplay == "hardcore") {
            $("title").html("Fierce " + character.name)
        } else {
            $("title").html(character.name)
        }
        reposition_ui();
        update_overlays();
        if (character.map != current_map) {
            current_map = character.map;
            reflect_music();
            M = G.maps[current_map].data;
            $(".mapname").html(G.maps[current_map].name || "Unknown");
            create_map();
            pull_all = true
        }
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
        }
        position_map();
        rip_logic();
        new_map_logic("start", data);
        new_game_logic();
        load_skills();
        if (is_sdk || 1) {
            render_skillbar()
        }
        ipass = data.ipass;
        setInterval(function () {
            if (game_loaded) {
                $.getJSON("http://" + server_addr + ":" + (parseInt(server_port) + 40) + "/character?checkin=1&ipass=" + ipass + "&id=" + character.id + "&callback=?")
            }
        }, 30000);
        if (character.ctype == "mage") {
            skill_timeout("burst", 10000)
        }
        if (character.ctype == "ranger") {
            skill_timeout("supershot", 10000)
        }
        if (code_to_load) {
            handle_information([{type: "code", code: code_to_load, run: true}]);
            code_to_load = false
        } else {
            if (persist_code) {
                try {
                    var data = window.localStorage.getItem("code_cache"), the_code = "", to_run = false;
                    if (data) {
                        data = JSON.parse(data);
                        the_code = data["code_" + real_id] || "";
                        to_run = data["run_" + real_id];
                        if (the_code.length) {
                            handle_information([{type: "code", code: the_code, run: to_run}])
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        }
        if (mstand_to_load) {
            for (var i = 0; i < 42; i++) {
                if (character.items[i] && character.items[i].name == mstand_to_load) {
                    open_merchant("" + i)
                }
            }
            mstand_to_load = false
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
            add_log("Location corrected", "gray");
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
            add_chat("", data.name + " is on " + data.server, "white")
        })
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
                ui_log("Consumed the elixir", "gray")
            } else {
                if (response == "not_ready") {
                    d_text("NOT READY", character)
                } else {
                    if (response == "no_mp") {
                        d_text("NO MP", character)
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
                                                            ui_log("Can't loot", "gray")
                                                        } else {
                                                            if (response == "transport_cant_reach") {
                                                                ui_log("Can't reach", "gray");
                                                                transporting = false
                                                            } else {
                                                                if (response == "destroyed") {
                                                                    ui_log("Destroyed " + G.items[data.name].name, "gray")
                                                                } else {
                                                                    if (response == "buy_get_closer" || response == "sell_get_closer" || response == "trade_get_closer" || response == "ecu_get_closer") {
                                                                        ui_log("Get closer", "gray")
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
                                                                                                if (response == "item_sent") {
                                                                                                    add_chat("", "Item sent", "#6AB3FF")
                                                                                                } else {
                                                                                                    if (response == "item_received") {
                                                                                                        var additional = "";
                                                                                                        if (data.q > 1) {
                                                                                                            additional = "(x" + data.q + ")"
                                                                                                        }
                                                                                                        add_chat("", "Received " + G.items[data.item].name + additional + " from " + data.name, "#6AB3FF")
                                                                                                    } else {
                                                                                                        if (response == "gold_sent") {
                                                                                                            add_chat("", "Gold sent", colors.gold)
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
                                                                                                                                    if (response == "craft_cant") {
                                                                                                                                        ui_log("Can't craft", "gray")
                                                                                                                                    } else {
                                                                                                                                        if (response == "craft_atleast2") {
                                                                                                                                            ui_log("You need to provide at least 2 items", "gray")
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
        })
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
                } else {
                    if (npc) {
                        d_text(data.type, npc, {color: colors.white_positive})
                    }
                    if (player) {
                        d_text("-$", player, {color: colors.white_negative})
                    }
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
        add_chat("", data.message, data.color || "orange")
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
        draw_trigger(function () {
            if (chests[data.id]) {
                destroy_sprite(chests[data.id]);
                delete chests[data.id];
                sfx("coins")
            }
        })
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
            var entity = get_entity(data.id);
            if (entity) {
                d_text(data.message, entity, {size: S.chat, color: "#BA6B88"})
            }
            sfx("chat");
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
                d_text(data.message, entity, {size: S.chat, color: "#5B8DB0"})
            }
            sfx("chat");
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
        eval(data.code)
    });
    socket.on("eval", function (data) {
        smart_eval(data.code, data.args)
    });
    socket.on("player", function (data) {
        if (character) {
            adopt_soft_properties(character, data), rip_logic()
        }
    });
    socket.on("player_nr", function (data) {
        if (character) {
            adopt_soft_properties(character, data), rip_logic()
        }
        reopen()
    });
    socket.on("end", function (data) {
    });
    socket.on("disconnect", function () {
        socket.destroy();
        window.socket = null;
        disconnect()
    });
    socket.on("disconnect_reason", function (reason) {
        window.disconnect_reason = reason
    });
    socket.on("hit", function (data) {
        var entity = get_entity(data.id), owner = get_entity(data.hid);
        draw_trigger(function () {
            if (owner && entity && owner != entity) {
                direction_logic(owner, entity, "attack")
            }
            if (entity && data.anim) {
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
                                    if (owner.me) {
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
                if (character_to_load) {
                    try {
                        log_in(user_id, character_to_load, user_auth)
                    } catch (e) {
                        console.log(e)
                    }
                    character_to_load = false
                }
            }
        }
        erec++;
        if (data.type == "all") {
            console.log("all entities " + new Date())
        }
        if (erec % 20 == 1) {
        }
        if (erec % 100 == 1 && window.pako) {
            window.lastentities = data;
            var rs = rough_size(data), ms;
            var cs = new Date();
            var enc = pako.deflate(msgpack.encode(data));
            ms = mssince(cs);
            console.log("entities%100 rough_size: " + rs + " enc_length: " + enc.length + " enc_in: " + ms + "ms")
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
        render_party(data.list || []);
        if (party_list.length == 0 && (data.list || []).length && !in_arr("party", cwindows)) {
            open_chat_window("party")
        }
        party_list = data.list || []
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
    })
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
        socket.emit("click", {type: "player_attack", id: this.id, button: "right"})
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
        socket.emit("click", {type: "player_heal", id: this.id, button: "right"})
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
        socket.emit("click", {type: "monster", id: this.id, button: "right"})
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
                destroy_sprite(entities[entity], "just")
            }
            delete entities[entity];
            continue
        } else {
            if (!a.drawn) {
                a.drawn = true;
                map.addChild(a)
            }
        }
        a.x = round(a.real_x);
        a.y = round(a.real_y);
        if (!round_entities_xy) {
            a.x = a.real_x
        }
        a.y = a.real_y;
        update_sprite(a)
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
function update_sprite(k) {
    if (!k || !k.stype) {
        return
    }
    for (name in (k.animations || {})) {
        update_sprite(k.animations[name])
    }
    if (k.stype == "static") {
        return
    }
    if (k.type == "character" || k.type == "monster") {
        hp_bar_logic(k);
        if (border_mode) {
            border_logic(k)
        }
    }
    if (k.type == "character" || k.type == "npc") {
        name_logic(k)
    }
    if (k.type == "character") {
        player_rclick_logic(k);
        player_effects_logic(k)
    }
    if (k.type == "character" || k.type == "monster") {
        effects_logic(k)
    }
    if (k.stype == "full") {
        var a = false, f = 1, e = 0;
        if (k.type == "monster" && G.monsters[k.mtype].aa) {
            a = true
        }
        if (k.npc && !k.moving && k.allow === true) {
            k.direction = 1
        }
        if (k.npc && !k.moving && k.allow === false) {
            k.direction = 0
        }
        if ((k.moving || a) && k.walking === null) {
            if (k.last_stop && msince(k.last_stop) < 320) {
                k.walking = k.last_walking
            } else {
                reset_ms_check(k, "walk", 350), k.walking = 1
            }
        } else {
            if (!(k.moving || a) && k.walking) {
                k.last_stop = new Date();
                k.last_walking = k.walking || k.last_walking || 1;
                k.walking = null
            }
        }
        var d = [0, 1, 2, 1], c = 350;
        if (k.mtype == "wabbit") {
            d = [0, 1, 2], c = 220
        }
        if (k.walking && ms_check(k, "walk", c - (k.speed / 2 || 0))) {
            k.walking++
        }
        if (k.direction !== undefined) {
            e = k.direction
        }
        if (!a && k.stunned) {
            f = 1
        } else {
            if (k.walking) {
                f = d[k.walking % d.length]
            } else {
                if (k.last_stop && mssince(k.last_stop) < 180) {
                    f = d[k.last_walking % d.length]
                }
            }
        }
        if (k.stand && !k.standed) {
            var b = new PIXI.Sprite(stand0_texture);
            b.y = 3;
            b.anchor.set(0.5, 1);
            k.addChild(b);
            k.standed = b;
            k.speed = 10
        } else {
            if (k.standed && !k.stand) {
                k.standed.destroy();
                k.standed = false
            }
        }
        if (k.rip && !k.rtexture) {
            k.cskin = null;
            k.rtexture = true;
            k.texture = rip_texture
        } else {
            if (!k.rip) {
                k.rtexture = false;
                set_texture(k, f, e)
            }
        }
        if (k.charging && ms_check(k, "clone", 80)) {
            disappearing_clone(k)
        }
    }
    if (k.stype == "animation") {
        var g = (k.aspeed == "slow" && 3) || 2;
        if (ms_check(k, "anim", g * 16.5)) {
            k.frame += 1
        }
        if (k.frame >= k.frames && k.continuous) {
            k.frame = 0
        } else {
            if (k.frame >= k.frames) {
                var h = k.parent;
                if (h) {
                    destroy_sprite(k, "children");
                    delete h.animations[k.skin]
                }
                return
            }
        }
        set_texture(k, k.frame)
    }
    if (k.stype == "emote") {
        var g = (k.aspeed == "slow" && 17) || (k.aspeed == "slower" && 40) || 10;
        if (k.atype == "flow") {
            if (ms_check(k, "anim", g * 16.5)) {
                k.frame += 1
            }
            set_texture(k, [0, 1, 2, 1][k.frame % 4])
        } else {
            if (ms_check(k, "anim", g * 16.5) && k.atype != "once") {
                k.frame = (k.frame + 1) % 3
            }
            set_texture(k, k.frame)
        }
    }
    update_filters(k);
    k.updates += 1
}
function add_monster(d) {
    var c = G.monsters[d.type], b = new_sprite(c.skin || d.type, "full");
    adopt_soft_properties(b, d);
    b.displayGroup = monster_layer;
    b.walking = null;
    b.animations = {};
    b.move_num = d.move_num;
    b.c = {};
    b.x = b.real_x = round(d.x);
    b.y = b.real_y = round(d.y);
    b.vx = d.vx || 0;
    b.vy = d.vy || 0;
    b.anchor.set(0.5, 1);
    b.speed = d.speed;
    b.type = "monster";
    b.mtype = d.type;
    if (c.hit) {
        b.hit = c.hit
    }
    if (c.size) {
        b.height *= c.size, b.width *= c.size, b.mscale = 2, b.hpbar_wdisp = -5
    }
    b.interactive = true;
    b.buttonMode = true;
    b.on("mousedown", monster_click).on("touchstart", monster_click).on("rightdown", monster_attack);
    if (0 && G.actual_dimensions[d.type]) {
        var e = G.actual_dimensions[d.type], a = b.anchor;
        b.hitArea = new PIXI.Rectangle(-e[0] * a.x - 2, -e[1] * a.y - 2, e[0] + 4, e[1] + 4);
        b.awidth = e[0];
        b.aheight = e[1]
    }
    return b
}
function update_filters(a) {
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
        if (a.stand || a.charging) {
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
        if (a.stand || a.charging) {
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
        if (a.stand || a.charging) {
            b.b = 1.2
        }
        b.brightness(b.b)
    }
    if (a.appearing) {
        a.alpha += 0.05;
        if (a.alpha >= 1 || mssince(a.appearing) > 900) {
            a.appearing = a.tp = false;
            a.alpha = 1;
            if (a.invis) {
                a.alpha = 0.5
            }
            stop_animation(a, "transport")
        }
    }
    if (a.disappearing) {
        if (a.alpha > 0.5) {
            a.alpha -= 0.0025
        }
    }
}
function start_filter(b, a) {
    var c = new PIXI.filters.ColorMatrixFilter();
    if (!b.filter_list) {
        b.filter_list = [c]
    } else {
        b.filter_list.push(c)
    }
    b.filters = b.filter_list;
    b["filter_" + a] = c;
    b[a] = true;
    c.step = 0.01;
    c.b = 1;
    if (a == "curse") {
        if (b.frozen) {
            c.hue(24)
        } else {
            if (b.poisoned) {
                c.hue(-24)
            } else {
                c.hue(20)
            }
        }
    }
}
function stop_filter(b, a) {
    b.filter_list.splice(b.filter_list.indexOf(b["filter_" + a]), 1);
    if (!b.filter_list.length) {
        b.filters = null
    } else {
        b.filters = b.filter_list
    }
    delete b["filter_" + a];
    delete b[a]
}
function player_effects_logic(a) {
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
    if (a.invis && (!a.invis_effect || a.alpha != 0.5)) {
        a.invis_effect = true;
        a.alpha = 0.5
    } else {
        if (!a.invis && a.invis_effect) {
            a.invis_effect = false;
            a.alpha = 1
        }
    }
    if (a.stunned && !a.stunned_effect) {
        a.stunned_effect = true;
        start_animation(a, "stunned", "stun")
    } else {
        if (!a.stunned && a.stunned_effect) {
            a.stunned_effect = false;
            stop_animation(a, "stunned")
        }
    }
    if (a.invincible && !a.invincible_effect) {
        a.invincible_effect = true;
        start_animation(a, "invincible");
        a.alpha = 0.9
    } else {
        if (!a.invincible && a.invincible_effect) {
            a.invincible_effect = false;
            stop_animation(a, "invincible");
            a.alpha = 1
        }
    }
    if (a.c.town && !a.disappearing) {
        a.disappearing = new Date();
        a.alpha = 1;
        start_animation(a, "transport")
    } else {
        if (!a.c.town && a.disappearing) {
            a.disappearing = false;
            a.alpha = 1;
            stop_animation(a, "transport")
        }
    }
    if (a.tp && !a.appearing) {
        a.appearing = new Date();
        a.alpha = 0.5;
        start_animation(a, "transport")
    }
    if (a.me && a.targets >= 3 && (!a.last_targets || a.last_targets < a.targets)) {
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
function effects_logic(a) {
    if ((a.cursed || a.poisoned || a.frozen) && !a.cursed_effect) {
        a.cursed_effect = true;
        start_filter(a, "curse")
    } else {
        if (!(a.cursed || a.poisoned || a.frozen) && a.cursed_effect) {
            a.cursed_effect = false;
            stop_filter(a, "curse")
        }
    }
}
function add_character(e, d) {
    if (log_game_events) {
        console.log("add character " + e.id)
    }
    var a = (d && manual_centering && 2) || 1;
    if (!D[e.skin]) {
        e.skin = "tf_template"
    }
    var c = new_sprite(e.skin, "full");
    if (a != 1) {
        c.scale = new PIXI.Point(a, a)
    }
    adopt_soft_properties(c, e);
    c.name = c.id;
    c.displayGroup = player_layer;
    c.walking = null;
    c.animations = {};
    c.x = round(e.x);
    c.real_x = parseFloat(e.x);
    c.y = round(e.y);
    c.real_y = parseFloat(e.y);
    c.anchor.set(0.5, 1);
    c.type = "character";
    c.me = d;
    if (e.npc && G.npcs[e.npc] && G.npcs[e.npc].role == "citizen") {
        c.citizen = true
    }
    c.awidth = c.width / a;
    c.aheight = c.height / a;
    if (!(d && manual_centering)) {
        c.interactive = true;
        c.on("mousedown", player_click).on("touchstart", player_click);
        if (!d && pvp) {
            c.cursor = "crosshair"
        }
    }
    if (manual_centering && 0) {
        var f = [c.awidth, c.aheight], b = c.anchor;
        c.hitArea = new PIXI.Rectangle(-f[0] * b.x - 2, -f[1] * b.y - 2, f[0] + 4, f[1] + 4)
    }
    return c
}
function add_chest(c) {
    var a = new_sprite(c.chest, "chest");
    a.displayGroup = chest_layer;
    a.x = round(c.x);
    a.y = round(c.y);
    a.items = c.items;
    a.anchor.set(0.5, 1);
    a.type = "chest";
    a.interactive = true;
    a.buttonMode = true;
    a.cursor = "help";
    var b = function () {
        socket.emit("open_chest", {id: c.id})
    };
    a.on("mousedown", b).on("touchstart", b).on("rightdown", b);
    chests[c.id] = a;
    map.addChild(a)
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
    var e;
    if (d.type == "static") {
        e = new_sprite(d.skin, "static")
    } else {
        if (d.type == "fullstatic") {
            e = new_sprite(d.skin, "full")
        } else {
            e = new_sprite(d.skin, "emote")
        }
    }
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
    e.anchor.set(0.5, 1);
    e.type = "npc";
    e.npc = true;
    e.animations = {};
    adopt_soft_properties(e, d);
    if (e.stype == "emote") {
        var h = [26, 35], b = e.anchor;
        e.hitArea = new PIXI.Rectangle(-h[0] * b.x - 2, -h[1] * b.y - 2, h[0] + 4, h[1] + 4);
        e.awidth = h[0];
        e.aheight = h[1];
        if (d.atype) {
            e.atype = d.atype;
            e.frame = e.stopframe || e.frame
        }
    }
    function f(j) {
        last_npc_right_click = new Date();
        $("#topleftcornerdialog").html("");
        if (!d.color && current_map == "main") {
            d.color = colors.npc_white
        }
        if (this.role != "shrine" && this.role != "compound" && this.role != "blocker") {
            d_text(d.says || "Yes", this, {color: d.color})
        }
        if (this.role == "blocker") {
            socket.emit("blocker", {type: "pvp"})
        }
        if (this.role == "merchant") {
            render_merchant(this);
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
        if (this.role == "shrine") {
            render_upgrade_shrine()
        }
        if (this.role == "newupgrade") {
            render_interaction("newupgrade")
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
        if (this.role == "seashells") {
            render_interaction("seashells")
        }
        if (this.role == "mistletoe") {
            render_interaction("mistletoe")
        }
        if (this.role == "ornaments") {
            render_interaction("ornaments")
        }
        if (this.role == "leathers") {
            render_interaction("leathers")
        }
        if (this.role == "lostearring") {
            render_interaction("lostearring")
        }
        if (this.role == "santa") {
            render_interaction("santa")
        }
        if (this.role == "tavern") {
            render_interaction("tavern")
        }
        if (this.role == "gemfragments") {
            render_interaction("gemfragments")
        }
        if (this.role == "standmerchant") {
            render_interaction("standmerchant")
        }
        if (this.role == "craft") {
            render_crafter()
        }
        if (this.role == "thesearch" && gameplay == "hardcore") {
            render_interaction("hardcoretp")
        }
        if (this.stype == "full") {
            direction_logic(this, character, "npc")
        }
        try {
            if (j) {
                j.stopPropagation()
            }
        } catch (k) {
        }
    }

    e.on("mousedown", f).on("touchstart", f).on("rightdown", f);
    e.onrclick = f;
    return e
}
function add_door(b) {
    var c = new PIXI.Sprite();
    c.displayGroup = player_layer;
    c.interactive = true;
    c.buttonMode = true;
    c.x = round(b[0]);
    c.y = round(b[1]);
    c.hitArea = new PIXI.Rectangle(0, 0, round(b[2]), round(b[3]));
    c.type = "door";
    function a() {
        if (distance(character, {x: b[0] + b[2] / 2, y: b[1] + b[3] / 2}) > 100) {
            add_log("Get closer", "gray");
            return
        }
        socket.emit("transport", {to: b[4], s: b[5]})
    }

    if (is_mobile) {
        c.on("mousedown", a).on("touchstart", a)
    }
    c.on("rightdown", a);
    c.onrclick = a;
    return c
}
function add_quirk(c) {
    var a = new PIXI.Sprite();
    a.displayGroup = player_layer;
    a.interactive = true;
    a.buttonMode = true;
    if (c[4] != "upgrade" && c[4] != "compound") {
        a.cursor = "help"
    }
    a.x = round(c[0]);
    a.y = round(c[1]);
    a.hitArea = new PIXI.Rectangle(0, 0, round(c[2]), round(c[3]));
    a.type = "quirk";
    function b(d) {
        if (c[4] == "sign") {
            add_log('Sign reads: "' + c[5] + '"', "gray")
        } else {
            if (c[4] == "note") {
                add_log('Note reads: "' + c[5] + '"', "gray")
            } else {
                if (c[4] == "log") {
                    add_log(c[5], "gray")
                } else {
                    if (c[4] == "upgrade") {
                        render_upgrade_shrine()
                    } else {
                        if (c[4] == "compound") {
                            render_compound_shrine()
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

    if (is_mobile || in_arr(c[4], ["upgrade", "compound"])) {
        a.on("mousedown", b).on("touchstart", b)
    }
    a.on("rightdown", b);
    return a
}
function add_animatable(a, b) {
    var c = new_sprite(b.position, "animatable");
    c.x = b.x;
    c.y = b.y;
    c.anchor.set(0.5, 1);
    c.type = "animatable";
    return c
}
function create_map() {
    if (window.map) {
        if (window.inner_stage) {
            inner_stage.removeChild(window.map)
        } else {
            stage.removeChild(window.map)
        }
        free_children(map);
        map.destroy();
        map_entities.forEach(function (a) {
            a.destroy({children: true})
        });
        if (dtile) {
            dtile.destroy(), dtile = null
        }
        if (tiles) {
            tiles.destroy(), tiles = null
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
    }
    map_npcs = [];
    map_doors = [];
    map_tiles = [];
    map_entities = [];
    water_tiles = [];
    entities = {};
    if (!tile_sprites[current_map]) {
        tile_sprites[current_map] = {}, sprite_last[current_map] = []
    }
    dtile_size = M["default"] && M["default"][3];
    if (dtile_size && is_array(dtile_size)) {
        dtile_size = dtile_size[0]
    }
    map = new PIXI.Container();
    pvp = G.maps[current_map].pvp || is_pvp;
    map.real_x = 0;
    map.real_y = 0;
    if (first_coords) {
        first_coords = false;
        map.real_x = first_x;
        map.real_y = first_y
    }
    map.speed = 80;
    map.hitArea = new PIXI.Rectangle(-20000, -20000, 40000, 40000);
    if (scale) {
        map.scale = new PIXI.Point(scale, scale)
    }
    map.interactive = true;
    map.on("mousedown", map_click).on("mouseup", map_click_release).on("mouseupoutside", map_click_release).on("touchstart", map_click).on("touchend", map_click_release).on("touchendoutside", map_click_release);
    if (window.inner_stage) {
        inner_stage.addChild(map)
    } else {
        stage.addChild(map)
    }
    if (G.maps[current_map].filter == "halloween") {
        var g = new PIXI.filters.ColorMatrixFilter();
        g.saturate(-0.1);
        stage.filters = [g]
    }
    if (cached_map) {
        for (var A = 0; A <= M.tiles.length; A++) {
            if (A == M.tiles.length) {
                element = M["default"]
            } else {
                element = M.tiles[A]
            }
            sprite_last[current_map][A] = 0;
            if (!tile_sprites[current_map][A]) {
                tile_sprites[current_map][A] = [];
                if (!element) {
                    continue
                }
                if (element[3].length) {
                    element[4] = element[3][1], element[3] = element[3][0]
                } else {
                    if (element[4] === undefined) {
                        element[4] = element[3]
                    }
                }
                var J = new PIXI.Rectangle(element[1], element[2], element[3], element[4]);
                var r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                element[5] = r;
                if (element[0] == "water") {
                    element[5].type = "water";
                    J = new PIXI.Rectangle(element[1] + 48, element[2], element[3], element[4]);
                    r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                    element[6] = r;
                    J = new PIXI.Rectangle(element[1] + 48 + 48, element[2], element[3], element[4]);
                    r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                    element[7] = r
                }
                if (element[0] == "puzzle" || element[0] == "custom_a") {
                    element[5].type = "water";
                    J = new PIXI.Rectangle(element[1] + 16, element[2], element[3], element[4]);
                    r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                    element[6] = r;
                    J = new PIXI.Rectangle(element[1] + 16 + 16, element[2], element[3], element[4]);
                    r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                    element[7] = r
                }
            }
        }
        window.rtextures = [0, 0, 0];
        window.dtextures = [0, 0, 0];
        if (dtile_size) {
            recreate_dtextures()
        }
        var K = [new PIXI.Container(), new PIXI.Container(), new PIXI.Container()];
        var I = 0, H = 0;
        for (var c = 0; c < 3; c++) {
            rtextures[c] = PIXI.RenderTexture.create(M.max_x - M.min_x, M.max_y - M.min_y, PIXI.SCALE_MODES.NEAREST, 1);
            for (var A = 0; A < M.placements.length; A++) {
                var L = M.placements[A];
                if (L[3] === undefined) {
                    var q = M.tiles[L[0]], f = q[3], B = q[4];
                    if (sprite_last[current_map][L[0]] >= tile_sprites[current_map][L[0]].length) {
                        tile_sprites[current_map][L[0]][sprite_last[current_map][L[0]]] = new_map_tile(q)
                    }
                    var k = tile_sprites[current_map][L[0]][sprite_last[current_map][L[0]]++];
                    if (k.textures) {
                        k.texture = k.textures[c]
                    }
                    k.x = L[1] - M.min_x;
                    k.y = L[2] - M.min_y;
                    K[c].addChild(k)
                } else {
                    var q = M.tiles[L[0]], f = q[3], B = q[4];
                    if (abs(((L[3] - L[1]) / f + 1) * ((L[4] - L[2]) / B + 1)) > 3) {
                        var r = q[5];
                        if (q.length == 8) {
                            r = q[5 + c]
                        }
                        var k = new PIXI.extras.TilingSprite(r, L[3] - L[1] + f, L[4] - L[2] + B);
                        k.x = L[1] - M.min_x;
                        k.y = L[2] - M.min_y;
                        K[c].addChild(k);
                        I++
                    } else {
                        H++;
                        for (var e = L[1]; e <= L[3]; e += f) {
                            for (var d = L[2]; d <= L[4]; d += B) {
                                if (sprite_last[current_map][L[0]] >= tile_sprites[current_map][L[0]].length) {
                                    tile_sprites[current_map][L[0]][sprite_last[current_map][L[0]]] = new_map_tile(q)
                                }
                                var k = tile_sprites[current_map][L[0]][sprite_last[current_map][L[0]]++];
                                if (k.textures) {
                                    k.texture = k.textures[c]
                                }
                                k.x = e - M.min_x;
                                k.y = d - M.min_y;
                                K[c].addChild(k)
                            }
                        }
                    }
                }
            }
            K[c].x = 0;
            K[c].y = 0;
            renderer.render(K[c], rtextures[c]);
            if (!mode.destroy_tiles) {
                K[c].destroy()
            }
        }
        console.log("a: " + I + " b: " + H);
        if (dtile_size) {
            window.dtile = new PIXI.Sprite(dtextures[1]), dtile.x = -500, dtile.y = -500
        }
        window.tiles = new PIXI.Sprite(rtextures[0]);
        tiles.x = M.min_x;
        tiles.y = M.min_y;
        if (dtile_size) {
            map.addChild(dtile)
        }
        map.addChild(tiles);
        if (mode.destroy_tiles) {
            for (var A = 0; A < 3; A++) {
                K[A].destroy()
            }
            for (var A = 0; A <= M.tiles.length; A++) {
                for (var v = 0; v < tile_sprites[current_map][A].length; v++) {
                    tile_sprites[current_map][A][v].destroy()
                }
                tile_sprites[current_map][A] = null
            }
        }
    } else {
        for (var A = 0; A <= M.tiles.length; A++) {
            if (A == M.tiles.length) {
                element = M["default"]
            } else {
                element = M.tiles[A]
            }
            sprite_last[current_map][A] = 0;
            if (!tile_sprites[current_map][A]) {
                tile_sprites[current_map][A] = [];
                if (!element) {
                    continue
                }
                if (element[3].length) {
                    element[4] = element[3][1], element[3] = element[3][0]
                } else {
                    element[4] = element[3]
                }
                var J = new PIXI.Rectangle(element[1], element[2], element[3], element[4]);
                var r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                element[5] = r;
                if (element[0] == "water") {
                    element[5].type = "water";
                    J = new PIXI.Rectangle(element[1] + 48, element[2], element[3], element[4]);
                    r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                    element[6] = r;
                    J = new PIXI.Rectangle(element[1] + 48 + 48, element[2], element[3], element[4]);
                    r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                    element[7] = r
                }
                if (element[0] == "puzzle" || element[0] == "custom_a") {
                    element[5].type = "water";
                    J = new PIXI.Rectangle(element[1] + 16, element[2], element[3], element[4]);
                    r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                    element[6] = r;
                    J = new PIXI.Rectangle(element[1] + 16 + 16, element[2], element[3], element[4]);
                    r = new PIXI.Texture(C[G.tilesets[element[0]]], J);
                    element[7] = r
                }
                tile_sprites[current_map][A][sprite_last[current_map][A]] = new_map_tile(element)
            }
        }
    }
    if (M.groups) {
        for (var t = 0; t < M.groups.length; t++) {
            if (!M.groups[t].length) {
                continue
            }
            var n = new PIXI.Container();
            n.type = "group";
            var m = 999999999, o = 99999999, E = -999999999;
            for (var A = 0; A < M.groups[t].length; A++) {
                var L = M.groups[t][A], q = M.tiles[L[0]];
                if (L[1] < o) {
                    o = L[1]
                }
                if (L[2] < m) {
                    m = L[2]
                }
                if (L[2] + q[4] > E) {
                    E = L[2] + q[4]
                }
            }
            for (var A = 0; A < M.groups[t].length; A++) {
                var L = M.groups[t][A];
                var k = new PIXI.Sprite(M.tiles[L[0]][5]);
                k.x = L[1] - o;
                k.y = L[2] - m;
                if (L[2] < m) {
                    m = L[2]
                }
                n.addChild(k)
            }
            n.x = o;
            n.y = m;
            n.real_x = o;
            n.real_y = E;
            n.displayGroup = player_layer;
            map.addChild(n);
            map_entities.push(n)
        }
    }
    map_info = G.maps[current_map];
    npcs = map_info.npcs;
    for (var A = 0; A < npcs.length; A++) {
        var F = npcs[A], q = G.npcs[F.id];
        if (q.type == "full" || q.role == "citizen") {
            continue
        }
        console.log("NPC: " + F.id);
        var l = add_npc(q, F.position, F.name, F.id);
        map.addChild(l);
        map_npcs.push(l);
        map_entities.push(l)
    }
    doors = map_info.doors || [];
    for (var A = 0; A < doors.length; A++) {
        var u = doors[A];
        var l = add_door(u);
        console.log("Door: " + u);
        map.addChild(l);
        map_doors.push(l);
        map_entities.push(l)
    }
    quirks = map_info.quirks || [];
    for (var A = 0; A < quirks.length; A++) {
        var z = quirks[A];
        var l = add_quirk(z);
        console.log("Quirk: " + z);
        map.addChild(l);
        map_entities.push(l)
    }
    console.log("Map created: " + current_map);
    animatables = {};
    for (var s in map_info.animatables || {}) {
        animatables[s] = add_animatable(s, map_info.animatables[s]);
        map.addChild(animatables[s]);
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
            map.removeChildren(map.children.indexOf(map_tiles[0]), map.children.indexOf(map_tiles[map_tiles.length - 1]))
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
        if (M["default"]) {
            if (!window.default_tiling) {
                default_tiling = new PIXI.extras.TilingSprite(M["default"][5], floor((B - k) / 32) * 32 + 32, floor((A - g) / 32) * 32 + 32)
            }
            default_tiling.x = floor(k / M["default"][3]) * M["default"][3];
            default_tiling.y = floor(g / M["default"][4]) * M["default"][4];
            default_tiling.textures = [M["default"][5], M["default"][6], M["default"][7]];
            map.addChild(default_tiling);
            map_tiles.push(default_tiling)
        }
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
function calculate_fps() {
    if (mode.dom_tests_pixi || inside == "payments") {
        return
    }
    frames += 1;
    if (!last_count) {
        last_count = new Date(), last_frame = frames, frequency = 500
    }
    if (mssince(last_count) >= frequency) {
        last_count = new Date(), fps = (frames - last_frame) * (1000 / frequency), last_frame = frames
    }
    fps_counter.text = "" + round(fps);
    fps_counter.position.set(width - 340, height)
}
function load_game(a) {
    loader.load(function (m, c) {
        if (mode_nearest) {
            for (file in PIXI.utils.BaseTextureCache) {
                PIXI.utils.BaseTextureCache[file].scaleMode = PIXI.SCALE_MODES.NEAREST
            }
        }
        for (name in G.sprites) {
            var f = G.sprites[name];
            if (f.skip) {
                continue
            }
            var d = 4, k = "full";
            if (f.type == "animation") {
                d = 1, k = "animation"
            }
            var l = f.matrix;
            var b = C[f.file].width / (f.columns * 3);
            var n = C[f.file].height / (f.rows * d);
            for (var g = 0; g < l.length; g++) {
                for (var e = 0; e < l[g].length; e++) {
                    if (!l[g][e]) {
                        continue
                    }
                    FC[l[g][e]] = f.file;
                    D[l[g][e]] = [e * 3 * b, g * d * n, b, n];
                    T[l[g][e]] = k
                }
            }
        }
        var h = G.positions.stone;
        rip_texture = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[h[0]]], new PIXI.Rectangle(h[1], h[2], h[3], h[4]));
        var h = G.positions.stand0t;
        stand0_texture = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[h[0]]], new PIXI.Rectangle(h[1], h[2], h[3], h[4]));
        create_map();
        for (name in G.animations) {
            generate_textures(name, "animation")
        }
        if (!mode.dom_tests_pixi && inside != "payments") {
            fps_counter = new PIXI.Text("0", {fontFamily: "Arial", fontSize: 32, fill: "green"});
            fps_counter.position.set(10, 10);
            fps_counter.anchor.set(1, 1);
            fps_counter.displayGroup = chest_layer;
            fps_counter.zOrder = -999999999;
            if (window.inner_stage) {
                inner_stage.addChild(fps_counter)
            } else {
                stage.addChild(fps_counter)
            }
        }
        draw();
        game_loaded = true;
        if (inside != "payments") {
            socket.emit("loaded", {success: 1, width: screen.width, height: screen.height, scale: scale})
        }
    })
}
var stop_rendering = false;
function draw(a, b) {
    if (manual_stop) {
        return
    }
    draws++;
    if (window.last_draw) {
        frame_ms = mssince(last_draw)
    }
    last_draw = new Date();
    start_timer("draw");
    draw_timeouts_logic(2);
    stop_timer("draw", "timeouts");
    calculate_fps();
    if (!(character && mouse_only) && 0) {
        var e = map.speed;
        if (character) {
            e = character.speed
        }
        e *= frame_ms / 1000;
        if ((left_pressed || right_pressed) && (down_pressed || up_pressed)) {
            e /= 1.41
        }
        if (left_pressed < right_pressed) {
            map.real_x += e
        }
        if (left_pressed > right_pressed) {
            map.real_x -= e
        }
        if (up_pressed < down_pressed) {
            map.real_y += e
        }
        if (up_pressed > down_pressed) {
            map.real_y -= e
        }
    }
    process_entities();
    future_entities = {players: {}, monsters: {}};
    stop_timer("draw", "entities");
    if (gtest && character) {
        map.real_x -= 0.1, map.real_y -= 0.001
    }
    var d = frame_ms;
    if (d > (is_sdk && 40 || 10000)) {
        console.log("cframe_ms is " + d)
    }
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
        for (i in entities) {
            entity = entities[i];
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
    retile_the_map();
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
    tint_logic();
    draw_timeouts_logic();
    stop_timer("draw", "before_render");
    if (!b && !is_hidden() && !stop_rendering) {
        renderer.render(stage)
    }
    stop_timer("draw", "after_render");
    if (!b) {
        requestAnimationFrame(draw)
    }
};