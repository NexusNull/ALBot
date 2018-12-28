var auto_api_methods = [], base_url =  "http://adventure.land";
var sounds = {};
var draw_timeouts = []
    , timers = {}
    , ping_sent = new Date()
    , modal_count = 0;
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
function ping() {
    ping_sent = new Date();
    socket.emit("ping_trig", {})
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
    if (!window.GCACHED) {
        window.GCACHED = {}
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
function disappearing_clone(b) {

}
function fade_away(b, a) {
    return function () {
        if (b == 20 || is_hidden()) {
            destroy_sprite(a, "children")
        } else {
            a.alpha -= 0.05;
            update_sprite(a);
            draw_timeout(fade_away(b + 1, a), 30, 1)
        }
    }
}
function show_game_guide() {

}
function hide_modal() {

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
var game_logs = [], game_chats = [];
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
function add_chat(b, k, d) {
    console.log(b,k,d)
}
function cpm_window(a) {

}
function add_pmchat(g, a, d) {

}
function add_partychat(a, d) {

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
    d.sort(function(g, f) {
        return (g.c_dist > f.c_dist) ? 1 : ((f.c_dist > g.c_dist) ? -1 : 0)
    });
    return d
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
                map_click({
                    data: {
                        global: {
                            x: width / 2,
                            y: Math.ceil(height / 2) + 0.01
                        }
                    }
                });
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
                            g.forEach(function(l) {
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
                                console.log("asd")
                                var g = get_nearby_hostiles({
                                    range: character.range - 2,
                                    limit: 3
                                })
                                    , a = [];
                                g.forEach(function(l) {
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
                                    g.forEach(function(l) {
                                        a.push(l.id)
                                    });
                                    socket.emit("skill", {
                                        name: "5shot",
                                        ids: a
                                    })
                                }
                            } else {
                                if (in_arr(b, ["invis", "partyheal", "darkblessing", "agitate", "cleave", "stomp", "charge", "light", "hardshell", "track", "warcry", "mcourage"])) {
                                    socket.emit("skill", {
                                        name: b
                                    })
                                } else {
                                    if (in_arr(b, ["supershot", "quickpunch", "quickstab", "taunt", "curse", "burst", "4fingers", "magiport", "absorb", "mluck", "rspeed"])) {
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
        if (b > 0) {
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
                        next_minteraction = "up";
                        setTimeout(arrow_movement_logic, 40)
                    } else {
                        if (c == "move_down") {
                            next_minteraction = "down";
                            setTimeout(arrow_movement_logic, 40)
                        } else {
                            if (c == "move_left") {
                                next_minteraction = "left";
                                setTimeout(arrow_movement_logic, 40)
                            } else {
                                if (c == "move_right") {
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
                                                    button: "Jump",
                                                    onclick: function() {
                                                        socket.emit("gm", {
                                                            action: "jump_list"
                                                        })
                                                    }
                                                });
                                                f.push({
                                                    button: "Invincible",
                                                    onclick: function() {
                                                        socket.emit("gm", {
                                                            action: "invincible"
                                                        });
                                                        hide_modal()
                                                    }
                                                });
                                                f.push({
                                                    button: "Mute",
                                                    onclick: function() {
                                                        hide_modal();
                                                        get_input({
                                                            button: "Mute",
                                                            onclick: function() {
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
                                                    onclick: function() {
                                                        hide_modal();
                                                        get_input({
                                                            button: "Jail",
                                                            onclick: function() {
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
                                                                                setTimeout(function() {
                                                                                    try {
                                                                                        codemirror_render.focus()
                                                                                    } catch (j) {}
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
                                                                                            onclick: function() {
                                                                                                use_skill("magiport", $(".mglocx").val());
                                                                                                hide_modal()
                                                                                            },
                                                                                            input: "mglocx",
                                                                                            placeholder: "Name",
                                                                                            title: "Magiport"
                                                                                        })
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
function on_skill_up(c) {
    var a = keymap[c]
        , b = a && a.name || a;
    if (!a) {
        return
    }
    if (a == "blink") {
        blink_pressed = false;
        last_blink_pressed = new Date()
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
    if (!window.character || !window.options.move_with_arrows) {
        return
    }
    if (up_pressed && left_pressed) {
        move(character.real_x - 50, character.real_y - 50)
    } else {
        if (up_pressed && right_pressed) {
            move(character.real_x + 50, character.real_y - 50)
        } else {
            if (up_pressed) {
                move(character.real_x, character.real_y - 50)
            } else {
                if (left_pressed && down_pressed) {
                    move(character.real_x - 50, character.real_y + 50)
                } else {
                    if (left_pressed) {
                        move(character.real_x - 50, character.real_y)
                    } else {
                        if (right_pressed && down_pressed) {
                            move(character.real_x + 50, character.real_y + 50)
                        } else {
                            if (right_pressed) {
                                move(character.real_x + 50, character.real_y)
                            } else {
                                if (down_pressed) {
                                    move(character.real_x, character.real_y + 50)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
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
    return;
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
    map_npcs.forEach(function(d) {
        b = distance(d, character);
        if (b < c) {
            c = b,
                a = d
        }
    });
    map_doors.forEach(function(d) {
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
        add_log("Character not found!", "#993D42");
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
function character_load_code() {}
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
function code_travel(a) {
    if (character.role == "gm") {
        socket.emit("transport", {
            to: a
        })
    } else {
        code_eval("smart_move({map:'" + a + "'})")
    }
}
function eval_snippet() {
}
function start_runner(a, b) {
}
function stop_runner(a) {
}
function code_persistence_logic() {
}
function toggle_runner() {
    if (code_run) {
        stop_runner();
        code_persistence_logic()
    } else {
        start_runner();
        code_persistence_logic()
    }
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
    return;
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
function direction_logic(a, b, c) {
    if (a.moving) {
        return
    }
    a.angle = Math.atan2(b.real_y - a.real_y, b.real_x - a.real_x) * 180 / Math.PI;
    set_direction(a, c)
}
function free_children(b) {
    if (!b.children) {
        return
    }
    for (var a = 0; a < b.children.length; a++) {
        b.children[a].parent = null
    }
}
function remove_sprite(a) {
}

function destroy_sprite(a, c) {
}
function trade(d, a, c, b) {
    b = b || 1;
    socket.emit("equip", {q: b, slot: d, num: a, value: ("" + c).replace_all(",", "").replace_all(".", "")});
}
function trade_buy(d, c, a, b) {
    b = b || 1;
    socket.emit("trade_buy", {slot: d, id: c, rid: a, q: b});
}
function secondhand_buy(a) {
    socket.emit("sbuy", {
        rid: a
    })
}
function buy_shells(a) {
    if ((a * 15000000 / 100) > character.gold) {
    } else {
        socket.emit("buy_shells", {
            gold: (a * 15000000 / 100)
        });
    }
}
function buy(a, b) {
    if (mssince(last_npc_right_click) < 100) {
        return
    }
    var c = "buy";
    if (G.items[a].cash) {
        c = "buy_with_cash"
    }
    socket.emit(c, {name: a, quantity: b});
}
function sell(a, b) {
    if (!b) {
        b = 1
    }
    socket.emit("sell", {num: a, quantity: b});
}
function call_code_function(functionName, b, a, f) {
    try {
        get_code_function(functionName)(b, a, f)
    } catch (d) {
        add_log(functionName + " " + d, "#E13758")
    }
}
function get_code_function(a) {
    return code_active && self.executor && self.executor.callbacks && self.executor.callbacks[a] || (function () {})
}
function private_say(a, c, b) {
    socket.emit("say", {message: c, code: b, name: a})
}
function party_say(b, a) {
    socket.emit("say", {message: b, code: a, party: true})
}
var last_say = "normal";
function say(g, f) {
    if (!g || !g.length) {
        return
    }
    last_say = "normal";
    if (g[0] == "/") {
        g = g.substr(1, 2000);
        var d = g.split(" ")
            , h = d.shift()
            , c = d.join(" ");
        if (h == "help" || h == "list" || h == "") {
            add_chat("", "/list");
            add_chat("", "/guide");
            add_chat("", "/invite NAME");
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
            if (is_electron) {
                add_chat("", "/new_window")
            }
        } else {
            if (is_electron && (h == "new_window" || h == "window" || h == "newwindow")) {
                window.open(base_url, "", {
                    width: $(window).width(),
                    height: $(window).height()
                })
            } else {
                if (h == "start") {
                    var b = c.split(" ")
                        , a = b.shift();
                    if (a) {
                        start_character_runner(a)
                    }
                } else {
                    if (h == "leave") {
                        socket.emit("party", {
                            event: "leave"
                        })
                    } else {
                        if (h == "stop") {
                            var b = c.split(" ")
                                , a = b.shift();
                            if (!a || a == "teleport") {
                                use_skill("stop")
                            } else {
                                if (a == "invis") {
                                    socket.emit("stop", {
                                        action: "invis"
                                    })
                                } else {
                                    stop_character_runner(a)
                                }
                            }
                        } else {
                            if (h == "disconnect") {
                                var b = c.split(" ")
                                    , a = b.shift();
                                if (!a) {
                                    window.location = base_url
                                } else {
                                    api_call("disconnect_character", {
                                        name: a
                                    })
                                }
                            } else {
                                if (h == "p") {
                                    party_say(c)
                                } else {
                                    if (h == "pause") {
                                        pause()
                                    } else {
                                        if (h == "snippet") {
                                            show_snippet()
                                        } else {
                                            if (h == "eval" || h == "execute") {
                                                code_eval(c)
                                            } else {
                                                if (h == "w" || h == "whisper" || h == "pm") {
                                                    var b = c.split(" ")
                                                        , a = b.shift()
                                                        , c = b.join(" ");
                                                    if (!a || !c) {
                                                        add_chat("", "Format: /w NAME MESSAGE")
                                                    } else {
                                                        private_say(a, c)
                                                    }
                                                } else {
                                                    if (h == "savecode") {
                                                        var b = c.split(" ")
                                                            , j = b.shift()
                                                            , a = b.join(" ");
                                                        if (j.length && !parseInt(j)) {
                                                            add_chat("", "/savecode NUMBER NAME");
                                                            add_chat("", "NUMBER can be from 1 to 100")
                                                        } else {
                                                            if (!j) {
                                                                j = 1
                                                            }
                                                            api_call("save_code", {
                                                                code: codemirror_render.getValue(),
                                                                slot: j,
                                                                name: a
                                                            })
                                                        }
                                                    } else {
                                                        if (h == "loadcode" || h == "runcode") {
                                                            var b = c.split(" ")
                                                                , a = b.shift();
                                                            if (!a) {
                                                                a = 1
                                                            }
                                                            api_call("load_code", {
                                                                name: a,
                                                                run: (h == "runcode" && "1" || "")
                                                            })
                                                        } else {
                                                            if (h == "ping") {
                                                                ping()
                                                            } else {
                                                                if (h == "whisper") {
                                                                    if (ctarget && !ctarget.me && !ctarget.npc && ctarget.type == "character") {
                                                                        private_say(ctarget.name, c)
                                                                    } else {
                                                                        add_chat("", "Target someone to whisper")
                                                                    }
                                                                } else {
                                                                    if (h == "party" || h == "invite") {
                                                                        var b = c.split(" ")
                                                                            , a = b.shift();
                                                                        if (a && a.length) {
                                                                            socket.emit("party", {
                                                                                event: "invite",
                                                                                name: a
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
                                                                        if (h == "friend") {
                                                                            var b = c.split(" ")
                                                                                , a = b.shift();
                                                                            if (a && a.length) {
                                                                                socket.emit("friend", {
                                                                                    event: "request",
                                                                                    name: a
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
                                                                            if (h == "guide") {
                                                                            } else {
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
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
            message: g,
            code: f
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
function upgrade(u_item,u_scroll,u_offering) {
    if (u_item == null || (u_scroll == null && u_offering == null)) {
        d_text("INVALID", character)
    } else {
        socket.emit("upgrade", {
            item_num: u_item,
            scroll_num: u_scroll,
            offering_num: u_offering,
            clevel: (character.items[u_item].level || 0)
        })
    }
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
    if (in_arr(exchange_type, ["mistletoe", "ornament", "candycane"])) {
        a = exccolorsc
    }
    if (mssince(last_excanim) > 300) {
        last_excanim = new Date();
        exclast++
    }
}
function exchange(e_item, a) {
    var b = 3000;
    if (a) {
        socket.emit("exchange", {item_num: e_item, q: character.items[e_item].q});
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
function compound(item0,item1,item2,scroll_num,offering_num) {
    if (scroll_num == null || typeof item0 === "undefined" || typeof item1 === "undefined"||typeof item2 === "undefined") {
        console.log("INVALID")
    } else {
        socket.emit("compound", {
            items: [item0,item1,item2],
            scroll_num: scroll_num,
            offering_num: offering_num,
            clevel: (character.items[item0].level || 0)
        });
    }
}
function craft(i0,i1,i2,i3,i4,i5,i6,i7,i8) {
    var a = [i0,i1,i2,i3,i4,i5,i6,i7,i8], b = false;
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
function reopen() {
    u_scroll = c_scroll = e_item = null;
    draw_trigger(function() {
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
                            if (rendered_target == "crafter") {
                                render_crafter()
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
            exchange_animations = false
        }
    })
}
function esc_pressed() {
    throw new Error("esc_pressed is not supported.");

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
                if (topleft_npc) {
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
        if (a && !in_arr(rendered_target, ["upgrade", "compound", "exchange", "npc", "merchant", "crafter"])) {
            return
        }
        render_inventory(), render_inventory()
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
function generate_textures(b, l) {
    return;
    console.log("generate_textures " + b + " " + l);
    if (l == "full") {
        var k = D[b], c = k[2], o = k[3], q = 0, p = 0;
        var n = G.actual_dimensions[b];
        if (n) {
            c = n[0];
            o = n[1];
            q = round((k[2] - c) / 2 + (n[2] || 0));
            p = round(k[3] - o + (n[3] || 0))
        }
        textures[b] = [[null, null, null, null], [null, null, null, null], [null, null, null, null]];
        for (var h = 0; h < 3; h++) {
            for (var f = 0; f < 4; f++) {
                var m = new PIXI.Rectangle(k[0] + h * k[2] + q, k[1] + f * k[3] + p, c, o);
                if (offset_walking && !n) {
                    m.y += 2, m.height -= 2
                }
                textures[b][h][f] = new PIXI.Texture(C[FC[b]], m)
            }
        }
    }
    if (l == "animation") {
        var n = G.animations[b];
        var c = PIXI.utils.BaseTextureCache[n.file].width, g = Math.floor(c / n.frames);
        var o = PIXI.utils.BaseTextureCache[n.file].height;
        textures[b] = e_array(n.frames);
        for (var h = 0; h < n.frames; h++) {
            var m = new PIXI.Rectangle(0 + g * h, 0, g, o);
            textures[b][h] = new PIXI.Texture(PIXI.utils.BaseTextureCache[n.file], m)
        }
    }
    if (l == "animatable") {
        var k = G.positions[b];
        textures[b] = e_array(k.length);
        var h = 0;
        k.forEach(function (d) {
            var a = new PIXI.Rectangle(d[1], d[2], d[3], d[4]);
            textures[b][h++] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[d[0]]], a)
        })
    }
    if (l == "emote") {
        var k = D[b];
        textures[b] = [null, null, null];
        for (var h = 0; h < 3; h++) {
            var m = new PIXI.Rectangle(k[0] + h * k[2], k[1], k[2], k[3]);
            textures[b][h] = new PIXI.Texture(C[FC[b]], m)
        }
    }
}
function set_texture(d, b, a) {
    var f = b + "" + a;
    if (d.cskin == f) {
        return
    }
    if (d.stype == "full") {
        d.texture = textures[d.skin][b][a]
    }
    if (d.stype == "animation") {
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
function new_sprite(l, h, a) {
    return;
    if (h == "full") {
        if (!textures[l]) {
            generate_textures(l, "full")
        }
        var k = new PIXI.Sprite(textures[l][1][0]);
        k.cskin = "10"
    }
    if (h == "chest") {
        var g = textures["chest_" + l];
        if (!g) {
            var f = D[l];
            var j = new PIXI.Rectangle(f[0], f[1], f[2], f[3]);
            var g = new PIXI.Texture(C[FC[l]], j);
            textures["chest_" + l] = g
        }
        var k = new PIXI.Sprite(g);
        k.cskin = undefined + "" + undefined
    }
    if (h == "animatable") {
        if (!textures[l]) {
            generate_textures(l, "animatable")
        }
        var k = new PIXI.Sprite(textures[l][0]);
        k.cskin = "0" + undefined;
        k.frame = 0;
        k.frames = textures[l].length
    }
    if (h == "animation") {
        if (!textures[l]) {
            generate_textures(l, "animation")
        }
        var k = new PIXI.Sprite(textures[l][0]);
        k.cskin = "0" + undefined;
        k.frame = 0;
        k.frames = textures[l].length
    }
    if (h == "emote") {
        if (!textures[l]) {
            generate_textures(l, "emote")
        }
        var k = new PIXI.Sprite(textures[l][0]);
        k.cskin = "0" + undefined;
        k.frame = 0
    }
    if (h == "static") {
        var g = textures["static_" + l];
        if (!g) {
            var c = G.positions[l], b = G.tilesets[c[0]];
            var j = new PIXI.Rectangle(c[1], c[2], c[3], c[4]);
            var g = new PIXI.Texture(PIXI.utils.BaseTextureCache[b], j);
            textures["static_" + l] = g
        }
        var k = new PIXI.Sprite(g);
        k.cskin = undefined + "" + undefined
    }
    k.skin = l;
    k.stype = h;
    k.updates = 0;
    return k
}
function recreate_dtextures() {
    (window.dtextures || []).forEach(function (c) {
        if (c) {
            c.destroy()
        }
    });
    dtile_width = max(width, screen.width);
    dtile_height = max(height, screen.height);
    for (var b = 0; b < 3; b++) {
        var a = new PIXI.extras.TilingSprite(M["default"][5 + b] || M["default"][5], dtile_width / scale + 3 * dtile_size, dtile_height / scale + 3 * dtile_size);
        dtextures[b] = PIXI.RenderTexture.create(dtile_width + 4 * dtile_size, dtile_height + 4 * dtile_size, PIXI.SCALE_MODES.NEAREST, 1);
        renderer.render(a, dtextures[b]);
        a.destroy()
    }
    console.log("recreated dtextures");
    if (dtile) {
        dtile.texture = dtextures[water_frame()]
    }
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
function assassin_smoke(a, f, c) {
    return;
    if (!c) {
        c = "explode_p"
    }
    var b = new_sprite(c, "animation");
    b.displayGroup = player_layer;
    b.x = round(a);
    b.y = round(f);
    b.real_x = a;
    b.real_y = f + 1;
    if (c == "explode_p") {
        b.width = 16;
        b.height = 16
    }
    b.anchor.set(0.5, 1);
    map.addChild(b);
    function d(g) {
        return function () {
            if (g >= 12) {
                destroy_sprite(b)
            } else {
                b.y -= 3;
                b.height += 1;
                b.width += 1;
                b.frame++;
                set_texture(b, b.frame);
                draw_timeout(d(g + 1), 40)
            }
        }
    }

    draw_timeout(d(1), 40)
}
function confetti_shower(c, h) {
    return;
    var a = 200, f = 1, g = 25;
    if (h == 2) {
        a = 150, f = 2, g = 60
    }
    if (is_hidden()) {
        g = 2
    }
    for (var d = 0; d < g; d++) {
        for (var b = 0; b < f; b++) {
            draw_timeout(function () {
                var j = get_entity(c);
                if (!j) {
                    return
                }
                assassin_smoke(j.real_x + (Math.random() * 80 - 40), j.real_y + (Math.random() * 80 - 40), "confetti")
            }, d * a)
        }
    }
}
function start_animation(d, c, g) {
    return;
    if (d.animations[c]) {
        d.animations[c].frame = 0;
        return
    }
    var b = new_sprite(c, "animation"), f = (d.awidth || d.width), a = (d.aheight || d.height);
    d.animations[c] = b;
    if (G.animations[c].alpha) {
        b.alpha = G.animations[c].alpha
    } else {
        b.alpha = 0.5
    }
    if (g == "stun") {
        b.continuous = true;
        b.width = round(f * 2 / 3);
        b.height = round(a / 3);
        b.y = -a + 8
    }
    if (c == "transport" || c == "invincible") {
        b.continuous = true;
        b.height = round(a * 0.95)
    } else {
        if (G.animations[c].proportional) {
            if (1 * b.height * f / b.width > a) {
                b.height = a;
                b.width = ceil(1 * b.width * a / b.height)
            } else {
                b.height = ceil(1 * b.height * f / b.width);
                b.width = d.width
            }
        } else {
            if (G.animations[c].size) {
                b.width = round(f * G.animations[c].size);
                b.height = round(a * G.animations[c].size)
            } else {
                b.width = f;
                b.height = a
            }
        }
    }
    b.aspeed = G.animations[c].aspeed;
    b.anchor.set(0.5, 1);
    d.addChild(b)
}
function stop_animation(b, a) {
    return;
    var d = b.animations[a];
    if (!d) {
        return
    }
    var c = d.parent;
    if (!c) {
        return
    }
    destroy_sprite(d);
    delete c.animations[a]
}
function set_base_rectangle(b) {
    return;
    var a = b.texture.frame;
    b.base_rectangle = new PIXI.Rectangle(a.x, a.y, a.width, a.height)
}
function dirty_fix(a) {
    return;
    var b = a.texture.frame;
    a.texture = new PIXI.Rectangle(b.x, b.y + 8, b.width, b.height)
}
function restore_base(b) {
    return;
    var a = b.base_rectangle;
    b.texture.frame = new PIXI.Rectangle(a.x, a.y, a.width, a.height)
}
function rotate(l, g) {
    return;
    var m = PIXI.GroupD8, j = l.texture;
    var d = m.isSwapWidthHeight(g) ? j.frame.width : j.frame.height;
    var k = m.isSwapWidthHeight(g) ? j.frame.height : j.frame.width;
    var a = j.frame;
    var f = new PIXI.Rectangle(0, 0, k, d);
    var b = f;
    if (g % 2 == 0) {
        var c = new PIXI.Texture(j.baseTexture, a, f, b, g)
    } else {
        var c = new PIXI.Texture(j.baseTexture, a, f, b, g - 1);
        c.rotate++
    }
    l.texture = c
}
function rotated_texture(j, a, g) {
    return;
    if (!g) {
        return new PIXI.Texture(j, a)
    }
    var l = PIXI.GroupD8;
    var d = l.isSwapWidthHeight(g) ? a.width : a.height;
    var k = l.isSwapWidthHeight(g) ? a.height : a.width;
    var f = new PIXI.Rectangle(0, 0, k, d);
    var b = f;
    if (g % 2 == 0) {
        var c = new PIXI.Texture(j, a, f, b, g)
    } else {
        var c = new PIXI.Texture(j, a, f, b, g - 1);
        c.rotate++
    }
    return c
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
            try {
                timeout[0]()
            } catch (d) {
                console.log("draw_timeout_error: " + d)
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
    return;
    var c = new Date(), s = [];
    for (var h = 0; h < tints.length; h++) {
        var d = tints[h], a = 240, j = 95, p = 0, f = 50, n = 205, l = 50;
        if (d.type == "skill") {
            if (c > d.end) {
                $(d.selector).parent().find("img").css("opacity", 1);
                s.push(h);
                $(d.selector).css("height", "0px").css("background-color", "rgb(" + a + "," + j + "," + p + ")")
            } else {
                if (!d.added) {
                    d.added = true;
                    $(d.selector).css("height", "1px")
                }
                var m = mssince(d.start), q = -mssince(d.end);
                var t = 2 * 46 * m / (m + q + 1), k = m / (m + q + 1);
                $(d.selector).css("background-color", "rgb(" + round(a + (f - a) * k) + "," + round(j + (n - j) * k) + "," + round(p + (l - p) * k) + ")");
                $(d.selector).css({
                    "-webkit-transform": "scaleY(" + t + ")",
                    "-moz-transform": "scaleY(" + t + ")",
                    "-ms-transform": "scaleY(" + t + ")",
                    "-o-transform": "scaleY(" + t + ")",
                    transform: "scaleY(" + t + ")",
                })
            }
        } else {
            if (d.type == "dissipate") {
                if (c > d.end) {
                    $(d.selector).parent().css("background", "black");
                    s.push(h)
                } else {
                    var a = d.r, j = d.g, p = d.b, o = 20;
                    if (d.i < o) {
                        a = round(a - (a / 2 / o) * d.i);
                        j = round(j - (j / 2 / o) * d.i);
                        p = round(p - (p / 2 / o) * d.i);
                        if (d.i == o - 1) {
                            d.mid = new Date()
                        }
                    } else {
                        var m = mssince(d.mid), q = -mssince(d.end);
                        var k = min(1, max(0, 1 * m / (m + q + 1)));
                        a = round((1 - k) * a / 2);
                        j = round((1 - k) * j / 2);
                        p = round((1 - k) * p / 2)
                    }
                    $(d.selector).parent().css("background", "rgb(" + a + "," + p + "," + p + ")")
                }
                d.i++
            } else {
                if (d.type == "brute") {
                    if (c > d.end) {
                        if (tint_c[d.key] == d.cur) {
                            $(d.selector).children(".thetint").remove();
                            $(d.selector).css("background", d.reset_to)
                        }
                        s.push(h)
                    } else {
                        if (tint_c[d.key] != d.cur) {
                            continue
                        }
                        if (!d.added) {
                            d.added = true;
                            $(d.selector).append("<div style='position: absolute; " + (d.pos || "bottom") + ": 0px; left: 0px; right: 0px; height: 1px; background: " + d.color + "; z-index: 0' class='thetint'></div>")
                        }
                        var m = mssince(d.start), q = -mssince(d.end);
                        var t = 60.1 * m / (m + q + 1);
                        $(d.selector).children(".thetint").css({
                            "-webkit-transform": "scaleY(" + t + ")",
                            "-moz-transform": "scaleY(" + t + ")",
                            "-ms-transform": "scaleY(" + t + ")",
                            "-o-transform": "scaleY(" + t + ")",
                            transform: "scaleY(" + t + ")",
                        })
                    }
                } else {
                    if (d.type == "fill") {
                        if (c > d.end) {
                            d.type = "glow";
                            $(d.selector).css("background", d.reset_to);
                            if (d.on_end) {
                                d.on_end()
                            }
                            s.push(h)
                        } else {
                            var m = mssince(d.start), q = -mssince(d.end);
                            var u = round(100 * m / (m + q + 1));
                            if (d.reverse) {
                                u = 100 - u
                            }
                            u = max(1, u);
                            $(d.selector).css("background", "-webkit-gradient(linear, " + d.start_d + ", " + d.end_d + ", from(" + d.color + "), to(" + d.back_to + "), color-stop(" + (u - 1) + "%," + d.color + "),color-stop(" + u + "%, " + d.back_to + ")")
                        }
                    } else {
                        if (d.type == "glow") {
                        } else {
                            if (d.type == "half") {
                                $(d.selector).css("background", "-webkit-gradient(linear, left top, right top, from(#f0f), to(#0f0), color-stop(49%,#f0f),color-stop(50%, #0f0)")
                            }
                        }
                    }
                }
            }
        }
    }
    if (s) {
        delete_indices(tints, s)
    }
}
function add_tint(a, b) {
    return;
    if (mode.dom_tests) {
        return
    }
    if (!b) {
        b = {}
    }
    if (!b.color) {
        b.color = "#999787"
    }
    if (!b.ms) {
        b.ms = 1000
    }
    if (!b.type) {
        b.type = "fill"
    }
    if (!b.back_to) {
        b.back_to = "black"
    }
    if (!b.reset_to) {
        b.reset_to = b.back_to
    }
    if (!b.start_d) {
        b.start_d = "left bottom"
    }
    if (!b.end_d) {
        b.end_d = "left top"
    }
    b.selector = a;
    b.start = new Date();
    b.end = new Date();
    b.end.setMilliseconds(b.end.getMilliseconds() + b.ms);
    tints.push(b)
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
            if (g[0] == c) {
                socket.emit("equip", {num: b});
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
var tint_c = {a: 0, p: 0, t: 0};
function attack_timeout(a) {
    next_attack = future_ms(a);
}
function pot_timeout(a) {
    next_potion = future_ms(a);
    skill_timeout("use_hp", a);
    skill_timeout("use_mp", a)
}
function pvp_timeout(a, b) {
    next_transport = future_ms(a);
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
    var f = 200, d = 50, a = 20;
    if (h == "sneak") {
        f = 45, d = 111, a = 45
    }
    next_transport = future_ms(c);
    skill_timeout("use_town", c);
    if (h == 1) {
        return
    }
}
var next_skill = {};
function skill_timeout(skill, ms) {
    console.log(skill);
    var c = "";
    if (!ms) {
        ms = G.skills[skill].cooldown
    }
    next_skill[skill] = future_ms(ms);
}
function disappearing_circle(a, g, d, b) {
}
function empty_rect(b, g, f, a, d, c) {

}
function draw_line(a, g, c, f, d, b) {

}
function draw_circle(a, d, c, b) {

}
function add_border(b, c, a) {

}
function player_rclick_logic(a) {

}
function border_logic(a) {

}
function rip_logic() {
    if (character.rip && !rip) {
        rip = true;
        character.moving = false;
        skill_timeout("use_town", 12000);
        reopen()
    }
    if (!character.rip && rip) {
        rip = false;
    }
}
function name_logic(a) {
    if (a.type != "character" && a.type != "npc") {
        return
    }
    if (!show_names && a.name_tag) {
        destroy_sprite(a.name_tag, "children");
        a.name_tag = null;
        a.ntag_cache = null
    } else {
        if (show_names) {
            add_name_tag(a)
        }
    }
}
function add_name_tag(c) {
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
function d_line(d, a, b) {
}
function d_text(n, j, h, g) {
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
            if (j) {
                j.removeClass("disable")
            }
        }
    }

    if (g.r_id) {
        show_loader(g.r_id)
    }
    call_args = {type: "POST", dataType: "json", url: base_url + path, data: data, success: success(g, b), error: error(g, b)};
    $.ajax(call_args)
}
function api_call_l(c, a, b) {
    if (!a) {
        a = {}
    }
    a.ui_loader = true;
    return api_call(c, a, b)
}
var warned = {}, map_info = {};

function new_map_logic(a, b) {
    map_info = b.info || {};
    if (current_map == "abtesting" && !abtesting) {
        abtesting = {A: 0, B: 0};
        abtesting_ui = true;
        abtesting.end = future_s(G.events.abtesting.duration)
    }
    if (current_map != "abtesting" && abtesting_ui) {
        abtesting = false;
        abtesting_ui = false;
        $("#abtesting").remove()
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
                        smart_eval(window[info.func], info.args)
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
function sfx(a) {

}
function pcs(a) {
}
function init_sounds() {
}
function init_fx() {
}
function init_music() {
}
var current_music = null;
function reflect_music() {

}
var BACKUP = {};
function reload_data() {
    BACKUP.maps = G.maps;
    prop_cache = {};
}
function apply_backup() {
    G.maps = BACKUP.maps;
    process_game_data();
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
function syntax_highlight(a) {
    a = a.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return a.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (c) {
        var b = "shnumber";
        if (/^"/.test(c)) {
            if (/:$/.test(c)) {
                b = "shkey"
            } else {
                b = "shstring"
            }
        } else {
            if (/true|false/.test(c)) {
                b = "shboolean"
            } else {
                if (/null/.test(c)) {
                    b = "shnull"
                }
            }
        }
        return '<span class="' + b + '">' + c + "</span>"
    })
}
function stpr(a) {
    try {
        if (a == "manual") {
            return
        }
        a.stopPropagation()
    } catch (b) {
    }
};