var auto_api_methods = []
    , base_url = window.location.protocol + "//" + window.location.host;
var sounds = {};
var draw_timeouts = []
    , timers = {}
    , ping_sent = new Date()
    , modal_count = 0;
function is_hidden() {
    return document.hidden
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
function disappearing_clone(c, a) {
    if (!a) {
        a = {}
    }
    var d = c.texture;
    if (a.random && c.stype == "full") {
        d = textures[c.skin][parseInt(Math.random() * 3)][parseInt(Math.random() * 4)]
    }
    var b = new PIXI.Sprite(d);
    b.x = a.x || get_x(c);
    b.y = a.y || get_y(c) - 1;
    b.width = c.width / (c.cscale || 1);
    b.height = c.height / (c.cscale || 1);
    if (a.rcolor) {
        start_filter(b, "rcolor")
    }
    if (use_layers) {
        b.parentGroup = c.parentGroup
    } else {
        b.displayGroup = c.displayGroup
    }
    b.anchor = c.anchor;
    b.alpha = 0.8;
    map.addChild(b);
    draw_timeout(fade_away(5, b), 15)
}
function fade_out_blink(b, a) {
    return function() {
        if (!a.fading_out) {
            return
        }
        if (b == 10 || is_hidden()) {
            if (a == character) {
                return
            }
        } else {
            a.alpha -= 0.1;
            a.height += (a.cscale || 1);
            draw_timeout(fade_out_blink(b + 1, a), 30, 1)
        }
    }
}
function fade_out_magiport(b, a) {
    return function() {
        if (!a.fading_out) {
            return
        }
        if (b == 15 || is_hidden()) {
            if (a == character) {
                return
            }
        } else {
            a.alpha -= 0.05;
            a.height -= (a.cscale || 1);
            a.width -= (a.cscale || 1);
            draw_timeout(fade_out_magiport(b + 1, a), 16, 1)
        }
    }
}
function fade_away_teleport(b, a) {
    return function() {
        if (b == 10 || is_hidden()) {
            if (a == character) {
                return
            }
            destroy_sprite(a, "children")
        } else {
            a.alpha -= 0.1;
            update_sprite(a);
            draw_timeout(fade_away_teleport(b + 1, a), 30, 1)
        }
    }
}
function fade_away(b, a) {
    return function() {
        if (b == 20 || is_hidden()) {
            destroy_sprite(a, "children")
        } else {
            a.alpha -= 0.05;
            update_sprite(a);
            draw_timeout(fade_away(b + 1, a), 30, 1)
        }
    }
}
function booster_modal_logic() {
    $(".bitems").html(item_container({
        skin: G.items.cscroll1.skin
    }, {
        name: "cscroll1"
    }));
    $(".bitemo").html(item_container({
        skin: G.items.offering.skin
    }, {
        name: "offering"
    }));
    for (var a = 1; a <= 5; a++) {
        $(".bitem" + a).html(item_container({
            skin: G.items.goldbooster.skin_a
        }, {
            level: a,
            name: "goldbooster",
            expires: future_s(999999999)
        }))
    }
}
var snip_wl_code = 'map_key("Q","snippet","smart_move(\'winterland\')");\n//Press Q in the Game to test this, after you EXECUTE!';
var snip_esc_code = "map_key(\"ESC\",{name:\"eval\",code:\"use_skill('stop'); esc_pressed();\",skin:G.skills.stop.skin});\n//Overrides ESC, adds stopping, overrides the 'eval' icon with the 'stop' icon";
function keymap_modal_logic() {
    [["1", "charge"], ["2", "blink"], ["3", "supershot"], ["4", "invis"], ["5", "cleave"], ["X", "use_hp"], ["Y", "use_mp"]].forEach(function(d) {
        var b = d[0]
            , c = d[1];
        $(".skb" + b).html(item_container({
            skid: b,
            skin: G.skills[c].skin,
            draggable: false
        }, {
            name: c
        }))
    });
    var a = "";
    object_sort(K).forEach(function(b) {
        a += "<span class='klabel'>" + b[1] + "</span>"
    });
    $(".skbkeys").html(a)
}
function show_game_guide() {
    if (gameplay == "hardcore") {
        show_modal($("#hardcoreguide").html())
    } else {
        show_modal($("#gameguide").html())
    }
}
function hide_modal() {
    if (modal_count > 0) {
        modal_count--
    }
    if ($(".modal:last").find(".destroy").length) {
        eval($(".modal:last").find(".destroy").attr("onclick"))
    }
    $(".modal:last").remove()
}
function show_modal(mhtml, args) {
    if (!args) {
        args = {}
    }
    if (!args.opacity) {
        args.opacity = 0.5
    }
    if (args.wrap === undefined) {
        args.wrap = true
    }
    var wrap_styles = "";
    if (args.wrap) {
        wrap_styles = "width: " + (args.wwidth || 600) + "px; border: 5px solid gray; background: black;"
    }
    modal_count++;
    var html = ""
        , styles = "";
    styles += "position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; z-index: 9000; text-align: center; vertical-align: middle; overflow-y: scroll; ";
    styles += "background: rgba(0,0,0," + args.opacity + ")";
    html += "<div style='" + styles + "' class='modal' onclick='stpr(event); hide_modal()'>";
    html += "<div style='display: inline-block; " + wrap_styles + " " + (args.styles || "") + " margin-bottom: 100px; margin-top: 40px; padding: 10px; text-align: left; position: relative'";
    html += " onclick='stpr(event); /*return false*/' class='imodal'>";
    html += mhtml;
    if (args.ondestroy) {
        html += '<div style="display:none" class="destroy" onclick="' + args.ondestroy + '"></div>'
    }
    html += "</div>";
    html += "</div>";
    $("body").append(html);
    var iheight = $(".imodal:last").height();
    if (height > iheight) {
        $(".imodal:last").css("margin-bottom", "0px").css("margin-top", max(0, round(height / 2 - iheight / 2 - 5)))
    }
    if ($(".modal:last").find(".oncreate").length) {
        eval($(".modal:last").find(".oncreate").attr("onclick"))
    }
}
function position_modals() {
    $(".imodal").each(function() {
        var a = $(this)
            , b = a.height();
        if (height > b) {
            a.css("margin-bottom", "0px").css("margin-top", max(0, round(height / 2 - b / 2 - 5)))
        } else {
            a.css("margin-bottom", "40px").css("margin-top", "100px")
        }
    })
}
function set_status(a) {
    current_status = a
}
function show_json(a) {
    if (!is_string(a)) {
        a = safe_stringify(a, 2)
    }
    show_modal("<div style='font-size: 24px; white-space: pre-wrap;' class='yesselect pre'>" + syntax_highlight(a) + "</div>")
}
function json_to_html(a) {
    if (!is_string(a)) {
        a = safe_stringify(a, 2)
    }
    return "<div style='font-size: 24px; white-space: pre;' class='yesselect'>" + syntax_highlight(a) + "</div>"
}
function add_invite(a) {
    $(".pin" + a).remove();
    $("#chatlog").append("<div class='chatentry pin" + a + "' style='color: gray'><span style='color: white'>" + a + "</span> wants to party. 		<span class='clickable' style='color:green' onclick='socket.emit(\"party\",{event:\"accept\",name:\"" + a + "\"}); $(this).parent().remove()'>Accept</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_request(a) {
    $(".pin" + a).remove();
    $("#chatlog").append("<div class='chatentry pin" + a + "' style='color: gray'><span style='color: white'>" + a + "</span> wants to join your party. 		<span class='clickable' style='color:#119CC1' onclick='socket.emit(\"party\",{event:\"raccept\",name:\"" + a + "\"}); $(this).parent().remove()'>Accept</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_frequest(a) {
    $(".pin" + a).remove();
    $("#chatlog").append("<div class='chatentry pin" + a + "' style='color: gray'><span style='color: white'>" + a + "</span> wants to be your friend. 		<span class='clickable' style='color:#DB7BB3' onclick='socket.emit(\"friend\",{event:\"accept\",name:\"" + a + "\"}); $(this).parent().remove()'>Accept</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_update_notes() {
    update_notes.forEach(function(b) {
        var a = "gray";
        if (b.indexOf("Chinese") != -1) {
            a = "#B02B16"
        }
        if (b.indexOf("Valentines") != -1) {
            a = "#C987B7"
        }
        add_log(b, a)
    })
}
var game_logs = []
    , game_chats = [];
function clear_game_logs() {
    game_logs = [];
    $("#gamelog").html("")
}
function add_log(c, a) {
    if (mode.dom_tests || inside == "payments" || no_html) {
        return
    }
    if (game_logs.length > 1000) {
        var b = "<div class='gameentry' style='color: gray'>- Truncated -</div>";
        game_logs = game_logs.slice(-720);
        game_logs.forEach(function(d) {
            b += "<div class='gameentry' style='color: " + (d[1] || "white") + "'>" + d[0] + "</div>"
        });
        $("#gamelog").html(b)
    }
    game_logs.push([c, a]);
    $("#gamelog").append("<div class='gameentry' style='color: " + (a || "white") + "'>" + c + "</div>");
    $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight)
}
function add_xmas_log() {
    if (mode.dom_tests || inside == "payments" || no_html) {
        return
    }
    $("#gamelog").append("<div class='gameentry' style='color: white'>Would you like to turn on the Xmas Tunes? <span style='color: #C82F17' class='clickable' onclick='xmas_tunes=true; sound_music=\"1\"; init_music(); reflect_music();  $(\".musicoff\").hide(); $(\".musicon\").show(); add_log(\"As a reminder, you can control Music from CONF\",\"gray\"); $(this).parent().remove();'>Yes!</span></div>");
    $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight)
}
function add_greenlight_log() {
    if (mode.dom_tests || inside == "payments" || no_html) {
        return
    }
    $("#gamelog").append("<div class='gameentry' style='color: white'>Adventure Land is on Steam Greenlight! Would really appreciate your help: <a href='http://steamcommunity.com/sharedfiles/filedetails/?id=821265543' target='_blank' class='cancela' style='color: " + colors.xmas + "'>Browser</a> <a href='steam://url/CommunityFilePage/821265543' target='_blank' class='cancela' style='color: " + colors.xmasgreen + "'>Open: Steam</a></div>");
    $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight)
}
function add_chat(c, o, g, b) {
    if (no_html) {
        return
    }
    var f = "#chatlog"
        , k = ""
        , n = 1
        , j = false;
    if (!window.character) {
        f = "#gamelog"
    }
    for (var l = 0; l < game_chats.length; l++) {
        if (b && game_chats[l][3] == b || game_chats[l][0] == c && game_chats[l][1] == o && game_chats[l][3] == b) {
            if (c && l != game_chats.length - 1) {
                continue
            }
            n = game_chats[l][4] + 1;
            game_chats.splice(l, 1);
            j = true;
            break
        }
    }
    if (game_chats.length > 360 || j) {
        var m = "";
        if (game_chats.length > 360) {
            m = "<div class='chatentry' style='color: gray'>- Truncated -</div>";
            var a = [];
            for (var l = 0; l < game_chats.length; l++) {
                var h = game_chats[l];
                if (l < 180 && !h[0]) {
                    continue
                }
                a.push(h)
            }
            game_chats = a.slice(-270)
        }
        game_chats.forEach(function(s) {
            var r = ""
                , q = s[4]
                , p = "#999A4F";
            if (s[0]) {
                r = "<span style='color:white'>" + s[0] + ":</span> "
            }
            if (s[2] == colors.server_success || s[2] == "gold") {
                p = "#E0E0E0"
            }
            if (s[2] == colors.server_failure) {
                p = "#626363"
            }
            if (q > 1) {
                q = " <span style='color:" + p + "'>[" + q + "]</span>"
            } else {
                q = ""
            }
            m += "<div class='chatentry' style='color: " + (s[2] || "gray") + "'>" + r + html_escape(s[1]) + q + "</div>"
        });
        $(f).html(m)
    }
    var d = "#999A4F";
    if (g == colors.server_success || g == "gold") {
        d = "#E0E0E0"
    }
    if (g == colors.server_failure) {
        d = "#626363"
    }
    game_chats.push([c, o, g, b, n]);
    if (c) {
        k = "<span style='color:white'>" + c + ":</span> "
    }
    if (n > 1) {
        n = " <span style='color:" + d + "'>[" + n + "]</span>"
    } else {
        n = ""
    }
    $(f).append("<div class='chatentry' style='color: " + (g || "gray") + "'>" + k + html_escape(o) + n + "</div>");
    $(f).scrollTop($(f)[0].scrollHeight)
}
function cpm_window(a) {
    if (no_html) {
        return
    }
    var b = "pm" + a;
    last_say = b;
    if (!in_arr(b, cwindows)) {
        open_chat_window("pm", a, 1)
    } else {
        toggle_chat_window("pm", a)
    }
}
function add_pmchat(g, a, d) {
    if (no_html) {
        return
    }
    var f = "pm" + g
        , c = "";
    if (!in_arr(f, cwindows)) {
        open_chat_window("pm", g, a == character.name)
    }
    if (a != character.name && in_arr(f, docked)) {
        $("#chatt" + f).addClass("newmessage")
    }
    var b = "";
    b = "<span style='color:white'>" + a + ":</span> ";
    $("#chatd" + f).append("<div style='color: " + (c || "gray") + "'>" + b + html_escape(d) + "</div>");
    $("#chatd" + f).scrollTop($("#chatd" + f)[0].scrollHeight)
}
function add_partychat(a, d) {
    if (no_html) {
        return
    }
    var f = "party"
        , c = "";
    if (!in_arr(f, cwindows)) {
        open_chat_window("party", "", a == character.name)
    }
    if (a != character.name && in_arr(f, docked)) {
        $("#chatt" + f).addClass("newmessage")
    }
    var b = "";
    b = "<span style='color:white'>" + a + ":</span> ";
    $("#chatd" + f).append("<div style='color: " + (c || "gray") + "'>" + b + html_escape(d) + "</div>");
    $("#chatd" + f).scrollTop($("#chatd" + f)[0].scrollHeight)
}
function refresh_page() {
    window.location = window.location
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
var input_onclicks = [];
function get_input(b) {
    if (!b) {
        return
    }
    var c = "<div style='" + (!b.no_wrap && "border: 5px solid gray; padding: 5px; background: black" || "") + "'>"
        , d = 0
        , a = null;
    if (is_array(b)) {
        b = {
            elements: b
        }
    } else {
        if (!b.elements) {
            b = {
                elements: [b]
            }
        }
    }
    b.elements.forEach(function(f) {
        if (f.title) {
            c += "<div class='textheader'>" + f.title + "</div>"
        }
        if (f.input) {
            a = f.input,
                c += "<div style='margin-bottom: 4px'><input class='selectioninput " + f.input + "' placeholder='" + (f.placeholder || "") + "' value='" + (f.value || "") + "' /></div>"
        }
        if (f.button) {
            input_onclicks[d++] = f.onclick;
            c += "<div class='gamebutton " + (f.small && "gamebutton-small mb2" || "mb5") + "' onclick='smart_eval(input_onclicks[" + (d - 1) + "])' style='display:block'>" + f.button + "</div>"
        }
    });
    c += "</div>";
    show_modal(c, {
        wrap: false
    });
    if (a) {
        $("." + a).focus()
    }
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
                                                f.push({
                                                    button: "Travel",
                                                    onclick: function() {
                                                        hide_modal();
                                                        render_travel(1)
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
    render_item("#topleftcornerdialog", {
        id: "buying" + a,
        item: G.items[a],
        name: a,
        buying: true
    })
}
function condition_click(a) {
    dialogs_target = ctarget;
    render_condition("#topleftcornerdialog", a)
}
function inventory_click(a) {
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
function sh_click(a) {
    dialogs_target = get_npc("secondhands");
    render_item("#topleftcornerdialog", {
        id: "sh" + a,
        item: G.items[secondhands[a].name],
        name: secondhands[a].name,
        actual: secondhands[a],
        secondhand: true
    })
}
function lf_click(a) {
    dialogs_target = get_npc("lostandfound");
    render_item("#topleftcornerdialog", {
        id: "sh" + a,
        item: G.items[lostandfound[a].name],
        name: lostandfound[a].name,
        actual: lostandfound[a],
        lostandfound: true
    })
}
function slot_click(a) {
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
        add_log(a + " isn't around. <span class='clickable' onclick='pcs(event); travel_p(\"" + a + "\")' style='color: #A78059'>Travel</span>", "gray");
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
    $("#rightcornerui").html($(".transports").html());
    topright_npc = "transports"
}
function hide_transports() {
    $("#rightcornerui").html("");
    topright_npc = false
}
function eval_snippet() {
    var a = codemirror_render3.getValue();
    if (a.search("output=") != -1 || a.search("json_output=") != -1) {
        code_eval_s(a)
    } else {
        code_eval(a)
    }
}
function show_snippet(b) {
    var a = "<textarea id='rendererx'></textarea><div class='gamebutton' style='position: absolute; bottom: -68px; right: -5px' onclick='eval_snippet()'>EXECUTE</div>";
    show_modal(a);
    var c = "";
    if (window.codemirror_render3) {
        c = codemirror_render3.getValue()
    }
    window.codemirror_render3 = CodeMirror(function(d) {
        $("#rendererx").replaceWith(d)
    }, {
        value: b || c,
        mode: "javascript",
        indentUnit: 4,
        indentWithTabs: true,
        lineWrapping: true,
        lineNumbers: true,
        gutters: ["CodeMirror-linenumbers", "lspacer"],
        theme: "pixel",
        cursorHeight: 0.75,
    });
    codemirror_render3.focus()
}
function eval_character_snippet(a) {
    a = a.toLowerCase();
    character_code_eval(a, window["codemirror_render" + a].getValue())
}
function show_character_snippet(a) {
    var d = a;
    a = a.toLowerCase();
    var b = "<textarea id='renderer" + a + "'></textarea><div class='gamebutton' style='position: absolute; bottom: -68px; right: -5px' onclick='eval_character_snippet(\"" + a + "\")'>EXECUTE</div>";
    show_modal(b);
    var c = "// " + d + "\n";
    if (window["codemirror_render" + a]) {
        c = window["codemirror_render" + a].getValue()
    }
    window["codemirror_render" + a] = CodeMirror(function(f) {
        $("#renderer" + a).replaceWith(f)
    }, {
        value: c,
        mode: "javascript",
        indentUnit: 4,
        indentWithTabs: true,
        lineWrapping: true,
        lineNumbers: true,
        gutters: ["CodeMirror-linenumbers", "lspacer"],
        theme: "pixel",
        cursorHeight: 0.75,
    });
    window["codemirror_render" + a].focus()
}
function get_active_characters() {
    var a = {};
    if (!character) {
        return a
    }
    a[character.name] = "self";
    $("iframe").each(function() {
        var g = $(this)
            , c = g.data("name");
        if (c) {
            var f = "starting"
                , b = c.toLowerCase()
                , d = "ichar" + c.toLowerCase();
            if (document.getElementById(d) && document.getElementById(d).contentWindow) {
                f = "loading";
                if (document.getElementById(d).contentWindow.character) {
                    f = "active";
                    if (document.getElementById(d).contentWindow.code_active) {
                        f = "code"
                    }
                }
            }
            a[c] = f
        }
    });
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
    $("#" + c).remove();
    var a = window.location + "";
    a = a.replace(character.name, b);
    a = a.split(".land");
    a = a[1] || a[0];
    a = a.split(".com");
    a = a[1] || a[0];
    a = a.split("?");
    a = a[0];
    if (!d) {
        d = ""
    }
    $("#iframelist").append('<div class="clickable" onclick="show_character_snippet(\'' + b + '\')"><iframe src="' + a + "?no_html=true&code=" + d + '" id="' + c + '" style="border: 5px solid gray; background-color: black; margin-top: -5px; height: 60px; width: 128px; overflow: hidden; pointer-events: none" data-name="' + b + '"></iframe></div>');
    $("#iframelist").css("display", "inline-block");
    if (!is_electron) {}
}
function stop_character_runner(a) {
    var b = "ichar" + a.toLowerCase();
    $("#" + b).remove()
}
function start_runner(a, b) {
    if (!a) {
        a = "maincode"
    }
    actual_code = false;
    if (b === undefined) {
        b = codemirror_render.getValue(),
            actual_code = true
    }
    the_code = b;
    $(".engagebutton").hide();
    $(".dengagebutton").show();
    $("#" + a).remove();
    if (no_html) {
        $("body").append('<iframe src="/runner" id="' + a + '" style="border: none; height: 1px; width: 1px; overflow: hidden; pointer-events: none"></iframe>')
    } else {
        $("#iframelist").append('<div class="clickable" onclick="show_snippet()"><iframe src="/runner" id="' + a + '" style="border: 5px solid gray; background-color: black; margin-top: -5px; height: 60px; width: 128px; overflow: hidden; pointer-events: none"></iframe></div>')
    }
    $("#iframelist").css("display", "inline-block");
    code_run = true;
    code_persistence_logic()
}
function stop_runner(a) {
    if (!a) {
        a = "maincode"
    }
    call_code_function("on_destroy");
    code_run = code_active = false;
    $(".engagebutton").show();
    $(".dengagebutton").hide();
    $("#" + a).remove();
    socket.emit("code", {
        run: 0
    });
    code_persistence_logic();
    if (sounds.empty) {
        sounds.empty.stop()
    }
}
function set_setting(b, d, g) {
    var f = window.localStorage.getItem("settings_cache")
        , c = ""
        , a = false;
    f = f && JSON.parse(f) || {};
    f[b] = f[b] || {};
    f[b][d] = g;
    window.localStorage.setItem("settings_cache", JSON.stringify(f))
}
function get_settings(b) {
    var d = window.localStorage.getItem("settings_cache")
        , c = ""
        , a = false;
    d = d && JSON.parse(d) || {};
    d[b] = d[b] || {};
    return d[b]
}
function free_character(c) {
    var f = null;
    X.characters.forEach(function(h) {
        if (c == h.name) {
            f = h
        }
    });
    if (f) {
        var d = window.localStorage.getItem("code_cache")
            , b = ""
            , a = false;
        d = d && JSON.parse(d) || {};
        try {
            delete d["run_" + f.id]
        } catch (g) {}
        try {
            delete d["code_" + f.id]
        } catch (g) {}
        window.localStorage.setItem("code_cache", JSON.stringify(d));
        var d = window.localStorage.getItem("settings_cache")
            , b = ""
            , a = false;
        d = d && JSON.parse(d) || {};
        try {
            delete d[f.id]
        } catch (g) {}
        try {
            delete d.global
        } catch (g) {}
        window.localStorage.setItem("settings_cache", JSON.stringify(d));
        smart_eval($(".onbackbutton").attr("onclick"));
        add_log("Done!")
    } else {
        add_log("Character not found!")
    }
}
function code_persistence_logic() {
    if (persist_code) {
        try {
            var c = window.localStorage.getItem("code_cache")
                , b = ""
                , a = false;
            c = c && JSON.parse(c) || {};
            c["run_" + real_id] = actual_code && code_run && "1" || "";
            c["code_" + real_id] = codemirror_render.getValue();
            window.localStorage.setItem("code_cache", JSON.stringify(c));
            console.log("Code saved!")
        } catch (d) {
            console.log(d)
        }
    }
}
function toggle_runner() {
    if (code_run) {
        stop_runner()
    } else {
        start_runner()
    }
}
function code_logic() {
    window.codemirror_render = CodeMirror(function(a) {
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
    api_call("load_code", {
        name: a,
        run: "",
        log: b
    })
}
function remove_code_fx() {
    delete stage.cfilter_ascii;
    delete stage.cfilter_bloom;
    regather_filters(stage)
}
function toggle_code() {
    if (code) {
        $(".codeui").hide();
        code = false;
        $(":focus").blur();
        remove_code_fx()
    } else {
        $(".codeui").show();
        code = true;
        codemirror_render.refresh();
        if (character && !character.moving && options.code_fx) {
            stage.cfilter_ascii = new PIXI.filters.AsciiFilter(16);
            stage.cfilter_bloom = new PIXI.filters.BloomFilter();
            regather_filters(stage)
        }
    }
}
function start_timer(a) {
    timers[a] = new Date()
}
function stop_timer(b, a) {
    if (a) {
        a = "[" + a + "]"
    } else {
        a = ""
    }
    ms = mssince(timers[b]);
    if (b == "draw" && ms > 10 || b == "remove_sprite") {
        if (log_flags.timers) {
            console.log("timer[" + b + "]" + a + ": " + mssince(timers[b]))
        }
    }
    timers[b] = new Date()
}
function the_door() {
    if (animatables.the_door) {
        h_shake()
    }
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "1")
        }
    }, 200);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "2")
        }
    }, 300);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "3")
        }
    }, 400);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "4")
        }
    }, 500);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "5")
        }
    }, 600);
    draw_timeout(function() {
        if (animatables.the_door) {
            h_shake()
        }
    }, 2800);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "4")
        }
    }, 2900);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "3")
        }
    }, 3000);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "2")
        }
    }, 3100);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "1")
        }
    }, 3200);
    draw_timeout(function() {
        if (animatables.the_door) {
            set_texture(animatables.the_door, "0")
        }
    }, 3300)
}
function v_shake() {
    function b(c) {
        return function() {
            stage.y += c;
            character.real_y -= c
        }
    }
    var a = 0;
    [-1, 1, -2, 2, -2, 2, -1, 1].forEach(function(c) {
        setTimeout(b(c), a++ * 40)
    })
}
function v_shake_i(c) {
    function b(d, f) {
        return function() {
            d.real_y -= f
        }
    }
    var a = 0;
    [-1, 1, -2, 2, -2, 2, -1, 1].forEach(function(f) {
        setTimeout(b(c, f), a++ * 40)
    })
}
function v_dive() {
    function b(c) {
        return function() {
            stage.y += c;
            character.real_y -= c
        }
    }
    var a = 0;
    [-2, -1.5, -1.5, 2, 1, 1, 1].forEach(function(c) {
        setTimeout(b(c), a++ * 20)
    })
}
function v_dive_i(c) {
    function b(d, f) {
        return function() {
            d.real_y -= f
        }
    }
    var a = 0;
    [-2, -1.5, -1.5, 2, 1, 1, 1].forEach(function(f) {
        setTimeout(b(c, f), a++ * 20)
    })
}
function no_no_no(d) {
    function c(f) {
        return function() {
            ch_disp_x -= f
        }
    }
    var b = 0
        , a = [-1, 1, -1, 1];
    if (d == 2) {
        a = [-1, 1, -1, 1, -1, 1, -1, 1]
    }
    a.forEach(function(f) {
        setTimeout(c(f), b++ * 40)
    })
}
function sway(c) {
    function b(d, f) {
        return function() {
            if (c == character) {
                ch_disp_x -= d,
                    ch_disp_y -= f
            } else {
                c.real_x -= d,
                    c.real_y -= f
            }
        }
    }
    var a = 0;
    [[-3, -3], [-3, -3], [-3, -3], [0, 3], [0, 3], [0, 3], [3, 0], [3, 0], [3, 0]].forEach(function(f) {
        setTimeout(b(f[0], f[1]), a++ * 16)
    })
}
function mojo(c) {
    function b(d, f) {
        return function() {
            if (c == character) {
                ch_disp_x -= d,
                    ch_disp_y -= f
            } else {
                c.real_x -= d,
                    c.real_y -= f
            }
        }
    }
    var a = 0;
    [[-3, -3], [3, 3], [-3, 3], [3, -3], [3, 3], [-3, -3], [-3, 3], [3, -3]].forEach(function(f) {
        setTimeout(b(f[0], f[1]), a++ * 33)
    })
}
function flurry(d) {
    function c(f, g) {
        return function() {
            if (d == character) {
                ch_disp_x -= f,
                    ch_disp_y -= g
            } else {
                d.real_x -= f,
                    d.real_y -= g
            }
        }
    }
    var b = 0;
    var a = [[-2, -2], [-2, -2], [-2, -2], [6, 6], [0, -2], [0, -4], [-4, 0], [-2, 0], [0, 2], [0, 2], [0, 2], [2, 0], [2, 0], [2, 0]];
    shuffle(a);
    a.forEach(function(f) {
        setTimeout(c(f[0], f[1]), b++ * 16)
    })
}
function h_shake() {
    function b(c) {
        return function() {
            stage.x += c;
            character.real_x -= c
        }
    }
    var a = 0;
    [-1, 1, -2, 2, -3, 3, -3, 3, -3, 3, -2, 2, -1, 1].forEach(function(c) {
        setTimeout(b(c), a++ * 80)
    })
}
function bump_up(a, c) {
    function d(f) {
        return function() {
            a.real_y -= f
        }
    }
    var b = 0;
    [1, 1, 1, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5].forEach(function(f) {
        setTimeout(d(f * c), b++ * 17)
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
            a.real_y += 2,
                a.y_disp = 2
        } else {
            if (a.direction == 3) {
                a.real_y -= 2,
                    a.y_disp = -2
            } else {
                if (a.direction == 1) {
                    a.real_x -= 2
                } else {
                    a.real_x += 2
                }
            }
        }
        setTimeout(function() {
            if (a.direction == 0) {
                a.real_y -= 1,
                    a.y_disp -= 1
            } else {
                if (a.direction == 3) {
                    a.real_y += 1,
                        a.y_disp += 1
                } else {
                    if (a.direction == 1) {
                        a.real_x += 1
                    } else {
                        a.real_x -= 1
                    }
                }
            }
        }, 60);
        setTimeout(function() {
            if (a.direction == 0) {
                a.real_y -= 1,
                    a.y_disp -= 1
            } else {
                if (a.direction == 3) {
                    a.real_y += 1,
                        a.y_disp += 1
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
    if (no_graphics) {
        return
    }
    try {
        a.parent.removeChild(a)
    } catch (b) {
        console.log("Sprite is orphan, can't remove. Type: " + a.type)
    }
}
function destroy_sprite(a, c) {
    if (c != "just") {
        remove_sprite(a)
    }
    try {
        if (c == "children" || c == "just") {
            a.destroy({
                children: true
            })
        } else {
            a.destroy()
        }
    } catch (b) {
        console.log("Couldn't destroy sprite: " + a.type)
    }
}
function trade(d, a, c, b) {
    b = b || 1;
    socket.emit("equip", {
        q: b,
        slot: d,
        num: a,
        value: ("" + c).replace_all(",", "").replace_all(".", "")
    });
    $("#topleftcornerdialog").html("")
}
function trade_buy(d, c, a, b) {
    b = b || 1;
    socket.emit("trade_buy", {
        slot: d,
        id: c,
        rid: a,
        q: b
    });
    $("#topleftcornerdialog").html("")
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
    })
}
function buy_shells(a) {
    if ((a * 15000000 / 100) > character.gold) {
        render_interaction("noshells")
    } else {
        socket.emit("buy_shells", {
            gold: (a * 15000000 / 100)
        });
        render_interaction("yesshells")
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
    socket.emit(c, {
        name: a,
        quantity: b
    });
    $(".buynum").html($(".buynum").data("q"))
}
function sell(a, b) {
    if (!b) {
        b = 1
    }
    socket.emit("sell", {
        num: a,
        quantity: b
    });
    $(".sellnum").html((parseInt($(".sellnum").data("q")) - b) + "");
    $(".sellnum").data("q", $(".sellnum").html())
}
function call_code_function(c, b, a, f) {
    try {
        get_code_function(c)(b, a, f)
    } catch (d) {
        add_log(c + " " + d, "#E13758")
    }
}
function code_eval_if_r(code) {
    code_active && document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow.eval && document.getElementById("maincode").contentWindow.eval(code)
}
function get_code_function(a) {
    return code_active && document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow[a] || (function() {}
    )
}
function private_say(a, c, b) {
    socket.emit("say", {
        message: c,
        code: b,
        name: a
    })
}
function party_say(b, a) {
    socket.emit("say", {
        message: b,
        code: a,
        party: true
    })
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
            if (is_electron && (command == "new_window" || command == "window" || command == "newwindow")) {
                window.open(base_url, "", {
                    width: $(window).width(),
                    height: $(window).height()
                })
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
                        if (command == "stop") {
                            var args = rest.split(" ")
                                , name = args.shift();
                            if (!name || name == "teleport") {
                                use_skill("stop")
                            } else {
                                if (name == "invis") {
                                    socket.emit("stop", {
                                        action: "invis"
                                    })
                                } else {
                                    stop_character_runner(name)
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
                                                                                    show_modal($("#gameguide").html())
                                                                                } else {
                                                                                    if (code_active && document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow.handle_command) {
                                                                                        if (document.getElementById("maincode").contentWindow.handle_command(command, rest) != -1) {} else {
                                                                                            add_chat("", "Command not found. You can add a `handle_command` function to your CODE to capture commands.")
                                                                                        }
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
    if (!a) {
        a = $(".npcgold").html() || ""
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
        return
    }
    if (!a) {
        a = $(".npcgold").html() || ""
    }
    a = a.replace_all(",", "").replace_all(".", "");
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
        $("#eitem").children().css("border-color", a[exclast % a.length]);
        $(".ering3").css("border-color", a[(exclast + 1) % a.length]);
        $(".ering2").css("border-color", a[(exclast + 2) % a.length]);
        $(".ering1").css("border-color", a[(exclast + 3) % a.length]);
        exclast++
    }
}
function poof(a) {
    var b = 2400;
    exchange_type = "poof";
    if (a) {
        socket.emit("destroy", {
            num: p_item,
            statue: true
        });
        return
    }
    function c(d) {
        return function() {
            if (!exchange_animations) {
                return
            }
            socket.emit("destroy", {
                num: d,
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
function exchange(a) {
    var b = 3000;
    if (a) {
        socket.emit("exchange", {
            item_num: e_item,
            q: character.items[e_item].q
        });
        return
    }
    function c(d, f) {
        return function() {
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
    var a = []
        , b = false;
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
    u_scroll = c_scroll = e_item = p_item = null;
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
                            if (rendered_target == "craftsman") {
                                render_craftsman()
                            } else {
                                if (rendered_target == "dismantler") {
                                    render_dismantler()
                                } else {
                                    if (rendered_target == "none") {
                                        render_none_shrine()
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
    $(":focus").blur()
}
function toggle_stats() {
    if (topright_npc != "character") {
        render_character_sheet()
    } else {
        $("#rightcornerui").html("");
        topright_npc = false
    }
}
function toggle_character() {
    if (ctarget == character && !topleft_npc) {
        ctarget = null
    } else {
        topleft_npc = false,
            ctarget = character
    }
}
function reset_inventory(a) {
    if (inventory) {
        if (a && !in_arr(rendered_target, ["upgrade", "compound", "exchange", "npc", "merchant", "craftsman", "dismantler", "none"])) {
            return
        }
        render_inventory(),
            render_inventory()
    }
}
function close_chests() {
    for (var b in chests) {
        var a = chests[b];
        if (a.openning) {
            delete a.openning;
            a.frame = 0;
            set_texture(a, a.frame)
        }
    }
}
function open_chest(b) {
    var a = chests[b];
    if (a.openning && ssince(a.openning) < 5) {
        return
    }
    draw_trigger(function() {
        var c = chests[b];
        if (c && !c.openning) {
            c.openning = new Date();
            set_texture(c, ++c.frame)
        }
    });
    socket.emit("open_chest", {
        id: b
    })
}
function generate_textures(b, m) {
    console.log("generate_textures " + b + " " + m);
    if (m == "full") {
        var l = XYHW[b]
            , c = l[2]
            , p = l[3]
            , r = 0
            , q = 0;
        var o = G.actual_dimensions[b];
        if (o) {
            c = o[0];
            p = o[1];
            r = round((l[2] - c) / 2 + (o[2] || 0));
            q = round(l[3] - p)
        }
        textures[b] = [[null, null, null, null], [null, null, null, null], [null, null, null, null]];
        for (var k = 0; k < 3; k++) {
            for (var g = 0; g < 4; g++) {
                var n = new PIXI.Rectangle(l[0] + k * l[2] + r,l[1] + g * l[3] + q,c,p);
                if (offset_walking && !o) {
                    n.y += 2,
                        n.height -= 2
                }
                textures[b][k][g] = new PIXI.Texture(C[FC[b]],n)
            }
        }
    }
    if (m == "emblem") {
        var l = XYHW[b];
        var n = new PIXI.Rectangle(l[0],l[1],l[2],l[3]);
        textures[b] = new PIXI.Texture(C[FC[b]],n)
    }
    if (m == "machine") {
        var f = b;
        b = f.type;
        textures[b] = e_array(f.frames.length);
        for (var k = 0; k < f.frames.length; k++) {
            var n = new PIXI.Rectangle(f.frames[k][0],f.frames[k][1],f.frames[k][2],f.frames[k][3]);
            textures[b][k] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[f.set]],n)
        }
        if (f.subframes) {
            textures[b + "sub"] = e_array(f.subframes.length);
            for (var k = 0; k < f.subframes.length; k++) {
                var n = new PIXI.Rectangle(f.subframes[k][0],f.subframes[k][1],f.subframes[k][2],f.subframes[k][3]);
                textures[b + "sub"][k] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[f.set]],n)
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
            var n = new PIXI.Rectangle(0 + h * k,0,h,p);
            textures[b][k] = new PIXI.Texture(PIXI.utils.BaseTextureCache[o.file],n)
        }
    }
    if (m == "animatable") {
        var l = G.positions[b];
        textures[b] = e_array(l.length);
        var k = 0;
        l.forEach(function(d) {
            var a = new PIXI.Rectangle(d[1],d[2],d[3],d[4]);
            textures[b][k++] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[d[0]]],a)
        })
    }
    if (m == "emote") {
        var l = XYHW[b];
        textures[b] = [null, null, null];
        for (var k = 0; k < 3; k++) {
            var n = new PIXI.Rectangle(l[0] + k * l[2],l[1],l[2],l[3]);
            textures[b][k] = new PIXI.Texture(C[FC[b]],n)
        }
    }
    if (m == "v_animation") {
        var l = XYHW[b];
        textures[b] = [null, null, null, null];
        for (var k = 0; k < 4; k++) {
            var n = new PIXI.Rectangle(l[0],l[1] + k * l[3],l[2],l[3]);
            textures[b][k] = new PIXI.Texture(C[FC[b]],n)
        }
    }
}
function restore_dimensions(a) {
    a.height = a.texture.height * (a.cscale || 1) / (a.mscale || 1);
    a.width = a.texture.width * (a.cscale || 1) / (a.mscale || 1)
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
    if (d.stype == "v_animation") {
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
    if (b == "full") {
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
        f.cskin = "10"
    }
    if (b == "emblem") {
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
        f.cskin = "0"
    }
    if (b == "v_animation") {
        if (!textures[h]) {
            generate_textures(h, "v_animation")
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0" + undefined;
        f.frame = 0;
        f.frames = textures[h].length
    }
    if (b == "animatable") {
        if (!textures[h]) {
            generate_textures(h, "animatable")
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0" + undefined;
        f.frame = 0;
        f.frames = textures[h].length
    }
    if (b == "animation") {
        if (!textures[h]) {
            generate_textures(h, "animation")
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0" + undefined;
        f.frame = 0;
        f.frames = textures[h].length
    }
    if (b == "emote") {
        if (!textures[h]) {
            generate_textures(h, "emote")
        }
        var f = new PIXI.Sprite(textures[h][0]);
        f.cskin = "0" + undefined;
        f.frame = 0
    }
    if (b == "static") {
        var g = textures["static_" + h];
        if (!g) {
            var a = G.positions[h]
                , d = G.tilesets[a[0]];
            var c = new PIXI.Rectangle(a[1],a[2],a[3],a[4]);
            var g = new PIXI.Texture(PIXI.utils.BaseTextureCache[d],c);
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
    (window.dtextures || []).forEach(function(c) {
        if (c) {
            c.destroy()
        }
    });
    dtile_width = max(width, screen.width);
    dtile_height = max(height, screen.height);
    for (var b = 0; b < 3; b++) {
        var a = new PIXI.extras.TilingSprite(GEO["default"][5 + b] || GEO["default"][5],dtile_width / scale + 3 * dtile_size,dtile_height / scale + 3 * dtile_size);
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
    if (!c) {
        c = "explode_p"
    }
    var b = new_sprite(c, "animation");
    if (use_layers) {
        b.parentGroup = player_layer
    } else {
        b.displayGroup = player_layer
    }
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
        return function() {
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
            draw_timeout(function() {
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
function start_emblem(f, b, a) {
    if (!a) {
        a = {}
    }
    if (f.emblems[b]) {
        f.emblems[b].frames = a.frames || 225;
        return
    }
    var d = new_sprite(b, "emblem");
    if (a.no_dip) {
        d.frame_list = [0.57, 0.6, 0.63, 0.66, 0.69, 0.72, 0.75, 0.78, 0.82, 0.86, 0.9, 0.95, 1]
    } else {
        d.frame_list = [0.2, 0.33, 0.66, 0.77, 0.88, 0.95, 1]
    }
    for (var c = d.frame_list.length - 1; c >= 0; c--) {
        d.frame_list.push(d.frame_list[c])
    }
    d.frame_list;
    f.emblems[b] = d;
    d.frames = a.frames || 225;
    d.x = -0.5;
    d.y = -6;
    d.anchor.set(0.5, 0.5);
    d.parentGroup = animation_layer;
    d.alpha = 0.33;
    f.addChild(d)
}
function stop_emblem(b, a) {
    if (b.emblems[a]) {
        b.emblems[a].frames = 0
    }
}
function start_animation(d, c, g) {
    if (d.animations[c]) {
        d.animations[c].frame = 0;
        return
    }
    var b = new_sprite(c, "animation")
        , f = (d.hitArea && d.hitArea.width || d.texture.width)
        , a = (d.hitArea && d.hitArea.height || d.texture.height);
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
    if (c == "transport" || c == "invincible" || c == "hardshell" || c == "revival") {
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
    if (c == "revival") {
        b.height = d.texture.height;
        b.width = d.texture.width
    }
    if (G.animations[c].speeding) {
        b.speeding = true
    }
    b.aspeed = G.animations[c].aspeed;
    b.aspeed = (b.aspeed == "fast" && 0.8) || (b.aspeed == "mild" && 1.4) || (b.aspeed == "slow" && 3) || 2;
    b.anchor.set(0.5, 1);
    d.addChild(b)
}
function stop_animation(b, a) {
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
    var a = b.texture.frame;
    b.base_rectangle = new PIXI.Rectangle(a.x,a.y,a.width,a.height)
}
function dirty_fix(a) {
    return;
    var b = a.texture.frame;
    a.texture = new PIXI.Rectangle(b.x,b.y + 8,b.width,b.height)
}
function restore_base(b) {
    var a = b.base_rectangle;
    b.texture.frame = new PIXI.Rectangle(a.x,a.y,a.width,a.height)
}
function rotate(l, g) {
    var m = PIXI.GroupD8
        , j = l.texture;
    var d = m.isSwapWidthHeight(g) ? j.frame.width : j.frame.height;
    var k = m.isSwapWidthHeight(g) ? j.frame.height : j.frame.width;
    var a = j.frame;
    var f = new PIXI.Rectangle(0,0,k,d);
    var b = f;
    if (g % 2 == 0) {
        var c = new PIXI.Texture(j.baseTexture,a,f,b,g)
    } else {
        var c = new PIXI.Texture(j.baseTexture,a,f,b,g - 1);
        c.rotate++
    }
    l.texture = c
}
function rotated_texture(j, a, g) {
    if (!g) {
        return new PIXI.Texture(j,a)
    }
    var l = PIXI.GroupD8;
    var d = l.isSwapWidthHeight(g) ? a.width : a.height;
    var k = l.isSwapWidthHeight(g) ? a.height : a.width;
    var f = new PIXI.Rectangle(0,0,k,d);
    var b = f;
    if (g % 2 == 0) {
        var c = new PIXI.Texture(j,a,f,b,g)
    } else {
        var c = new PIXI.Texture(j,a,f,b,g - 1);
        c.rotate++
    }
    return c
}
function drag_logic() {}
function draw_timeouts_logic(f) {
    var g = new Date()
        , a = [];
    for (var b = 0; b < draw_timeouts.length; b++) {
        var c = draw_timeouts[b];
        if (f && f == 2 && c[2] != 2) {
            continue
        }
        if (g >= c[1]) {
            a.push(b);
            try {
                c[0]()
            } catch (d) {
                console.log("draw_timeout_error: " + d);
                console.log("code: " + c[0])
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
    if (in_draw) {
        try {
            a()
        } catch (b) {
            console.log("draw_trigger_error: " + b);
            console.log("code: " + a)
        }
    } else {
        draw_timeouts.push([a, new Date(), 2])
    }
}
function tint_logic() {
    var c = new Date()
        , s = [];
    for (var h = 0; h < tints.length; h++) {
        var d = tints[h]
            , a = 240
            , j = 95
            , p = 0
            , f = 50
            , n = 205
            , l = 50;
        if (d.type == "skill") {
            if (c > d.end) {
                $(d.selector).parent().find("img").css("opacity", 1);
                s.push(h);
                $(d.selector).css("height", "0px").css("background-color", "rgb(" + a + "," + j + "," + p + ")")
            } else {
                if (!d.added) {
                    $(".skidloader" + d.skid).parent().find("img").css("opacity", 0.5);
                    d.added = true;
                    $(d.selector).css("height", "1px")
                }
                var m = mssince(d.start)
                    , q = -mssince(d.end);
                var t = 2 * 46 * m / (m + q + 1)
                    , k = m / (m + q + 1);
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
                    var a = d.r
                        , j = d.g
                        , p = d.b
                        , o = 20;
                    if (d.i < o) {
                        a = round(a - (a / 2 / o) * d.i);
                        j = round(j - (j / 2 / o) * d.i);
                        p = round(p - (p / 2 / o) * d.i);
                        if (d.i == o - 1) {
                            d.mid = new Date()
                        }
                    } else {
                        var m = mssince(d.mid)
                            , q = -mssince(d.end);
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
                        if (tint_c[d.key] == d.cur || 1) {
                            $(d.selector).children(".thetint").remove();
                            $(d.selector).css("background", d.reset_to)
                        }
                        s.push(h)
                    } else {
                        if (tint_c[d.key] != d.cur && 0) {
                            continue
                        }
                        if (!d.added) {
                            d.added = true;
                            $(d.selector).children(".thetint").remove();
                            $(d.selector).append("<div style='position: absolute; " + (d.pos || "bottom") + ": 0px; left: 0px; right: 0px; height: 1px; background: " + d.color + "; z-index: 1' class='thetint'></div>")
                        }
                        var m = mssince(d.start)
                            , q = -mssince(d.end);
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
                            var m = mssince(d.start)
                                , q = -mssince(d.end);
                            var u = round(100 * m / (m + q + 1));
                            if (d.reverse) {
                                u = 100 - u
                            }
                            u = max(1, u);
                            $(d.selector).css("background", "-webkit-gradient(linear, " + d.start_d + ", " + d.end_d + ", from(" + d.color + "), to(" + d.back_to + "), color-stop(" + (u - 1) + "%," + d.color + "),color-stop(" + u + "%, " + d.back_to + ")")
                        }
                    } else {
                        if (d.type == "glow") {} else {
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
function restart_skill_tints() {
    tints.forEach(function(a) {
        if (a.skid) {
            $(".skidloader" + a.skid).parent().find("img").css("opacity", 0.5);
            $(a.selector).css("height", "1px")
        }
    })
}
function get_tint(a) {
    for (var b = 0; b < tints.length; b++) {
        if (tints[b].selector == a) {
            return tints[b]
        }
    }
    return null
}
function add_tint(a, b) {
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
    var c = get_tint(a);
    if (c) {
        c.start = b.start;
        c.end = b.end;
        c.ms = b.ms
    } else {
        tints.push(b)
    }
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
        (d.gives || []).forEach(function(g) {
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
function attack_timeout(a) {
    next_attack = future_ms(a);
    draw_trigger(function() {
        $(".atint").css("background", "none");
        tint_c.a++;
        add_tint(".atint", {
            ms: -mssince(next_attack),
            color: "#4C4C4C",
            reset_to: "#6A6A6A",
            type: "brute",
            key: "a",
            cur: tint_c.a
        });
        skill_timeout("attack", -mssince(next_attack));
        skill_timeout("heal", -mssince(next_attack))
    })
}
function pot_timeout(a) {
    if (!a) {
        a = 2000
    }
    next_potion = future_ms(a);
    draw_trigger(function() {
        if (!get_tint(".ptint")) {
            $(".ptint").css("background", "none")
        }
        tint_c.p++;
        add_tint(".ptint", {
            ms: -mssince(next_potion),
            color: "#4C4C4C",
            reset_to: "#6A6A6A",
            type: "brute",
            key: "p",
            cur: tint_c.p
        })
    });
    skill_timeout("use_hp", a);
    skill_timeout("use_mp", a)
}
function pvp_timeout(a, b) {
    next_transport = future_ms(a);
    skill_timeout("use_town", a);
    if (b) {
        return
    }
    draw_trigger(function() {
        $(".pvptint").parent().css("background", "rgb(200,50,20)");
        for (var d = 1; d < 10; d++) {
            var h = 200 - d * 15
                , f = 50 - d * 3
                , c = 20 - d;
            draw_timeout(function(l, k, j) {
                return function() {
                    $(".pvptint").parent().css("background", "rgb(" + l + "," + k + "," + j + ")")
                }
            }(h, f, c), d * 600)
        }
        0 && draw_timeout(function() {
            $(".pvptint").parent().css("background", "black");
            $(".pvptint").css("background", "#907B81");
            tint_c.t++;
            add_tint(".pvptint", {
                ms: -mssince(next_transport),
                color: "black",
                reset_to: "none",
                type: "brute",
                key: "t",
                cur: tint_c.t,
                pos: "top"
            })
        }, 200)
    })
}
function pvp_timeout(c, h) {
    var f = 200
        , d = 50
        , a = 20;
    if (h == "sneak") {
        f = 45,
            d = 111,
            a = 45
    }
    next_transport = future_ms(c);
    skill_timeout("use_town", c);
    if (h == 1) {
        return
    }
    draw_trigger(function() {
        $(".pvptint").parent().css("background", "rgb(" + f + "," + d + "," + a + ")");
        tint_c.t++;
        add_tint(".pvptint", {
            ms: -mssince(next_transport),
            r: f,
            g: d,
            b: a,
            type: "dissipate",
            key: "t",
            cur: tint_c.t,
            i: 0
        })
    })
}
var next_skill = {};
function skill_timeout(c, b) {
    var a = [];
    if (!b) {
        b = G.skills[c].cooldown
    }
    if (b == "1X") {
        b = 1000 * 100 / character.speed
    }
    next_skill[c] = future_ms(b);
    for (N in keymap) {
        if (keymap[N] && (keymap[N] == c || keymap[N].name == c)) {
            a.push(N)
        }
    }
    draw_trigger(function() {
        if (G.skills[c] && G.skills[c].share == "attack") {
            attack_timeout(-mssince(next_skill[c]))
        }
        a.forEach(function(d) {
            add_tint(".skidloader" + d, {
                ms: -mssince(next_skill[c]),
                type: "skill",
                skid: d
            })
        })
    })
}
function disappearing_circle(a, g, d, b) {
    if (!b) {
        b = {}
    }
    if (!b.color) {
        b.color = 16777215
    }
    var c = new PIXI.Graphics();
    c.beginFill(b.color);
    c.drawCircle(a, g, d);
    c.endFill();
    c.pivot = new PIXI.Point(0.5,0.5);
    c.alpha = b.alpha || 1;
    map.addChild(c);
    function f(h) {
        return function() {
            if (h >= 10) {
                destroy_sprite(c)
            } else {
                c.alpha -= 0.03;
                draw_timeout(f(h + 1), 40)
            }
        }
    }
    draw_timeout(f(1), 40)
}
function empty_rect(b, g, f, a, d, c) {
    if (!c) {
        c = 8940599
    }
    if (!d) {
        d = 1
    }
    if (!f) {
        f = 1
    }
    if (!a) {
        a = 1
    }
    e = new PIXI.Graphics();
    e.lineStyle(d, c);
    e.drawPolygon([b, g, b, g + a, b + f, g + a, b + f, g, b, g]);
    return e
}
function draw_line(a, g, c, f, d, b) {
    if (!b) {
        b = 16720693
    }
    if (!d) {
        d = 1
    }
    e = new PIXI.Graphics();
    e.lineStyle(d, b);
    e.moveTo(a, g);
    e.lineTo(c, f);
    e.endFill();
    return e
}
function draw_circle(a, d, c, b) {
    if (!b) {
        b = 16720693
    }
    if (!c) {
        c = 1
    }
    e = new PIXI.Graphics();
    e.beginFill(b);
    e.drawCircle(a, d, c);
    e.endFill();
    return e
}
function add_border(f, g, d) {
    if (!g) {
        g = (f.texture.width),
            d = (f.texture.height)
    }
    var h = new PIXI.Graphics();
    h.lineStyle(1, 16691746);
    h.drawRect(0, 0, g, d);
    if (f.anchor) {
        h.x = -f.anchor.x * g;
        h.y = -f.anchor.y * d
    }
    if (f.hitArea && (f.hitArea.width != g || f.hitArea.height != d)) {
        var a = new PIXI.Graphics();
        a.lineStyle(1, 8705535);
        a.drawRect(0, 0, f.hitArea.width, f.hitArea.height);
        if (f.anchor) {
            a.x = -f.anchor.x * f.hitArea.width;
            a.y = -f.anchor.y * f.hitArea.height
        }
        f.bborder = a;
        f.addChild(a)
    }
    if (f.base) {
        var j = new PIXI.Graphics();
        j.lineStyle(1, 5550079);
        j.drawRect(0, 0, f.base.h * 2, f.base.v + f.base.vn);
        if (f.anchor) {
            j.x = -f.anchor.x * (f.base.h * 2);
            j.y = -f.anchor.y * (f.base.v + f.base.vn)
        }
        j.y += f.base.vn;
        f.cborder = j;
        f.addChild(j)
    }
    f.aborder = h;
    f.addChild(h)
}
function border_logic(a) {
    if (a.aborder) {
        return
    }
    if (a.aborder) {
        destroy_sprite(a.aborder);
        a.aborder = null
    }
    if (a.bborder) {
        destroy_sprite(a.bborder);
        a.bborder = null
    }
    if (a.cborder) {
        destroy_sprite(a.cborder);
        a.cborder = null
    }
    add_border(a)
}
function player_rclick_logic(a) {
    if (!character || a.me) {
        return
    }
    var b = false;
    if (a.npc) {
        b = true
    } else {
        if (character.ctype == "priest" || character.slots.mainhand && character.slots.mainhand.name == "cupid") {
            b = true
        } else {
            if (!pvp || character.party && a.party == character.party || character.guild && a.guild == character.guild) {} else {
                if (pvp) {
                    b = true
                }
            }
        }
    }
    if (b && !a.on_rclick) {
        a.on_rclick = true;
        a.on("rightdown", player_right_click)
    } else {
        if (!b && a.on_rclick) {
            a.on_rclick = false;
            a.removeListener("rightdown")
        }
    }
}
function regather_filters(a) {
    var b = [];
    for (var c in a) {
        if (c.startsWith("cfilter_")) {
            b.push(a[c])
        }
    }
    a.filters = b
}
function rip_logic() {
    if (character.rip && !rip) {
        if (code_run) {
            if (document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow.handle_death) {
                var c = false;
                try {
                    if (document.getElementById("maincode").contentWindow.handle_death() != -1) {
                        c = true
                    }
                } catch (b) {
                    add_log(b + " on handle_death", "#E13758")
                }
            }
        }
        rip = true;
        if (!no_graphics) {
            var a = new PIXI.filters.ColorMatrixFilter();
            a.desaturate();
            stage.cfilter_rip = a;
            regather_filters(stage)
        }
        character.moving = false;
        $("#ripbutton").show();
        skill_timeout("use_town", 12000);
        reopen();
        $("#name").css("color", "#5E5D5D")
    }
    if (!character.rip && rip) {
        rip = false;
        delete stage.cfilter_rip;
        regather_filters(stage);
        $("#ripbutton").hide();
        $("#name").css("color", "#1AC506")
    }
}
function name_logic(a) {
    if (no_graphics) {
        return
    }
    if (a.type != "character" && a.type != "npc") {
        return
    }
    if ((!options.show_names && character) && a.name_tag) {
        destroy_sprite(a.name_tag, "children");
        a.name_tag = null;
        a.ntag_cache = null
    } else {
        if (options.show_names || !character) {
            add_name_tag(a)
        }
    }
}
function add_name_tag(c) {
    var g = c.name + "|" + c.level;
    if (c.name_tag) {
        if (c.ntag_cache == g) {
            return
        }
        destroy_sprite(c.name_tag, "children");
        c.name_tag = null;
        c.ntag_cache = null
    }
    var f = new PIXI.Graphics();
    var a = "Lv." + c.level + " " + c.name
        , h = 7433580
        , b = a.length * 4 + 4
        , j = 11
        , k = 1;
    if (c.npc) {
        a = c.name || "NPC";
        h = 2531789;
        if (c.citizen) {
            h = 14188294
        }
        b = a.length * 4 + 8
    }
    f.beginFill(h);
    f.drawRect(0, 0, b, j);
    f.endFill();
    f.beginFill(2105119);
    f.drawRect(1, 1, b - 2, j - 2);
    f.endFill();
    f.position = new PIXI.Point(-round(b / 2),2);
    c.addChild(f);
    if (!c.me) {
        k = 4
    } else {
        k = 8
    }
    var d = {
        fontFamily: S.font,
        fontSize: 64 * k,
        fill: "white",
        align: "center"
    };
    var a = new PIXI.Text(a,d);
    a.x = (b / 2);
    a.y = 2.5;
    a.anchor.set(0.5, 0);
    a.scale = new PIXI.Point(0.125 / k,0.125 / k);
    f.addChild(a);
    c.name_tag = f;
    c.ntag_cache = g;
    c.addChild(f);
    f.parentGroup = entity_layer
}
function add_name_tag_large(d) {
    if (d.name_tag) {
        destroy_sprite(d.name_tag, "children");
        d.name_tag = null
    }
    var h = new PIXI.Graphics()
        , c = "Lv." + d.level + " " + d.name
        , f = c.length * 7 + 6
        , a = 21
        , g = 1;
    h.beginFill(7433580);
    h.drawRect(0, 0, f, a);
    h.endFill();
    h.beginFill(2105119);
    h.drawRect(2, 2, f - 4, a - 4);
    h.endFill();
    h.position = new PIXI.Point(-round(f / 2),2);
    d.addChild(h);
    if (!d.me) {
        g = 4
    } else {
        g = 8
    }
    var b = {
        fontFamily: S.font,
        fontSize: 64 * g,
        fill: "white",
        align: "center"
    };
    var c = new PIXI.Text(c,b);
    c.x = (f / 2);
    c.y = 4;
    c.anchor.set(0.5, 0);
    c.scale = new PIXI.Point(0.25 / g,0.25 / g);
    h.addChild(c);
    d.name_tag = h;
    d.addChild(h)
}
function add_name_tag_experimental(d) {
    if (d.name_tag) {
        destroy_sprite(d.name_tag, "children");
        d.name_tag = null
    }
    var h = new PIXI.Graphics()
        , c = "Lv." + d.level + " " + d.name
        , f = c.length * 7 + 6
        , a = 21
        , g = 1;
    h.beginFill(7433580);
    h.drawRect(0, 0, f, a);
    h.endFill();
    h.beginFill(2105119);
    h.drawRect(2, 2, f - 4, a - 4);
    h.endFill();
    h.position = new PIXI.Point(-round(f / 2),-a - (d.aheight || d.height));
    d.addChild(h);
    if (!d.me) {
        g = 4
    } else {
        g = 8
    }
    var b = {
        fontFamily: S.font,
        fontSize: 64 * g,
        fill: "white",
        align: "center"
    };
    var c = new PIXI.Text(c,b);
    c.x = (f / 2);
    c.y = 4;
    c.anchor.set(0.5, 0);
    c.scale = new PIXI.Point(0.25 / g,0.25 / g);
    h.addChild(c);
    d.name_tag = h;
    d.addChild(h)
}
function hp_bar_logic(a) {
    if (no_graphics) {
        return
    }
    if (a.dead && !a.hp_bar) {
        return
    }
    if (!hp_bars || a.me) {
        return
    }
    if (ctarget == a || (character && character.party && character.party == a.party) || (character && character.party && a.target && in_arr(a.target, party_list)) || (character && a.target == character.name) || (character && character.map == "abtesting") || (character && a.controller == character.name)) {
        add_hp_bar(a)
    } else {
        if (a.hp_bar) {
            destroy_sprite(a.hp_bar, "children");
            a.hp_bar = null;
            a.hp_color = null
        }
    }
}
function add_hp_bar(c) {
    var a = max(32, round(c.width * 0.8))
        , d = 1
        , g = round(2 * d);
    var b = 11609895;
    if (c.npc) {
        b = 14717952
    } else {
        if (c.type == "character" && !pvp && !is_pvp && ctarget == c) {
            b = 3574827
        } else {
            if (c.type == "character" && (pvp || is_pvp) && character && character.guild != c.guild && character.party != c.party && c.target == character.name) {} else {
                if (character && character.party && character.party == c.party) {
                    b = 7290759
                } else {
                    if (character && character.guild && character.guild == c.guild) {
                        b = 4110016
                    } else {
                        if (character && is_monster(c) && ctarget == c) {} else {
                            if (c.guild == "A") {
                                b = 3783508
                            } else {
                                if (c.guild == "B") {
                                    b = 14366627
                                } else {
                                    if (character && c.controller == character.name) {
                                        b = 9018258
                                    } else {
                                        if (character && c.target == character.name && is_player(c)) {
                                            b = 4171985
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    var f = round((a - round(2 * (d + 1))) * c.hp / c.max_hp);
    if (c.hp_bar) {
        if (c.hp_width == f && c.hp_color == b) {
            return
        }
        destroy_sprite(c.hp_bar, "children");
        c.hp_bar = null
    }
    c.hp_width = f;
    var k = new PIXI.Graphics();
    k.beginFill(7433580);
    k.drawRect(0, 0, a, 6 + g);
    k.endFill();
    k.beginFill(2105119);
    k.drawRect(d, d, a - g, 6);
    k.endFill();
    k.beginFill(b);
    k.drawRect(d + 1, d + 1, c.hp_width, 4);
    k.endFill();
    var h = 12
        , j = 0;
    if (c.type == "character" && character_names) {
        h += 8
    }
    if (c.mscale == 2) {
        h += 6,
            j += a / 2
    }
    k.position = new PIXI.Point(-(a / 2) - j,-h - (c.aheight || c.height) + (c.mscale == 2 && -4 || 0));
    if (c.mscale) {
        k.scale = new PIXI.Point(c.mscale,c.mscale)
    }
    c.hp_bar = k;
    c.hp_color = b;
    k.parentGroup = window.hp_layer;
    c.addChild(k)
}
function test_bitmap(a, d, b) {
    var c = new PIXI.BitmapText("YAY BITMAPS!",{
        font: b + "px m5x7",
        align: "center"
    });
    c.displayGroup = text_layer;
    c.x = round(a);
    c.y = round(d);
    map.addChild(c)
}
function d_line(start, end, args) {
    if (!d_lines || no_graphics || paused) {
        return
    }
    if (!args) {
        args = {}
    }
    var party = [16256018, 15601920, 16724753, 16729122, 16737860, 16750899, 16690733, 13417267, 13681424, 11193378, 6934565, 2280618, 1228217, 1157819, 4474077, 3346875, 3869885, 4465305];
    if (start.slots && (start.slots.helmet && start.slots.helmet.name == "partyhat" || start.slots.mainhand && start.slots.mainhand.name == "ornamentstaff") && args.color != "heal") {
        shuffle(party);
        args.size = 1;
        args.color = party[0];
        d_line({
            x: get_x(start) - 1,
            y: get_y(start) - 1
        }, {
            x: get_x(end) - 1,
            y: get_y(end) - 1
        }, {
            color: party[1]
        })
    } else {
        if (!args.color || args.color == "attack") {
            args.color = 9964288
        } else {
            if (args.color == "heal") {
                args.color = 14714259
            } else {
                if (args.color == "taunt") {
                    args.color = 7368816
                } else {
                    if (args.color == "burst") {
                        args.color = 4362158,
                            args.size = 3
                    } else {
                        if (args.color == "supershot") {
                            args.color = 10164014,
                                args.size = 2
                        } else {
                            if (args.color == "reflect") {
                                args.color = 9063074,
                                    args.size = 2
                            } else {
                                if (args.color == "curse") {
                                    args.color = 8211882,
                                        args.size = 2
                                } else {
                                    if (args.color == "evade") {
                                        args.color = 8424340
                                    } else {
                                        if (args.color == "my_hit") {
                                            args.color = 2919973
                                        } else {
                                            if (args.color == "gold") {
                                                args.color = 16766720
                                            } else {
                                                if (args.color == "item") {
                                                    args.color = 4104883
                                                } else {
                                                    if (args.color == "mana") {
                                                        args.color = eval(colors.mp.replace("#", "0x"))
                                                    } else {
                                                        if (args.color == "mluck") {
                                                            args.color = eval("#9BF984".replace("#", "0x"))
                                                        } else {
                                                            if (args.color == "warrior") {
                                                                args.color = 14710051,
                                                                    args.size = 3
                                                            } else {
                                                                if (args.color && args.color.startsWith && args.color.startsWith("#")) {
                                                                    args.color = eval(args.color.replace("#", "0x"))
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    e = new PIXI.Graphics();
    e.lineStyle(args.size || 1, args.color);
    e.moveTo(get_x(start), get_y(start) - 2);
    e.lineTo(get_x(end), get_y(end) - 2);
    e.endFill();
    map.addChild(e);
    function disappear_line(step, line) {
        return function() {
            line.alpha -= 0.08;
            if (step < 10) {
                draw_timeout(disappear_line(step + 1, line), 20)
            } else {
                remove_sprite(line);
                try {
                    line.destroy()
                } catch (e) {}
            }
        }
    }
    draw_timeout(disappear_line(0, e), 20)
}
function d_text(n, j, h, g) {
    var l = null;
    if (mode.dom_tests_pixi || no_graphics || paused) {
        return
    }
    if (is_object(j)) {
        l = j;
        g = h;
        j = get_x(l);
        h = get_y(l) - (l.aheight || l.height) - (l.hp_bar && 15 || 2);
        if (l.mscale == 2) {
            h += 14
        }
    }
    if (!g) {
        g = {}
    }
    var b = g.color || "#4C4C4C";
    if (b == "hp") {
        b = "green"
    } else {
        if (b == "mp") {
            b = "#317188"
        } else {
            if (b == "damage") {
                b = "#C80000"
            } else {
                if (b == "+gold") {
                    b = "gold"
                } else {
                    if (b == "stun") {
                        b = "#FF9601",
                            h -= 12
                    } else {
                        if (b == "sugar") {
                            b = "#D64770"
                        } else {
                            if (b == "freeze") {
                                b = "#53C1FF",
                                    h -= 12
                            } else {
                                if (b == "crit") {
                                    b = "#D32D51",
                                        h -= 12
                                } else {
                                    if (b == "sneak") {
                                        b = "#2D9B41",
                                            h -= 12
                                    } else {
                                        if (b == "mana") {
                                            b = colors.mp
                                        } else {
                                            if (b == "elixir") {
                                                b = "#E06A63"
                                            } else {
                                                if (b == "evade") {
                                                    b = "#808B94";
                                                    if (l && g.from && get_entity(g.from)) {
                                                        d_line(get_entity(g.from), l, {
                                                            color: "evade"
                                                        })
                                                    }
                                                } else {
                                                    if (b == "reflect") {
                                                        b = "#6D62A2"
                                                    } else {
                                                        if (b == "supershot") {
                                                            b = "#9B172E",
                                                                h -= 12
                                                        } else {
                                                            if (b == "quickpunch") {
                                                                b = "#41338B",
                                                                    h -= 12
                                                            } else {
                                                                if (b == "burst") {
                                                                    b = "#2A8A9A",
                                                                        o = "large"
                                                                } else {
                                                                    if (b == "poison") {
                                                                        b = colors.poison,
                                                                            o = "large",
                                                                            h -= 12
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    var o = S[g.size] || g.size || S.normal;
    var k = g.parent || window.map;
    var a = !g.dont_animate;
    var c = 1000;
    var m = new PIXI.Text(n,{
        fontFamily: S.font,
        fontSize: o * text_quality,
        fontWeight: "bold",
        fill: b,
        align: "center"
    });
    if (use_layers) {
        m.parentGroup = text_layer
    } else {
        m.displayGroup = text_layer
    }
    m.x = round(j);
    m.y = round(h);
    m.disp_m = S.normal / 18;
    if (o > S.normal) {
        m.disp_m = (S.normal + 1) / 18
    }
    m.anim_time = max(75, parseInt(100 * 18 / o));
    m.type = "text";
    m.alpha = 1;
    m.last_fade = new Date();
    m.anchor.set(0.5, 1);
    if (text_quality > 1) {
        m.scale = new PIXI.Point(1 / text_quality,1 / text_quality)
    }
    k.addChild(m);
    function d(p, q) {
        return function() {
            var r = mssince(q.last_fade)
                , t = round(4 * r / q.anim_time);
            if (2 < t && t < 7) {
                t = 4
            }
            q.y -= q.disp_m * t;
            q.alpha = max(0, q.alpha - (0.078 * r / q.anim_time));
            q.last_fade = new Date();
            if (q.alpha > 0.25) {
                draw_timeout(d(p + 1, q), q.anim_time)
            } else {
                remove_sprite(q);
                try {
                    q.destroy({
                        texture: true,
                        baseTexture: true
                    })
                } catch (s) {}
            }
        }
    }
    function f(p, q) {
        return function() {
            q.position.y -= 4;
            q.alpha -= 0.08;
            if (p < 10) {
                draw_timeout(d(p + 1, q), q.anim_time)
            } else {
                remove_sprite(q);
                try {
                    q.destroy({
                        texture: true,
                        baseTexture: true
                    })
                } catch (r) {}
            }
        }
    }
    draw_timeout(d(0, m), m.anim_time);
    if (g.s) {
        sfx(g.s, m.x, m.y)
    }
}
function api_call(h, c, g) {
    if (!c) {
        c = {}
    }
    if (!g) {
        g = {}
    }
    var d = "/api/" + h
        , b = g.disable;
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
    data = {
        method: h,
        "arguments": JSON.stringify(c)
    };
    function f(k, j) {
        return function(l) {
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
    function a(k, j) {
        return function(l) {
            if (k.r_id) {
                hide_loader(k.r_id)
            }
            if (k.silent || in_arr(h, auto_api_methods)) {
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
    call_args = {
        type: "POST",
        dataType: "json",
        url: base_url + d,
        data: data,
        success: f(g, b),
        error: a(g, b)
    };
    $.ajax(call_args)
}
function api_call_l(c, a, b) {
    if (!a) {
        a = {}
    }
    a.ui_loader = true;
    return api_call(c, a, b)
}
function game_events_logic(a) {
    if (!code_run) {
        return
    }
    a.forEach(function(c) {
        var b = c.e;
        delete c.e;
        call_code_function("trigger_event", b, c)
    })
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
        $("#topmid").append("<div id='abtesting'><div class='gamebutton' style='border-color: " + colors.A + "'>A <span class='scoreA'>0</span></div> <div class='gamebutton abtime'>5:00</div> <div class='gamebutton' style='border-color: " + colors.B + "'>B <span class='scoreB'>0</span></div></div>");
        reposition_ui();
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
        warned[current_map] = 1,
            add_log("This is a PVP Zone. Be careful!", "#E1664C")
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
var last_servers_and_characters = new Date();
setInterval(function() {
    if (!window.inside) {
        return
    }
    if (inside == "game" && ssince(last_servers_and_characters) > 48 || inside == "selection" && ssince(last_servers_and_characters) > 9) {
        api_call("servers_and_characters");
        last_servers_and_characters = new Date()
    }
}, 2000);
function update_servers_and_characters(c) {
    var b = {
        1: null,
        2: null,
        3: null,
        merchant: null
    }
        , a = 1;
    c.characters.forEach(function(d) {
        if (d.online) {
            $(".characterav" + d.name).html('<span style="color: #F3A05D">[I]</span>')
        } else {
            $(".characterav" + d.name).html('<span style="color: #A4FA64">[A]</span>')
        }
        if (!d.online) {
            return
        }
        if (d.type == "merchant") {
            b.merchant = d
        } else {
            if (a <= 3) {
                b[a] = d,
                    a += 1
            }
        }
    });
    [1, 2, 3, "merchant"].forEach(function(d) {
        if (!b[d]) {
            $(".characterr" + d).html("<span style='color: orange'>Offline</span>")
        } else {
            $(".characterr" + d).html("<span style='color: green'>" + b[d].name + "</span>")
        }
    })
}
function handle_information(g) {
    for (var f = 0; f < g.length; f++) {
        info = g[f];
        if (info.type == "code_list") {
            if (info.purpose == "load") {
                var d = ""
                    , c = false;
                info.list[0] = "Default Code";
                for (var b in info.list) {
                    d += "<div class='gamebutton block' style='margin-bottom: -4px' onclick='load_code(\"" + b + "\",1)'>[" + b + "] " + info.list[b] + "</div>";
                    c = true
                }
                d += "<div style='margin: 10px 5px 5px 5px; font-size: 24px; line-height: 28px'>";
                d += "<div>You can also load code's into your code. For example, you can save your 'Functions' in one code slot, let's say 2, and inside your first code slot, you can: <span class='label' style='height: 24px; margin: -2px 0px 0px 0px;'>load_code(2)</span> or <span class='label' style='height: 24px; margin: -2px 0px 0px 0px;'>load_code('Functions')</span></div>";
                d += "</div>";
                show_modal(d)
            } else {
                if (info.purpose == "save") {
                    var d = ""
                        , c = false;
                    d += "<div style='box-sizing: border-box; width: 100%; text-align: center; margin-bottom: 8px'>";
                    d += "<input type='text' style='box-sizing: border-box; width: 20%;' placeholder='#' class='csharp cinput'/>";
                    d += "<input type='text' style='box-sizing: border-box; width: 58%;' placeholder='NAME' class='codename cinput' />";
                    d += "<div class='gamebutton' style='box-sizing: border-box; width: 20%; padding: 8px' onclick='save_code_s()'>SAVE</div>";
                    d += "</div>";
                    if (!Object.keys(info.list).length) {
                        info.list = {
                            "1": "Empty",
                            "2": "Empty"
                        }
                    }
                    code_list = info.list;
                    info.list["#"] = "DELETE";
                    for (var b in info.list) {
                        d += "<div class='gamebutton block' style='margin-bottom: -4px' onclick='load_code_s(\"" + b + "\")'>[" + b + "] " + info.list[b] + "</div>";
                        c = true
                    }
                    d += "<div style='margin: 10px 5px 5px 5px; font-size: 24px; line-height: 28px'>";
                    d += "</div>";
                    show_modal(d)
                } else {
                    show_json(info.list)
                }
            }
        } else {
            if (info.type == "servers_and_characters") {
                X.servers = info.servers;
                X.characters = info.characters;
                update_servers_and_characters(info)
            }
        }
        if (info.type == "reload") {
            var a = future_s(10);
            window.localStorage.setItem("reload" + server_region + server_identifier, JSON.stringify({
                time: a,
                ip: info.ip,
                port: "" + info.port
            }))
        }
        if (info.type == "friends") {
            load_friends(info)
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
                    toggle_runner(),
                        toggle_runner()
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
                $("#message").html(info.message)
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
                $("#content").html(info.html);
                resize()
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
function sfx(b, a, f) {
    try {
        if (!window.sound_sfx || no_html) {
            return
        }
        var d = null;
        if (b == "hit" || b == "monster_hit") {
            d = sounds.hit_8bit
        }
        if (b == "explosion") {
            d = sounds.fx_explosion
        }
        if (b == "coins") {
            d = sounds.coin_collect
        }
        if (b == "hp" || b == "mp") {
            d = sounds.use_8bit
        }
        if (b == "chat") {
            d = sounds.chat
        }
        if (d) {
            if (a === undefined) {
                d.play()
            } else {
                d.orientation(0, 0, 0);
                d.pos((a - character.real_x) / 100, 0, (f - character.real_y) / 100);
                d.play()
            }
        }
    } catch (c) {
        add_alert(c)
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
    if (no_html) {
        return
    }
    sounds.click = new Howl({
        src: ["/sounds/effects/click_natural.wav"],
        volume: 0.5,
    });
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
    sounds.fx_explosion = new Howl({
        src: ["/sounds/fx/EXPLOSION_Short_Kickback_Crackle_stereo.wav"],
        volume: 0.4,
    });
    sounds.coin_collect = new Howl({
        src: ["/sounds/fx/COINS_Rattle_03_mono.wav"],
        volume: 0.4,
    });
    sounds.hit_8bit = new Howl({
        src: ["/sounds/fx/8BIT_RETRO_Hit_Bump_Noise_mono.wav"],
        volume: 0.4,
    });
    sounds.magic_8bit = new Howl({
        src: ["/sounds/fx/8BIT_RETRO_Fire_Blaster_Short_mono.wav"],
        volume: 0.4,
    });
    sounds.use_8bit = new Howl({
        src: ["/sounds/fx/VideoGameSFX_blip_07.wav"],
        volume: 0.4,
    });
    sounds.chat = new Howl({
        src: ["/sounds/fx/UI_Beep_Double_Quick_Smooth_stereo.wav"],
        volume: 0.4,
    })
}
function performance_trick() {
    if (sounds.empty) {
        return sounds.empty.play()
    }
    sounds.empty = new Howl({
        src: ["/sounds/loops/empty_loop_for_js_performance.ogg", "/sounds/loops/empty_loop_for_js_performance.wav"],
        volume: 0.5,
        autoplay: true,
        loop: true,
    })
}
function init_music() {
    if (window.music_init) {
        return
    }
    window.music_init = 1;
    sounds.christmas = new Howl({
        src: ["/sounds/loops/christmas.ogg"],
        volume: 0.4 * music_level,
        autoplay: false,
        loop: true,
    });
    if (xmas_tunes) {
        return
    }
    sounds.horror01 = new Howl({
        src: ["/sounds/loops/horror_01_loop.ogg", "/sounds/loops/horror_01_loop.wav"],
        volume: 0.4 * music_level,
        autoplay: false,
        loop: true,
    });
    sounds.rpg08 = new Howl({
        src: ["/sounds/loops/rpg_08_loop.ogg", "/sounds/loops/rpg_08_loop.wav"],
        volume: 0.4 * music_level,
        autoplay: false,
        loop: true,
    })
}
var current_music = null;
function reflect_music() {
    var a = sounds.rpg08;
    if (!sound_music) {
        if (current_music) {
            current_music.stop()
        }
        current_music = null;
        return
    }
    if (current_map == "batcave" || current_map == "halloween") {
        a = sounds.horror01
    }
    if (current_map == "winterland" || xmas_tunes) {
        a = sounds.christmas
    }
    if (current_music != a && a) {
        if (current_music) {
            current_music.stop()
        }
        current_music = a;
        a.play()
    }
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
    $.getScript("/data.js?reload=1&timestamp=" + (new Date().getTime()))
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
function show_loader() {}
function hide_loader() {}
function alert_json(a) {
    alert(JSON.stringify(a))
}
function game_stringify(d, b) {
    var a = [];
    try {
        return JSON.stringify(d, function(f, g) {
            if (in_arr(f, ["transform", "parent", "displayGroup", "parentGroup", "vertexData", "animations", "tiles", "placements", "default", "children"]) || f.indexOf("filter_") != -1 || f[0] == "_") {
                return
            }
            if (f == "data" && d[f] && d[f].x_lines) {
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
    return a.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(c) {
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
jQuery.fn.all_html = function() {
    return jQuery("<div />").append(this.eq(0).clone()).html()
}
;
jQuery.fn.rval = function(a) {
    var b = jQuery(this);
    var c = b.val();
    if (a == undefined) {
        a = ""
    }
    b.val(a);
    return c
}
;
jQuery.fn.rfval = function(a) {
    var b = jQuery(this).rval(a);
    $(":focus").blur();
    return b
}
;
function stkp(a) {
    try {
        if (a == "manual") {
            return
        }
        a.preventDefault();
        a.stopPropagation()
    } catch (b) {}
}
function stpr(a) {
    try {
        if (a == "manual") {
            return
        }
        a.stopPropagation()
    } catch (b) {}
}
function set_fullscreen() {
    var a = require("electron");
    var b = a.remote.getCurrentWindow();
    b.setFullScreen(true)
}
;