var auto_api_methods = []
    , base_url = window.location.protocol + "//" + window.location.host;
var sounds = {};
var draw_timeouts = []
    , timers = {}
    , pingts = {}
    , pings = []
    , modal_count = 0
    , last_ping = new Date();
var DTM = 1;
var DMS = 0;
function is_hidden() {
    return document.hidden
}
var last_id_sent = ""
    , last_xid_sent = "";
function send_target_logic() {
    var a = false;
    if (ctarget && last_id_sent != ctarget.id) {
        a = true
    }
    if (!ctarget && last_id_sent) {
        a = true
    }
    if (xtarget && last_xid_sent != xtarget.id) {
        a = true
    }
    if (!xtarget && last_xid_sent) {
        a = true
    }
    last_id_sent = ctarget && ctarget.id || "";
    last_xid_sent = xtarget && xtarget.id || "";
    if (a) {
        socket.emit("target", {
            id: last_id_sent,
            xid: last_xid_sent
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
setInterval(function() {
    if (ssince(last_ping) > 15) {
        if (window.socket) {
            ping(true)
        }
    }
}, 16000);
function push_ping(a) {
    last_ping = new Date();
    pings.push(a);
    if (pings.length > 40) {
        pings.shift()
    }
    if (character) {
        character.ping = 0;
        pings.forEach(function(b) {
            character.ping += b / pings.length
        })
    }
}
function ping(a) {
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
function preview_all(c) {
    if (!c) {
        c = character
    }
    for (var b = 0; b < 3; b++) {
        for (var a = 0; a < 4; a++) {
            disappearing_clone(c, {
                i: b,
                j: a,
                x: get_x(c) + b * 40,
                y: get_y(c) + a * 40,
                stay: true,
                alpha: 1,
                border: true
            })
        }
    }
}
function disappearing_clone(d, b) {
    if (!b) {
        b = {}
    }
    var g = d.texture
        , a = false;
    if (b.random && d.stype == "full") {
        g = textures[d.skin][parseInt(Math.random() * 3)][parseInt(Math.random() * 4)]
    }
    if (b.i !== undefined) {
        g = textures[d.skin][b.i][b.j]
    }
    var c = new PIXI.Sprite(g);
    if (d.cx) {
        if (b.i !== undefined) {
            c.i = b.i,
                c.j = b.j
        } else {
            c.i = d.i,
                c.j = d.j
        }
        c.skin = d.skin;
        c.cx = d.cx;
        cosmetics_logic(c);
        a = true
    }
    c.x = b.x || get_x(d);
    c.y = b.y || get_y(d) - 1;
    c.width = d.width / (d.cscale || 1);
    c.height = d.height / (d.cscale || 1);
    if (b.rcolor) {
        start_filter(c, "rcolor")
    }
    c.anchor.set(0.5, 1);
    if (c.cx && (b.alpha || 0.8) != 1) {
        var f = new PIXI.filters.AlphaFilter();
        f.alpha = b.alpha || 0.8;
        c.filters = [f]
    } else {
        c.alpha = b.alpha || 0.8
    }
    if (b.border) {
        border_logic(c)
    }
    map.addChild(c);
    if (!b.stay) {
        draw_timeout(fade_away(5, c), 15)
    }
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
            a.real_alpha -= 0.1;
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
            a.real_alpha -= 0.05;
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
            a.real_alpha -= 0.1;
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
            a.real_alpha -= 0.05;
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
    render_guide()
}
function show_shells_info() {
    show_modal($("#shellsinfo").html(), {
        styles: "padding-left: 20px; padding-right: 20px; font-size: 24px;"
    })
}
function show_credits() {
    show_modal($("#credits").html(), {
        styles: "background: #E5E5E5; color: #010805; padding-left: 20px; padding-right: 20px; font-size: 24px; text-align: center"
    })
}
function show_terms() {
    show_modal($("#terms").html(), {
        styles: "background: #E5E5E5; color: #010805; padding-left: 20px; padding-right: 20px; font-size: 24px; text-align: center"
    })
}
function show_privacy() {
    show_modal($("#privacy").html(), {
        styles: "background: #E5E5E5; color: #010805; padding-left: 20px; padding-right: 20px; font-size: 24px; text-align: center"
    })
}
function show_opensource_info() {
    show_modal($("#opensource").html(), {
        styles: "background: #E5E5E5; color: #010805; padding-left: 20px; padding-right: 20px; font-size: 24px; text-align: center"
    })
}
function hide_modal(force) {
    var old_url = null
        , new_url = null;
    if (!force && $('.modal:last input.mprotected[type="text"],.modal:last textarea.mprotected').filter(function() {
        return this.value.length > 0
    }).length) {
        return show_confirm("Are you sure you want to discard your entries?", "Yes", "No!", function() {
            hide_modal();
            hide_modal(true)
        })
    }
    old_url = modals[modal_count - 1] && modals[modal_count - 1].url;
    if (modal_count > 0) {
        modal_count--
    }
    new_url = modals[modal_count - 1] && modals[modal_count - 1].url;
    if (old_url || new_url) {
        window.history.replaceState({}, page.title, new_url || page.url)
    }
    if ($(".modal:last").find(".destroy").length) {
        eval($(".modal:last").find(".destroy").attr("onclick"))
    }
    $(".modal:last").remove();
    if ($(".modal:last").hasClass("hideinbackground")) {
        $(".modal:last").show();
        position_modals()
    }
    if (!modal_count) {
        block_right_clicks = true;
        if (window.code) {
            $("#codeui").show();
            codemirror_render.refresh()
        }
        $(".showwithmodals").hide();
        $(".hidewithmodals").show()
    }
}
function hide_modals() {
    while (modal_count) {
        hide_modal(true)
    }
}
var modals = [];
function show_modal(mhtml, args) {
    if (!args) {
        args = {}
    }
    if (!args.opacity && window.modal_opacity !== undefined) {
        args.opacity = window.modal_opacity
    } else {
        if (!args.opacity) {
            args.opacity = 0.4
        }
    }
    if (!args.classes) {
        args.classes = ""
    }
    if (args.hideinbackground) {
        args.classes = "hideinbackground"
    }
    if (args.wrap === undefined) {
        args.wrap = true
    }
    var wrap_styles = "";
    if (args.wrap) {
        wrap_styles = "width: " + (args.wwidth || 600) + "px; border: 5px solid gray; background: black;"
    }
    modals[modal_count] = args;
    modal_count++;
    var html = ""
        , styles = "";
    styles += "position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; z-index: 9000; text-align: center; vertical-align: middle; overflow-y: scroll; ";
    styles += "background: rgba(0,0,0," + args.opacity + ")";
    html += "<div style='" + styles + "' class='modal " + args.classes + "' onclick='if(stprlink(event)) return; hide_modal()'>";
    html += "<div style='display: inline-block; margin-bottom: 100px; margin-top: 40px; padding: 10px; text-align: left; position: relative; " + wrap_styles + " " + (args.styles || "") + "'";
    html += " onclick='stprlink(event); /*return false*/' class='imodal'>";
    html += mhtml;
    if (args.ondestroy) {
        html += '<div style="display:none" class="destroy" onclick="' + args.ondestroy + '"></div>'
    }
    html += "</div>";
    html += "</div>";
    if ($(".modal:last").hasClass("hideinbackground")) {
        $(".modal:last").hide()
    }
    $("body").append(html);
    var iheight = $(".imodal:last").height();
    if (height > iheight) {
        $(".imodal:last").css("margin-bottom", "0px").css("margin-top", max(0, round(height / 2 - iheight / 2 - 5)))
    }
    if ($(".modal:last").find(".oncreate").length) {
        eval($(".modal:last").find(".oncreate").attr("onclick"))
    }
    block_right_clicks = false;
    $(".showwithmodals").show();
    $(".hidewithmodals").hide();
    if (window.code && !args.keep_code) {
        $("#codeui").hide();
        if (last_hint) {
            $("#codehint").remove(),
                last_hint = undefined
        }
    }
    if (args.url) {
        window.history.replaceState({}, page.title, args.url)
    }
}
function show_alert(a) {
    show_modal("<div style='padding: 20px; text-align:center'><pre style='font-family: Pixel; font-size: 48px;'>" + a + "</pre></div>")
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
function show_json(b, a) {
    if (!is_string(b)) {
        b = safe_stringify(b, "\t")
    }
    show_modal("<div style='font-size: 24px; white-space: pre-wrap;' class='yesselect pre shcontainer'>" + syntax_highlight(b) + "</div>", {
        url: a && a.url
    })
}
function json_to_html(a) {
    if (!is_string(a)) {
        a = safe_stringify(a, "\t")
    }
    return "<div style='font-size: 24px; white-space: pre;' class='yesselect shcontainer'>" + syntax_highlight(a) + "</div>"
}
function add_magiport(a) {
    $(".mpin" + a).remove();
    chat_inventory_logic();
    $("#chatlog").append("<div class='chatentry mpin" + a + "' style='color: gray'><span style='color: white'>" + a + "</span> wants to magiport you! 		<span class='clickable' style='color:#3E97AA' onclick='socket.emit(\"magiport\",{name:\"" + a + "\"}); $(this).parent().remove()'>Accept</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_invite(a) {
    $(".pin" + a).remove();
    chat_inventory_logic();
    $("#chatlog").append("<div class='chatentry pin" + a + "' style='color: gray'><span style='color: white'>" + a + "</span> wants to party. 		<span class='clickable' style='color:green' onclick='socket.emit(\"party\",{event:\"accept\",name:\"" + a + "\"}); $(this).parent().remove()'>Accept</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_challenge(a) {
    $(".chl" + a).remove();
    chat_inventory_logic();
    $("#chatlog").append("<div class='chatentry chl" + a + "' style='color: gray'><span style='color: white'>" + a + "</span> challenged you to duel! 		<span class='clickable' style='color:orange' onclick='socket.emit(\"duel\",{event:\"accept\",name:\"" + a + "\"}); $(this).parent().remove()'>Accept</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_duel(a, c, b) {
    $(".chl" + a).remove();
    chat_inventory_logic();
    $("#chatlog").append("<div class='chatentry chl" + a + "' style='color: gray'><span style='color: white'>" + c + "</span> accepted a duel from " + a + "! 		<span class='clickable' style='color:orange' onclick='socket.emit(\"duel\",{event:\"enter\",id:\"" + b + "\"}); $(this).parent().remove()'>Join</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_request(a) {
    $(".pin" + a).remove();
    chat_inventory_logic();
    $("#chatlog").append("<div class='chatentry pin" + a + "' style='color: gray'><span style='color: white'>" + a + "</span> wants to join your party. 		<span class='clickable' style='color:#119CC1' onclick='socket.emit(\"party\",{event:\"raccept\",name:\"" + a + "\"}); $(this).parent().remove()'>Accept</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_frequest(a) {
    $(".pin" + a).remove();
    chat_inventory_logic();
    $("#chatlog").append("<div class='chatentry pin" + a + "' style='color: gray'><span style='color: white'>" + a + "</span> wants to be your friend. 		<span class='clickable' style='color:#DB7BB3' onclick='socket.emit(\"friend\",{event:\"accept\",name:\"" + a + "\"}); $(this).parent().remove()'>Accept</span></div>");
    $("#chatlog").scrollTop($("#chatlog")[0].scrollHeight)
}
function add_update_notes() {
    update_notes.forEach(function(b) {
        var a = "gray";
        if (b.indexOf("Holiday") != -1) {
            a = "#C82F17"
        }
        if (b.indexOf("Duelland") != -1) {
            a = "#3BB7CB"
        }
        if (b.indexOf("Chinese") != -1) {
            a = "#B02B16"
        }
        if (b.indexOf("Valentine's") != -1) {
            a = "#C987B7"
        }
        if (b.indexOf("Halloween") != -1) {
            a = "#DE6E37"
        }
        if (b.indexOf("Easter:") != -1) {
            a = "#DE5CB8"
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
    if (no_html == "bot") {
        game_logs.push([c, a])
    }
    if (mode.dom_tests || inside == "payments" || no_html) {
        return
    }
    if (game_logs.length > 480) {
        var b = "<div class='gameentry' style='color: gray'>- Truncated -</div>";
        game_logs = game_logs.slice(-160);
        game_logs.forEach(function(d) {
            b += "<div class='gameentry' style='color: " + (d[1] || "white") + "'>" + d[0] + "</div>"
        });
        $("#gamelog").html(b)
    }
    game_logs.push([c, a]);
    $("#gamelog").append("<div class='gameentry' style='color: " + (a || "white") + "'>" + c + "</div>");
    $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight)
}
function add_holiday_log() {
    if (mode.dom_tests || inside == "payments" || no_html) {
        return
    }
    $("#gamelog").append("<div class='gameentry' style='color: white'>Would you like to turn on the Holiday Tunes? <span style='color: #C82F17' class='clickable' onclick='xmas_tunes=true; sound_music=\"1\"; init_music(); reflect_music();  $(\".musicoff\").hide(); $(\".musicon\").show(); add_log(\"As a reminder, you can control Music from CONF\",\"gray\"); $(this).parent().remove();'>Yes!</span></div>");
    $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight)
}
function add_greenlight_log() {
    if (mode.dom_tests || inside == "payments" || no_html) {
        return
    }
    $("#gamelog").append("<div class='gameentry' style='color: white'>Adventure Land is on Steam Greenlight! Would really appreciate your help: <a href='http://steamcommunity.com/sharedfiles/filedetails/?id=821265543' target='_blank' class='cancela' style='color: " + colors.xmas + "'>Browser</a> <a href='steam://url/CommunityFilePage/821265543' target='_blank' class='cancela' style='color: " + colors.xmasgreen + "'>Open: Steam</a></div>");
    $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight)
}
var unread_chat = 0
    , no_chat_notification = false;
function chat_inventory_logic() {
    if (no_chat_notification) {
        return
    }
    if (inventory) {
        unread_chat += 1;
        if (unread_chat == 1) {
            $(".newchatui").html("1 unread chat message!")
        } else {
            $(".newchatui").html(unread_chat + " unread chat messages!")
        }
        $(".newchatui").css("display", "inline-block")
    }
}
function add_chat(c, o, g, b) {
    if (no_html == "bot") {
        game_chats.push([c, o, g, b])
    }
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
    if (game_chats.length > 250 || j) {
        var m = "";
        if (game_chats.length > 250) {
            m = "<div class='chatentry' style='color: gray'>- Truncated -</div>";
            var a = [];
            for (var l = 0; l < game_chats.length; l++) {
                var h = game_chats[l];
                if (l < 100 && !h[0]) {
                    continue
                }
                a.push(h)
            }
            game_chats = a.slice(-225)
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
    chat_inventory_logic();
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
    for (id in entities) {
        var b = entities[id];
        if (b.rip || b.invincible || b.npc) {
            continue
        }
        if (character.team && b.team == character.team) {
            continue
        }
        if (!character.team && b.party && character.party == b.party) {
            continue
        }
        if (!character.team && b.guild && character.guild == b.guild) {
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
            if (!a) {
                a = f.input
            }
            c += "<div style='margin-bottom: 4px'><input type='text' class='selectioninput mprotected " + f.input + "' placeholder='" + (f.placeholder || "") + "' value='" + (f.value || "") + "' style='" + (f.style || "") + "'/></div>"
        }
        if (f.textarea) {
            if (!a) {
                a = f.textarea
            }
            c += "<div style='margin-bottom: 4px'><textarea class='selectiontextarea mprotected " + f.textarea + "' placeholder='" + (f.placeholder || "") + "' value='" + (f.value || "") + "' style='" + (f.style || "") + "'/></div>"
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
function show_mail_modal() {
    get_input([{
        title: "New Mail"
    }, {
        input: "mrecipient",
        placeholder: "Recipient",
        style: "width: 320px; text-align: left !important;"
    }, {
        input: "msubject",
        placeholder: "Subject",
        style: "width: 320px; text-align: left !important;"
    }, {
        textarea: "mmsg",
        placeholder: "Message",
        style: "width: 324px; height: 74px; text-align: left !important;"
    }, {
        button: "Send",
        onclick: function() {
            pcs();
            socket.emit("mail", {
                to: $(".mrecipient").val(),
                subject: $(".msubject").val(),
                message: $(".mmsg").val()
            })
        }
    }])
}
var sc_onclick = function() {};
function show_confirm(f, c, d, a) {
    sc_onclick = a;
    var b = "";
    b += "<div style='width: 400px; border: 5px solid gray; background-color: black; font-size: 24px'><div style='padding: 20px;'>" + f + "</div></div>";
    b += "<div style='width: 410px; text-align: right; font-size: 0px'>";
    b += "<div class='gamebutton' style='border-color: #328355; margin: 6px 6px 6px 0px' onclick='sc_onclick();'>" + c + "</div>";
    b += "<div class='gamebutton' style='margin: 6px 0px 6px 6px' onclick='hide_modal();'>" + d + "</div>";
    b += "</div>";
    show_modal(b, {
        wrap: false,
        hideinbackground: true
    })
}
function use_skill(b, j, l) {
    if (j && j.id) {
        j = j.id
    }
    if (j && is_array(j)) {
        for (var d = 0; d < j.length; d++) {
            if (j[d] && j[d].id) {
                j[d] = j[d].id
            }
            if (j[d] && j[d][0] && j[d][0].id) {
                j[d][0] = j[d][0].id
            }
        }
    }
    if (b == "use_hp" || b == "hp") {
        use("hp");
        return resolving_promise({
            result: "requested"
        })
    } else {
        if (b == "use_mp" || b == "mp") {
            use("mp");
            return resolving_promise({
                result: "requested"
            })
        } else {
            if (b == "stop") {
                move(character.real_x, character.real_y + 0.00001);
                socket.emit("stop");
                code_eval_if_r("smart.moving=false");
                return resolving_promise({
                    result: "requested"
                })
            } else {
                if (b == "use_town" || b == "town") {
                    if (character.rip) {
                        socket.emit("respawn")
                    } else {
                        socket.emit("town")
                    }
                    return resolving_promise({
                        result: "requested"
                    })
                } else {
                    if (b == "cburst") {
                        if (is_array(j)) {
                            socket.emit("skill", {
                                name: "cburst",
                                targets: j
                            });
                            return push_deferreds("skill", j.length)
                        } else {
                            var h = get_nearby_hostiles({
                                range: character.range - 2,
                                limit: 12
                            })
                                , g = []
                                , c = character.mp - 200
                                , k = parseInt(c / h.length);
                            h.forEach(function(m) {
                                g.push([m.id, k])
                            });
                            socket.emit("skill", {
                                name: "cburst",
                                targets: g
                            });
                            return push_deferreds("skill", g.length)
                        }
                    } else {
                        if (b == "3shot") {
                            if (is_array(j)) {
                                socket.emit("skill", {
                                    name: "3shot",
                                    ids: j
                                });
                                return push_deferreds("skill", j.length)
                            } else {
                                var h = get_nearby_hostiles({
                                    range: character.range - 2,
                                    limit: 3
                                })
                                    , a = [];
                                h.forEach(function(m) {
                                    a.push(m.id)
                                });
                                socket.emit("skill", {
                                    name: "3shot",
                                    ids: a
                                });
                                return push_deferreds("skill", a.length)
                            }
                        } else {
                            if (b == "5shot") {
                                if (is_array(j)) {
                                    socket.emit("skill", {
                                        name: "5shot",
                                        ids: j
                                    });
                                    return push_deferreds("skill", j.length)
                                } else {
                                    var h = get_nearby_hostiles({
                                        range: character.range - 2,
                                        limit: 5
                                    })
                                        , a = [];
                                    h.forEach(function(m) {
                                        a.push(m.id)
                                    });
                                    socket.emit("skill", {
                                        name: "5shot",
                                        ids: a
                                    });
                                    return push_deferreds("skill", a.length)
                                }
                            } else {
                                if (in_arr(b, ["invis", "partyheal", "darkblessing", "agitate", "cleave", "stomp", "charge", "light", "hardshell", "track", "warcry", "mcourage", "scare", "alchemy"])) {
                                    socket.emit("skill", {
                                        name: b
                                    })
                                } else {
                                    if (in_arr(b, ["supershot", "quickpunch", "quickstab", "taunt", "curse", "burst", "4fingers", "magiport", "absorb", "mluck", "rspeed", "charm", "mentalburst", "piercingshot", "huntersmark", "reflection"])) {
                                        socket.emit("skill", {
                                            name: b,
                                            id: j
                                        })
                                    } else {
                                        if (b == "pcoat") {
                                            var f = item_position("poison");
                                            if (f === undefined) {
                                                add_log("You don't have a poison sack", "gray");
                                                return rejecting_promise({
                                                    reason: "no_item"
                                                })
                                            }
                                            socket.emit("skill", {
                                                name: "pcoat",
                                                num: f
                                            })
                                        } else {
                                            if (b == "revive") {
                                                var f = item_position("essenceoflife");
                                                if (f === undefined) {
                                                    add_log("You don't have an essence", "gray");
                                                    return rejecting_promise({
                                                        reason: "no_item"
                                                    })
                                                }
                                                socket.emit("skill", {
                                                    name: "revive",
                                                    num: f,
                                                    id: j
                                                })
                                            } else {
                                                if (b == "entangle") {
                                                    var f = item_position("essenceofnature");
                                                    if (f === undefined) {
                                                        add_log("You don't have an essence", "gray");
                                                        return rejecting_promise({
                                                            reason: "no_item"
                                                        })
                                                    }
                                                    socket.emit("skill", {
                                                        name: "entangle",
                                                        num: f,
                                                        id: j
                                                    })
                                                } else {
                                                    if (b == "poisonarrow") {
                                                        var f = item_position("poison");
                                                        if (f === undefined) {
                                                            add_log("You don't have a poison sack", "gray");
                                                            return rejecting_promise({
                                                                reason: "no_item"
                                                            })
                                                        }
                                                        socket.emit("skill", {
                                                            name: "poisonarrow",
                                                            num: f,
                                                            id: j
                                                        })
                                                    } else {
                                                        if (b == "shadowstrike" || b == "phaseout") {
                                                            var f = item_position("shadowstone");
                                                            if (f === undefined) {
                                                                add_log("You don't have any shadow stones", "gray");
                                                                return rejecting_promise({
                                                                    reason: "no_item"
                                                                })
                                                            }
                                                            socket.emit("skill", {
                                                                name: b,
                                                                num: f
                                                            })
                                                        } else {
                                                            if (b == "throw") {
                                                                if (!character.items[l]) {
                                                                    add_log("Inventory slot is empty", "gray");
                                                                    return rejecting_promise({
                                                                        reason: "no_item"
                                                                    })
                                                                }
                                                                socket.emit("skill", {
                                                                    name: b,
                                                                    num: l,
                                                                    id: j
                                                                })
                                                            } else {
                                                                if (b == "blink") {
                                                                    socket.emit("skill", {
                                                                        name: "blink",
                                                                        x: j[0],
                                                                        y: j[1]
                                                                    })
                                                                } else {
                                                                    if (b == "energize") {
                                                                        socket.emit("skill", {
                                                                            name: "energize",
                                                                            id: j,
                                                                            mp: l
                                                                        })
                                                                    } else {
                                                                        if (b == "stack") {
                                                                            on_skill("attack")
                                                                        } else {
                                                                            add_log("Skill not found: " + b, "gray");
                                                                            return rejecting_promise({
                                                                                reason: "no_skill"
                                                                            })
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return push_deferred("skill")
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
            if (G.items[g.name].type == "stand" || G.items[g.name].stand) {
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
            var j = xtarget || ctarget;
            if (j && j.id) {
                socket.emit("attack", {
                    id: j.id
                })
            } else {
                add_log("No target", "gray")
            }
        } else {
            if (c == "heal") {
                var j = xtarget || ctarget;
                if (j && j.id) {
                    socket.emit("heal", {
                        id: j.id
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
                                                    onclick: function() {
                                                        hide_modal();
                                                        render_gtravel()
                                                    }
                                                });
                                                f.push({
                                                    button: "P Jump",
                                                    onclick: function() {
                                                        socket.emit("gm", {
                                                            action: "jump_list"
                                                        })
                                                    }
                                                });
                                                f.push({
                                                    button: "M Jump",
                                                    onclick: function() {
                                                        hide_modal();
                                                        render_gmonsters(1)
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
                                                                hide_modal(true)
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
                                                                hide_modal(true)
                                                            },
                                                            input: "mglocx",
                                                            placeholder: "Name",
                                                            title: "Character"
                                                        })
                                                    }
                                                });
                                                f.push({
                                                    button: "Ban",
                                                    onclick: function() {
                                                        hide_modal();
                                                        get_input({
                                                            button: "Ban",
                                                            onclick: function() {
                                                                socket.emit("gm", {
                                                                    action: "ban",
                                                                    id: $(".mglocx").val()
                                                                });
                                                                hide_modal(true)
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
                                                                                    } catch (k) {}
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
                                                                                        if (c == "throw") {
                                                                                            use_skill(c, xtarget || ctarget, a.num || 0)
                                                                                        } else {
                                                                                            use_skill(c, xtarget || ctarget)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
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
    if (!window.character || !window.options.move_with_arrows || !can_walk(character)) {
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
    dialogs_target = xtarget || ctarget;
    render_condition("#topleftcornerdialog", a)
}
function inventory_click(a) {
    if (character.items[a]) {
        if (character.items[a].name == "placeholder") {
            return
        }
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
function wishlist_item_click(b, a) {
    render_wishlist_item(b, a)
}
function wishlist_click(b) {
    var a = parseInt(b.substr(5, 123));
    render_wishlist(a, 0)
}
function slot_click(a) {
    var b = xtarget || ctarget;
    if (b && b.slots && b.slots[a]) {
        dialogs_target = b;
        render_item("#topleftcornerdialog", {
            id: "item" + a,
            item: G.items[b.slots[a].name],
            name: b.slots[a].name,
            actual: b.slots[a],
            slot: a,
            from_player: b.id
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
    xtarget = b
}
function travel_p(a) {
    if (party[a] && party[a]["in"] == party[a].map) {
        call_code_function_f("smart_move", {
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
        xtarget = b
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
function execute_codemirror(a) {
    $(".executei").remove();
    window.the_example = $(a).parent()[0].CodeMirror.getValue();
    $(a).parent().append("<div class='clickable enableclicks' style='position: absolute; top: 4px; right: 4px; z-index: 4;' onclick='$(\".executei\").remove();'><iframe src='/executor' style='width: 200px; height: 26px; border: 1px solid white; pointer-events: none;' class='executei' /></div>")
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
    if ($(".snippetbtn").length) {
        return
    }
    var a = "<textarea id='rendererx'></textarea><div class='gamebutton snippetbtn' style='position: absolute; bottom: -68px; right: -5px' onclick='eval_snippet()'>EXECUTE</div>";
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
        var h = $(this)
            , c = h.data("name")
            , g = null;
        if (c) {
            var f = "starting"
                , b = c.toLowerCase()
                , d = h.attr("id");
            if (document.getElementById(d) && document.getElementById(d).contentWindow) {
                f = "loading";
                if (document.getElementById(d).contentWindow.character) {
                    g = document.getElementById(d).contentWindow.character.name;
                    f = "active";
                    if (document.getElementById(d).contentWindow.code_active) {
                        f = "code"
                    }
                }
            }
            if (g && g != c) {
                c = g,
                    h.attr("id", "ichar" + c.toLowerCase())
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
function code_move(a, b) {
    code_eval("smart_move({x:'" + a + "',y:'" + b + "'})")
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
    $("#iframelist").append('<div class="clickable" onclick="show_character_snippet(\'' + b + '\')"><iframe src="' + a + "?no_html=true&is_bot=1&code=" + d + '" id="' + c + '" style="border: 5px solid gray; background-color: black; margin-top: -5px; height: 60px; width: 128px; overflow: hidden; pointer-events: none" data-name="' + b + '"></iframe></div>');
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
        sounds.empty.stop(),
            sounds.empty.cplaying = false
    }
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
    X.characters.forEach(function(h) {
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
        } catch (g) {}
        storage_set("code_cache", JSON.stringify(d));
        smart_eval($(".onbackbutton").attr("onclick"));
        add_log("Done!")
    } else {
        add_log("Character not found!")
    }
}
function code_persistence_logic() {
    if (persist_code) {
        try {
            if (gameplay != "normal") {
                f = gameplay
            }
            var c = storage_get("code_cache")
                , b = ""
                , a = false
                , f = "";
            c = c && JSON.parse(c) || {};
            if (new_code_slot !== undefined) {
                code_slot = new_code_slot
            }
            c["run_" + real_id + f] = actual_code && code_run && "1" || "";
            c["code_" + real_id + f] = codemirror_render.getValue();
            c["slot_" + real_id + f] = code_slot;
            storage_set("code_cache", JSON.stringify(c));
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
var last_hint = undefined;
function code_logic() {
    window.codemirror_render = CodeMirror(function(a) {
        $("#code").replaceWith(a);
        a.classList.add("maincode")
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
    });
    listen_for_hints(codemirror_render)
}
function listen_for_hints(a) {
    a.on("cursorActivity", function() {
        if (!code) {
            return
        }
        var b = a.findWordAt(a.getCursor());
        var c = a.getRange(b.anchor, b.head);
        if (c && !in_arr(c, ["0"]) && (window[c] || in_arr(c, G.docs.functions))) {
            if (last_hint === undefined) {
                $("body").append("<div id='codehint' onclick='load_documentation($(this).html())'></div>")
            }
            last_hint = c;
            $("#codehint").html(c);
            $("#codehint").show()
        } else {
            if (last_hint) {
                $("#codehint").remove(),
                    last_hint = undefined
            }
        }
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
        remove_code_fx();
        $("#codehint").remove();
        last_hint = undefined
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
function the_lever() {
    socket.emit("interaction", "the_lever");
    if (animatables.the_lever) {
        h_minor()
    }
    draw_timeout(function() {
        if (animatables.the_lever) {
            set_texture(animatables.the_lever, "1")
        }
    }, 100);
    draw_timeout(function() {
        if (animatables.the_lever) {
            set_texture(animatables.the_lever, "2")
        }
    }, 200)
}
function v_shake_minor() {
    function b(c) {
        return function() {
            stage.y += c;
            ch_disp_y -= c
        }
    }
    var a = 0;
    [-1, 1].forEach(function(c) {
        setTimeout(b(c), a++ * 20)
    })
}
function v_shake() {
    function b(c) {
        return function() {
            stage.y += c;
            ch_disp_y -= c
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
            if (d == character) {
                ch_disp_y -= f
            } else {
                d.real_y -= f
            }
        }
    }
    var a = 0;
    [-1, 1, -2, 2, -2, 2, -1, 1].forEach(function(f) {
        setTimeout(b(c, f), a++ * 40)
    })
}
function v_shake_i2(c) {
    function b(d, f) {
        return function() {
            if (d == character) {
                ch_disp_y -= f
            } else {
                d.real_y -= f
            }
        }
    }
    var a = 0;
    [-1, 1, -1, 1, -1, 1, -1, 1].forEach(function(f) {
        setTimeout(b(c, f), a++ * 20)
    })
}
function v_shake_i_minor(c) {
    function b(d, f) {
        return function() {
            d.y -= f
        }
    }
    var a = 0;
    [-1, 1].forEach(function(f) {
        setTimeout(b(c, f), a++ * 20)
    })
}
function v_dive() {
    function b(c) {
        return function() {
            stage.y += c;
            ch_disp_y -= c
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
            if (d == character) {
                ch_disp_y -= f
            } else {
                d.real_y -= f
            }
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
function jump_up(d) {
    function c(f) {
        return function() {
            ch_disp_y -= f
        }
    }
    var b = 0
        , a = [-1, -2, 2, 1];
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
function h_minor() {
    function b(c) {
        return function() {
            stage.x += c
        }
    }
    var a = 0;
    [-1, 1, -1, 1, -1, 1, -1, 1].forEach(function(c) {
        setTimeout(b(c), a++ * 30)
    })
}
function h_shake() {
    function b(c) {
        return function() {
            stage.x += c;
            ch_disp_x -= c
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
            if (a == character) {
                ch_disp_y -= f
            } else {
                a.real_y -= f
            }
        }
    }
    var b = 0;
    [1, 1, 1, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5].forEach(function(f) {
        setTimeout(d(f * c), b++ * 17)
    })
}
function animate_weapon(a, b) {
    a.fx.attack = [new Date(), 0]
}
function safe_y_move(a, b) {
    if (a.me) {
        ch_disp_y += b
    } else {
        a.real_y += b,
            a.y_disp += b
    }
}
function safe_x_move(b, a) {
    if (b.me) {
        ch_disp_x += a
    } else {
        b.real_x += a
    }
}
function attack_animation_logic(b, c) {
    var a = false;
    if (in_arr(c, ["partyheal"])) {
        a = true
    }
    if (b.fx.aaa || b.fx.aaa === 0) {
        return
    }
    b.fx.aaa = b.a_direction;
    if (1) {
        if (b.fx.aaa == 0 || a) {
            safe_y_move(b, 2)
        } else {
            if (b.fx.aaa == 3) {
                safe_y_move(b, -2)
            } else {
                if (b.fx.aaa == 1) {
                    safe_x_move(b, -2)
                } else {
                    safe_x_move(b, 2)
                }
            }
        }
        setTimeout(function() {
            if (b.fx.aaa == 0 || a) {
                safe_y_move(b, -1)
            } else {
                if (b.fx.aaa == 3) {
                    safe_y_move(b, 1)
                } else {
                    if (b.fx.aaa == 1) {
                        safe_x_move(b, 1)
                    } else {
                        safe_x_move(b, -1)
                    }
                }
            }
        }, 60);
        setTimeout(function() {
            if (b.fx.aaa == 0 || a) {
                safe_y_move(b, -1)
            } else {
                if (b.fx.aaa == 3) {
                    safe_y_move(b, 1)
                } else {
                    if (b.fx.aaa == 1) {
                        safe_x_move(b, 1)
                    } else {
                        safe_x_move(b, -1)
                    }
                }
            }
            b.fx.aaa = null
        }, 60)
    }
}
function set_direction(a, d) {
    if (d != "soft" && a.moving && a.name_tag) {
        start_name_tag(a)
    }
    var b = 70
        , c = 0;
    if (d == "npc") {
        b = 45
    }
    if (abs(a.angle) < b) {
        c = 2
    } else {
        if (abs(abs(a.angle) - 180) < b) {
            c = 1
        } else {
            if (abs(a.angle + 90) < 90) {
                c = 3
            }
        }
    }
    a.a_direction = c;
    if (d != "soft") {
        a.direction = c
    }
}
function leave_references(a) {
    a.visible = false;
    (function() {
            var d = a.real_x
                , f = a.real_y
                , c = a.awidth || 10
                , b = a.aheight || 10;
            Object.defineProperty(a, "x", {
                get: function() {
                    return d
                },
                set: function(g) {
                    d = g
                },
                configurable: true
            });
            Object.defineProperty(a, "y", {
                get: function() {
                    return f
                },
                set: function(g) {
                    f = g
                },
                configurable: true
            });
            Object.defineProperty(a, "width", {
                get: function() {
                    return c
                },
                set: function(g) {
                    c = g
                },
                configurable: true
            });
            Object.defineProperty(a, "height", {
                get: function() {
                    return b
                },
                set: function(g) {
                    b = g
                },
                configurable: true
            })
        }
    )()
}
function free_children(b) {
    if (!b.children) {
        return
    }
    for (var a = 0; a < b.children.length; a++) {
        leave_references(b.children[a]);
        if (!b.children[a].dead) {
            b.children[a].dead = "map"
        }
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
    leave_references(a);
    if (!a.dead) {
        a.dead = "vision"
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
        leave_references(a);
        if (!a.dead) {
            a.dead = "vision"
        }
    } catch (b) {
        console.log("Couldn't destroy sprite: " + a.type + " because: " + b)
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
    $("#topleftcornerdialog").html("")
}
function trade(d, a, b, c) {
    c = c || 1;
    socket.emit("equip", {
        q: c,
        slot: d,
        num: a,
        price: b
    });
    $("#topleftcornerdialog").html("")
}
function giveaway(d, a, c, b) {
    socket.emit("equip", {
        q: c || 1,
        slot: d,
        num: a,
        giveaway: true,
        minutes: b || 0
    });
    $("#topleftcornerdialog").html("")
}
function join_giveaway(c, b, a) {
    socket.emit("join_giveaway", {
        slot: c,
        id: b,
        rid: a
    });
    $("#topleftcornerdialog").html("")
}
function trade_buy(d, c, a, b) {
    socket.emit("trade_buy", {
        slot: d,
        id: c,
        rid: a,
        q: b || 1
    });
    $("#topleftcornerdialog").html("")
}
function trade_sell(d, c, a, b) {
    socket.emit("trade_sell", {
        slot: d,
        id: c,
        rid: a,
        q: b || 1
    });
    $("#topleftcornerdialog").html("")
}
function secondhand_buy(a) {
    socket.emit("sbuy", {
        rid: a
    });
    $("#topleftcornerdialog").html("")
}
function lostandfound_buy(a) {
    socket.emit("sbuy", {
        rid: a,
        f: true
    });
    $("#topleftcornerdialog").html("")
}
function buy_shells(a) {
    if ((a * G.shells_to_gold) > character.gold) {
        render_interaction("noshells")
    } else {
        socket.emit("buy_shells", {
            gold: (a * G.shells_to_gold)
        });
        render_interaction("yesshells")
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
    $(".buynum").html($(".buynum").data("q"));
    if (c == "buy") {
        return push_deferred("buy")
    }
}
function buy_with_gold(a, b) {
    if (mssince(last_npc_right_click) < 100) {
        return
    }
    socket.emit("buy", {
        name: a,
        quantity: b
    });
    $(".buynum").html($(".buynum").data("q"));
    return push_deferred("buy")
}
function buy_with_shells(a, b) {
    if (mssince(last_npc_right_click) < 100) {
        return
    }
    socket.emit("buy_with_cash", {
        name: a,
        quantity: b
    });
    $(".buynum").html($(".buynum").data("q"))
}
function sell(a, c) {
    if (!c) {
        c = 1
    }
    socket.emit("sell", {
        num: a,
        quantity: c
    });
    try {
        $(".sellnum").html(max(0, character.items[a].q - c))
    } catch (b) {
        $(".sellnum").html(0)
    }
}
var last_ccfunc = null;
function call_code_function_f(c, b, a, f) {
    if (code_active) {
        try {
            return get_code_function(c)(b, a, f)
        } catch (d) {
            add_log(c + " " + d, colors.code_error);
            log_trace("call_code_function " + c, d)
        }
    } else {
        last_ccfunc = [c, b, a, f];
        start_runner(0, "\nset_message('Snippet');\neval(parent.last_ccfunc[0])(parent.last_ccfunc[1],parent.last_ccfunc[2],parent.last_ccfunc[3])")
    }
}
function call_code_function(c, b, a, f) {
    try {
        return get_code_function(c)(b, a, f)
    } catch (d) {
        add_log(c + " " + d, colors.code_error);
        log_trace("call_code_function " + c, d)
    }
}
function code_eval_if_r(code) {
    code_active && document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow.eval && document.getElementById("maincode").contentWindow.eval(code)
}

function get_code_function(a) {
    return code_active && document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow[a] || (function() {})
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
            add_chat("", "/uptime");
            add_chat("", "/guide");
            add_chat("", "/learn");
            add_chat("", "/docs");
            add_chat("", "/invite NAME");
            add_chat("", "/request NAME");
            add_chat("", "/friend NAME");
            add_chat("", "/leave");
            add_chat("", "/challenge");
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
                        if (command == "uptime") {
                            add_chat("", to_pretty_num(parseInt(msince(inception))) + " minutes " + parseInt(ssince(inception) % 60) + " seconds", "gray")
                        } else {
                            if (command == "duel" || command == "challenge") {
                                var args = rest.split(" ")
                                    , name = args.shift();
                                var target = xtarget || ctarget;
                                if (!name && target && target.name) {
                                    socket.emit("duel", {
                                        event: "challenge",
                                        name: target.name
                                    })
                                } else {
                                    if (name) {
                                        socket.emit("duel", {
                                            event: "challenge",
                                            name: name
                                        })
                                    } else {
                                        add_chat("", "No one to duel")
                                    }
                                }
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
                                                                                var target = xtarget || ctarget;
                                                                                if (target && !target.me && !target.npc && target.type == "character") {
                                                                                    private_say(target.name, rest)
                                                                                } else {
                                                                                    add_chat("", "Target someone to whisper")
                                                                                }
                                                                            } else {
                                                                                if (command == "party" || command == "invite") {
                                                                                    var args = rest.split(" ")
                                                                                        , name = args.shift();
                                                                                    var target = xtarget || ctarget;
                                                                                    if (name && name.length) {
                                                                                        socket.emit("party", {
                                                                                            event: "invite",
                                                                                            name: name
                                                                                        })
                                                                                    } else {
                                                                                        if (target && !target.me && !target.npc && target.type == "character") {
                                                                                            socket.emit("party", {
                                                                                                event: "invite",
                                                                                                id: target.id
                                                                                            })
                                                                                        } else {
                                                                                            add_chat("", "Target someone to invite")
                                                                                        }
                                                                                    }
                                                                                } else {
                                                                                    if (command == "request") {
                                                                                        var args = rest.split(" ")
                                                                                            , name = args.shift();
                                                                                        var target = xtarget || ctarget;
                                                                                        if (name && name.length) {
                                                                                            socket.emit("party", {
                                                                                                event: "request",
                                                                                                name: name
                                                                                            })
                                                                                        } else {
                                                                                            if (target && !target.me && !target.npc && target.type == "character") {
                                                                                                socket.emit("party", {
                                                                                                    event: "request",
                                                                                                    id: target.id
                                                                                                })
                                                                                            } else {
                                                                                                add_chat("", "Target someone to request party")
                                                                                            }
                                                                                        }
                                                                                    } else {
                                                                                        if (command == "friend") {
                                                                                            var args = rest.split(" ")
                                                                                                , name = args.shift();
                                                                                            var target = xtarget || ctarget;
                                                                                            if (name && name.length) {
                                                                                                socket.emit("friend", {
                                                                                                    event: "request",
                                                                                                    name: name
                                                                                                })
                                                                                            } else {
                                                                                                if (target && !target.me && !target.npc && target.type == "character") {
                                                                                                    socket.emit("friend", {
                                                                                                        event: "request",
                                                                                                        name: target.name
                                                                                                    })
                                                                                                } else {
                                                                                                    add_chat("", "Target someone to friend")
                                                                                                }
                                                                                            }
                                                                                        } else {
                                                                                            if (command == "guide") {
                                                                                                show_game_guide()
                                                                                            } else {
                                                                                                if (command == "learn") {
                                                                                                    render_code_articles()
                                                                                                } else {
                                                                                                    if (command == "docs") {
                                                                                                        render_code_docs()
                                                                                                    } else {
                                                                                                        if (code_active && document.getElementById("maincode") && document.getElementById("maincode").contentWindow && document.getElementById("maincode").contentWindow.handle_command) {
                                                                                                            if (document.getElementById("maincode").contentWindow.handle_command(command, rest) != -1) {} else {
                                                                                                                add_chat("", "Command not found. You can add a `handle_command` function to your CODE to capture commands.")
                                                                                                            }
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
function quantity(a, d) {
    var c = 0;
    for (var b = 0; b < character.items.length; b++) {
        if (character.items[b] && character.items[b].name == a && (character.items[b].level || 0) == (d || 0)) {
            c += character.items[b].q || 1
        }
    }
    return c
}
function auto_craft(d, f) {
    var a = null;
    if (!G.craft[d]) {
        a = "recipe"
    } else {
        if (G.craft[d].gold < character.gold) {
            a = "gold"
        } else {
            G.craft[d].items.forEach(function(g) {
                if (quantity(g[1], g[2]) < g[0]) {
                    a = "items"
                }
            })
        }
    }
    if (a) {
        if (a == "recipe") {
            add_log("Can't craft that item", "gray")
        } else {
            if (a == "gold") {
                add_log("Not enough gold", "gray")
            } else {
                if (a == "items") {
                    add_log("Don't have the required items", "gray")
                }
            }
        }
        if (f) {
            return a
        }
    } else {
        var c = []
            , b = 0;
        G.craft[d].items.forEach(function(h) {
            for (var g = 0; g < character.items.length; g++) {
                if (character.items[g] && character.items[g].name == h[1] && (character.items[g].level || 0) == (h[2] || 0) && (character.items[g].q || 1) >= h[0]) {
                    c.push([b++, g]);
                    break
                }
            }
        });
        console.log(c);
        socket.emit("craft", {
            items: c
        })
    }
}
var suppress_calculations = false;
function upgrade(d, a, f, c, b) {
    if (!c && b && suppress_calculations) {
        return
    }
    if (!c && (d == null || (a == null && f == null))) {
        d_text("INVALID", character)
    } else {
        socket.emit("upgrade", {
            item_num: d,
            scroll_num: a,
            offering_num: f,
            clevel: (character.items[d] && character.items[d].level || 0),
            calculate: b
        });
        last_uping = new Date();
        return push_deferred("upgrade")
    }
}
function compound(d, c, b, a, h, g, f) {
    if (!g && f && suppress_calculations) {
        return
    }
    if (!g && (d == null || c == null || b == null || a == null)) {
        d_text("INVALID", character)
    } else {
        socket.emit("compound", {
            items: [d, c, b],
            scroll_num: a,
            offering_num: h,
            clevel: (character.items[d].level || 0),
            calculate: f
        });
        return push_deferred("compound")
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
var last_excanim = new Date()
    , exclast = 0;
var exccolors1 = ["#f1c40f", "#f39c12", "#e74c3c", "#c0392b", "#8e44ad", "#9b59b6", "#2980b9", "#3498db", "#1abc9c"];
var exccolorsl = ["#CD6F1A", "#A95C15"];
var exccolorsg = ["#EFD541", "#9495AC"];
var exccolorsgray = ["#7C7C7C", "#5C5D5D", "#3B3C3C"];
var exccolorsc = ["#C82F17", "#EBECEE"];
var exccolorssea = ["#24A7CB", "#EBECEE"];
function exchange_animation_logic() {
    var a = exccolors1;
    if (character.q.exchange.qs == "leather") {
        a = exccolorsl
    }
    if (character.q.exchange.qs == "lostearring") {
        a = exccolorsg
    }
    if (character.q.exchange.qs == "seashell") {
        a = exccolorssea
    }
    if (character.q.exchange.qs == "poof") {
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
var u_valid = false
    , last_uchance = null
    , last_uchance_for = "upgrade_or_compound";
function set_uchance(f, b) {
    last_uchance = f;
    last_uchance_for = rendered_target;
    if (f == "?") {
        $(".uchance").css("color", "#299C4C");
        $(".uchance").html("%??.??");
        return
    }
    if (parseInt(f * 10000000000)) {
        u_valid = true
    }
    var a = min(9999, (parseInt(f * 10000) || 0))
        , d = "" + parseInt(a / 100)
        , c = "" + parseInt(a % 100);
    a = a / 100;
    if (d.length == 1) {
        d = "0" + d
    }
    if (c.length == 1) {
        c = c + "0"
    }
    if (a > 95) {
        color = "#31C760"
    } else {
        if (a > 80) {
            color = "#259248"
        } else {
            if (a > 75) {
                color = "#56923B"
            } else {
                if (a > 60) {
                    color = "#76922C"
                } else {
                    if (a > 50) {
                        color = "#8F8A23"
                    } else {
                        if (a > 40) {
                            color = "#8E682D"
                        } else {
                            if (a > 30) {
                                color = "#8E5744"
                            } else {
                                if (a > 20) {
                                    color = "#8E456A"
                                } else {
                                    if (a > 10) {
                                        color = "#8E6087"
                                    } else {
                                        color = "#AA3248"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if (b) {
        return [color, "%" + d + "." + c]
    }
    $(".uchance").css("color", color);
    $(".uchance").html("%" + d + "." + c)
}
var uroll_colors = ["#f1c40f", "#f39c12", "#e74c3c", "#c0392b", "#8e44ad", "#9b59b6", "#2980b9", "#3498db", "#1abc9c"];
var uroll_colors = ["#868590"];
var uroll_characters = ["|", "/", "-", "\\"]
    , last_uc = 0;
function set_uroll(g, f) {
    var h = uroll_characters[last_uc++ % uroll_characters.length]
        , a = 0;
    var d = "";
    if (g.success) {
        h = "$",
            a = "#49C528"
    }
    if (g.failure) {
        h = "^",
            a = "#9F1020"
    }
    d += "<span style='color:" + (a || random_one(uroll_colors)) + ";'>" + h + "</span>";
    for (var b = 3; b >= 0; b--) {
        if (g.nums[b] !== undefined) {
            d += "<span style='color:" + (a || "white") + "'>" + g.nums[b] + "</span>"
        } else {
            d += "<span style='color:" + (a || random_one(uroll_colors)) + "'>" + parseInt(Math.random() * 10) + "</span>"
        }
        if (b == 2) {
            d += "<span style='color:" + (a || random_one(uroll_colors)) + "'>.</span>"
        }
    }
    if (f) {
        return d
    }
    $(".uroll").html(d)
}
var last_companim = new Date();
function compound_animation_logic() {
    if (topleft_npc == "compound" && character.q.compound && character.items[character.q.compound.num] && character.items[character.q.compound.num].name == "placeholder") {
        var a = character.items[character.q.compound.num].p;
        if (mssince(last_companim) > 120) {
            last_companim = new Date();
            set_uroll(a)
        }
    }
    if (character.map == "main" && Math.random() < 0.4) {
        random_spark({
            map: "main",
            x: G.maps.main.ref.c_mid[0] + 5 - Math.random() * 10,
            y: G.maps.main.ref.c_mid[1] - Math.random() * 6 + 1,
            "in": "main"
        }, {
            color: "spark"
        })
    }
}
var last_upganim = new Date()
    , last_uping = new Date();
function upgrade_animation_logic() {
    if (topleft_npc == "upgrade" && character.q.upgrade && character.items[character.q.upgrade.num] && character.items[character.q.upgrade.num].name == "placeholder") {
        var a = character.items[character.q.upgrade.num].p;
        if (mssince(last_upganim) > 120) {
            last_upganim = new Date();
            set_uroll(a)
        }
    }
    if (character.map == "main" && Math.random() < 0.4) {
        random_spark({
            map: "main",
            x: G.maps.main.ref.u_mid[0] + 5 - Math.random() * 10,
            y: G.maps.main.ref.u_mid[1] - Math.random() * 6 + 1,
            "in": "main"
        }, {
            color: "spark"
        })
    }
}
setInterval(function() {
    if (window.character && !character.q.upgrade && topleft_npc == "upgrade" && u_valid && u_item !== null && u_scroll !== null && mssince(last_uping) > 1600) {
        upgrade(u_item, u_scroll, u_offering, null, true),
            last_uping = new Date()
    }
}, 1600);
function poof(a) {
    var b = 2400;
    exchange_type = "poof";
    if (a || 1) {
        socket.emit("destroy", {
            num: p_item,
            q: 1,
            statue: true
        });
        return
    }
    function c(d) {
        return function() {
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

function exchange(a) {
    if (character.q.exchange) {
        d_text("WAIT", character)
    } else {
        if (!a && e_item == null) {
            d_text("INVALID", character)
        } else {
            socket.emit("exchange", {
                item_num: e_item,
                q: character.items[e_item].q
            });
            return
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
var u_retain = false
    , u_retain_t = false;

function reopen() {
    if (options.retain_upgrades && u_item) {
        u_retain = [u_item, u_scroll, u_offering]
    }
    draw_trigger(function() {
        var a = [];
        if (rendered_target == "upgrade") {
            a = render_upgrade_shrine()
        } else {
            if (rendered_target == "compound") {
                a = render_compound_shrine()
            } else {
                if (rendered_target == "exchange") {
                    a = render_exchange_shrine(exchange_type)
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
        suppress_calculations = true;
        var b = false;
        for (var c = 0; c < a.length; c++) {
            if (a[c] !== null) {
                on_rclick($("#citem" + a[c])[0]),
                    b = true
            }
        }
        if (b && last_uchance !== null && last_uchance_for == rendered_target) {
            set_uchance(last_uchance)
        }
        suppress_calculations = false;
        if (rendered_target != "upgrade") {
            u_item = u_scroll = u_offering = null
        }
        if (rendered_target != "compound") {
            c_items[0] = c_items[1] = c_items[2] = c_scroll = c_offering = null
        }
        if (rendered_target != last_uchance_for) {
            last_uchance = null
        }
        if (rendered_target != "exchange") {
            e_item = null
        }
        if (u_retain && u_retain_t && rendered_target == "upgrade" && !character.q.upgrade) {
            for (var c = 0; c < 3; c++) {
                if ((u_retain[c] || u_retain[c] === 0) && character.items[u_retain[c]]) {
                    on_rclick($("#citem" + u_retain[c])[0])
                }
            }
            u_retain = u_retain_t = false
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
                    if (xtarget) {
                        xtarget = null
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
    $(":focus").blur()
}
function toggle_stats() {
    tut("stats");
    if (topright_npc != "character") {
        render_character_sheet()
    } else {
        $("#rightcornerui").html("");
        topright_npc = false
    }
}
function toggle_character() {
    tut("character");
    if (xtarget && xtarget == character) {
        xtarget = null
    } else {
        if (ctarget == character && !topleft_npc) {
            ctarget = null
        } else {
            topleft_npc = false,
                xtarget = character
        }
    }
}
function reset_inventory(a) {
    if (inventory) {
        if (a && !in_arr(rendered_target, ["upgrade", "compound", "exchange", "npc", "merchant", "craftsman", "dismantler", "none", "locksmith"])) {
            return
        }
        render_inventory(true)
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
function generate_textures(c, p) {
    if (in_arr(p, ["full", "wings", "body", "armor", "skin", "upper", "tail", "character"])) {
        var o = XYWH[c]
            , g = o[2]
            , s = o[3]
            , u = 0
            , t = 0
            , n = ""
            , f = 0
            , b = 3;
        if (p == "upper") {
            n = "upper",
                f = 8
        }
        var r = G.dimensions[c];
        if (r) {
            g = r[0];
            s = r[1];
            u = round((o[2] - g) / 2 + (r[2] || 0));
            t = round(o[3] - s)
        }
        textures[n + c] = [[null, null, null, null], [null, null, null, null], [null, null, null, null]];
        if (p == "tail") {
            b = 4,
                textures[n + c].push([null, null, null, null])
        }
        for (var m = 0; m < b; m++) {
            for (var k = 0; k < 4; k++) {
                var q = new PIXI.Rectangle(o[0] + m * o[2] + u,o[1] + k * o[3] + t,g,s - f);
                if (offset_walking && !r) {
                    q.y += 2,
                        q.height -= 2
                }
                textures[n + c][m][k] = new PIXI.Texture(C[FC[c]],q)
            }
        }
    }
    if (p == "item") {
        var q = new PIXI.Rectangle(G.positions[c][1] * 20,G.positions[c][2] * 20,20,20);
        textures["item" + c] = new PIXI.Texture(C[G.imagesets[G.positions[c][0] || "pack_20"].file],q)
    }
    if (in_arr(p, ["emblem", "gravestone"])) {
        var o = XYWH[c];
        var q = new PIXI.Rectangle(o[0],o[1],o[2],o[3]);
        textures[c] = new PIXI.Texture(C[FC[c]],q)
    }
    if (p == "machine") {
        var h = c;
        c = h.type;
        textures[c] = e_array(h.frames.length);
        for (var m = 0; m < h.frames.length; m++) {
            var q = new PIXI.Rectangle(h.frames[m][0],h.frames[m][1],h.frames[m][2],h.frames[m][3]);
            textures[c][m] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[h.set]],q)
        }
        if (h.subframes) {
            textures[c + "sub"] = e_array(h.subframes.length);
            for (var m = 0; m < h.subframes.length; m++) {
                var q = new PIXI.Rectangle(h.subframes[m][0],h.subframes[m][1],h.subframes[m][2],h.subframes[m][3]);
                textures[c + "sub"][m] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[h.set]],q)
            }
        }
    }
    if (p == "animation") {
        var r = G.animations[c];
        if (no_graphics) {
            PIXI.utils.BaseTextureCache[r.file] = {
                width: 20,
                height: 20
            }
        }
        var g = PIXI.utils.BaseTextureCache[r.file].width
            , l = Math.floor(g / r.frames);
        var s = PIXI.utils.BaseTextureCache[r.file].height;
        textures[c] = e_array(r.frames);
        for (var m = 0; m < r.frames; m++) {
            var q = new PIXI.Rectangle(0 + l * m,0,l,s);
            textures[c][m] = new PIXI.Texture(PIXI.utils.BaseTextureCache[r.file],q)
        }
    }
    if (p == "animatable") {
        var o = G.positions[c];
        textures[c] = e_array(o.length);
        var m = 0;
        o.forEach(function(d) {
            var a = new PIXI.Rectangle(d[1],d[2],d[3],d[4]);
            textures[c][m++] = new PIXI.Texture(PIXI.utils.BaseTextureCache[G.tilesets[d[0]]],a)
        })
    }
    if (p == "emote") {
        var o = XYWH[c];
        textures[c] = [null, null, null];
        for (var m = 0; m < 3; m++) {
            var q = new PIXI.Rectangle(o[0] + m * o[2],o[1],o[2],o[3]);
            textures[c][m] = new PIXI.Texture(C[FC[c]],q)
        }
    }
    if (in_arr(p, ["v_animation", "head", "hair", "hat", "s_wings", "face", "beard"])) {
        var o = XYWH[c];
        textures[c] = [null, null, null, null];
        for (var m = 0; m < 4; m++) {
            var q = new PIXI.Rectangle(o[0],o[1] + m * o[3],o[2],o[3]);
            textures[c][m] = new PIXI.Texture(C[FC[c]],q)
        }
    }
}
function restore_dimensions(a) {
    a.height = a.texture.height * (a.cscale || 1) / (a.mscale || 1);
    a.width = a.texture.width * (a.cscale || 1) / (a.mscale || 1)
}
function set_texture(d, b, a) {
    var f = b + "" + a;
    d.i = b;
    d.j = a;
    if (d.cskin == f) {
        return
    }
    if (d.stype == "upper") {
        d.texture = textures["upper" + d.skin][b][a]
    }
    if (in_arr(d.stype, ["full", "wings", "body", "armor", "skin", "tail", "character"])) {
        d.texture = textures[d.skin][b][a]
    }
    if (d.stype == "animation") {
        d.texture = textures[d.skin][b % d.frames]
    }
    if (in_arr(d.stype, ["v_animation", "head", "hair", "hat", "s_wings", "face", "beard"])) {
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
    if (in_arr(b, ["full", "wings", "body", "armor", "skin", "tail", "character"])) {
        if (j == "renew") {
            var f = h;
            h = f.skin;
            if (!textures[h]) {
                generate_textures(h, b)
            }
            f.texture = textures[h][1][0]
        } else {
            if (!textures[h]) {
                generate_textures(h, b)
            }
            var f = new PIXI.Sprite(textures[h][1][0])
        }
        f.cskin = "10";
        f.i = 1;
        f.j = 0
    }
    if (b == "item") {
        if (!textures["item" + h]) {
            generate_textures(h, "item")
        }
        var f = new PIXI.Sprite(textures["item" + h])
    }
    if (b == "upper") {
        if (!textures["upper" + h]) {
            generate_textures(h, "upper")
        }
        var f = new PIXI.Sprite(textures["upper" + h][1][0]);
        f.cskin = "10";
        f.i = 1;
        f.j = 0
    }
    if (in_arr(b, ["head", "hair", "hat", "s_wings", "face", "beard"])) {
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
        var f;
        if (G.animations[h] && G.animations[h].tiling) {
            f = new PIXI.extras.TilingSprite(textures[h][0],textures[h][0].width,textures[h][0].height)
        } else {
            f = new PIXI.Sprite(textures[h][0])
        }
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
function random_rotating_rectangle(g, j) {
    if (no_graphics) {
        return
    }
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
    var d = new PIXI.filters.PixelateFilter(7,7);
    h.filters = [d];
    h.x = 0;
    h.y = -15;
    g.cxc.bg.addChild(h);
    function c(p, q, o, n) {
        return function() {
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
function random_spark(f, h) {
    if (no_graphics) {
        return
    }
    if (!h) {
        h = {}
    }
    var g = new PIXI.Graphics();
    var b = [62270, 15999275, 16316471, 5340664, 14765049, 2008313, 7216377, 16216621];
    if (h.color == "success") {
        b = [8767339, 11403147, 15662319]
    } else {
        if (h.color == "purple") {
            b = [10044616, 8140963, 16046847]
        } else {
            if (h.color == "spark") {
                b = [16448741, 16579827, 16501139, 12910562]
            }
        }
    }
    var d = random_one(b);
    var k = 0.2
        , j = random_one([0.25, 0.5, 0, -0.25, -0.5])
        , a = random_one([0.25, 0.5, 0.75]);
    g.lineStyle(3, d);
    g.beginFill(d);
    g.drawRect(-k / 2, -k / 2, k / 2, k / 2);
    g.x = f.x;
    g.y = f.y;
    g.alpha = 0.25;
    if (use_layers) {
        g.parentGroup = player_layer
    } else {
        g.displayGroup = player_layer
    }
    map.addChild(g);
    function c(m, n, l) {
        return function() {
            if (m >= 20.6) {
                destroy_sprite(g)
            } else {
                g.x -= n * DTM * 2;
                g.y -= l * DTM * 2;
                g.height += 0.01 * DTM;
                g.width += 0.01 * DTM;
                g.alpha -= 0.01 * DTM;
                draw_timeout(c(m + DTM, n, l), 15)
            }
        }
    }
    draw_timeout(c(0, j, a), 15)
}
function small_success(a, c) {
    for (var b = 0; b < 4; b++) {
        for (var d = 0; d < 30; d++) {
            draw_timeout(function() {
                random_rotating_rectangle(a, c)
            }, d * 16)
        }
    }
}
function assassin_smoke(m, k, j) {
    if (!j) {
        j = "explode_p"
    }
    var d = 1
        , h = 1
        , f = 3
        , b = 40
        , l = 12
        , g = 0;
    if (j == "firecrackers") {
        j = "crackle",
            d = 1.5,
            h = 1.5,
            b = 16,
            f = 1,
            l = 6;
        var a = Math.random();
        if (a < 0.3) {
            g = 0.5
        }
        if (a > 0.7) {
            g = -0.5
        }
        if (a < 0.25) {
            draw_timeout(function() {
                sfx("crackle0")
            }, a * 40)
        } else {
            if (a > 0.75) {
                draw_timeout(function() {
                    sfx("crackle1")
                }, a * 40)
            }
        }
    }
    var n = new_sprite(j, "animation");
    if (use_layers) {
        n.parentGroup = player_layer
    } else {
        n.displayGroup = player_layer
    }
    n.x = round(m);
    n.y = round(k);
    n.real_x = m;
    n.real_y = k + 1;
    if (j == "explode_p") {
        n.width = 16;
        n.height = 16
    }
    n.anchor.set(0.5, 1);
    map.addChild(n);
    function c(o) {
        return function() {
            if (o >= l) {
                destroy_sprite(n)
            } else {
                n.x -= g;
                n.y -= f;
                n.height += d;
                n.width += h;
                n.frame++;
                set_texture(n, n.frame);
                draw_timeout(c(o + 1), b)
            }
        }
    }
    draw_timeout(c(1), b)
}
function confetti_shower(b, h) {
    if (!b) {
        return
    }
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
                if (b.real_x === undefined) {
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
    interval = 60,
        count = 2,
        times = 15;
    for (var c = 0; c < times; c++) {
        for (var b = 0; b < count; b++) {
            draw_timeout(function() {
                if (a.real_x === undefined) {
                    a = get_entity(a)
                }
                if (!a) {
                    return
                }
                var d = random_away(a.real_x, a.real_y, 30);
                assassin_smoke(d[0], d[1], "firecrackers");
                var d = random_away(a.real_x, a.real_y, 30);
                assassin_smoke(d[0], d[1], "firecrackers")
            }, c * interval)
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
function start_animation(d, c, h) {
    if (no_graphics) {
        return
    }
    if (d.animations[c]) {
        d.animations[c].frame = 0;
        return
    }
    var b = new_sprite(c, "animation")
        , f = (d.hitArea && d.hitArea.width || d.texture.width)
        , a = (d.hitArea && d.hitArea.height || d.texture.height);
    var g = G.animations[c];
    d.animations[c] = b;
    if (g.alpha) {
        b.alpha = g.alpha
    } else {
        b.alpha = 0.5
    }
    if (h == "stun") {
        b.continuous = true;
        b.width = round(f * 2 / 3);
        b.height = round(a / 3);
        b.y = -a + 8
    }
    if (g.continuous) {
        b.continuous = true
    }
    if (g.exact) {} else {
        if (g.continuous) {
            b.height = round(a * 0.95)
        } else {
            if (g.proportional) {
                if (1 * b.height * f / b.width > a) {
                    b.height = a;
                    b.width = ceil(1 * b.width * a / b.height)
                } else {
                    b.height = ceil(1 * b.height * f / b.width);
                    b.width = d.width
                }
            } else {
                if (g.size) {
                    b.width = round(f * g.size);
                    b.height = round(a * g.size)
                } else {
                    b.width = f;
                    b.height = a
                }
            }
        }
    }
    if (c == "revival") {
        b.height = d.texture.height;
        b.width = d.texture.width
    }
    if (g.speeding) {
        b.speeding = true
    }
    if (g.front) {
        b.y_disp = -30
    }
    if (g.y) {
        b.y = -g.y
    }
    b.zy = 1200;
    b.aspeed = g.aspeed;
    b.aspeed = (b.aspeed == "fast" && 0.8) || (b.aspeed == "mild" && 1.4) || (b.aspeed == "slow" && 3) || 2;
    b.anchor.set(0.5, 1);
    d.addChild(b)
}
function map_animation(d, c) {
    if (no_graphics) {
        return
    }
    if (!c) {
        c = {}
    }
    var b = new_sprite(d, "animation")
        , f = b.width
        , a = b.height;
    var g = G.animations[d];
    b.atype = "map";
    b.continuous = true;
    b.speeding = true;
    b.aspeed = g.aspeed;
    b.aspeed = (b.aspeed == "fast" && 0.8) || (b.aspeed == "mild" && 1.4) || (b.aspeed == "slow" && 3) || 2;
    b.anchor.set(0.5, 0.5);
    if (g.front) {
        b.y_disp = -30
    }
    b.parentGroup = b.displayGroup = player_layer;
    b.x = c.x || 0;
    b.y = c.y || 0;
    b.framefps = g.framefps || 15;
    b.last_frame = new Date();
    b.last_update = new Date();
    b.id = randomStr(8);
    if (g.directional) {
        b.directional = true
    }
    b.speed = g.speed;
    b.to_fade = c.fade;
    if (g.scale) {
        b.scale.set(g.scale, g.scale)
    }
    if (c.target) {
        b.target = c.target;
        b.going_x = get_x(c.target);
        b.going_y = get_y(c.target) - get_height(c.target) / 2;
        if (point_distance(b.x, b.y, b.going_x, b.going_y) < 100) {
            b.speed *= 0.75
        }
    }
    map_animations[b.id] = b;
    map.addChild(b)
}
function continuous_map_animation(d, b, h) {
    if (no_graphics) {
        return
    }
    var c = new_sprite(d, "animation")
        , f = c.width
        , a = c.height;
    var g = G.animations[d];
    c.atype = "cmap";
    c.anchor.set(0.5, 0.5);
    c.zy = 12000;
    c.parentGroup = c.displayGroup = player_layer;
    c.id = randomStr(8);
    if (g.directional) {
        c.directional = true
    }
    c.speed = g.speed;
    c.x = (get_x(b) + get_x(h)) / 2;
    c.y = (get_y(b) - get_height(b) / 2 + get_y(h) - get_height(h) / 2) / 2;
    c.height = distance(b, h);
    c.origin = b;
    c.target = h;
    c.last_update = new Date();
    map_animations[c.id] = c;
    map.addChild(c)
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
            DTM = 1;
            DMS = g - c[3];
            if (c[4]) {
                try {
                    DTM = (g - c[3]) / c[4]
                } catch (d) {}
            }
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
    draw_timeouts.push([c, future_ms(b), a, new Date(), b])
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
        draw_timeouts.push([a, new Date(), 2, new Date(), 0])
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
            if (d.type == "progress") {
                if (d.compound) {
                    a = 50,
                        j = 163,
                        p = 204,
                        f = 70,
                        n = 183,
                        l = 244
                } else {
                    if (d.upgrade) {
                        f = 41,
                            n = 156,
                            l = 76,
                            a = 254,
                            j = 183,
                            p = 42
                    } else {
                        if (d.upgrade) {
                            a = 254,
                                j = 183,
                                p = 42,
                                f = 255,
                                n = 209,
                                l = 9
                        } else {
                            a = 200,
                                j = 200,
                                p = 200,
                                f = 250,
                                n = 250,
                                l = 250
                        }
                    }
                }
                if (c > d.end) {
                    s.push(h);
                    $(d.selector).css("height", "0px").css("background-color", "rgb(" + a + "," + j + "," + p + ")")
                } else {
                    if (!d.added) {
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
                        $(d.selector).parent().css("background", "rgb(" + a + "," + j + "," + p + ")")
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
    b.start = b.start || (new Date());
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
var next_attack = new Date()
    , next_potion = new Date();
function attack_timeout_animation(a) {
    if (a <= 0) {
        return
    }
    draw_trigger(function() {
        $(".atint").css("background", "none");
        tint_c.a++;
        add_tint(".atint", {
            ms: -mssince(next_skill.attack) - DMS,
            color: "#4C4C4C",
            reset_to: "#6A6A6A",
            type: "brute",
            key: "a",
            cur: tint_c.a
        })
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
    draw_trigger(function() {
        if (!get_tint(".ptint")) {
            $(".ptint").css("background", "none")
        }
        tint_c.p++;
        add_tint(".ptint", {
            ms: -mssince(next_skill.use_hp) - DMS,
            color: "#4C4C4C",
            reset_to: "#6A6A6A",
            type: "brute",
            key: "p",
            cur: tint_c.p
        })
    })
}
function pvp_timeout(a, b) {
    if (a <= 0) {
        return
    }
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
                ms: -mssince(next_skill.use_town) - DMS,
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
    draw_trigger(function() {
        $(".pvptint").parent().css("background", "rgb(" + f + "," + d + "," + a + ")");
        tint_c.t++;
        add_tint(".pvptint", {
            ms: -mssince(next_skill.use_town) - DMS,
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
var next_skill = {
    attack: new Date(),
    use_hp: new Date(),
    use_mp: new Date(),
    use_town: new Date()
};
function skill_timeout_singular(c, b) {
    if (b <= 0) {
        return
    }
    var a = [];
    if (!b && G.skills[c].cooldown) {
        b = G.skills[c].cooldown
    } else {
        if (!b && G.skills[c].reuse_cooldown) {
            b = G.skills[c].reuse_cooldown
        } else {
            if (!b && G.skills[c].share) {
                b = G.skills[G.skills[c].share].cooldown * (G.skills[c].cooldown_multiplier || 1)
            } else {
                if (c == "attack") {
                    b = 1000 / character.frequency
                }
            }
        }
    }
    next_skill[c] = future_ms(b);
    if (c == "attack") {
        next_attack = next_skill[c]
    }
    for (N in keymap) {
        if (keymap[N] && (keymap[N] == c || keymap[N].name == c)) {
            a.push(N)
        }
    }
    draw_trigger(function() {
        if (c == "attack") {
            attack_timeout_animation(-mssince(next_skill[c]) - DMS)
        }
        a.forEach(function(d) {
            add_tint(".skidloader" + d, {
                ms: -mssince(next_skill[c]) - DMS,
                type: "skill",
                skid: d
            })
        })
    })
}
function skill_timeout(b, a) {
    if (G.skills[b].share) {
        skill_timeout_singular(G.skills[b].share, a);
        for (var c in G.skills) {
            if (G.skills[c].share == G.skills[b].share) {
                skill_timeout_singular(c, a)
            }
        }
    } else {
        if (G.skills[b].cooldown || b == "attack") {
            skill_timeout_singular(b, a)
        }
    }
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
            if (!pvp) {} else {
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
            call_code_function("trigger_character_event", "death", {})
        }
        rip = true;
        character.i = 1;
        character.j = 0;
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
    if ((!options.show_names && !options.always_hpn && character) && a.name_tag) {
        destroy_sprite(a.name_tag, "children");
        a.name_tag = null;
        a.ntag_cache = null
    } else {
        if (options.show_names || !character || options.always_hpn) {
            add_name_tag(a)
        }
    }
}
function start_name_tag(b, a) {
    if (!a) {
        a = b.name_tag.children[0]
    }
    if (!b.me) {
        a.roundPixels = false
    }
}
function stop_name_tag(c, b) {
    if (!b) {
        b = c.name_tag.children[0]
    }
    b.roundPixels = true;
    return;
    var j = 0
        , a = 0;
    var g = b.width;
    var d = round(g + 10);
    if (round(g) != g) {
        j = 0.25
    }
    var h = b.worldTransform.tx - floor(b.worldTransform.tx);
    var f = b.worldTransform.ty - floor(b.worldTransform.ty);
    b.x = (d / 2) + j + h;
    b.y = 2.5 + a + f
}
function add_name_tag(d) {
    var h = d.name + "|" + d.level;
    if (d.name_tag) {
        if (d.ntag_cache == h) {
            return
        }
        destroy_sprite(d.name_tag, "children");
        d.name_tag = null;
        d.ntag_cache = null
    }
    var g = new PIXI.Graphics();
    var a = ("Lv." + d.level + " ") + d.name
        , j = 7433580
        , b = a.length * 4 + 4
        , k = 11;
    if (d.npc && (d.type == "npc" || G.npcs[d.npc])) {
        a = d.name || "NPC";
        j = 2531789;
        if (d.citizen) {
            j = 14188294
        }
        b = a.length * 4 + 8
    }
    if (d.role == "gm") {
        j = 15115055
    }
    var l = 1
        , c = 0;
    if (!d.me) {
        l = 4
    } else {
        l = 4
    }
    var f = {
        fontFamily: SZ.font,
        fontSize: 8 * l,
        fill: "white",
        align: "center"
    };
    var a = new PIXI.Text(a,f);
    a.roundPixels = false;
    a.anchor.set(0.5, 0);
    a.scale = new PIXI.Point(1 / l,1 / l);
    b = round(a.width + 10);
    if (!d.moving || d.me) {
        a.roundPixels = true
    }
    a.x = (b / 2) + c;
    a.y = 2.5;
    g.beginFill(j);
    g.drawRect(0, 0, b, k);
    g.endFill();
    g.beginFill(2105119);
    g.drawRect(1, 1, b - 2, k - 2);
    g.endFill();
    g.position = new PIXI.Point(-round(b / 2),2);
    d.addChild(g);
    g.addChild(a);
    d.name_tag = g;
    d.ntag_cache = h;
    d.addChild(g);
    g.parentGroup = entity_layer
}
function add_name_tag_x(f) {
    var h = f.name + "|" + f.level;
    if (f.name_tag) {
        if (f.ntag_cache == h) {
            return
        }
        destroy_sprite(f.name_tag, "children");
        f.name_tag = null;
        f.ntag_cache = null
    }
    var d = ("" && "Lv." + f.level + " ") + f.name
        , b = 7433580
        , g = d.length * 4 + 4
        , a = 11
        , j = 1;
    if (f.npc) {
        d = f.name || "NPC";
        b = 2531789;
        if (f.citizen) {
            b = 14188294
        }
        g = d.length * 4 + 8
    }
    if (f.role == "gm") {
        b = 15115055
    }
    if (!f.me) {
        j = 4
    } else {
        j = 2
    }
    var c = {
        fontFamily: SZ.font,
        fontSize: 64 * j,
        fill: "white",
        align: "center",
        dropShadow: true,
        dropShadowDistance: 1
    };
    var d = new PIXI.Text(d,c);
    d.x = (g / 2);
    d.y = 2.5;
    d.anchor.set(0.5, 1);
    d.scale = new PIXI.Point(0.125 / j,0.125 / j);
    d.position = new PIXI.Point(0,-get_height(f) - 10);
    f.name_tag = d;
    f.ntag_cache = h;
    f.addChild(d);
    d.parentGroup = entity_layer
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
        fontFamily: SZ.font,
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
        fontFamily: SZ.font,
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
    if ((!hp_bars || a.me) && !options.always_hpn) {
        return
    }
    if (ctarget == a || xtarget == a || (character && character.party && character.party == a.party) || (character && character.party && (a.target && in_arr(a.target, party_list) || a.focus && in_arr(a.focus, party_list))) || (character && (a.target == character.name || a.focus == character.name)) || (character && character.team && !a.npc) || (character && a.controller == character.name) || options.always_hpn) {
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
        if (c.type == "character" && !pvp && !is_pvp && (ctarget == c || xtarget == c)) {
            b = 3574827
        } else {
            if (c.team == "A") {
                b = 3783508
            } else {
                if (c.team == "B") {
                    b = 14366627
                } else {
                    if (c.type == "character" && (pvp || is_pvp) && character && character.guild != c.guild && character.party != c.party && (c.target == character.name || c.focus == character.name)) {} else {
                        if (character && character.party && character.party == c.party) {
                            b = 7290759
                        } else {
                            if (character && character.guild && character.guild == c.guild) {
                                b = 4110016
                            } else {
                                if (character && is_monster(c) && (ctarget == c || xtarget == c)) {} else {
                                    if (character && c.controller == character.name) {
                                        b = 9018258
                                    } else {
                                        if (character && (c.target == character.name || c.focus == character.name) && is_player(c)) {
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
function add_hp_bar_x(f) {
    var c = max(32, round(get_width(f) * 2 * 0.8))
        , g = 1
        , m = round(2 * g);
    var d = 11609895;
    if (f.npc) {
        d = 14717952
    } else {
        if (f.type == "character" && !pvp && !is_pvp && ctarget == f) {
            d = 3574827
        } else {
            if (f.team == "A") {
                d = 3783508
            } else {
                if (f.team == "B") {
                    d = 14366627
                } else {
                    if (f.type == "character" && (pvp || is_pvp) && character && character.guild != f.guild && character.party != f.party && f.target == character.name) {} else {
                        if (character && character.party && character.party == f.party) {
                            d = 7290759
                        } else {
                            if (character && character.guild && character.guild == f.guild) {
                                d = 4110016
                            } else {
                                if (character && is_monster(f) && ctarget == f) {} else {
                                    if (character && f.controller == character.name) {
                                        d = 9018258
                                    } else {
                                        if (character && f.target == character.name && is_player(f)) {
                                            d = 4171985
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    var h = round((c - round(2 * (g + 1))) * f.hp / f.max_hp);
    if (!f.max_hp) {
        h = round((c - round(2 * (g + 1))) * 1)
    }
    if (f.hp_bar) {
        if (f.hp_width == h && f.hp_color == d) {
            return
        }
        console.log("new hp_bar " + f.id);
        destroy_sprite(f.hp_bar, "children");
        f.hp_bar = null
    }
    f.hp_width = h;
    var q = new PIXI.Graphics();
    q.beginFill(7433580);
    q.drawRect(0, 0, c, 6 + m);
    q.endFill();
    q.beginFill(2105119);
    q.drawRect(g, g, c - m, 6);
    q.endFill();
    q.beginFill(d);
    q.drawRect(g + 1, g + 1, f.hp_width, 4);
    q.endFill();
    q.beginFill(7433580);
    q.drawRect(0, 0 - 9, c, 8 + m);
    q.endFill();
    q.beginFill(2105119);
    q.drawRect(g, g - 9, c - m, 8);
    q.endFill();
    q.beginFill(7433580);
    q.drawRect(9, 0 - 9, 1, 8 + m);
    q.endFill();
    var b = f.name || f.mtype || f.type
        , a = f.level || "NPC"
        , k = b.length * 4 + 4
        , l = 11
        , o = 1;
    if (f.npc) {
        b = f.name || "NPC";
        border_color = 2531789;
        if (f.citizen) {
            border_color = 14188294
        }
        k = b.length * 4 + 8
    }
    var j = {
        fontFamily: SZ.font,
        fontSize: 64 * o,
        fill: "white",
        align: "center"
    };
    var b = new PIXI.Text(b,j);
    b.x = 12;
    b.y = -7;
    b.anchor.set(0, 0);
    b.scale = new PIXI.Point(0.125 / o,0.125 / o);
    q.addChild(b);
    var a = new PIXI.Text(a,j);
    a.x = 5;
    a.y = -7;
    a.anchor.set(0.5, 0);
    a.scale = new PIXI.Point(0.125 / o,0.125 / o);
    q.addChild(a);
    var n = 12
        , p = 0;
    if (f.type == "character" && character_names) {
        n += 8
    }
    if (f.mscale == 2) {
        n += 6,
            p += c / 2
    }
    q.position = new PIXI.Point(-(c / 2) - p,-n - (f.aheight || f.height) + (f.mscale == 2 && -4 || 0));
    if (f.mscale) {
        q.scale = new PIXI.Point(f.mscale,f.mscale)
    }
    f.hp_bar = q;
    f.hp_color = d;
    q.parentGroup = window.hp_layer;
    f.addChild(q)
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
function d_text(p, l, k, j) {
    var n = null;
    if (mode.dom_tests_pixi || no_graphics || paused) {
        return
    }
    if (is_object(l)) {
        n = l;
        j = k;
        l = get_x(n);
        k = get_y(n) - (n.aheight || n.height) - (n.hp_bar && 15 || 2);
        if (n.mscale == 2) {
            k += 14
        }
    }
    if (!j) {
        j = {}
    }
    var c = j.color || "#4C4C4C"
        , b = null;
    if (c == "hp") {
        c = "green"
    } else {
        if (c == "mp") {
            c = "#317188"
        } else {
            if (c == "damage") {
                c = "#C80000"
            } else {
                if (c == "+gold") {
                    c = "gold"
                } else {
                    if (c == "stun") {
                        c = "#FF9601",
                            k -= 12
                    } else {
                        if (c == "sugar") {
                            c = "#D64770"
                        } else {
                            if (c == "freeze") {
                                c = "#53C1FF",
                                    k -= 12
                            } else {
                                if (c == "burn") {
                                    c = "#FD9644",
                                        k -= 12
                                } else {
                                    if (c == "crit") {
                                        c = "#D32D51",
                                            k -= 12
                                    } else {
                                        if (c == "sneak") {
                                            c = "#2D9B41",
                                                k -= 12
                                        } else {
                                            if (c == "mana") {
                                                c = colors.mp
                                            } else {
                                                if (c == "elixir") {
                                                    c = "#E06A63"
                                                } else {
                                                    if (c == "evade") {
                                                        c = "#808B94"
                                                    } else {
                                                        if (c == "reflect") {
                                                            c = "#6D62A2"
                                                        } else {
                                                            if (c == "supershot") {
                                                                c = "#9B172E",
                                                                    k -= 12
                                                            } else {
                                                                if (c == "quickpunch") {
                                                                    c = "#41338B",
                                                                        k -= 12
                                                                } else {
                                                                    if (c == "mentalburst") {
                                                                        c = "#4C9AE0",
                                                                            k -= 12
                                                                    } else {
                                                                        if (c == "burst") {
                                                                            c = "#2A8A9A",
                                                                                q = "large"
                                                                        } else {
                                                                            if (c == "poison") {
                                                                                c = colors.poison,
                                                                                    q = "large",
                                                                                    k -= 12
                                                                            } else {
                                                                                if (c == "1mxp") {
                                                                                    c = "#FFFFFF",
                                                                                        b = "glow"
                                                                                } else {
                                                                                    if (colors[c]) {
                                                                                        c = colors[c]
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    var q = SZ[j.size] || j.size || SZ.normal;
    var m = j.parent || window.map;
    var a = !j.dont_animate;
    var d = 0;
    var f = 1000;
    var o = new PIXI.Text(p,{
        fontFamily: SZ.font,
        fontSize: q * text_quality,
        fontWeight: "bold",
        fill: c,
        align: "center"
    });
    if (use_layers) {
        o.parentGroup = text_layer
    } else {
        o.displayGroup = text_layer
    }
    o.disp_m = SZ.normal / 18;
    if (q > SZ.normal) {
        o.disp_m = (SZ.normal + 1) / 18
    }
    o.anim_time = max(75, parseInt(100 * 18 / q));
    o.type = "text";
    o.alpha = 1;
    o.last_fade = new Date();
    o.anchor.set(0.5, 1);
    if (b) {
        start_filter(o, b)
    }
    if (text_quality > 1) {
        o.scale = new PIXI.Point(1 / text_quality,1 / text_quality)
    }
    o.x = round(l);
    o.y = round(k) + d;
    if (j.y) {
        o.y -= j.y
    }
    m.addChild(o);
    function g(r, s) {
        return function() {
            var t = mssince(s.last_fade)
                , v = round(4 * t / s.anim_time);
            if (2 < v && v < 7) {
                v = 4
            }
            s.y -= s.disp_m * v;
            s.alpha = max(0, s.alpha - (0.078 * t / s.anim_time));
            s.last_fade = new Date();
            if (s.alpha > 0.25) {
                draw_timeout(g(r + 1, s), s.anim_time)
            } else {
                remove_sprite(s);
                try {
                    s.destroy({
                        texture: true,
                        baseTexture: true
                    })
                } catch (u) {
                    console.log(u)
                }
            }
        }
    }
    function h(r, s) {
        return function() {
            s.position.y -= 4;
            s.alpha -= 0.08;
            if (r < 10) {
                draw_timeout(g(r + 1, s), s.anim_time)
            } else {
                remove_sprite(s);
                try {
                    s.destroy({
                        texture: true,
                        baseTexture: true
                    })
                } catch (t) {
                    console.log(t)
                }
            }
        }
    }
    draw_timeout(g(0, o), o.anim_time);
    if (j.s) {
        sfx(j.s, o.x, o.y)
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
    if (window.is_electron) {
        c.epl = electron_data.platform
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
            ui_error("An Unknown Error [HTTP]");
            error_ct = l;
            if (h != "log_error" && l.status + "" != "0") {
                setTimeout(function(m, n) {
                    return function() {
                        api_call("log_error", {
                            type: "api_call_error",
                            err: m.status + " " + m.statusText + " on " + n,
                            info: m.getAllResponseHeaders()
                        })
                    }
                }(l, d), 40000)
            }
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
var warned = {};
function new_map_logic(a, b) {
    I = b.info || {};
    if (current_map == "resort") {
        add_log("Resort is a prototype with work in progress", "#ADA9E4")
    }
    if (current_map == "tavern") {
        if (I.dice == "roll") {
            map_machines.dice.shuffling = true,
                map_machines.dice.num = undefined,
                delete map_machines.dice.lock_start,
                map_machines.dice.locked = 0
        }
        if (I.dice == "lock") {
            map_machines.dice.shuffling = true,
                map_machines.dice.num = I.num,
                map_machines.dice.lock_start = future_ms(-1200),
                map_machines.dice.locked = 0
        }
        if (I.dice == "bets") {
            map_machines.dice.shuffling = false,
                map_machines.dice.num = I.num,
                map_machines.dice.seconds = I.seconds,
                map_machines.dice.count_start = future_s(-I.seconds)
        }
        add_log("Tavern is a prototype with work in progress", "#63ABE4")
    } else {
        dice_bet.active = false,
            topleft_npc = false
    }
    if (is_pvp && (a == "start" || a == "welcome")) {
        add_log("This is a PVP Server. Be careful!", "#E1664C")
    }
    if (a == "map" && !is_pvp && G.maps[current_map].safe_pvp && !warned[current_map]) {
        warned[current_map] = 1,
            add_log("This is a Safe PVP Zone. You can lose recently looted items if someone defeats you!", "#E1664C")
    } else {
        if (a == "map" && !is_pvp && G.maps[current_map].pvp && !warned[current_map]) {
            warned[current_map] = 1,
                add_log("This is a PVP Zone. Be careful!", "#E1664C")
        } else {
            if (a == "map" && is_pvp && G.maps[current_map].safe && !warned[current_map]) {
                warned[current_map] = 1,
                    add_log("This is a Safe Zone. No one can hurt you here!", "#9DE85E")
            }
        }
    }
    render_map()
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
function update_servers_and_characters() {
    var c = {
        1: null,
        2: null,
        3: null,
        merchant: null
    }
        , a = 1
        , b = 0;
    X.characters.forEach(function(d) {
        if (d.online) {
            $(".characterav" + d.name).html('<span style="color: #F3A05D">[I]</span>')
        } else {
            $(".characterav" + d.name).html('<span style="color: #A4FA64">[A]</span>')
        }
        if (!d.online) {
            return
        }
        if (d.type == "merchant") {
            c.merchant = d
        } else {
            if (a <= 3) {
                c[a] = d,
                    a += 1
            }
        }
    });
    [1, 2, 3, "merchant"].forEach(function(d) {
        if (!c[d]) {
            $(".characterr" + d).html("<span style='color: orange'>Offline</span>")
        } else {
            $(".characterr" + d).html("<span style='color: green'>" + c[d].name + "</span>"),
                b += 1
        }
    });
    $(".ccount").html(b);
    if ($(".cclist").length) {
        load_character_list()
    }
    if ($(".sslist").length) {
        load_servers_list()
    }
    if (!X.unread) {
        $(".comcount").html("")
    } else {
        $(".comcount").html(" [" + X.unread + "]")
    }
    $(".mcount").html(X.unread)
}
function handle_information(h) {
    for (var g = 0; g < h.length; g++) {
        info = h[g];
        call_code_function("trigger_event", "api_response", info);
        if (info.type == "code_list") {
            if (info.purpose == "load") {
                var f = "<div style='width: 520px'>"
                    , d = false;
                info.list[0] = "Default Code";
                for (var c in info.list) {
                    if (c == "0") {
                        color = "gray"
                    } else {
                        color = colors.code_blue
                    }
                    f += "<div class='gamebutton block' style='margin-bottom: -4px' onclick='load_code(\"" + c + "\",1)'><span style='color: " + color + "'>[" + c + "]</span> " + info.list[c] + "</div>";
                    d = true
                }
                f += "<div style='margin-top: 10px; font-size: 24px; line-height: 28px; border: 4px solid gray; background: black; padding: 16px;'>";
                f += "<div>You can also load codes into your code. For example, you can save your 'Functions' in one code slot, let's say 2, and inside your first code slot, you can: <span class='label' style='height: 24px; margin: -2px 0px 0px 0px;'>load_code(2)</span> or <span class='label' style='height: 24px; margin: -2px 0px 0px 0px;'>load_code('Functions')</span></div>";
                f += "</div>";
                f += "</div>";
                show_modal(f, {
                    keep_code: true,
                    wrap: false
                })
            } else {
                if (info.purpose == "save") {
                    var f = "<div style='width: 520px'>"
                        , d = false;
                    var j = code_slot
                        , b = "";
                    if (new_code_slot !== undefined) {
                        j = code_slot = new_code_slot
                    }
                    if (j) {
                        for (var c in info.list) {
                            if (parseInt(c) == j) {
                                b = info.list[c]
                            }
                        }
                    }
                    f += "<div style='box-sizing: border-box; width: 100%; text-align: center; margin-bottom: 8px;'>";
                    f += "<input type='text' style='box-sizing: border-box; width: 15%;; float: left' placeholder='#' autocomplete='nope' id='alcodenumx' name='alcodenumx' class='csharp cinput'/>";
                    f += "<input type='text' style='box-sizing: border-box; width: 63%;' placeholder='NAME' autocomplete='nope' id='alcodeinputx' name='alcodeinputx' class='codename cinput' />";
                    f += "<div class='gamebutton' style='box-sizing: border-box; width: 20%; padding: 8px; float: right' onclick='save_code_s()'>SAVE</div>";
                    f += "</div>";
                    if (!Object.keys(info.list).length) {
                        info.list = {
                            "1": "Empty",
                            "2": "Empty"
                        }
                    }
                    code_list = info.list;
                    info.list["#"] = "DELETE";
                    for (var c in info.list) {
                        if (c == "#") {
                            color = "gray"
                        } else {
                            color = colors.code_pink
                        }
                        f += "<div class='gamebutton block' style='margin-bottom: -4px' onclick='load_code_s(\"" + c + "\")'><span style='color: " + color + "'>[" + c + "]</span> " + info.list[c] + "</div>";
                        d = true
                    }
                    f += "<div style='margin: 10px 5px 5px 5px; font-size: 24px; line-height: 28px'>";
                    f += "</div>";
                    f += "</div>";
                    show_modal(f, {
                        keep_code: true,
                        wrap: false
                    });
                    if (j) {
                        $("#alcodenumx").val(j)
                    }
                    if (b) {
                        $("#alcodeinputx").val(b)
                    }
                } else {
                    show_json(info.list)
                }
            }
        } else {
            if (info.type == "servers_and_characters") {
                X.servers = info.servers;
                X.characters = info.characters;
                X.tutorial = info.tutorial;
                X.unread = info.mail;
                update_servers_and_characters()
            } else {
                if (info.type == "unread") {
                    X.unread = info.count;
                    update_servers_and_characters()
                } else {
                    if (info.type == "reload") {
                        var a = future_s(10);
                        storage_set("reload" + server_region + server_identifier, JSON.stringify({
                            time: a,
                            ip: info.ip,
                            port: "" + info.port
                        }))
                    } else {
                        if (info.type == "friends") {
                            load_friends(info)
                        } else {
                            if (info.type == "mail") {
                                load_mail(info)
                            } else {
                                if (info.type == "merchants") {
                                    load_merchants(info)
                                } else {
                                    if (in_arr(info.type, ["ui_log", "message"])) {
                                        if (info.color) {
                                            add_log(info.message, info.color)
                                        } else {
                                            ui_log(info.message)
                                        }
                                    } else {
                                        if (info.type == "code") {
                                            codemirror_render.setValue(info.code);
                                            if (info.slot) {
                                                new_code_slot = info.slot
                                            } else {
                                                if (info.slot !== undefined) {
                                                    new_code_slot = 0
                                                }
                                            }
                                            if (info.reset) {
                                                codemirror_render.clearHistory()
                                            }
                                            if (info.run) {
                                                if (code_run) {
                                                    toggle_runner(),
                                                        toggle_runner()
                                                } else {
                                                    toggle_runner()
                                                }
                                            }
                                        } else {
                                            if (info.type == "gcode") {
                                                var f = "";
                                                f += "<textarea id='gcode'>" + info.code + "</textarea>";
                                                show_modal(f)
                                            } else {
                                                if (info.type == "article") {
                                                    if (info.tutorial) {
                                                        render_tutorial(info.html, parseInt(info.tutorial), url)
                                                    } else {
                                                        if (info.guide) {
                                                            render_learn_article(info.html, {
                                                                url: info.url || "/docs"
                                                            })
                                                        } else {
                                                            if (info.func) {
                                                                render_function_html = info.html;
                                                                render_function_reference(info.func, undefined, undefined)
                                                            } else {
                                                                render_learn_article(info.html, {
                                                                    url: info.url || "/docs"
                                                                })
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    if (info.type == "tutorial_data") {
                                                        delete info.type;
                                                        X.tutorial = info;
                                                        if (info.next) {
                                                            small_success(character, {
                                                                color: "purple"
                                                            });
                                                            delete info.next;
                                                            setTimeout(open_tutorial, 1000)
                                                        } else {
                                                            if (info.success) {
                                                                small_success(character, {
                                                                    color: "success"
                                                                });
                                                                delete info.success
                                                            }
                                                        }
                                                    } else {
                                                        if (info.type == "chat_message") {
                                                            add_chat("", info.message, info.color)
                                                        } else {
                                                            if (in_arr(info.type, ["ui_error", "error"])) {
                                                                if (inside == "message") {
                                                                    $("#message").html(info.message)
                                                                } else {
                                                                    ui_error(info.message)
                                                                }
                                                            } else {
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
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
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
function sfx(b, a, h) {
    try {
        if (!window.sound_sfx || no_html) {
            return
        }
        var f = null;
        if (b == "hit" || b == "monster_hit") {
            f = sounds.hit_8bit
        }
        if (b == "explosion") {
            f = sounds.fx_explosion
        }
        if (b == "coins") {
            f = sounds.coin_collect
        }
        if (b == "hp" || b == "mp") {
            f = sounds.use_8bit
        }
        if (b == "chat") {
            f = sounds.chat
        }
        if (b == "walk") {
            f = sounds.walk
        }
        if (b == "npc") {
            f = sounds.drop
        }
        if (!f && sounds[b]) {
            f = sounds[b]
        }
        if (f) {
            if (a === undefined) {
                f.play()
            } else {
                if (mode.directional_sfx) {
                    f.orientation(0, 0, 0);
                    f.pos((-a + map.real_x) / 120, (h - map.real_y) / 120, 0);
                    f.play()
                } else {
                    var g = point_distance(a, h, map.real_x, map.real_y)
                        , c = 1;
                    if (!f.original_volume) {
                        f.original_volume = f.volume()
                    }
                    if (g > 700) {
                        c = 0.05
                    } else {
                        if (g > 500) {
                            c = 0.075
                        } else {
                            if (g > 400) {
                                c = 0.1
                            } else {
                                if (g > 300) {
                                    c = 0.15
                                } else {
                                    if (g > 250) {
                                        c = 0.175
                                    } else {
                                        if (g > 275) {
                                            c = 0.2
                                        } else {
                                            if (g > 250) {
                                                c = 0.25
                                            } else {
                                                if (g > 225) {
                                                    c = 0.3
                                                } else {
                                                    if (g > 200) {
                                                        c = 0.4
                                                    } else {
                                                        if (g > 175) {
                                                            c = 0.45
                                                        } else {
                                                            if (g > 150) {
                                                                c = 0.5
                                                            } else {
                                                                if (g > 125) {
                                                                    c = 0.6
                                                                } else {
                                                                    if (g > 100) {
                                                                        c = 0.7
                                                                    } else {
                                                                        if (g > 75) {
                                                                            c = 0.8
                                                                        } else {
                                                                            if (g > 50) {
                                                                                c = 0.9
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    f.volume(f.original_volume * c);
                    f.play()
                }
            }
        }
    } catch (d) {
        add_alert(d)
    }
}
function tut(a) {
    if (X.tutorial.task == a) {
        api_call("tutorial", {
            task: a
        })
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
    if (!window.Howl) {
        sound_music = false;
        sound_sfx = false;
        add_log("Sound issue (Howl). Turned sound off");
        return
    }
    if (no_html) {
        return
    }
    sounds.click = new Howl({
        src: [url_factory("/sounds/effects/click_natural.wav")],
        volume: 0.32,
    });
    if (sound_sfx) {
        init_fx()
    }
    if (sound_music) {
        init_music()
    }
}
function init_fx() {
    if (!window.Howl) {
        sound_music = false;
        sound_sfx = false;
        add_log("Sound issue (Howl). Turned sound off");
        return
    }
    if (window.fx_init) {
        return
    }
    window.fx_init = 1;
    sounds.fx_explosion = new Howl({
        src: [url_factory("/sounds/fx/EXPLOSION_Short_Kickback_Crackle_stereo.wav")],
        volume: 0.3,
    });
    sounds.coin_collect = new Howl({
        src: [url_factory("/sounds/fx/pop_plink.wav")],
        volume: 0.2,
    });
    sounds.hit_8bit = new Howl({
        src: [url_factory("/sounds/fx/zap_drum.wav")],
        volume: 0.2,
    });
    sounds.magic_8bit = new Howl({
        src: [url_factory("/sounds/fx/8BIT_RETRO_Fire_Blaster_Short_mono.wav")],
        volume: 0.4,
    });
    sounds.use_8bit = new Howl({
        src: [url_factory("/sounds/fx/pop_plink.wav")],
        volume: 0.16,
    });
    sounds.chat = new Howl({
        src: [url_factory("/sounds/fx/UI_Beep_Double_Quick_Smooth_stereo.wav")],
        volume: 0.5,
    });
    sounds.walk = new Howl({
        src: [url_factory("/sounds/fx/FOOTSTEP_Asphalt_Trainers_Walk_Slow_RR5_mono.wav")],
        volume: 0.6,
    });
    sounds.drop = new Howl({
        src: [url_factory("/sounds/fx/DROP_Designed_mono.wav")],
        volume: 0.4,
    });
    sounds.open = new Howl({
        src: [url_factory("/sounds/fx/CLASP_Plastic_Open_stereo.wav")],
        volume: 0.4,
    });
    sounds.whoosh = new Howl({
        src: [url_factory("/sounds/fx/WHOOSH_Air_Fast_Wind_RR1_mono.wav")],
        volume: 0.2,
    });
    sounds.reflect = new Howl({
        src: [url_factory("/sounds/fx/MAGIC_SPELL_Spawn_mono.wav")],
        volume: 0.15,
    });
    sounds.crackle01 = new Howl({
        src: [url_factory("/sounds/fx/Explosive01.wav")],
        volume: 0.15,
    });
    sounds.crackle0 = new Howl({
        src: [url_factory("/sounds/fx/Explosive02.wav")],
        volume: 0.15,
    });
    sounds.level_up = new Howl({
        src: [url_factory("/sounds/fx/MUSIC_EFFECT_Bell_Voice_Positive_09_stereo.wav")],
        volume: 0.2,
    })
}
function performance_trick() {
    if (!window.Howl) {
        return
    }
    if (sounds.empty) {
        return sounds.empty.play()
    }
    sounds.empty = new Howl({
        src: [url_factory("/sounds/loops/empty_loop_for_js_performance.ogg"), url_factory("/sounds/loops/empty_loop_for_js_performance.wav")],
        volume: 0.5,
        autoplay: true,
        loop: true,
    });
    sounds.empty.cplaying = true
}
function init_music() {
    if (!window.Howl) {
        sound_music = false;
        sound_sfx = false;
        add_log("Sound issue (Howl). Turned sound off");
        return
    }
    if (window.music_init) {
        return
    }
    window.music_init = 1;
    sounds.christmas = new Howl({
        src: [url_factory("/sounds/loops/christmas.ogg")],
        volume: 0.2 * music_level,
        autoplay: false,
        loop: true,
    });
    if (xmas_tunes) {
        return
    }
    sounds.horror01 = new Howl({
        src: [url_factory("/sounds/loops/horror_01_loop.ogg")],
        volume: 0.15 * music_level,
        autoplay: false,
        loop: true,
    });
    sounds.casual05 = new Howl({
        src: [url_factory("/sounds/loops/casual_05_loop.ogg")],
        volume: 0.2 * music_level,
        autoplay: false,
        loop: true,
    });
    sounds.rpg07 = new Howl({
        src: [url_factory("/sounds/loops/rpg_07_loop.ogg")],
        volume: 0.2 * music_level,
        autoplay: false,
        loop: true,
    });
    sounds.rpg08 = new Howl({
        src: [url_factory("/sounds/loops/rpg_08_loop.ogg")],
        volume: 0.2 * music_level,
        autoplay: false,
        loop: true,
    });
    sounds.rpg10 = new Howl({
        src: [url_factory("/sounds/loops/rpg_10_loop.ogg")],
        volume: 0.2 * music_level,
        autoplay: false,
        loop: true,
    });
    sounds.rpg14 = new Howl({
        src: [url_factory("/sounds/loops/rpg_14_loop.ogg")],
        volume: 0.2 * music_level,
        autoplay: false,
        loop: true,
    });
    sounds.rpg16 = new Howl({
        src: [url_factory("/sounds/loops/rpg_16_loop.ogg")],
        volume: 0.2 * music_level,
        autoplay: false,
        loop: true,
    })
}
var current_music = null;
function reflect_music() {
    var a = sounds.rpg08;
    if (!window.Howl) {
        sound_music = false;
        sound_sfx = false;
        add_log("Sound issue (Howl). Turned sound off");
        return
    }
    if (!sound_music) {
        if (current_music) {
            current_music.stop()
        }
        current_music = null;
        return
    }
    if (current_map == "tavern") {
        a = sounds.rpg10
    }
    if (in_arr(current_map, ["batcave", "halloween", "spookytown"]) || current_map.startsWith("level")) {
        a = sounds.rpg14
    }
    if (current_map.startsWith("winter_inn")) {
        a = sounds.rpg16
    }
    if (current_map == "desertland") {
        a = sounds.rpg07
    }
    if (current_map == "winterland" || xmas_tunes) {
        a = sounds.christmas
    }
    if (current_map == "bank") {
        a = sounds.casual05
    }
    if (current_music != a && a) {
        if (current_music) {
            current_music.stop()
        }
        current_music = a;
        a.play()
    }
}
function sound_on() {
    if (is_electron) {
        Cookies.set("music", "on", {
            expires: 12 * 365
        })
    } else {
        if (character) {
            set_setting(real_id, "music", "on")
        }
    }
    sound_music = "1";
    init_music();
    reflect_music();
    $(".musicoff").hide();
    $(".musicoffi").hide();
    $(".musicon").show();
    $(".musiconi").css("display", "inline-block")
}
function sound_off(a) {
    if (!a) {
        if (is_electron) {
            Cookies.set("music", "off", {
                expires: 12 * 365
            })
        } else {
            if (character) {
                set_setting(real_id, "music", "off")
            }
        }
        sound_music = "";
        reflect_music()
    }
    $(".musicon").hide();
    $(".musiconi").hide();
    $(".musicoff").show();
    $(".musicoffi").css("display", "inline-block")
}
function sfx_on() {
    if (is_electron) {
        Cookies.set("sfx", "on", {
            expires: 12 * 365
        })
    } else {
        if (character) {
            set_setting(real_id, "sfx", "on")
        }
    }
    sound_sfx = "1";
    init_fx();
    $(".sfxoff").hide();
    $(".sfxoffi").hide();
    $(".sfxon").show();
    $(".sfxoni").css("display", "inline-block")
}
function sfx_off() {
    if (is_electron) {
        Cookies.set("sfx", "off", {
            expires: 12 * 365
        })
    } else {
        if (character) {
            set_setting(real_id, "sfx", "off")
        }
    }
    sound_sfx = "";
    $(".sfxon").hide();
    $(".sfxoni").hide();
    $(".sfxoff").show();
    $(".sfxoffi").css("display", "inline-block")
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
var ignored_properties = ["transform", "parent", "displayGroup", "parentGroup", "vertexData", "animations", "tiles", "placements", "default", "children", "tempDisplayObjectParent", "cachedTint", "vertexTrimmedData", "hp_bar", "blendMode", "filterArea", "worldAlpha", "pluginName", "roundPixels", "updateOrder", "displayOrder", "shader", "accessible", "interactiveChildren", "hitArea", "cursor", "zOrder", "accessibleTitle", "accessibleHint", "parentLayer", "layerableChildren", "trackedPointers", "interactive", "tabIndex", "zIndex", "buttonMode", "renderable"];
function game_stringify(f, c) {
    var b = [];
    try {
        if (f === undefined) {
            return "undefined"
        }
        var a = JSON.stringify(f, function(h, k) {
            if (in_arr(h, ignored_properties) || h.indexOf("filter_") != -1 || h[0] == "_") {
                return
            }
            if (h == "data" && f[h] && f[h].x_lines) {
                return
            }
            if (k != null && typeof k == "object") {
                if (b.indexOf(k) >= 0) {
                    return
                }
                b.push(k);
                if ("x"in k) {
                    var g = {};
                    ["x", "y", "width", "height"].forEach(function(l) {
                        if (l in k) {
                            g[l] = k[l]
                        }
                    });
                    for (var j in k) {
                        g[j] = k[j]
                    }
                    k = g
                }
            }
            return k
        }, c);
        try {
            if ("x"in f) {
                a = JSON.parse(a);
                a.x = f.x;
                a.y = f.y;
                a = JSON.stringify(a, undefined, c)
            }
        } catch (d) {}
        return a
    } catch (d) {
        console.log(d);
        return "game_stringify_exception"
    }
}
function game_stringify_simple(d, b) {
    try {
        if (d === undefined) {
            return "undefined"
        }
        var a = JSON.stringify(d, function(g, j) {
            if (in_arr(g, ignored_properties) || g.indexOf("filter_") != -1 || g[0] == "_") {
                return
            }
            if (g == "data" && d[g] && d[g].x_lines) {
                return
            }
            if (j != null && typeof j == "object") {
                if ("x"in j) {
                    var f = {};
                    ["x", "y", "width", "height"].forEach(function(k) {
                        if (k in j) {
                            f[k] = j[k]
                        }
                    });
                    for (var h in j) {
                        f[h] = j[h]
                    }
                    j = f
                }
            }
            return j
        }, b);
        try {
            if ("x"in d) {
                a = JSON.parse(a);
                a.x = d.x;
                a.y = d.y;
                a = JSON.stringify(a, undefined, b)
            }
        } catch (c) {}
        return a
    } catch (c) {
        return "game_stringify_simple_exception"
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
jQuery.fn.shtml = function(a) {
    var b = jQuery(this);
    var c = b.html();
    c = ("" + c).replace_all(",", "").replace_all(".", "");
    return c
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
jQuery.fn.cfocus = function() {
    var a = jQuery(this).html();
    var b = "1";
    if (!(a || "").replace_all(" ", "").length) {
        if (jQuery(this).data("default") !== undefined) {
            b = jQuery(this).data("default")
        }
        jQuery(this).html(b)
    }
    var c = jQuery(this).focus();
    if (b == "\u00a0") {
        document.execCommand("delete", false, null)
    }
    return c
}
;
jQuery.fn.codemirror = function(a) {
    if (!a) {
        a = {}
    }
    return this.each(function() {
        var d = jQuery(this);
        var c = a.value || d.html();
        c = c.replace_all("&amp;", "&").replace_all("&gt;", ">").replace_all("&lt;", "<");
        if (a.trim || d.hasClass("trimnl")) {
            while (c[0] == "\n") {
                c = c.substr(1, c.length)
            }
            while (c[c.length - 1] == "\n") {
                c = c.substr(0, c.length - 1)
            }
        }
        var b = CodeMirror(function(g) {
            d.replaceWith(g)
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
        var f = $(b.getWrapperElement());
        if (d.hasClass("executeb")) {
            f.append("<div class='clickable' style='position: absolute; bottom: 4px; right: 4px; color: white; background: black; padding: 2px 2px 2px 4px; border: 1px solid white; z-index:4; padding-left: 8px; padding-right: 4px;' onclick='execute_codemirror(this)'>Execute!</div>")
        }
        if (a.focus) {
            b.focus()
        }
        if (a.hints) {
            listen_for_hints(b)
        }
    })
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
function stprlink(a) {
    try {
        if (a.target.tagName.toLowerCase() === "a") {
            return true
        }
        a.stopPropagation()
    } catch (b) {}
    return false
}
function stpr(a) {
    try {
        if (a == "manual") {
            return
        }
        a.stopPropagation()
    } catch (b) {}
}
function clear_ui() {
    $("body").children().each(function() {
        if (this.tagName != "CANVAS") {
            $(this).remove()
        }
        $("iframe").remove()
    })
}
function clear_ui2() {
    $("body").children().each(function() {
        if (this.tagName != "CANVAS" && this.id != "topleftcorner") {
            $(this).remove()
        }
        $("iframe").remove()
    })
}
function storage_get(a) {
    if (is_electron) {
        if (!electron_store) {
            var b = require("electron-store");
            electron_store = new b()
        }
        return electron_store.get(a)
    } else {
        return window.localStorage.getItem(a)
    }
}
function storage_set(a, b) {
    if (is_electron) {
        if (!electron_store) {
            var c = require("electron-store");
            electron_store = new c()
        }
        electron_store.set(a, b)
    } else {
        return window.localStorage.setItem(a, b)
    }
}
var manifest = null;
var electron = null
    , path = null
    , electron_store = null;
function url_factory(b) {
    try {
        if (is_electron && !manifest) {
            if (!electron) {
                electron = require("electron")
            }
            if (!path) {
                path = electron.remote.require("path")
            }
            manifest = require(path.resolve(electron.remote.app.getAppPath(), "./manifest.js"))
        } else {
            if (!manifest) {
                manifest = {}
            }
        }
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
    a.unlink(getAppPath, function() {
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
    a = a || function() {}
    ;
    if (!b) {
        b = {
            delay: 0
        }
    }
    if (!a) {
        a = function() {
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
    setTimeout(function() {
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
    $("body").append("<webview src='" + a + "' style='position: fixed; top: 0px; left: 0px; bottom: 0px; right: 0px' disablewebsecurity nodeintegration></webview>")
}
;