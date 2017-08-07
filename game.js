/**
 * Created by nexus on 03/04/17.
 */


var Game = function (args) {
    var fs = require("fs")
    var cheerio = require("cheerio");
    var G = require("./gameData");
    var fs = require('fs');
    var Executor = require("./Executor");

    eval(fs.readFileSync('modedGameFiles/game.js')+'');

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
    this.ipAddress = args.ipAddress || close("Ipaddress missing");
    this.port = args.port || close("Port missing");
    this.request = args.request || close("Request object missing");
    this.socket = args.socket || close("Socket missing");
    this.gameUserId = args.gameUserId || close("Gameuserid missing");
    this.socketAuth = args.socketAuth || close("socketAuth missing");
    this.characterId = args.characterId || close("Characterid missing");
    server_addr = this.ipAddress;
    port = args.port;
    user_id = args.gameUserId;
    socket = args.socket;
    character_to_load =  args.characterId;
    user_auth = args.socketAuth;
    request = this.request;
    init_socket();

    this.start = function(){
        setTimeout(function(){
            socket.emit("loaded", {success: 1, width: screen.width, height: screen.height, scale: scale})
            game_loaded = true;
            log_in(user_id,character_to_load,user_auth);
            setTimeout(function(){

                var global = {
                    gameplay: gameplay,
                    is_pvp:is_pvp,
                    server_region:server_region,
                    server_identifier: server_identifier,
                    G:G,
                    character:character,
                    activate:activate,
                    shift:shift,
                    use_skill:use_skill,
                    can_use:can_use,
                    socket:socket,
                    current_map:current_map,
                    add_log:add_log,
                    ctarget:ctarget,
                    send_target_logic:send_target_logic,
                    distance:distance,
                    is_disabled:is_disabled,
                    transporting:transporting,
                    player_attack:player_attack,
                    monster_attack:monster_attack,
                    player_heal:player_heal,
                    buy:buy,
                    sell:sell,
                    trade:trade,
                    trade_buy:trade_buy,
                    //u_item:u_item,
                    //u_scroll:u_scroll,
                    //u_offering:u_offering,
                    upgrade:upgrade,
                    //c_items:c_items,
                    //c_last:c_last,
                    //c_scroll:c_scroll,
                    //c_offering:c_offering,
                    compound:compound,
                    //cr_items:cr_items,
                    //craft:craft,
                    //e_item:e_item,
                    exchange:exchange,
                    say:say,
                    map:map,
                    calculate_move:calculate_move,
                    M:M,
                    chests:chests,
                    entities:entities,
                    calculate_vxy:calculate_vxy,
                    show_json:show_json,
                    next_potion:next_potion,
                    send_code_message:send_code_message,
                    drawings:drawings,
                    //code_buttons:code_buttons,
                    show_modal:show_modal,
                    prop_cache:prop_cache,
                    next_attack:next_attack,
                    bot_mode:true,
                };
                Object.defineProperty(global,"entities",{
                    get: function(){
                        return entities;
                    }
                })
                var executor = new Executor(global);
                executor.execute();
            },3722);
        },5722);
    };
}

/*
Game.prototype.start = function () {

    var self = this;
    user_id = this.gameUserId;
    user_auth = this.socket_auth;
    socket = this.socket;


    console.log("Load Character with id: " + this.characterId);
    console.log(user_auth);

    setTimeout(function () {
        character_to_load = self.characterId;
        log_in();
    }, 10337);


    function mssince(a, b) {
        if (!b) {
            b = new Date()
        }
        return b.getTime() - a.getTime()
    }

    var onevent = socket.onevent;
    socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call(this, packet);    // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet);      // additional call to catch-all
    };

    socket.on("*", function (event, data) {
        if (event != "entities" && event != "upgrade" && event != "ui") {
            console.log(event);
            console.log(data);
        }
    });

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

        if (pull_all_next) {
            console.log('pull_all_next triggered');
            pull_all_next = false;
            pull_all = true;
        }

        process_entities();
        future_entities = {
            players: {},
            monsters: {}
        };
        var d = 50;
        while (d > 0) {
            var c = false;
            if (character && character.moving) {
                c = true;
                if (character.vx) {
                    character.real_x += character.vx * Math.min(d, 50) / 1000
                }
                if (character.vy) {
                    character.real_y += character.vy * Math.min(d, 50) / 1000
                }
                set_direction(character);
                stop_logic(character)
            }
            for (var i in entities) {
                var entity = entities[i];
                if (entity && !entity.dead && entity.moving) {
                    c = true;
                    entity.real_x += entity.vx * Math.min(d, 50) / 1000;
                    entity.real_y += entity.vy * Math.min(d, 50) / 1000;
                    set_direction(entity);
                    stop_logic(entity)
                }
            }
            d -= 50;
            if (!c) {
                break;
            }
        }
        heartbeat = new Date();
    }, 50);


    function log_in() {
        console.log("Socket Authenication");
        var a = {
            user: user_id,
            character: character_to_load,
            auth: self.socketAuth,
            width: 1280,
            height: 1024,
            scale: "2"
        };

        socket.emit('auth', a)
    }

    socket.on("welcome", function (data) {
        is_pvp = data.pvp;
        server_region = data.region;
        server_identifier = data.name;
        server_name = server_names[data.region] + ' ' + data.name;

        current_map = data.map;
        first_coords = true;
        first_x = data.x;
        first_y = data.y;

        setTimeout(function () {
            game_loaded = true;
            console.log("Game loaded");
            socket.emit('loaded', {
                success: 1,
                width: 1280,
                height: 1024,
                scale: 2
            });
        }, 3337);
    });

    socket.on("disappear", function (data) {
        on_disappear(data)
    });

    socket.on('simple_eval', function (data) {
        console.error("Server tried to execute:" + data)
    });
    socket.on('eval', function (data) {
        console.error("Server tried to execute:" + data)
    });
    socket.on('player', function (data) {
        if (character) {
            adopt_soft_properties(character, data)
            //rip_logic()
        }
    });
    socket.on('correction', function (data) {
        if (can_move({
                map: character.map,
                x: character.real_x,
                y: character.real_y,
                going_x: data.x,
                going_y: data.y
            })) {
            console.log('Character correction');
            character.real_x = parseFloat(data.x);
            character.real_y = parseFloat(data.y);
            character.moving = false;
            character.vx = character.vy = 0
        }
    });
    socket.on("start", function (data) {
        var ipass = data.ipass;
        var characterId = data.id;

        character = {};
        var callbackId = Math.round(Math.random() * 100000000000 + 12007144706612636761);
        var callbackStart = Math.round(Math.random() * 10000) + 1494359179004;
        var callbackCount = callbackStart + 1;

        self.ipass = data.ipass;
        character = add_character(data, true);


        character.vision = [
            700,
            500
        ]
        setTimeout(function () {
            character.afk = true;
            socket.emit('property', {
                afk: true
            })
        }, 2000);


        if (character.map != current_map) {
            current_map = character.map;

            create_map();

        }

        setInterval(function () {
            if (game_loaded) {
                callbackCount++;
                var options = {
                    url: 'http://' + self.ipAddress + ':' + (+self.port + 40) + '/character?checkin=1&ipass=' + ipass + '&id=' + characterId + '&callback=jQuery' + callbackId + '_' + callbackStart + '&_=' + callbackCount
                };
                console.log(options)
                self.request(options);
            }
        }, 30000);
    });

    socket.on('entities', function (data) {
        if (data.type == 'all') {
            if (!first_entities) {
                first_entities = true;
            }
        }
        if (data.type == 'all') {
            console.log('all entities ' + new Date())
        }

        if (character) {
            if (data.xy) {
                last_refxy = new Date(),
                    ref_x = data.x,
                    ref_y = data.y
            } else {
                last_refxy = 0
            }
        }
        if (!pull_all) {
            for (var i = 0; i < data.players.length; i++) {
                future_entities.players[data.players[i].id] = data.players[i]
            }
            for (var j = 0; j < data.monsters.length; j++) {
                var old_events = future_entities.players[data.monsters[j].id] && future_entities.players[data.monsters[j].id].events;
                future_entities.monsters[data.monsters[j].id] = data.monsters[j];
                if (old_events) {
                    future_entities.monsters[data.monsters[j].id].events = old_events + future_entities.monsters[data.monsters[j].id].events
                }
            }
        }
    });
    socket.open();
}
*/
/**
 * welcome
 * observing
 * new_map
 * start
 * correction
 * ping_ack
 * requesting_ack
 * game_error
 * game_log
 * online
 * light
 * game_event
 * game_response
 * tavern
 * game_chat_log
 * chat_log
 * ui
 * upgrade
 * server_message
 * notice
 * reloaded
 * chest_opened
 * cm
 * pm
 * partym
 * drop
 * reopen
 * simple_eval
 * eval
 * player
 * player_nr
 * end
 * disconnect
 * disconnect_reason
 * hit
 * disappearing_text
 * death
 * entities
 * disappear
 * info
 * test
 * invite
 * request
 * frequest
 * friend
 * party_update
 * blocker
 * trade_history
 */

/*
function add_character(data, localPlayer) {
    var character = {};
    console.log('Add character ' + data.id)

    adopt_soft_properties(character, data);
    character.name = character.id;
    character.walking = null;
    character.x = Math.round(data.x);
    character.real_x = parseFloat(data.x);
    character.y = Math.round(data.y);
    character.real_y = parseFloat(data.y);
    character.type = 'character';
    character.me = localPlayer;


    return character;
}

function adopt_soft_properties(character, data) {
    if (character.me) {
        if (character.moving && character.speed && data.speed && character.speed != data.speed) {
            character.speed = data.speed;
            calculate_vxy(character)
        }
        if (data.abs) {
            character.moving = false
        }
        character.bank = null
    }

    var ignoredProperties = [
        'x',
        'y',
        'vx',
        'vy',
        'moving',
        'abs',
        'going_x',
        'going_y',
        'from_x',
        'from_y',
        'width',
        'height',
        'type',
        'events',
        'angle',
        'skin'
    ];

    for (var prop in data) {
        if (ignoredProperties.indexOf(prop) == -1) {
            character[prop] = data[prop];
        }
    }

    if (character.slots) {
        character.g10 = character.g9 = character.g8 = undefined;
        for (var c in character.slots) {
            if ((c == 'chest' || c == 'mainhand') && character.slots[c]) {
                if (character.slots[c].level == 10) {
                    character.g10 = true
                }
                if (character.slots[c].level == 9) {
                    character.g9 = true
                }
                if (character.slots[c].level == 8) {
                    character.g8 = true
                }
            }
        }
        if (character.g10) {
            character.g9 = character.g8 = undefined
        }
        if (character.g9) {
            character.g8 = undefined
        }
    }
    [
        'stunned',
        'cursed',
        'poisoned',
        'poisonous'
    ].forEach(function (d) {
        if (character[d]) {
            character[d] = false
        }
    });
    if (is_player(character)) {
        [
            'charging',
            'invis',
            'invincible',
            'mute'
        ].forEach(function (d) {
            if (character[d]) {
                character[d] = false
            }
        })
    }
    for (prop in data.s || {}) {
        character[prop] = data.s[prop]
    }
    if (character.me) {
        character.bank = character.user
    }
}

function calculate_vxy(entity, c) {
    if (!c) {
        c = 1
    }
    entity.ref_speed = entity.speed;
    var b = 0.0001 + sq(entity.going_x - entity.from_x) + sq(entity.going_y - entity.from_y);
    b = Math.sqrt(b);
    entity.vx = entity.speed * c * (entity.going_x - entity.from_x) / b;
    entity.vy = entity.speed * c * (entity.going_y - entity.from_y) / b;
    if (1 || is_game) {
        entity.angle = Math.atan2(entity.going_y - entity.from_y, entity.going_x - entity.from_x) * 180 / Math.PI
    }
}

function is_player(a) {
    if (!a) {
        return
    }
    if (a.type == 'character' && !a.npc) {
        return true
    }
}

function close(error) {
    console.error(error);
    process.exit(1);
}

function process_entities() {

    for (var f in future_entities.players) {
        var futurePlayer = future_entities.players[f];
        var player = entities[futurePlayer.id];
        if (character && character.id == futurePlayer.id) {
            continue
        }
        //Create Player if not existing
        if (!player) {
            if (futurePlayer.dead) {
                continue
            }
            futurePlayer.external = true;
            futurePlayer.player = true;
            player = entities[futurePlayer.id] = add_character(futurePlayer);
            player.drawn = false;
            player.resync = true;
        }
        if (futurePlayer.dead) {
            player.dead = true;
            continue
        }
        sync_entity(player, futurePlayer);
    }

    for (var key in entities) {
        var entity = entities[key];

        if (character && !within_xy_range(character, entity) || !character && !within_xy_range({
                map: current_map,
                'in': current_map,
                vision: [
                    700,
                    500
                ],
                x: first_x,
                y: first_y
            }, entity)) {
            on_disappear(entity);
            entity.dead = true;
        }

        if (entity.dead || pull_all) {
            entity.dead = true;
            entity.cid++;
            entity.died = new Date();
            entity.interactive = false;
            delete entities[key];

            continue
        } else {
            if (!entity.drawn) {
                entity.drawn = true;
            }
        }
        entity.x = Math.round(entity.real_x);
        entity.y = Math.round(entity.real_y);

    }
    if (pull_all && game.socket) {
        pull_all = false;
        console.log("send ME updates")
        game.socket.emit('send_updates', {});
    }

    for (var key in future_entities.monsters) {
        var futureMonster = future_entities.monsters[key];
        var monster = entities[futureMonster.id];
        //Create Monster if not existing
        if (!monster) {
            if (futureMonster.dead) {
                continue
            }
            try {
                monster = entities[futureMonster.id] = add_monster(futureMonster)
            } catch (c) {
                console.log(c);
            }
            monster.drawn = false;
            monster.resync = true
        }
        if (futureMonster.dead) {
            monster.dead = true;
            continue
        }
        sync_entity(monster, futureMonster);
        (futureMonster.events || []).forEach(function (event) {
            if (event.type == 'mhit') {
                var target = get_entity(event.p),
                    monster = get_entity(event.m);
                if (!target) {
                    return
                }
                if (event.evade) {
                    return
                }
                if (event.combo && target && target.me && target.targets < 3) {
                    console.log(monster.mtype + ' dealt combined damage');
                }
            }
        })
    }
}

function sync_entity(current, future) {
    adopt_soft_properties(current, future);
    if (current.resync) {
        current.real_x = future.x;
        current.real_y = future.y;
        if (future.moving) {
            current.engaged_move = -1,
                current.move_num = 0
        } else {
            current.engaged_move = current.move_num = future.move_num,
                current.angle = ((future.angle === undefined && 90) || future.angle),
                set_direction(current)
        }
        current.resync = current.moving = false
    }
    if (future.abs && !current.abs) {
        current.abs = true;
        current.moving = false
    }
    if (current.move_num != current.engaged_move) {
        var d = simple_distance({
            x: current.real_x,
            y: current.real_y
        }, future);
        if (d > 120) {
            current.real_x = future.x;
            current.real_y = future.y;
        }
        var b = simple_distance({
                x: current.real_x,
                y: current.real_y
            }, {
                x: future.going_x,
                y: future.going_y
            }) / (simple_distance(future, {
                x: future.going_x,
                y: future.going_y
            }) + EPS);
        if (b > 1.25) {
            console.log(current.id + ' speedm: ' + b)
        }
        current.moving = true;
        current.abs = false;
        current.engaged_move = current.move_num;
        current.from_x = current.real_x;
        current.from_y = current.real_y;
        current.going_x = future.going_x;
        current.going_y = future.going_y;
        calculate_vxy(current, b)
    }
}

function set_direction(a, c) {
    var b = 70;
    if (c == 'npc') {
        b = 45
    }
    if (Math.abs(a.angle) < b) {
        a.direction = 2
    } else {
        if (Math.abs(Math.abs(a.angle) - 180) < b) {
            a.direction = 1
        } else {
            if (Math.abs(a.angle + 90) < 90) {
                a.direction = 3
            } else {
                a.direction = 0
            }
        }
    }
    if (c == 'attack' && !a.me && is_monster(a)) {
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
        setTimeout(function () {
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
        setTimeout(function () {
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

function simple_distance(a, b) {
    var c = a.x,
        h = a.y,
        g = b.x,
        f = b.y;
    if (a.map && b.map && a.map != b.map) {
        return 9999999
    }
    if ('real_x' in a) {
        c = a.real_x,
            h = a.real_y
    }
    if ('real_y' in b) {
        g = b.real_x,
            f = b.real_y
    }
    return Math.sqrt((c - g) * (c - g) + (h - f) * (h - f))
}

function add_monster(futureMonster) {
    var c = futureMonster.type,
        monster = {};
    adopt_soft_properties(monster, futureMonster);
    monster.walking = null;
    monster.animations = {};
    monster.move_num = futureMonster.move_num;
    monster.c = {};
    monster.x = monster.real_x = Math.round(futureMonster.x);
    monster.y = monster.real_y = Math.round(futureMonster.y);
    monster.vx = futureMonster.vx || 0;
    monster.vy = futureMonster.vy || 0;
    monster.speed = futureMonster.speed;
    monster.type = 'monster';
    monster.mtype = futureMonster.type;
    if (c.hit) {
        monster.hit = c.hit
    }
    if (c.size) {
        monster.height *= c.size,
            monster.width *= c.size,
            monster.mscale = 2,
            monster.hpbar_wdisp = -5
    }
    return monster
}
function sq(a) {
    return a * a
}
function on_disappear(data) {
    if (future_entities.players[data.id]) {
        delete future_entities.players[data.id]
    }
    if (future_entities.monsters[data.id]) {
        delete future_entities.monsters[data.id]
    }
    if (entities[data.id]) {
        if (data.invis) {
            //player turned invisible
        }
        if (data.effect) {
            //player returned to spawn
        }
        entities['DEAD' + data.id] = entities[data.id];
        entities[data.id].dead = true;

        delete entities[data.id]
    } else {
        if (character && character.id == data.id) {
            if (data.invis) {
                //character turned invisible
            }
        }
    }
}
function get_entity(a) {
    if (character && a == character.id) {
        return character
    }
    return entities[a]
}

function create_map() {

    entities = {};

    pvp = G.maps[current_map].pvp || is_pvp; //TODO implement G.

    map_info = G.maps[current_map];

    console.log('Map created: ' + current_map)
    pull_all = true;
}

function within_xy_range(c, b) {
    if (c['in'] != b['in']) {
        return false
    }
    if (!c.vision) {
        return false
    }

    var a = b.x,
        f = b.y,
        e = c.x,
        d = c.y;
    if ('real_x' in c) {
        e = c.real_x,
            d = c.real_y
    }
    if (e - c.vision[0] < a && a < e + c.vision[0] && d - c.vision[1] < f && f < d + c.vision[1]) {
        return true
    }
    return false
}

function stop_logic(entity) {
    if (!entity.moving) {
        return
    }
    var pX = entity.x,
        pY = entity.y;
    if ('real_x' in entity) {
        pX = entity.real_x,
            pY = entity.real_y
    }
    if (((entity.from_x <= entity.going_x && pX >= entity.going_x - 0.1) || (entity.from_x >= entity.going_x && pX <= entity.going_x + 0.1)) && ((entity.from_y <= entity.going_y && pY >= entity.going_y - 0.1) || (entity.from_y >= entity.going_y && pY <= entity.going_y + 0.1))) {
        if ('real_x' in entity) {
            entity.real_x = entity.going_x,
                entity.real_y = entity.going_y
        } else {
            entity.x = entity.going_x,
                entity.y = entity.going_y
        }
        entity.moving = false;
        entity.vx = entity.vy = 0
    }
}

function can_move(entity) {
    var data = G.maps[entity.map].data || {};
    var starX = entity.real_x,
        startY = entity.real_y,
        endX = entity.going_x,
        endY = entity.going_y,
        d;

    for (var c = 0; c < (data.x_lines || []).length; c++) {
        var xline = data.x_lines[c];
        if (!(starX <= xline[0] && xline[0] <= endX || endX <= xline[0] && xline[0] <= starX)) {
            continue
        }
        d = startY + (endY - startY) * (xline[0] - starX) / (endX - starX + EPS);
        if (!(xline[1] <= d && d <= xline[2])) {
            continue
        }
        return false
    }
    for (var c = 0; c < (data.y_lines || []).length; c++) {
        var yline = data.y_lines[c];
        if (!(startY <= yline[0] && yline[0] <= endY || endY <= yline[0] && yline[0] <= startY)) {
            continue
        }
        d = starX + (endX - starX) * (yline[0] - startY) / (endY - startY + EPS);
        if (!(yline[1] <= d && d <= yline[2])) {
            continue
        }
        return false
    }
    return true
}

var move = function (x, y) {
    if (character && can_move({
            map: character.map,
            real_x: character.real_x,
            real_y: character.real_y,
            going_x: x,
            going_y: y
        })) {

        //var b = calculate_move(M, character.real_x, character.real_y, character.real_x + d, character.real_y + c);
        character.from_x = character.real_x;
        character.from_y = character.real_y;
        character.going_x = x;
        character.going_y = y;
        character.moving = true;
        calculate_vxy(character);
        if (can_move(character)) {
            socket.emit('move', {
                x: character.real_x,
                y: character.real_y,
                going_x: character.going_x,
                going_y: character.going_y,
                m: character.m
            });
        }
    }
    else {
        console.log("Can not move there")
    }
}
*/
module.exports = Game;