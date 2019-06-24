var auto_api_methods = [], base_url = "http://adventure.land";
var sounds = {};
var draw_timeouts = []
    , timers = {}
    , pingts = {}
    , pings = []
    , modal_count = 0
    , last_ping = new Date();
var DTM = 1;
var DMS = 32;
var ping_sent;
function is_hidden() {
    return false
}

var last_id_sent = "";

function send_target_logic() {
    if (ctarget && last_id_sent != ctarget.id) {
        last_id_sent = ctarget.id;
        socket.emit("target", {
            id: ctarget.id
        })
    }
    if (!ctarget && last_id_sent) {
        last_id_sent = "";
        socket.emit("target", {
            id: ""
        })
    }
}

function is_npc(a) {
    if (a && (a.npc || a.type == "npc")) {
        return true
    }
}

function is_monster(a) {
    if (a && a.type == "monster") {
        return true
    }
}

function is_player(a) {
    if (a && a.type == "character" && !a.npc) {
        return true
    }
}

function is_character(a) {
    return is_player(a)
}

function cfocus(a) {
    var b = $(a);
    if (!$(a + ":focus").length) {
        b.focus()
    }
    b.html(b.html())
}

setInterval(function () {
    if (ssince(last_ping) > 15) {
        if (socket) {
            ping(true)
        }
    }
}, 16000);

function push_ping(a) {
    pings.push(a);
    if (pings.length > 40) {
        pings.shift()
    }
    if (character) {
        character.ping = 0;
        pings.forEach(function (b) {
            character.ping += b / pings.length
        })
    }
}

function ping(a) {
    ping_sent = new Date();
    var b = {
        id: randomStr(5)
    };
    pingts[b.id] = new Date();
    if (!a) {
        b.ui = true
    }
    socket.emit("ping_trig", b)
}

function reset_ms_check(c, b, a) {
    c["ms_" + b] = null
}

function ms_check(c, b, a) {
    if (!c["ms_" + b]) {
        c["ms_" + b] = new Date();
        return 0
    }
    if (c["ms_" + b] && mssince(c["ms_" + b]) < a) {
        return 0
    }
    c["ms_" + b] = new Date();
    return 1
}

function cached(d, c, b, a) {
    if (!GCACHED) {
        GCACHED = {}
    }
    if (b) {
        c += "|_" + b
    }
    if (a) {
        c += "|_" + a
    }
    if (GCACHED[d] == c) {
        return true
    }
    GCACHED[d] = c;
    return false
}

function preview_all(c) {

}

function disappearing_clone(d, b) {

}

function fade_out_blink(b, a) {
    return function () {

    }
}

function fade_out_magiport(b, a) {
    return function () {
    }
}

function fade_away_teleport(b, a) {
    return function () {
    }
}

function fade_away(b, a) {
    return function () {
    }
}

function fade_out_magiport(b, a) {
    return function () {
    }
}

function booster_modal_logic() {
}

var snip_wl_code = 'map_key("Q","snippet","smart_move(\'winterland\')");\n//Press Q in the Game to test this, after you EXECUTE!';
var snip_esc_code = "map_key(\"ESC\",{name:\"eval\",code:\"use_skill('stop'); esc_pressed();\",skin:G.skills.stop.skin});\n//Overrides ESC, adds stopping, overrides the 'eval' icon with the 'stop' icon";

function keymap_modal_logic() {
}

function show_game_guide() {
}

function show_shells_info() {
}

function show_credits() {
}

function show_terms() {
}

function show_privacy() {
}

function show_opensource_info() {
}

function hide_modal() {

}

function hide_modals() {
    while (modal_count) {
        hide_modal()
    }
}

function show_modal(f, a) {

}

function position_modals() {

}

function show_json(a) {
    return;
    if (!is_string(a)) {
        a = safe_stringify(a, 2)
    }
    show_modal("<div style='font-size: 24px; white-space: pre;' class='yesselect'>" + syntax_highlight(a) + "</div>")
}

function json_to_html(a) {
    return;
    if (!is_string(a)) {
        a = safe_stringify(a, 2)
    }
    return "<div style='font-size: 24px; white-space: pre;' class='yesselect'>" + syntax_highlight(a) + "</div>"
}

function add_frequest(a) {
    call_code_function("on_friend_request", a)
}

function add_invite(a) {
    call_code_function("on_party_invite", a)
}

function add_request(a) {
    call_code_function("on_party_request", a)
}

function add_frequest(a) {
    call_code_function("on_party_request", a)
}

function add_update_notes() {
    /*update_notes.forEach(function (b) {
        var a = "gray";
        if (b.indexOf("Hardcore!") != -1) {
            a = "#C01626"
        }
        add_log(b, a)
    })*/
}

var game_logs = []
    , game_chats = [];

function clear_game_logs() {
    game_logs = [];
}

function add_log(c, a) {
    console.log(c);
}

function add_xmas_log() {

}

function add_greenlight_log() {

}

function add_chat(c, o, g, b) {
    console.log(c, o, g, b)
}

function cpm_window(a) {

}

function add_pmchat(g, a, d) {
    console.log("party: " + g + " :", a, d)
}

function add_partychat(a, d) {
    console.log("party: " + a + ": " + d);
}

function refresh_page() {
    return;
}

function item_position(a) {
    for (var b = 41; b >= 0; b--) {
        if (character.items[b] && character.items[b].name == a) {
            return b
        }
    }
    return undefined
}

function can_use(a) {
    if (!next_skill[a] || (new Date()) > next_skill[a]) {
        return true
    }
    return false
}

function send_code_message(b, a) {
    if (!is_array(b)) {
        b = [b]
    }
    socket.emit("cm", {
        to: b,
        message: JSON.stringify(a)
    })
}

function get_nearby_hostiles(a) {
    var d = [];
    if (!a) {
        a = {}
    }
    if (!a.range) {
        a.range = character && character.range || 12000
    }
    if (!a.limit) {
        a.limit = 12
    }
    for (id in parent.entities) {
        var b = parent.entities[id];
        if (b.rip || b.invincible || b.npc) {
            continue
        }
        if (b.party && character.party == b.party) {
            continue
        }
        if (b.guild && character.guild == b.guild) {
            continue
        }
        if (b.type == "character" && !(is_pvp || G.maps[character.map].pvp)) {
            continue
        }
        if (in_arr(b.owner, parent.friends)) {
            continue
        }
        var c = parent.distance(character, b);
        if (c < a.range && d.length < a.limit) {
            d.push(b),
                b.c_dist = c
        }
    }
    d.sort(function (g, f) {
        return (g.c_dist > f.c_dist) ? 1 : ((f.c_dist > g.c_dist) ? -1 : 0)
    });
    return d
}

var input_onclicks = [];

function get_input(b) {

}

function show_confirm(d, b, c, a) {
}

function use_skill(b, h, k) {
    if (h && h.id) {
        h = h.id
    }
    if (b == "use_hp" || b == "hp") {
        use("hp")
    } else {
        if (b == "use_mp" || b == "mp") {
            use("mp")
        } else {
            if (b == "stop") {
                move(character.real_x, character.real_y + 0.00001);
                socket.emit("stop");
                code_eval_if_r("smart.moving=false")
            } else {
                if (b == "use_town" || b == "town") {
                    if (character.rip) {
                        socket.emit("respawn")
                    } else {
                        socket.emit("town")
                    }
                } else {
                    if (b == "cburst") {
                        if (is_array(h)) {
                            socket.emit("skill", {
                                name: "cburst",
                                targets: h
                            })
                        } else {
                            var g = get_nearby_hostiles({
                                range: character.range - 2,
                                limit: 12
                            })
                                , f = []
                                , c = character.mp - 200
                                , j = parseInt(c / g.length);
                            g.forEach(function (l) {
                                f.push([l.id, j])
                            });
                            socket.emit("skill", {
                                name: "cburst",
                                targets: f
                            })
                        }
                    } else {
                        if (b == "3shot") {
                            if (is_array(h)) {
                                socket.emit("skill", {
                                    name: "3shot",
                                    ids: h
                                })
                            } else {
                                var g = get_nearby_hostiles({
                                    range: character.range - 2,
                                    limit: 3
                                })
                                    , a = [];
                                g.forEach(function (l) {
                                    a.push(l.id)
                                });
                                socket.emit("skill", {
                                    name: "3shot",
                                    ids: a
                                })
                            }
                        } else {
                            if (b == "5shot") {
                                if (is_array(h)) {
                                    socket.emit("skill", {
                                        name: "5shot",
                                        ids: h
                                    })
                                } else {
                                    var g = get_nearby_hostiles({
                                        range: character.range - 2,
                                        limit: 5
                                    })
                                        , a = [];
                                    g.forEach(function (l) {
                                        a.push(l.id)
                                    });
                                    socket.emit("skill", {
                                        name: "5shot",
                                        ids: a
                                    })
                                }
                            } else {
                                if (in_arr(b, ["invis", "partyheal", "darkblessing", "agitate", "cleave", "stomp", "charge", "light", "hardshell", "track", "warcry", "mcourage", "scare"])) {
                                    socket.emit("skill", {
                                        name: b
                                    })
                                } else {
                                    if (in_arr(b, ["supershot", "quickpunch", "quickstab", "taunt", "curse", "burst", "4fingers", "magiport", "absorb", "mluck", "rspeed", "charm", "mentalburst", "piercingshot", "huntersmark"])) {
                                        socket.emit("skill", {
                                            name: b,
                                            id: h
                                        })
                                    } else {
                                        if (b == "pcoat") {
                                            var d = item_position("poison");
                                            if (d === undefined) {
                                                add_log("You don't have a poison sack", "gray");
                                                return
                                            }
                                            socket.emit("skill", {
                                                name: "pcoat",
                                                num: d
                                            })
                                        } else {
                                            if (b == "revive") {
                                                var d = item_position("essenceoflife");
                                                if (d === undefined) {
                                                    add_log("You don't have an essence", "gray");
                                                    return
                                                }
                                                socket.emit("skill", {
                                                    name: "revive",
                                                    num: d,
                                                    id: h
                                                })
                                            } else {
                                                if (b == "poisonarrow") {
                                                    var d = item_position("poison");
                                                    if (d === undefined) {
                                                        add_log("You don't have a poison sack", "gray");
                                                        return
                                                    }
                                                    socket.emit("skill", {
                                                        name: "poisonarrow",
                                                        num: d,
                                                        id: h
                                                    })
                                                } else {
                                                    if (b == "shadowstrike" || b == "phaseout") {
                                                        var d = item_position("shadowstone");
                                                        if (d === undefined) {
                                                            add_log("You don't have any shadow stones", "gray");
                                                            return
                                                        }
                                                        socket.emit("skill", {
                                                            name: b,
                                                            num: d
                                                        })
                                                    } else {
                                                        if (b == "throw") {
                                                            if (!character.items[k]) {
                                                                add_log("Inventory slot is empty", "gray");
                                                                return
                                                            }
                                                            socket.emit("skill", {
                                                                name: b,
                                                                num: k,
                                                                id: h
                                                            })
                                                        } else {
                                                            if (b == "blink") {
                                                                socket.emit("skill", {
                                                                    name: "blink",
                                                                    x: h[0],
                                                                    y: h[1]
                                                                })
                                                            } else {
                                                                if (b == "energize") {
                                                                    socket.emit("skill", {
                                                                        name: "energize",
                                                                        id: h,
                                                                        mana: k
                                                                    })
                                                                } else {
                                                                    if (b == "stack") {
                                                                        on_skill("attack")
                                                                    } else {
                                                                        add_log("Skill not found: " + b, "gray")
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

function on_skill(d, h) {
    var a = keymap[d]
        , c = a && a.name || a;
    if (!a) {
        return
    }
    if (a.type == "item") {
        var b = -1;
        for (i = character.items.length - 1; i >= 0; i--) {
            if (character.items[i] && character.items[i].name == a.name) {
                b = i;
                break
            }
        }
        if (b >= 0) {
            var g = character.items[b];
            if (G.items[g.name].type == "stand") {
                if (character.stand) {
                    socket.emit("merchant", {
                        close: 1
                    })
                } else {
                    socket.emit("merchant", {
                        num: b
                    })
                }
            } else {
                socket.emit("equip", {
                    num: b
                })
            }
        } else {
            add_log("Item not found", "gray")
        }
    } else {
        if (c == "attack") {
            if (ctarget && ctarget.id) {
                socket.emit("attack", {
                    id: ctarget.id
                })
            } else {
                add_log("No target", "gray")
            }
        } else {
            if (c == "heal") {
                if (ctarget && ctarget.id) {
                    socket.emit("heal", {
                        id: ctarget.id
                    })
                } else {
                    add_log("No target", "gray")
                }
            } else {
                if (c == "blink") {
                    if (h) {
                        blink_pressed = true
                    }
                    last_blink_pressed = new Date()
                } else {
                    if (c == "move_up") {
                        arrow_up = true;
                        next_minteraction = "up";
                        setTimeout(arrow_movement_logic, 40)
                    } else {
                        if (c == "move_down") {
                            arrow_down = true;
                            next_minteraction = "down";
                            setTimeout(arrow_movement_logic, 40)
                        } else {
                            if (c == "move_left") {
                                arrow_left = true;
                                next_minteraction = "left";
                                setTimeout(arrow_movement_logic, 40)
                            } else {
                                if (c == "move_right") {
                                    arrow_right = true;
                                    next_minteraction = "right";
                                    setTimeout(arrow_movement_logic, 40)
                                } else {
                                    if (c == "esc") {
                                        esc_pressed()
                                    } else {
                                        if (c == "travel") {
                                            render_travel()
                                        } else {
                                            if (c == "gm") {
                                                var f = [];
                                                hide_modal();
                                                f.push({
                                                    button: "Travel",
                                                    onclick: function () {

                                                    }
                                                });
                                                f.push({
                                                    button: "P Jump",
                                                    onclick: function () {
                                                        socket.emit("gm", {
                                                            action: "jump_list"
                                                        })
                                                    }
                                                });
                                                f.push({
                                                    button: "M Jump",
                                                    onclick: function () {

                                                    }
                                                });
                                                f.push({
                                                    button: "Invincible",
                                                    onclick: function () {
                                                        socket.emit("gm", {
                                                            action: "invincible"
                                                        });
                                                        hide_modal()
                                                    }
                                                });
                                                f.push({
                                                    button: "Mute",
                                                    onclick: function () {
                                                        hide_modal();
                                                        get_input({
                                                            button: "Mute",
                                                            onclick: function () {
                                                                socket.emit("gm", {
                                                                    action: "mute",
                                                                    id: $(".mglocx").val()
                                                                });
                                                                hide_modal()
                                                            },
                                                            input: "mglocx",
                                                            placeholder: "Name",
                                                            title: "Character"
                                                        })
                                                    }
                                                });
                                                f.push({
                                                    button: "Jail",
                                                    onclick: function () {
                                                        hide_modal();
                                                        get_input({
                                                            button: "Jail",
                                                            onclick: function () {
                                                                socket.emit("gm", {
                                                                    action: "jail",
                                                                    id: $(".mglocx").val()
                                                                });
                                                                hide_modal()
                                                            },
                                                            input: "mglocx",
                                                            placeholder: "Name",
                                                            title: "Character"
                                                        })
                                                    }
                                                });
                                                f.push({
                                                    button: "Ban",
                                                    onclick: function () {
                                                        hide_modal();
                                                        get_input({
                                                            button: "Ban",
                                                            onclick: function () {
                                                                socket.emit("gm", {
                                                                    action: "ban",
                                                                    id: $(".mglocx").val()
                                                                });
                                                                hide_modal()
                                                            },
                                                            input: "mglocx",
                                                            placeholder: "Name",
                                                            title: "Character"
                                                        })
                                                    }
                                                });
                                                get_input({
                                                    no_wrap: true,
                                                    elements: f
                                                })
                                            } else {
                                                if (c == "interact") {
                                                    npc_focus()
                                                } else {
                                                    if (c == "toggle_inventory") {
                                                        render_inventory()
                                                    } else {
                                                        if (c == "toggle_character") {
                                                            toggle_character()
                                                        } else {
                                                            if (c == "toggle_stats") {
                                                                toggle_stats()
                                                            } else {
                                                                if (c == "open_snippet") {
                                                                    show_snippet()
                                                                } else {
                                                                    if (c == "toggle_run_code") {
                                                                        toggle_runner()
                                                                    } else {
                                                                        if (c == "toggle_code") {
                                                                            toggle_code();
                                                                            if (code) {
                                                                                setTimeout(function () {
                                                                                    try {
                                                                                        codemirror_render.focus()
                                                                                    } catch (j) {
                                                                                    }
                                                                                }, 1)
                                                                            }
                                                                        } else {
                                                                            if (c == "snippet") {
                                                                                code_eval(a.code)
                                                                            } else {
                                                                                if (c == "eval" || c == "pure_eval") {
                                                                                    smart_eval(a.code)
                                                                                } else {
                                                                                    if (c == "magiport") {
                                                                                        get_input({
                                                                                            small: true,
                                                                                            button: "Engage",
                                                                                            onclick: function () {
                                                                                                use_skill("magiport", $(".mglocx").val());
                                                                                                hide_modal()
                                                                                            },
                                                                                            input: "mglocx",
                                                                                            placeholder: "Name",
                                                                                            title: "Magiport"
                                                                                        })
                                                                                    } else {
                                                                                        if (c == "throw") {
                                                                                            use_skill(c, ctarget, a.num || 0)
                                                                                        } else {
                                                                                            use_skill(c, ctarget)
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

function on_skill_up(c) {
    var a = keymap[c]
        , b = a && a.name || a;
    if (!a) {
        return
    }
    if (a == "blink") {
        blink_pressed = false;
        last_blink_pressed = new Date()
    } else {
        if (b == "move_up") {
            arrow_up = false
        } else {
            if (b == "move_down") {
                arrow_down = false
            } else {
                if (b == "move_left") {
                    arrow_left = false
                } else {
                    if (b == "move_right") {
                        arrow_right = false
                    }
                }
            }
        }
    }
}

function map_keys_and_skills() {
    if (!skillbar.length) {
        if (character.ctype == "warrior" || character.ctype == "rogue") {
            skillbar = ["1", "2", "3", "Q", "R"]
        } else {
            if (character.ctype == "merchant") {
                skillbar = ["1", "2", "3", "4", "5"]
            } else {
                skillbar = ["1", "2", "3", "4", "R"]
            }
        }
    }
    if (!Object.keys(keymap).length) {
        if (character.ctype == "warrior") {
            keymap = {
                "1": "use_hp",
                "2": "use_mp",
                "3": "cleave",
                "4": "stomp",
                "5": "agitate",
                Q: "taunt",
                R: "charge"
            }
        } else {
            if (character.ctype == "mage") {
                keymap = {
                    "1": "use_hp",
                    "2": "use_mp",
                    Q: "light",
                    R: "burst",
                    "6": "cburst",
                    B: "blink",
                    "7": "magiport"
                }
            } else {
                if (character.ctype == "priest") {
                    keymap = {
                        "1": "use_hp",
                        "2": "use_mp",
                        R: "curse",
                        "4": "partyheal",
                        "8": "darkblessing",
                        H: "heal"
                    }
                } else {
                    if (character.ctype == "ranger") {
                        keymap = {
                            "1": "use_hp",
                            "2": "use_mp",
                            "3": "3shot",
                            "5": "5shot",
                            "6": "4fingers",
                            R: "supershot"
                        }
                    } else {
                        if (character.ctype == "rogue") {
                            keymap = {
                                "1": "use_hp",
                                "2": "use_mp",
                                "3": "quickpunch",
                                "5": "quickstab",
                                R: "invis",
                                Q: "pcoat"
                            }
                        } else {
                            if (character.ctype == "merchant") {
                                keymap = {
                                    "1": "use_hp",
                                    "2": "use_mp",
                                    "3": "mluck"
                                }
                            }
                        }
                    }
                }
            }
        }
        keymap.A = "attack";
        keymap.I = "toggle_inventory";
        keymap.C = "toggle_character";
        keymap.U = "toggle_stats";
        keymap.S = "stop";
        keymap["\\"] = "toggle_run_code";
        keymap["\\2"] = "toggle_run_code";
        keymap["-"] = "toggle_code";
        keymap[","] = "open_snippet";
        keymap.F = "interact";
        keymap.UP = "move_up";
        keymap.DOWN = "move_down";
        keymap.LEFT = "move_left";
        keymap.RIGHT = "move_right";
        keymap.X = "use_town";
        keymap["0"] = {
            name: "snippet",
            code: "say('Hola')"
        };
        keymap.L = {
            name: "snippet",
            code: "loot()"
        };
        keymap.ESC = "esc";
        keymap.T = "travel";
        keymap.TAB = {
            name: "pure_eval",
            code: "var list=get_nearby_hostiles(); if(list.length) ctarget=list[0];"
        };
        keymap.N = {
            name: "pure_eval",
            code: "options.show_names=!options.show_names;"
        };
        keymap.ENTER = {
            name: "pure_eval",
            code: "focus_chat()"
        };
        keymap.SPACE = {
            name: "stand0",
            type: "item"
        }
    }
    for (name in keymap) {
        if (keymap[name].keycode) {
            K[keymap[name].keycode] = name
        }
    }
}

var last_move = new Date();

function move(a, f) {
    var d = d
        , b = calculate_move(character, parseFloat(a) || 0, parseFloat(f) || 0);
    character.from_x = character.real_x;
    character.from_y = character.real_y;
    character.going_x = b.x;
    character.going_y = b.y;
    character.moving = true;
    calculate_vxy(character);
    var c = {
        x: character.real_x,
        y: character.real_y,
        going_x: character.going_x,
        going_y: character.going_y,
        m: character.m
    };
    if (next_minteraction) {
        c.key = next_minteraction,
            next_minteraction = null
    }
    socket.emit("move", c);
    last_move = new Date()
}

function arrow_movement_logic() {
    /*
    if (!character || !options.move_with_arrows || !can_walk(character)) {
        return
    }
    if (arrow_up && arrow_left) {
        move(character.real_x - 50, character.real_y - 50)
    } else {
        if (arrow_up && arrow_right) {
            move(character.real_x + 50, character.real_y - 50)
        } else {
            if (arrow_up) {
                move(character.real_x, character.real_y - 50)
            } else {
                if (arrow_left && arrow_down) {
                    move(character.real_x - 50, character.real_y + 50)
                } else {
                    if (arrow_left) {
                        move(character.real_x - 50, character.real_y)
                    } else {
                        if (arrow_right && arrow_down) {
                            move(character.real_x + 50, character.real_y + 50)
                        } else {
                            if (arrow_right) {
                                move(character.real_x + 50, character.real_y)
                            } else {
                                if (arrow_down) {
                                    move(character.real_x, character.real_y + 50)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    */
}

function focus_chat() {
    if (inventory) {
        return
    }
    $(":focus").blur();
    if (last_say != "normal" && in_arr(last_say, cwindows) && !in_arr(last_say, docked)) {
        $("#chati" + last_say).focus()
    } else {
        $("#chatinput").focus()
    }
}

function gallery_click(a) {
}

function condition_click(a) {
}

function inventory_click(a) {
}

function slot_click(a) {
}

function get_player(a) {
    var b = null;
    if (a == character.name) {
        b = character
    }
    for (i in entities) {
        if (entities[i].type == "character" && entities[i].name == a) {
            b = entities[i]
        }
    }
    return b
}

function get_entity(a) {
    if (character && (a == character.id || a == character.name)) {
        return character
    }
    return entities[a]
}

function target_player(a) {
    var b = null;
    if (a == character.name) {
        b = character
    }
    for (i in entities) {
        if (entities[i].type == "character" && entities[i].name == a) {
            b = entities[i]
        }
    }
    if (!b) {
        add_log(a + " isn't around", "gray");
        return
    }
    ctarget = b
}

function travel_p(a) {
    if (party[a] && party[a]["in"] == party[a].map) {
        call_code_function("smart_move", {
            x: party[a].x,
            y: party[a].y,
            map: party[a].map
        })
    } else {
        add_log("Can't find " + a, "gray")
    }
}

function party_click(a) {
    var b = null;
    if (a == character.name) {
        b = character
    }
    for (i in entities) {
        if (entities[i].type == "character" && entities[i].name == a) {
            b = entities[i]
        }
    }
    if (!b) {
        add_log(a + " isn't around", "gray");
        return
    }
    if (character.ctype == "priest") {
        player_heal.call(b)
    } else {
        ctarget = b
    }
}

function attack_click() {
    if (character.ctype == "priest" && ctarget && ctarget.type == "character") {
        player_heal.call(ctarget)
    } else {
        if (character.ctype == "priest") {
            player_heal.call(character)
        } else {
            if (ctarget && ctarget.type == "monster") {
                monster_attack.call(ctarget)
            }
        }
    }
}

function code_button_click(a) {
    var d = $(a)
        , f = d.data("id")
        , c = code_buttons[f].fn;
    if (c) {
        document.getElementById("maincode").contentWindow.buttons[f].fn()
    }
}

function npc_focus() {
    var c = 102, a = null, b;
    if (!character) {
        return
    }
    map_npcs.forEach(function (d) {
        b = distance(d, character);
        if (b < c) {
            c = b,
                a = d
        }
    });
    map_doors.forEach(function (d) {
        b = distance(d, character);
        if (b < c) {
            c = b,
                a = d
        }
    });
    if (a) {
        a.onrclick()
    } else {
        add_log("Nothing nearby", "gray")
    }
}

function locate_item(a) {
    var c = 0;
    for (var b = 0; b < character.items.length; b++) {
        if (character.items[b] && character.items[b].name == a) {
            c = b
        }
    }
    return c
}

function show_configure() {
    add_log("Coming soon: Settings, Sounds, Music", "gray");
    ping()
}

function list_soon() {
    add_log("Coming soon: Settings, Sounds, Music, PVP (in 1-2 weeks), Trade (Very Soon!)", "gray")
}

function transport_to(a, b) {
    if (character.map == a) {
        add_log("Already here", "gray");
        return
    }
    if (a == "underworld") {
        add_log("Can't reach the underworld. Yet.", "gray");
        return
    }
    if (a == "desert") {
        add_log("Can't reach the desertland. Yet.", "gray");
        return
    }
    socket.emit("transport", {
        to: a,
        s: b
    })
}

function show_transports() {
}

function hide_transports() {
}

function execute_codemirror(a) {
}

function eval_snippet() {
}

function show_snippet(b) {
}

function eval_character_snippet(a) {
    a = a.toLowerCase();
    character_code_eval(a, window["codemirror_render" + a].getValue())
}

function show_character_snippet(a) {
}

function get_active_characters() {
    var a = {};
    if (!character) {
        return a
    }
    a[character.name] = "self";
    //TODO implement method to receive active characters
    return a
}

function character_code_eval(name, snippet) {
    var rid = "ichar" + name.toLowerCase();
    var weval = document.getElementById(rid) && document.getElementById(rid).contentWindow && document.getElementById(rid).contentWindow.eval;
    if (!weval) {
        add_log("Character not found! ", "#993D42");
        return undefined
    }
    if (document.getElementById(rid).contentWindow.code_active) {
        document.getElementById(rid).contentWindow.call_code_function("eval", snippet)
    } else {
        if (document.getElementById(rid).contentWindow.code_run) {
            add_log("CODE is warming up", "#DC9E48")
        } else {
            document.getElementById(rid).contentWindow.start_runner(0, "\nset_message('Snippet');\n" + snippet)
        }
    }
}

function character_window_eval(name, snippet) {
    var rid = "ichar" + name.toLowerCase();
    var weval = document.getElementById(rid) && document.getElementById(rid).contentWindow && document.getElementById(rid).contentWindow.eval;
    if (!weval) {
        add_log("Character not found!", "#993D42");
        return undefined
    }
    var result = true;
    try {
        weval(snippet)
    } catch (e) {
        result = false
    }
    return result
}

function character_load_code() {
}

function code_eval(a) {
    throw new Error("code_eval is not supported.");
    if (code_active) {
        call_code_function("eval", a)
    } else {
        if (code_run) {
            add_log("CODE is warming up", "#DC9E48")
        } else {
            start_runner(0, "\nset_message('Snippet');\n" + a)
        }
    }
}

function code_eval_s(a) {
    if (code_active) {
        call_code_function("eval_s", a)
    } else {
        if (code_run) {
            add_log("CODE is warming up", "#DC9E48")
        } else {
            start_runner(0, "\nset_message('Snippet');\n" + a)
        }
    }
}

function code_travel(a) {
    code_eval("smart_move({map:'" + a + "'})")
}

function direct_travel(b, a) {
    socket.emit("transport", {
        to: b,
        s: a
    })
}

function start_character_runner(b, d) {
    var c = "ichar" + b.toLowerCase();
    if (gameplay == "test") {
        c += randomStr(10)
    }
}

function start_runner(a, b) {
}

function stop_runner(a) {
    call_code_function("on_destroy");
}

function set_setting(b, d, g) {
    var f = storage_get("settings_cache")
        , c = ""
        , a = false;
    f = f && JSON.parse(f) || {};
    f[b] = f[b] || {};
    f[b][d] = g;
    storage_set("settings_cache", JSON.stringify(f))
}

function get_settings(b) {
    var d = storage_get("settings_cache")
        , c = ""
        , a = false;
    d = d && JSON.parse(d) || {};
    d[b] = d[b] || {};
    return d[b]
}

function free_character(c) {
    var f = null;
    X.characters.forEach(function (h) {
        if (c == h.name) {
            f = h
        }
    });
    if (f) {
        var d = storage_get("code_cache")
            , b = ""
            , a = false;
        d = d && JSON.parse(d) || {};
        try {
            delete d["run_" + f.id]
        } catch (g) {
        }
        storage_set("code_cache", JSON.stringify(d));
        smart_eval($(".onbackbutton").attr("onclick"));
        add_log("Done!")
    } else {
        add_log("Character not found!")
    }
}

function code_persistence_logic() {
}

function toggle_runner() {
}

function code_logic() {
    window.codemirror_render = CodeMirror(function (a) {
        $("#code").replaceWith(a)
    }, {
        value: $("#dcode").val(),
        mode: "javascript",
        indentUnit: 4,
        indentWithTabs: true,
        lineWrapping: true,
        lineNumbers: true,
        gutters: ["CodeMirror-linenumbers", "lspacer"],
        theme: "pixel",
        cursorHeight: 0.75,
    })
}

function load_code(a, b) {
    api_call("load_code", {name: a, run: "", log: b})
}

function toggle_code() {
}

function start_timer(a) {

}

function stop_timer(b, a) {

}

function the_door() {
}
function v_shake() {
}
function v_shake_i(c) {
}
function v_shake_i2(c) {
}
function v_dive() {
}
function v_dive_i(c) {
}
function no_no_no(d) {
}
function sway(c) {
}
function mojo(c) {
}
function flurry(d) {
}
function h_shake() {
    function b(c) {
        return function () {
            stage.x += c;
            character.real_x -= c
        }
    }

    var a = 0;
    [-1, 1, -2, 2, -3, 3, -3, 3, -3, 3, -2, 2, -1, 1].forEach(function (c) {
        setTimeout(b(c), a++ * 80)
    })
}

function set_direction(entity, c) {
    var b = 70;
    if (c == "npc") {
        b = 45
    }
    if (abs(entity.angle) < b) {
        entity.direction = 2
    } else {
        if (abs(abs(entity.angle) - 180) < b) {
            entity.direction = 1
        } else {
            if (abs(entity.angle + 90) < 90) {
                entity.direction = 3
            } else {
                entity.direction = 0
            }
        }
    }
    if (c == "attack" && entity && !entity.me && is_monster(entity)) {
        if (entity.direction == 0) {
            entity.real_y += 2, entity.y_disp = 2
        } else {
            if (entity.direction == 3) {
                entity.real_y -= 2, entity.y_disp = -2
            } else {
                if (entity.direction == 1) {
                    entity.real_x -= 2
                } else {
                    entity.real_x += 2
                }
            }
        }
        setTimeout(function () {
            if (entity.direction == 0) {
                entity.real_y -= 1, entity.y_disp -= 1
            } else {
                if (entity.direction == 3) {
                    entity.real_y += 1, entity.y_disp += 1
                } else {
                    if (entity.direction == 1) {
                        entity.real_x += 1
                    } else {
                        entity.real_x -= 1
                    }
                }
            }
        }, 60);
        setTimeout(function () {
            if (entity.direction == 0) {
                entity.real_y -= 1, entity.y_disp -= 1
            } else {
                if (entity.direction == 3) {
                    entity.real_y += 1, entity.y_disp += 1
                } else {
                    if (entity.direction == 1) {
                        entity.real_x += 1
                    } else {
                        entity.real_x -= 1
                    }
                }
            }
        }, 60)
    }
}

function free_children(b) {
    if (!b.children) {
        return
    }
    for (var a = 0; a < b.children.length; a++) {
        b.children[a].visible = false;
        if (!b.children[a].dead) {
            b.children[a].dead = "map"
        }
        b.children[a].parent = null
    }
}

function remove_sprite(a) {
    a.visible = false;
    if (!a.dead) {
        a.dead = "vision"
    }
}

function destroy_sprite(a, c) {
    a.visible = false;
    if (!a.dead) {
        a.dead = "vision"
    }
}

function wishlist(f, a, b, c, d) {
    if (!is_string(f)) {
        f = "trade" + f
    }
    socket.emit("trade_wishlist", {
        q: c,
        slot: f,
        price: b,
        level: d,
        name: a
    });
}

function trade(d, a, b, c) {
    c = c || 1;
    socket.emit("equip", {
        q: c,
        slot: d,
        num: a,
        price: b
    });
}

function trade_buy(d, c, a, b) {
    b = b || 1;
    socket.emit("trade_buy", {
        slot: d,
        id: c,
        rid: a,
        q: b
    });
}

function trade_sell(d, c, a, b) {
    b = b || 1;
    socket.emit("trade_sell", {
        slot: d,
        id: c,
        rid: a,
        q: b
    });
}

function secondhand_buy(a) {
    socket.emit("sbuy", {
        rid: a
    })
}

function lostandfound_buy(a) {
    socket.emit("sbuy", {
        rid: a,
        f: true
    });
}

function buy_shells(a) {
    if ((a * G.shells_to_gold) > character.gold) {
    } else {
        socket.emit("buy_shells", {
            gold: (a * G.shells_to_gold)
        });
    }
}

function buy(a, b) {
    if (mssince(last_npc_right_click) < 100) {
        return
    }
    var c = "buy";
    if (G.items[a] && G.items[a].cash && !G.items[a].p2w && G.items[a].cash <= character.cash) {
        c = "buy_with_cash"
    }
    socket.emit(c, {
        name: a,
        quantity: b
    });
    if (c == "buy") {
        return push_deferred("buy")
    }
}

function buy_with_gold(a, b) {
    socket.emit("buy", {
        name: a,
        quantity: b
    });
    return push_deferred("buy")
}

function buy_with_shells(a, b) {
    socket.emit("buy_with_cash", {
        name: a,
        quantity: b
    });
}

function sell(a, c) {
    if (!c) {
        c = 1
    }
    socket.emit("sell", {
        num: a,
        quantity: c
    });
}

function call_code_function(functionName, b, a, f) {
    try {
        get_code_function(functionName)(b, a, f)
    } catch (d) {
        add_log(functionName + " " + d)
    }
}

function code_eval_if_r(code) {
    false && document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow.eval && document.getElementById("maincode").contentWindow.eval(code)
}

function get_code_function(a) {
    return code_active && self.executor && self.executor.callbacks && self.executor.callbacks[a] || (function () {
    })
}

function private_say(a, c, b) {
    socket.emit("say", {message: c, code: b, name: a})
}

function party_say(b, a) {
    socket.emit("say", {message: b, code: a, party: true})
}

var last_say = "normal";

function say(message, code) {
    if (!message || !message.length) {
        return
    }
    last_say = "normal";
    if (message[0] == "/") {
        message = message.substr(1, 2000);
        var components = message.split(" ")
            , command = components.shift()
            , rest = components.join(" ");
        if (command == "help" || command == "list" || command == "") {
            add_chat("", "/list");
            add_chat("", "/uptime");
            add_chat("", "/guide");
            add_chat("", "/invite NAME");
            add_chat("", "/request NAME");
            add_chat("", "/friend NAME");
            add_chat("", "/leave");
            add_chat("", "/whisper NAME MESSAGE");
            add_chat("", "/p MESSAGE");
            add_chat("", "/ping");
            add_chat("", "/pause");
            add_chat("", "/eval CODE");
            add_chat("", "/snippet");
            add_chat("", "/start CHARACTERNAME");
            add_chat("", "/stop CHARACTERNAME");
            add_chat("", "/stop");
            add_chat("", "/stop invis");
            add_chat("", "/stop teleport");
            add_chat("", "/disconnect");
            add_chat("", "/disconnect CHARACTERNAME");
        } else {

            if (command == "start") {
                var args = rest.split(" ")
                    , name = args.shift();
                if (name) {
                    start_character_runner(name)
                }
            } else {
                if (command == "leave") {
                    socket.emit("party", {
                        event: "leave"
                    })
                } else {
                    if (command == "uptime") {
                        add_chat("", to_pretty_num(parseInt(msince(inception))) + " minutes " + parseInt(ssince(inception) % 60) + " seconds", "gray")
                    } else {
                        if (command == "stop") {
                            var args = rest.split(" ")
                                , name = args.shift();
                            if (!name) {
                                use_skill("stop")
                            } else {
                                if (name == "teleport" || name == "town") {
                                    socket.emit("stop", {
                                        action: "town"
                                    })
                                } else {
                                    if (name == "revival") {
                                        socket.emit("stop", {
                                            action: "revival"
                                        })
                                    } else {
                                        if (name == "invis") {
                                            socket.emit("stop", {
                                                action: "invis"
                                            })
                                        } else {
                                            stop_character_runner(name)
                                        }
                                    }
                                }
                            }
                        } else {
                            if (command == "disconnect") {
                                var args = rest.split(" ")
                                    , name = args.shift();
                                if (!name) {
                                    window.location = base_url
                                } else {
                                    api_call("disconnect_character", {
                                        name: name
                                    })
                                }
                            } else {
                                if (command == "p") {
                                    party_say(rest)
                                } else {
                                    if (command == "pause") {
                                        pause()
                                    } else {
                                        if (command == "snippet") {
                                            show_snippet()
                                        } else {
                                            if (command == "eval" || command == "execute") {
                                                code_eval(rest)
                                            } else {
                                                if (command == "pure_eval") {
                                                    eval(rest)
                                                } else {
                                                    if (command == "w" || command == "whisper" || command == "pm") {
                                                        var args = rest.split(" ")
                                                            , name = args.shift()
                                                            , rest = args.join(" ");
                                                        if (!name || !rest) {
                                                            add_chat("", "Format: /w NAME MESSAGE")
                                                        } else {
                                                            private_say(name, rest)
                                                        }
                                                    } else {
                                                        if (command == "savecode") {
                                                            var args = rest.split(" ")
                                                                , slot = args.shift()
                                                                , name = args.join(" ");
                                                            if (slot.length && !parseInt(slot)) {
                                                                add_chat("", "/savecode NUMBER NAME");
                                                                add_chat("", "NUMBER can be from 1 to 100")
                                                            } else {
                                                                if (!slot) {
                                                                    slot = 1
                                                                }
                                                                api_call("save_code", {
                                                                    code: codemirror_render.getValue(),
                                                                    slot: slot,
                                                                    name: name
                                                                })
                                                            }
                                                        } else {
                                                            if (command == "loadcode" || command == "runcode") {
                                                                var args = rest.split(" ")
                                                                    , name = args.shift();
                                                                if (!name) {
                                                                    name = 1
                                                                }
                                                                api_call("load_code", {
                                                                    name: name,
                                                                    run: (command == "runcode" && "1" || "")
                                                                })
                                                            } else {
                                                                if (command == "ping") {
                                                                    ping()
                                                                } else {
                                                                    if (command == "whisper") {
                                                                        if (ctarget && !ctarget.me && !ctarget.npc && ctarget.type == "character") {
                                                                            private_say(ctarget.name, rest)
                                                                        } else {
                                                                            add_chat("", "Target someone to whisper")
                                                                        }
                                                                    } else {
                                                                        if (command == "party" || command == "invite") {
                                                                            var args = rest.split(" ")
                                                                                , name = args.shift();
                                                                            if (name && name.length) {
                                                                                socket.emit("party", {
                                                                                    event: "invite",
                                                                                    name: name
                                                                                })
                                                                            } else {
                                                                                if (ctarget && !ctarget.me && !ctarget.npc && ctarget.type == "character") {
                                                                                    socket.emit("party", {
                                                                                        event: "invite",
                                                                                        id: ctarget.id
                                                                                    })
                                                                                } else {
                                                                                    add_chat("", "Target someone to invite")
                                                                                }
                                                                            }
                                                                        } else {
                                                                            if (command == "request") {
                                                                                var args = rest.split(" ")
                                                                                    , name = args.shift();
                                                                                if (name && name.length) {
                                                                                    socket.emit("party", {
                                                                                        event: "request",
                                                                                        name: name
                                                                                    })
                                                                                } else {
                                                                                    if (ctarget && !ctarget.me && !ctarget.npc && ctarget.type == "character") {
                                                                                        socket.emit("party", {
                                                                                            event: "request",
                                                                                            id: ctarget.id
                                                                                        })
                                                                                    } else {
                                                                                        add_chat("", "Target someone to request party")
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                if (command == "friend") {
                                                                                    var args = rest.split(" ")
                                                                                        , name = args.shift();
                                                                                    if (name && name.length) {
                                                                                        socket.emit("friend", {
                                                                                            event: "request",
                                                                                            name: name
                                                                                        })
                                                                                    } else {
                                                                                        if (ctarget && !ctarget.me && !ctarget.npc && ctarget.type == "character") {
                                                                                            socket.emit("friend", {
                                                                                                event: "request",
                                                                                                name: ctarget.name
                                                                                            })
                                                                                        } else {
                                                                                            add_chat("", "Target someone to friend")
                                                                                        }
                                                                                    }
                                                                                } else {
                                                                                    if (command == "guide") {
                                                                                        show_game_guide()
                                                                                    } else {
                                                                                        if (code_active && document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow.handle_command) {
                                                                                        } else {
                                                                                            if (screenshot_mode && command == "p1") {
                                                                                                add_chat("Wizard", "Adventure Land is a 2D Pixel MMORPG", "#D3C7A2")
                                                                                            } else {
                                                                                                if (screenshot_mode && command == "p2") {
                                                                                                    add_chat("Amazon", "20% off on all Elixirs", "gray");
                                                                                                    add_chat("Healer", "Economy is completely Merchant-to-Merchant, players leave their merchants in the town square to sell or buy items", "#58BCA5")
                                                                                                } else {
                                                                                                    if (recording_mode && command == "r1") {
                                                                                                        ui_log("Item upgrade succeeded", "white");
                                                                                                        ui_log("Item upgrade succeeded", "white");
                                                                                                        ui_log("Item upgrade succeeded", "white");
                                                                                                        ui_log("Item upgrade succeeded", "white");
                                                                                                        add_chat("NewKid", "hi", "gray");
                                                                                                        add_chat("Wizard", "hello :)", "gray");
                                                                                                        add_chat("", "SweetPea received a Mittens +9", "#85C76B");
                                                                                                        add_chat("", "Maela found a Mistletoe", "#85C76B");
                                                                                                        add_chat("", "Trexnamedted found a Candy Cane", "#85C76B")
                                                                                                    } else {
                                                                                                        add_chat("", "Command not found. Suggestion: /list")
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
    } else {
        socket.emit("say", {
            message: message,
            code: code
        })
    }
}

function activate(a) {
    socket.emit("booster", {
        num: a,
        action: "activate"
    })
}

function shift(a, b) {
    socket.emit("booster", {
        num: a,
        action: "shift",
        to: b
    })
}

function open_merchant(a) {
    socket.emit("merchant", {
        num: a
    })
}

function close_merchant() {
    socket.emit("merchant", {
        close: 1
    })
}

function donate(a) {
    if (a === undefined) {
        var a = parseInt($(".dgold").html().replace_all(",", ""));
        if (!a) {
            a = 100000
        }
        a = max(1, a)
    }
    socket.emit("donate", {
        gold: a
    })
}

function dice(c, b, a) {
    if (c == 1) {
        c = "up"
    }
    if (c == 2) {
        c = "down"
    }
    socket.emit("bet", {
        type: "dice",
        dir: c,
        num: b,
        gold: a
    })
}

function upgrade(u_item, u_scroll, u_offering) {
    if (u_item == null || (u_scroll == null && u_offering == null)) {
        d_text("INVALID", character)
    } else {
        socket.emit("upgrade", {
            item_num: u_item,
            scroll_num: u_scroll,
            offering_num: u_offering,
            clevel: (character.items[u_item] && character.items[u_item].level || 0)
        });
        return push_deferred("upgrade")
    }
}

function lock_item(a) {
    if (a === undefined) {
        a = l_item
    }
    socket.emit("locksmith", {
        num: a,
        operation: "lock"
    })
}

function seal_item(a) {
    if (a === undefined) {
        a = l_item
    }
    socket.emit("locksmith", {
        num: a,
        operation: "seal"
    })
}

function unlock_item(a) {
    if (a === undefined) {
        a = l_item
    }
    socket.emit("locksmith", {
        num: a,
        operation: "unlock"
    })
}

function deposit(a) {
    if (!G.maps[current_map].mount) {
        add_log("Not in the bank.", "gray");
        return
    }
    a = a.replace_all(",", "").replace_all(".", "");
    socket.emit("bank", {
        operation: "deposit",
        amount: parseInt(a)
    })
}

function withdraw(a) {
    if (!G.maps[current_map].mount) {
        add_log("Not in the bank.", "gray");
        return;
    }
    socket.emit("bank", {
        operation: "withdraw",
        amount: parseInt(a)
    })
}

var exchange_animations = false
    , last_excanim = new Date()
    , exclast = 0;
var exccolors1 = ["#f1c40f", "#f39c12", "#e74c3c", "#c0392b", "#8e44ad", "#9b59b6", "#2980b9", "#3498db", "#1abc9c"];
var exccolorsl = ["#CD6F1A", "#A95C15"];
var exccolorsg = ["#EFD541", "#9495AC"];
var exccolorsgray = ["#7C7C7C", "#5C5D5D", "#3B3C3C"];
var exccolorsc = ["#C82F17", "#EBECEE"];
var exccolorssea = ["#24A7CB", "#EBECEE"];

function exchange_animation_logic() {
    var a = exccolors1;
    if (exchange_type == "leather") {
        a = exccolorsl
    }
    if (exchange_type == "lostearring") {
        a = exccolorsg
    }
    if (exchange_type == "seashell") {
        a = exccolorssea
    }
    if (exchange_type == "poof") {
        a = exccolorsgray
    }
    if (in_arr(exchange_type, ["mistletoe", "ornament", "candycane"])) {
        a = exccolorsc
    }
    if (mssince(last_excanim) > 300) {
        last_excanim = new Date();
        exclast++
    }
}

function poof(a) {
    var b = 2400;
    exchange_type = "poof";
    if (a) {
        socket.emit("destroy", {
            num: p_item,
            q: 1,
            statue: true
        });
        return
    }

    function c(d) {
        return function () {
            if (!exchange_animations) {
                return
            }
            socket.emit("destroy", {
                num: d,
                q: 1,
                statue: true
            })
        }
    }

    if (p_item == null) {
        d_text("INVALID", character)
    } else {
        if (exchange_animations) {
            d_text("WAIT FOR IT", character)
        } else {
            exchange_animations = true;
            draw_timeout(c(p_item), b)
        }
    }
}

function exchange(e_item, a) {
    var b = 3000;
    if (a) {
        socket.emit("exchange", {
            item_num: e_item,
            q: character.items[e_item].q
        });
        return
    }

    function c(d, f) {
        return function () {
            if (!exchange_animations) {
                return
            }
            socket.emit("exchange", {
                item_num: d,
                q: f
            })
        }
    }

    if (e_item == null) {
        d_text("INVALID", character)
    } else {
        if (exchange_animations) {
            d_text("WAIT FOR IT", character)
        } else {
            if (exchange_type) {
                b = 2400
            }
            exchange_animations = true;
            draw_timeout(c(e_item, character.items[e_item].q), b)
        }
    }
}

function exchange_buy(c, b) {
    var a = item_position(c);
    if (a == undefined) {
        d_text("NO TOKENS", character)
    } else {
        socket.emit("exchange_buy", {
            num: a,
            name: b,
            q: character.items[a].q
        })
    }
}

function compound(item0, item1, item2, scroll_num, offering_num) {
    if (scroll_num == null || typeof item0 === "undefined" || typeof item1 === "undefined" || typeof item2 === "undefined") {
        console.log("INVALID")
    } else {
        socket.emit("compound", {
            items: [item0, item1, item2],
            scroll_num: scroll_num,
            offering_num: offering_num,
            clevel: (character.items[item0].level || 0)
        });
    }
}

function craft(i0, i1, i2, i3, i4, i5, i6, i7, i8) {
    var a = [i0, i1, i2, i3, i4, i5, i6, i7, i8], b = false;
    for (var c = 0; c < 9; c++) {
        if (cr_items[c] || cr_items[c] === 0) {
            b = true,
                a.push([c, cr_items[c]])
        }
    }
    if (!b) {
        d_text("INVALID", character)
    } else {
        socket.emit("craft", {
            items: a
        })
    }
}

function dismantle() {
    socket.emit("dismantle", {
        num: ds_item
    })
}

var u_retain = false;

function reopen() {
    throw new Error("reopen is not supported.");
    return;
    u_scroll = c_scroll = e_item = null;
    draw_trigger(function () {
        if (rendered_target == "upgrade") {
            render_upgrade_shrine()
        } else {
            if (rendered_target == "compound") {
                render_compound_shrine()
            } else {
                if (rendered_target == "exchange") {
                    render_exchange_shrine(exchange_type)
                } else {
                    if (rendered_target == "gold") {
                        render_gold_npc()
                    } else {
                        if (rendered_target == "items") {
                            render_items_npc()
                        } else {
                            if (rendered_target == "craftsman") {
                                render_craftsman()
                            } else {
                                if (rendered_target == "dismantler") {
                                    render_dismantler()
                                } else {
                                    if (rendered_target == "none") {
                                        render_none_shrine()
                                    } else {
                                        if (rendered_target == "locksmith") {
                                            render_locksmith()
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        if (inventory) {
            reset_inventory()
        }
        if (exchange_animations) {
            $(".ering").css("border-color", "gray");
            exchange_animations = false
        }
        if (u_retain) {
            for (var a = 0; a < 3; a++) {
                if ((u_retain[a] || u_retain[a] === 0) && character.items[u_retain[a]]) {
                    on_rclick($("#citem" + u_retain[a])[0])
                }
            }
            u_retain = false
        }
    })
}

function esc_pressed() {
    if (modal_count > 0) {
        hide_modal()
    } else {
        if (code) {
            toggle_code()
        } else {
            if (topright_npc) {
                $("#rightcornerui").html("");
                topright_npc = false
            } else {
                if (topleft_npc && topleft_npc != "dice") {
                    topleft_npc = false
                } else {
                    if (ctarget && ctarget.type == "character") {
                        ctarget = null
                    } else {
                        if (inventory) {
                            draw_trigger(render_inventory)
                        } else {
                            if (skillsui) {
                                draw_trigger(render_skills)
                            } else {
                                if (topleft_npc == "dice") {
                                    topleft_npc = false
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function toggle_stats() {
    throw new Error("toggle_stats is not supported.");
    if (topright_npc != "character") {
        render_character_sheet()
    } else {
        topright_npc = false
    }
}

function reset_inventory() {
    throw new Error("reset_inventory is not supported.");
    if (ctarget == character && !topleft_npc) {
        ctarget = null
    } else {
        topleft_npc = false, ctarget = character
    }
}

function reset_inventory(a) {
    throw new Error("reset_inventory is not supported.");
    if (inventory) {
        if (a && !in_arr(rendered_target, ["upgrade", "compound", "exchange", "npc", "merchant", "craftsman", "dismantler", "none", "locksmith"])) {
            return
        }
        render_inventory(), render_inventory()
    }
}

function close_chests() {
    for (var b in chests) {
        var a = chests[b];
        if (a.openning) {
            delete a.openning;
            a.frame = 0;
        }
    }
}

function open_chest(b) {
    var a = chests[b];
    if (a.openning && ssince(a.openning) < 5) {
        return
    }
    socket.emit("open_chest", {
        id: b
    })
}

function generate_textures(b, m) {
    return;
    console.log("generate_textures " + b + " " + m);
    if (in_arr(m, ["full", "wings", "body", "armor", "skin"])) {
        var l = XYWH[b]
            , c = l[2]
            , p = l[3]
            , r = 0
            , q = 0;
        var o = G.dimensions[b];
        if (o) {
            c = o[0];
            p = o[1];
            r = round((l[2] - c) / 2 + (o[2] || 0));
            q = round(l[3] - p)
        }
        textures[b] = [[null, null, null, null], [null, null, null, null], [null, null, null, null]];
        for (var k = 0; k < 3; k++) {
            for (var g = 0; g < 4; g++) {
                var n = new PIXI.Rectangle(l[0] + k * l[2] + r, l[1] + g * l[3] + q, c, p);
                if (offset_walking && !o) {
                    n.y += 2,
                        n.height -= 2
                }
                textures[b][k][g] = new PIXI.Texture(C[FC[b]], n)
            }
        }
    }
    if (in_arr(m, ["emblem", "gravestone"])) {
        var l = XYWH[b];
        var n = new PIXI.Rectangle(l[0], l[1], l[2], l[3]);
        textures[b] = new PIXI.Texture(C[FC[b]], n)
    }
    if (m == "machine") {
        var f = b;
        b = f.type;
        textures[b] = e_array(f.frames.length);
        for (var k = 0; k < f.frames.length; k++) {
            var n = new PIXI.Rectangle(f.frames[k][0], f.frames[k][1], f.frames[k][2], f.frames[k][3]);
            textures[b][k] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[f.set]], n)
        }
        if (f.subframes) {
            textures[b + "sub"] = e_array(f.subframes.length);
            for (var k = 0; k < f.subframes.length; k++) {
                var n = new PIXI.Rectangle(f.subframes[k][0], f.subframes[k][1], f.subframes[k][2], f.subframes[k][3]);
                textures[b + "sub"][k] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[f.set]], n)
            }
        }
    }
    if (m == "animation") {
        var o = G.animations[b];
        if (no_graphics) {
            PIXI.utils.BaseTextureCache[o.file] = {
                width: 20,
                height: 20
            }
        }
        var c = PIXI.utils.BaseTextureCache[o.file].width
            , h = Math.floor(c / o.frames);
        var p = PIXI.utils.BaseTextureCache[o.file].height;
        textures[b] = e_array(o.frames);
        for (var k = 0; k < o.frames; k++) {
            var n = new PIXI.Rectangle(0 + h * k, 0, h, p);
            textures[b][k] = new PIXI.Texture(PIXI.utils.BaseTextureCache[o.file], n)
        }
    }
    if (m == "animatable") {
        var l = G.positions[b];
        textures[b] = e_array(l.length);
        var k = 0;
        l.forEach(function (d) {
            var a = new PIXI.Rectangle(d[1], d[2], d[3], d[4]);
            textures[b][k++] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[d[0]]], a)
        })
    }
    if (m == "emote") {
        var l = XYWH[b];
        textures[b] = [null, null, null];
        for (var k = 0; k < 3; k++) {
            var n = new PIXI.Rectangle(l[0] + k * l[2], l[1], l[2], l[3]);
            textures[b][k] = new PIXI.Texture(C[FC[b]], n)
        }
    }
    if (in_arr(m, ["v_animation", "head", "hair", "hat", "s_wings", "face"])) {
        var l = XYWH[b];
        textures[b] = [null, null, null, null];
        for (var k = 0; k < 4; k++) {
            var n = new PIXI.Rectangle(l[0], l[1] + k * l[3], l[2], l[3]);
            textures[b][k] = new PIXI.Texture(C[FC[b]], n)
        }
    }
}

function restore_dimensions(a) {
}

function set_texture(d, b, a) {
    var f = b + "" + a;
    d.i = b;
    d.j = a;
    if (d.cskin == f) {
        return
    }
    if (in_arr(d.stype, ["full", "wings", "body", "armor", "skin"])) {
        d.texture = textures[d.skin][b][a]
    }
    if (d.stype == "animation") {
        d.texture = textures[d.skin][b % d.frames]
    }
    if (in_arr(d.stype, ["v_animation", "head", "hair", "hat", "s_wings", "face"])) {
        d.texture = textures[d.skin][b % d.frames]
    }
    if (d.stype == "animatable") {
        d.texture = textures[d.skin][b % d.frames]
    }
    if (d.stype == "emote") {
        d.texture = textures[d.skin][b % 3]
    }
    d.cskin = f
}

function new_sprite(h, b, j) {
    return;
    if (in_arr(b, ["full", "wings", "body", "armor", "skin"])) {
        if (j == "renew") {
            var f = h;
            h = f.skin;
            if (!textures[h]) {
                generate_textures(h, "full")
            }
            f.texture = textures[h][1][0]
        } else {
            if (!textures[h]) {
                generate_textures(h, "full")
            }
            var f = new PIXI.Sprite(textures[h][1][0])
        }
        f.cskin = "10";
        f.i = 1;
        f.j = 0
    }
    if (in_arr(b, ["head", "hair", "hat", "s_wings", "face"])) {
        if (!textures[h]) {
            generate_textures(h, b)
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0";
        f.i = 0;
        f.frames = 4
    }
    if (in_arr(b, ["emblem", "gravestone"])) {
        if (!textures[h]) {
            generate_textures(h, "emblem")
        }
        var f = new PIXI.Sprite(textures[h]);
        f.cskin = ""
    }
    if (b == "machine") {
        if (!textures[h.type]) {
            generate_textures(h, "machine")
        }
        var f = new PIXI.Sprite(textures[h.type][0]);
        f.cskin = "0";
        f.i = 0
    }
    if (b == "v_animation") {
        if (!textures[h]) {
            generate_textures(h, "v_animation")
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0" + undefined;
        f.i = 0;
        f.frame = 0;
        f.frames = textures[h].length
    }
    if (b == "animatable") {
        if (!textures[h]) {
            generate_textures(h, "animatable")
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0" + undefined;
        f.i = 0;
        f.frame = 0;
        f.frames = textures[h].length
    }
    if (b == "animation") {
        if (!textures[h]) {
            generate_textures(h, "animation")
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0" + undefined;
        f.i = 0;
        f.frame = 0;
        f.frames = textures[h].length
    }
    if (b == "emote") {
        if (!textures[h]) {
            generate_textures(h, "emote")
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0" + undefined;
        f.i = 0;
        f.frame = 0
    }
    if (b == "static") {
        var g = textures["static_" + h];
        if (!g) {
            var a = G.positions[h]
                , d = G.tilesets[a[0]];
            var c = new PIXI.Rectangle(a[1], a[2], a[3], a[4]);
            var g = new PIXI.Texture(PIXI.utils.BaseTextureCache[d], c);
            textures["static_" + h] = g
        }
        var f = new PIXI.Sprite(g);
        f.cskin = undefined + "" + undefined
    }
    f.skin = h;
    f.stype = b;
    f.updates = 0;
    return f
}

function recreate_dtextures() {
    return;

}

function water_frame() {
    return [0, 1, 2, 1][round(draws / 30) % 4]
}

function new_map_tile(b) {
    total_map_tiles++;
    if (b.length == 8) {
        var a = new PIXI.Sprite(b[5]);
        a.textures = [b[5], b[6], b[7]];
        return a
    }
    return new PIXI.Sprite(b[5])
}

function random_rotating_rectangle(g, j) {
    return;
    if (!g.cxc.bg) {
        return
    }
    if (!j) {
        j = {}
    }
    var h = new PIXI.Graphics();
    var b = [62270, 15999275, 16316471, 5340664, 14765049, 2008313, 7216377, 16216621];
    if (j.color == "success") {
        b = [8767339, 11403147, 15662319]
    } else {
        if (j.color == "purple") {
            b = [10044616, 8140963, 16046847]
        }
    }
    var f = random_one(b);
    var m = random_one([3, 5, 7])
        , k = random_one([1, -1, 2, -2])
        , a = random_one([-0.5, 0, 1, 2, 3])
        , l = random_one([-0.2, 0.2, -0.4, 0.4]);
    h.lineStyle(3, f);
    h.beginFill(f);
    h.drawRect(-m / 2, -m / 2, m / 2, m / 2);
    h.rotation = Math.random();
    var d = new PIXI.filters.PixelateFilter(7, 7);
    h.filters = [d];
    h.x = 0;
    h.y = -15;
    g.cxc.bg.addChild(h);

    function c(p, q, o, n) {
        return function () {
            if (p >= 10.6) {
                destroy_sprite(h)
            } else {
                h.x -= q * DTM * 2;
                h.y -= o * DTM * 2;
                h.rotation -= n * DTM;
                h.opacity -= 0.07 * DTM;
                draw_timeout(c(p + DTM, q, o, n), 15)
            }
        }
    }

    draw_timeout(c(0, k, a, l), 15)
}

function small_success(a, c) {
    for (var b = 0; b < 4; b++) {
        for (var d = 0; d < 30; d++) {
            draw_timeout(function () {
                random_rotating_rectangle(a, c)
            }, d * 16)
        }
    }
}

function assassin_smoke(m, k, j) {
}

function confetti_shower(b, h) {
    var a = 200
        , f = 1
        , g = 25;
    if (h == 2) {
        a = 150,
            f = 2,
            g = 60
    }
    if (is_hidden()) {
        g = 2
    }
    for (var d = 0; d < g; d++) {
        for (var c = 0; c < f; c++) {
            draw_timeout(function () {
                if (!b.real_x) {
                    b = get_entity(b)
                }
                if (!b) {
                    return
                }
                assassin_smoke(b.real_x + (Math.random() * 80 - 40), b.real_y + (Math.random() * 80 - 40), "confetti")
            }, d * a)
        }
    }
}

function firecrackers(a) {
}

function start_emblem(f, b, a) {
}

function stop_emblem(b, a) {
}

function start_animation(d, c, h) {
}

function stop_animation(b, a) {
}

function set_base_rectangle(b) {
}

function dirty_fix(a) {
}

function restore_base(b) {
}

function rotate(l, g) {
}

function rotated_texture(j, a, g) {
}

function drag_logic() {
}

function draw_timeouts_logic(f) {
    var currentDate = new Date(), indices = [];
    for (var i = 0; i < draw_timeouts.length; i++) {
        var timeout = draw_timeouts[i];
        if (f && f == 2 && timeout[2] != 2) {
            continue
        }
        if (currentDate >= timeout[1]) {
            indices.push(i);
            DTM = 1;
            DMS = currentDate - timeout[3];
            if (timeout[4]) {
                try {
                    DTM = (currentDate - timeout[3]) / timeout[4]
                } catch (d) {}
            }
            indices.push(i);
            try {
                timeout[0]()
            } catch (d) {
                //Never append an exception to a string you basically lose the stacktrace which contains very useful info
                console.log("draw_timeout_error: ", d);
                console.log(timeout[0])
            }
        }
    }
    if (indices) {
        delete_indices(draw_timeouts, indices)
    }
}

function draw_timeout(c, b, a) {
    draw_timeouts.push([c, future_ms(b), a])
}

function draw_trigger(a) {
    draw_timeouts.push([a, new Date(), 2])
}

function tint_logic() {
}

function add_tint(a, b) {
}

function use(c) {
    var a = false;
    for (var b = character.items.length - 1; b >= 0; b--) {
        var f = character.items[b];
        if (!f) {
            continue
        }
        if (a) {
            break
        }
        var d = G.items[f.name];
        (d.gives || []).forEach(function (g) {
            if (g[0] == c && !a) {
                socket.emit("equip", {
                    num: b
                });
                a = 1
            }
        })
    }
    if (!a) {
        socket.emit("use", {
            item: c
        })
    }
}

var tint_c = {
    a: 0,
    p: 0,
    t: 0
};
var next_attack = new Date()
    , next_potion = new Date();

function attack_timeout(a) {
    if (a <= 0) {
        return
    }
    next_attack = next_skill.attack = future_ms(a);
    draw_trigger(function () {
        tint_c.a++;
    skill_timeout("attack", -mssince(next_skill.attack) - DMS);
    skill_timeout("heal", -mssince(next_skill.attack) - DMS)
})
}

function pot_timeout(a) {
    if (a <= 0) {
        return
    }
    if (!a) {
        a = 2000
    }
    next_potion = future_ms(a);
    skill_timeout("use_hp", a);
    skill_timeout("use_mp", a);
}

function pvp_timeout(a, b) {
    if (a <= 0) {
        return
    }
    skill_timeout("use_town", a);
    if (b) {
        return
    }
    draw_trigger(function () {
        for (var d = 1; d < 10; d++) {
            var h = 200 - d * 15, f = 50 - d * 3, c = 20 - d;
            draw_timeout(function (l, k, j) {
                return function () {
                }
            }(h, f, c), d * 600)
        }
    })
}

function pvp_timeout(c, h) {
    if (c <= 0) {
        return
    }
    var f = 200
        , d = 50
        , a = 20;
    if (h == "sneak") {
        f = 45,
            d = 111,
            a = 45
    }
    skill_timeout("use_town", c);
    if (h == 1) {
        return
    }
}

var next_skill = {
    attack: new Date(),
    use_hp: new Date(),
    use_mp: new Date(),
    use_town: new Date()
};

function skill_timeout(skill, b) {
    if (b <= 0) {
        return
    }
    var a = [];
    if (!b) {
        b = G.skills[skill].cooldown
    }
    if (b == "1X") {
        b = 1000 * 100 / character.speed
    }
    next_skill[skill] = future_ms(b);
    draw_trigger(function () {
        if (G.skills[skill] && G.skills[skill].share == "attack") {
            attack_timeout(-mssince(next_skill[skill] - DMS))
        }
    })
}

function disappearing_circle(a, g, d, b) {
}

function empty_rect(b, g, f, a, d, c) {
}

function draw_line(a, g, c, f, d, b) {
}

function draw_circle(a, d, c, b) {
}

function add_border(f, g, d) {
}

function border_logic(a) {
}

function player_rclick_logic(a) {
}

function regather_filters(a) {
}

function rip_logic() {
    if (character.rip && !rip) {
        call_code_function("trigger_character_event", "death", {})
        rip = true;
        character.moving = false;
        skill_timeout("use_town", 12000);
    }
    if (!character.rip && rip) {
        rip = false;
    }
}

function name_logic(a) {
}

function start_name_tag(b, a) {
}

function stop_name_tag(c, b) {
}

function add_name_tag(d) {
}

function add_name_tag_x(f) {
}

function add_name_tag_large(d) {
}

function add_name_tag_experimental(d) {
}

function hp_bar_logic(a) {

}

function add_hp_bar(c) {
}

function test_bitmap(a, d, b) {
}

function d_line(start, end, args) {
}

function d_text(p, l, k, j) {
}

function api_call(command, c, g) {
    if (!c) {
        c = {}
    }
    if (!g) {
        g = {}
    }
    var path = "/api/" + command, b = g.disable;
    if (c.ui_loader) {
        g.r_id = randomStr(10);
        delete c.ui_loader
    }
    if (c.callback) {
        g.callback = c.callback;
        delete c.callback
    }
    if (b) {
        b.addClass("disable")
    }
    data = {method: command, "arguments": JSON.stringify(c)};

    function success(k, j) {
        return function (l) {
            if (k.r_id) {
                hide_loader(k.r_id)
            }
            if (k.callback) {
                k.callback.apply(this, [l])
            } else {
                handle_information(l)
            }
            if (k.success) {
                smart_eval(k.success)
            }
            if (j) {
                j.removeClass("disable")
            }
        }
    }

    function error(k, j) {
        return function (l) {
            if (k.r_id) {
                hide_loader(k.r_id)
            }
            if (k.silent || in_arr(command, auto_api_methods)) {
                return
            }
            ui_error("An Unknown Error");
        }
    }

    if (g.r_id) {
        show_loader(g.r_id)
    }
    call_args = {
        type: "POST",
        dataType: "json",
        url: base_url + path,
        data: data,
        success: success(g, b),
        error: error(g, b)
    };
    //TODO
    //$.ajax(call_args)
}

function api_call_l(c, a, b) {
    if (!a) {
        a = {}
    }
    a.ui_loader = true;
    return api_call(c, a, b)
}

var warned = {}
    , map_info = {};

function new_map_logic(a, b) {
    map_info = b.info || {};
    if (current_map == "abtesting" && !abtesting) {
        abtesting = {
            A: 0,
            B: 0
        };
        abtesting_ui = true;
        abtesting.end = future_s(G.events.abtesting.duration)
    }
    if (current_map != "abtesting" && abtesting_ui) {
        abtesting = false;
        abtesting_ui = false;
        //$("#abtesting").remove()
    }
    if (current_map == "resort") {
        add_log("Resort is a prototype with work in progress", "#ADA9E4")
    }
    if (current_map == "tavern") {
        add_log("Tavern is a prototype with work in progress", "#63ABE4")
    }
    if (is_pvp && (a == "start" || a == "welcome")) {
        add_log("This is a PVP Server. Be careful!", "#E1664C")
    }
    if (a == "map" && !is_pvp && G.maps[current_map].pvp && !warned[current_map]) {
        warned[current_map] = 1, add_log("This is a PVP Zone. Be careful!", "#E1664C")
    }
}

function new_game_logic() {
    if (gameplay == "hardcore") {
        hardcore_logic()
    }
    if (gameplay == "test") {
        test_logic()
    }
}

function ui_log(a, b) {
    add_log(a, b)
}

function ui_error(a) {
    add_log(a, "red")
}

function ui_success(a) {
    add_log(a, "green")
}

var code_list = {};

function load_code_s(a) {
}

function save_code_s() {
}

var last_servers_and_characters = new Date();
setInterval(function () {
    if (!inside) {
        return;
    }
    if (inside == "game" && ssince(last_servers_and_characters) > 48 || inside == "selection" && ssince(last_servers_and_characters) > 9) {
        api_call("servers_and_characters");
        last_servers_and_characters = new Date()
    }
}, 2000);

function update_servers_and_characters(d) {
    var c = {
        1: null,
        2: null,
        3: null,
        merchant: null
    }
        , a = 1
        , b = 0;
    d.characters.forEach(function (f) {
        if (!f.online) {
            return
        }
        if (f.type == "merchant") {
            c.merchant = f
        } else {
            if (a <= 3) {
                c[a] = f,
                    a += 1
            }
        }
    });
}

function handle_information(g) {
    for (var f = 0; f < g.length; f++) {
        info = g[f];
        if (info.type == "reload") {
            var a = future_s(10);
            //TODO
            /*window.localStorage.setItem("reload" + server_region + server_identifier, JSON.stringify({
                time: a,
                ip: info.ip,
                port: "" + info.port
            }))*/
        }

        if (in_arr(info.type, ["ui_log", "message"])) {
            if (info.color) {
                add_log(info.message, info.color)
            } else {
                ui_log(info.message)
            }
        }
        if (info.type == "code") {
            codemirror_render.setValue(info.code);
            if (info.run) {
                if (code_run) {
                    toggle_runner(), toggle_runner()
                } else {
                    toggle_runner()
                }
            }
        }
        if (info.type == "gcode") {
            var d = "";
            d += "<textarea id='gcode'>" + info.code + "</textarea>";
            show_modal(d)
        }
        if (info.type == "chat_message") {
            add_chat("", info.message, info.color)
        }
        if (in_arr(info.type, ["ui_error", "error"])) {
            if (inside == "message") {
            } else {
                ui_error(info.message)
            }
        }
        if (in_arr(info.type, ["success"])) {
            if (inside == "message") {
            } else {
                ui_success(info.message)
            }
        } else {
            if (info.type == "content") {
            } else {
                if (info.type == "eval") {
                    smart_eval(info.code)
                } else {
                    if (info.type == "func") {

                    } else {
                        if (info.type == "pcs") {
                            pcs(info.sound)
                        }
                    }
                }
            }
        }
    }
}

function add_alert(a) {
    console.log("caught exception: " + a);
}

function sfx(b, a, h) {
}

function tut(a) {
    if (X.tutorial.task == a) {
        api_call("tutorial", {
            task: a
        })
    }
}

function pcs(a) {
}

function init_sounds() {
}

function init_fx() {
}

function performance_trick() {
}

function init_music() {
}

var current_music = null;

function reflect_music() {
}

function sound_on() {
}

function sound_off(a) {
}

function sfx_on() {
}

function sfx_off() {
}

function gprocess_game_data() {
    if (no_graphics) {
        for (var a in G.geometry) {
            var b = G.geometry[a];
            if (!b.data) {
                continue
            }
            b.data.tiles = [];
            b.data.placements = [];
            b.data.groups = []
        }
    }
    process_game_data()
}

var BACKUP = {};

function reload_data() {
    BACKUP.maps = G.maps;
    prop_cache = {};
}

function apply_backup() {
    G.maps = BACKUP.maps;
    gprocess_game_data();
    BACKUP = {}
}

function bc(a, b) {
    var c = $(a);
    if (c.hasClass("disabled")) {
        return 1
    }
    pcs(b);
    return 0
}

function btc(b, a) {
    stpr(b);
    pcs(a)
}

function show_loader() {
}

function hide_loader() {
}

function alert_json(a) {
    alert(JSON.stringify(a))
}

function game_stringify(d, b) {
    var a = [];
    try {
        return JSON.stringify(d, function (f, g) {
            if (in_arr(f, ["transform", "parent", "displayGroup", "vertexData", "animations", "tiles", "placements", "default", "children"]) || f.indexOf("filter_") != -1 || f[0] == "_") {
                return
            }
            if (g != null && typeof g == "object") {
                if (a.indexOf(g) >= 0) {
                    return
                }
                a.push(g)
            }
            return g
        }, b)
    } catch (c) {
        return "safe_stringify_exception"
    }
}

function game_stringify_simple(d, b) {
    try {
        if (d === undefined) {
            return "undefined"
        }
        var a = JSON.stringify(d, function (f, g) {
            if (in_arr(f, ["transform", "parent", "displayGroup", "parentGroup", "vertexData", "animations", "tiles", "placements", "default", "children", "tempDisplayObjectParent", "cachedTint", "vertexTrimmedData", "hp_bar"]) || f.indexOf("filter_") != -1 || f[0] == "_") {
                return
            }
            if (f == "data" && d[f] && d[f].x_lines) {
                return
            }
            return g
        }, b);
        try {
            if ("x" in d) {
                a = JSON.parse(a);
                a.x = d.x;
                a.y = d.y;
                a = JSON.stringify(a, undefined, b)
            }
        } catch (c) {
        }
        return a
    } catch (c) {
        return "game_stringify_simple_exception"
    }
}

function syntax_highlight(a) {
}

function stkp(a) {
}

function stprlink(a) {
}

function stpr(a) {
}

function clear_ui() {
}

function clear_ui2() {
}

function storage_get(a) {
    return localStorage.getItem(a)
}

function storage_set(a, b) {
    return localStorage.setItem(a, b)
}

var manifest = null;
var electron = null
    , path = null
    , electron_store = null;

function url_factory(b) {
    try {
        var c = b.split("?v=")[0]
            , a = b.split("?v=")[1];
        if (manifest[c]) {
            if (!a || manifest[c].v == a) {
                var d = path.resolve(electron.remote.app.getAppPath(), "./files" + c);
                return "file://" + d
            }
        }
    } catch (f) {
        console.log("url_factory: " + f)
    }
    return b
}

function electron_reset() {
    if (!electron) {
        electron = require("electron")
    }
    if (!path) {
        path = require("path")
    }
    var a = require("fs-extra");
    getAppPath = path.join(electron.remote.app.getPath("appData"), electron.remote.app.getName());
    a.unlink(getAppPath, function () {
        alert("App data cleared");
        electron.relaunch();
        electron.exit()
    })
}

function electron_dev_tools() {
    if (!electron) {
        electron = require("electron")
    }
    var a = electron.remote.getCurrentWindow();
    a.openDevTools({
        mode: "detach"
    })
}

var fullscreen = false;

function electron_fullscreen(b) {
    if (b == undefined) {
        b = !fullscreen
    }
    fullscreen = b;
    if (!electron) {
        electron = require("electron")
    }
    var a = electron.remote.getCurrentWindow();
    a.setFullScreen(fullscreen)
}

function electron_screenshot(b, a) {
    a = a || function () {
    }
    ;
    if (!b) {
        b = {
            delay: 0
        }
    }
    if (!a) {
        a = function () {
            console.log("Screenshot taken!")
        }
    }
    if (!b.filename) {
        b.filename = "AL Screenshot " + (new Date()) + ".png"
    }
    var c;
    try {
        c = require("electron").remote
    } catch (d) {
        c = require("remote")
    }
    setTimeout(function () {
        c.getCurrentWindow().capturePage(function f(g) {
            c.require("fs").writeFile(b.filename, g.toPNG(), a)
        })
    }, b.delay)
}

function electron_mas_receipt() {
    try {
        if (!electron) {
            electron = require("electron")
        }
        var a = electron.remote.app.getPath("exe");
        a = a.split(".app/Contents/")[0] + ".app/Contents/_MASReceipt/receipt";
        return electron.remote.require("fs").readFileSync(a).toString("base64")
    } catch (b) {
        console.log(b)
    }
    return ""
}

function electron_steam_ticket() {
    try {
        return storage_get("ticket") || ""
    } catch (a) {
        console.log(a)
    }
    return ""
}

function electron_get_data() {
    try {
        if (!electron) {
            electron = require("electron")
        }
        return electron.remote.getCurrentWindow().cdata || {}
    } catch (a) {
        return {}
    }
}

function electron_http_mode(a) {
    if (a === undefined) {
        a = true
    }
    storage_set("http_mode", a)
}

function electron_get_http_mode() {
    try {
        return storage_get("http_mode")
    } catch (a) {
        console.log(a)
    }
    return false
}

function electron_is_main() {
    try {
        if (!electron) {
            electron = require("electron")
        }
        if (electron.remote.getCurrentWindow().webContents.browserWindowOptions.sideWindow) {
            return false
        }
    } catch (a) {
        console.log(a)
    }
    return true
}

function electron_add_webview(a) {
    if (!a) {
        a = "http://thegame.com/character/GG/in/EU/I/"
    }
};