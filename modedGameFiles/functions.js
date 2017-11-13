var auto_api_methods = [], base_url =  "http://adventure.land";
var sounds = {};
var draw_timeouts = [], timers = {}, ping_sent = new Date(), modal_count = 0;
function is_hidden() {
    return false
}
var last_id_sent = "";
function send_target_logic() {
    if (ctarget && last_id_sent != ctarget.id) {
        last_id_sent = ctarget.id;
        socket.emit("target", {id: ctarget.id})
    }
    if (!ctarget && last_id_sent) {
        last_id_sent = "";
        socket.emit("target", {id: ""})
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
    socket.emit("cm", {to: b, message: JSON.stringify(a)})
}
function use_skill(b, c) {
    if (b == "use_hp" || b == "hp") {
        use("hp")
    } else {
        if (b == "use_mp" || b == "mp") {
            use("mp")
        } else {
            if (b == "use_town" || b == "town") {
                if (character.rip) {
                    socket.emit("respawn")
                } else {
                    socket.emit("town")
                }
            } else {
                if (b == "charge") {
                    socket.emit("ability", {name: "charge"})
                } else {
                    if (b == "light") {
                        socket.emit("ability", {name: "light"})
                    } else {
                        if (b == "burst" && c) {
                            socket.emit("ability", {name: "burst", id: c.id})
                        } else {
                            if (b == "taunt" && c) {
                                socket.emit("ability", {name: "taunt", id: c.id})
                            } else {
                                if (b == "invis") {
                                    socket.emit("ability", {name: "invis"})
                                } else {
                                    if (b == "supershot") {
                                        socket.emit("ability", {name: "supershot", id: c.id})
                                    } else {
                                        if (b == "curse" && c) {
                                            socket.emit("ability", {name: "curse", id: c.id})
                                        } else {
                                            if (b == "pcoat") {
                                                var a = item_position("poison");
                                                if (a === undefined) {
                                                    add_log("You don't have a poison sack", "gray");
                                                    return
                                                }
                                                socket.emit("ability", {name: "pcoat", num: a})
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
function gallery_click(a) {
    return;
    render_item("#topleftcornerdialog", {id: "buying" + a, item: G.items[a], name: a, buying: true})
}
function inventory_click(a) {
    return;
    if (character.items[a]) {
        if (character.items[a].name == "computer") {
            return render_computer_network(".inventory-item")
        }
        render_item(".inventory-item", {
            id: "citem" + a,
            item: G.items[character.items[a].name],
            name: character.items[a].name,
            actual: character.items[a],
            num: a
        })
    }
}
function slot_click(a) {
    return;
    if (ctarget && ctarget.slots && ctarget.slots[a]) {
        dialogs_target = ctarget;
        render_item("#topleftcornerdialog", {
            id: "item" + a,
            item: G.items[ctarget.slots[a].name],
            name: ctarget.slots[a].name,
            actual: ctarget.slots[a],
            slot: a,
            from_player: ctarget.id
        })
    }
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
    if (character && a == character.id) {
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
    var d = $(a), f = d.data("id"), c = code_buttons[f].fn;
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
            c = b, a = d
        }
    });
    map_doors.forEach(function (d) {
        b = distance(d, character);
        if (b < c) {
            c = b, a = d
        }
    });
    if (a) {
        a.onrclick()
    } else {
        add_log("Nothing nearby", "gray")
    }
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
    socket.emit("transport", {to: a, s: b})
}
function show_snippet() {
    return;

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
function eval_snippet() {
    throw new Error("eval_snippet is not supported.");
    code_eval(codemirror_rewnder3.getValue())
}
function start_runner(a, b) {
    throw new Error("start_runner is not supported.");
}
function stop_runner(a) {
    throw new Error("stop_runner is not supported.");
}
function code_persistence_logic() {
    throw new Error("code_persistence_logic is not supported.");
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
    throw new Error("toggle_code is not supported.");
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
function set_direction(a, c) {
    var b = 70;
    if (c == "npc") {
        b = 45
    }
    if (abs(a.angle) < b) {
        a.direction = 2
    } else {
        if (abs(abs(a.angle) - 180) < b) {
            a.direction = 1
        } else {
            if (abs(a.angle + 90) < 90) {
                a.direction = 3
            } else {
                a.direction = 0
            }
        }
    }
    if (c == "attack" && !a.me && is_monster(a)) {
        if (a.direction == 0) {
            a.real_y += 2, a.y_disp = 2
        } else {
            if (a.direction == 3) {
                a.real_y -= 2, a.y_disp = -2
            } else {
                if (a.direction == 1) {
                    a.real_x -= 2
                } else {
                    a.real_x += 2
                }
            }
        }
        setTimeout(function () {
            if (a.direction == 0) {
                a.real_y -= 1, a.y_disp -= 1
            } else {
                if (a.direction == 3) {
                    a.real_y += 1, a.y_disp += 1
                } else {
                    if (a.direction == 1) {
                        a.real_x += 1
                    } else {
                        a.real_x -= 1
                    }
                }
            }
        }, 60);
        setTimeout(function () {
            if (a.direction == 0) {
                a.real_y -= 1, a.y_disp -= 1
            } else {
                if (a.direction == 3) {
                    a.real_y += 1, a.y_disp += 1
                } else {
                    if (a.direction == 1) {
                        a.real_x += 1
                    } else {
                        a.real_x -= 1
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
function call_code_function(c, b, a, f) {
    try {
        get_code_function(c)(b, a, f)
    } catch (d) {
        add_log(c + " " + d, "#E13758")
    }
}
function get_code_function(a) {
    return code_active || (function () {
        })
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
        var d = g.split(" "), h = d.shift(), c = d.join(" ");
        if (h == "help" || h == "list" || h == "") {
            add_chat("", "/list");
            add_chat("", "/guide");
            add_chat("", "/invite NAME");
            add_chat("", "/friend NAME");
            add_chat("", "/whisper NAME things");
            add_chat("", "/p things");
            add_chat("", "/ping");
            add_chat("", "/eval CODE");
            add_chat("", "/snippet")
        } else {
            if (h == "p") {
                party_say(c)
            } else {
                if (h == "snippet") {
                    show_snippet()
                } else {
                    if (h == "eval" || h == "execute") {
                        code_eval(c)
                    } else {
                        if (h == "w" || h == "whisper") {
                            var b = c.split(" "), a = b.shift(), c = b.join(" ");
                            if (!a || !c) {
                                add_chat("", "Format: /w NAME MESSAGE")
                            } else {
                                private_say(a, c)
                            }
                        } else {
                            if (h == "savecode") {
                                var b = c.split(" "), j = b.shift(), a = b.join(" ");
                                if (j.length && !parseInt(j)) {
                                    add_chat("", "/savecode NUMBER NAME");
                                    add_chat("", "NUMBER can be from 1 to 100")
                                } else {
                                    if (!j) {
                                        j = 1
                                    }
                                    api_call("save_code", {code: codemirror_render.getValue(), slot: j, name: a})
                                }
                            } else {
                                if (h == "loadcode" || h == "runcode") {
                                    var b = c.split(" "), a = b.shift();
                                    if (!a) {
                                        a = 1
                                    }
                                    api_call("load_code", {name: a, run: (h == "runcode" && "1" || "")})
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
                                                var b = c.split(" "), a = b.shift();
                                                if (a && a.length) {
                                                    socket.emit("party", {event: "invite", name: a})
                                                } else {
                                                    if (ctarget && !ctarget.me && !ctarget.npc && ctarget.type == "character") {
                                                        socket.emit("party", {event: "invite", id: ctarget.id})
                                                    } else {
                                                        add_chat("", "Target someone to invite")
                                                    }
                                                }
                                            } else {
                                                if (h == "friend") {
                                                    var b = c.split(" "), a = b.shift();
                                                    if (a && a.length) {
                                                        socket.emit("friend", {event: "request", name: a})
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
                                                }
                                            }
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
        socket.emit("say", {message: g, code: f})
    }
}
function activate(a) {
    socket.emit("booster", {num: a, action: "activate"})
}
function shift(a, b) {
    socket.emit("booster", {num: a, action: "shift", to: b})
}
function open_merchant(a) {
    socket.emit("merchant", {num: a})
}
function close_merchant() {
    socket.emit("merchant", {close: 1})
}
function upgrade() {
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
    socket.emit("bank", {operation: "deposit", amount: parseInt(a)})
}
function withdraw(a) {
    if (!G.maps[current_map].mount) {
        add_log("Not in the bank.", "gray");
        return;
    }
    socket.emit("bank", {operation: "withdraw", amount: parseInt(a)})
}
var exchange_animations = false, last_excanim = new Date(), exclast = 0;
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
function exchange(a) {
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
            socket.emit("exchange", {item_num: d, q: f})
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
function compound() {
    if (c_last != 3 || c_scroll == null) {
        d_text("INVALID", character)
    } else {
        socket.emit("compound", {
            items: c_items,
            scroll_num: c_scroll,
            offering_num: c_offering,
            clevel: (character.items[c_items[0]].level || 0)
        })
    }
}
function craft() {
    var a = [], b = false;
    for (var c = 0; c < 9; c++) {
        if (cr_items[c] || cr_items[c] === 0) {
            b = true, a.push([c, cr_items[c]])
        }
    }
    if (!b) {
        d_text("INVALID", character)
    } else {
        socket.emit("craft", {items: a})
    }
}
function reopen() {
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
    var currentDate = new Date(), a = [];
    for (var i = 0; i < draw_timeouts.length; i++) {
        var timeout = draw_timeouts[i];
        if (f && f == 2 && timeout[2] != 2) {
            continue
        }
        if (currentDate >= timeout[1]) {
            a.push(i);
            try {
                timeout[0]()
            } catch (d) {
                console.log("draw_timeout_error: " + d)
            }
        }
    }
    if (a) {
        delete_indices(draw_timeouts, a)
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
        socket.emit("use", {item: c})
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
function skill_timeout(b, a) {
    var c = "";
    if (!a) {
        a = G.skills[b].cooldown
    }
    next_skill[b] = future_ms(a);

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
    $(".csharp").val("" + a);
    $(".codename").val(code_list[a])
}
function save_code_s() {
    if (!$(".csharp").val()) {
        return
    }
    api_call("save_code", {
        code: codemirror_render.getValue(),
        slot: $(".csharp").val(),
        name: $(".codename").val(),
        log: 1
    })
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
                //$("#message").html(info.message)
            } else {
                ui_error(info.message)
            }
        }
        if (in_arr(info.type, ["success"])) {
            if (inside == "message") {
                $("#message").html(info.message)
            } else {
                ui_success(info.message)
            }
        } else {
            if (info.type == "content") {
                //$("#content").html(info.html);
                //resize()
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
    if (is_sdk) {
        alert(a)
    }
}
function sfx(a) {
    try {
        if (!window.sound_sfx) {
            return
        }
        if (a == "hit" || a == "monster_hit") {
            sounds.hit_8bit.play()
        }
        if (a == "explosion") {
            sounds.fx_explosion.play()
        }
        if (a == "coins") {
            sounds.coin_collect.play()
        }
        if (a == "hp" || a == "mp") {
            sounds.use_8bit.play()
        }
        if (a == "chat") {
            sounds.chat.play()
        }
    } catch (b) {
        add_alert(b)
    }
}
function pcs(a) {
    if (!window.sound_sfx) {
        return
    }
    if (!a || a == 0) {
        if (sounds.click) {
            sounds.click.play()
        }
    }
    if (a == "success" && sounds.success) {
        sounds.success.play()
    }
}
function init_sounds() {
    sounds.click = new Howl({src: ["/sounds/effects/click_natural.wav"], volume: 0.5,});
    if (sound_sfx) {
        init_fx()
    }
    if (sound_music) {
        init_music()
    }
}
function init_fx() {
    if (window.fx_init) {
        return
    }
    window.fx_init = 1;
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