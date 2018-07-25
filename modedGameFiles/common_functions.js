var c_version = 2;
var EPS = 1e-8;
var REPS = ((Number && Number.EPSILON) || EPS);
var CINF = 999999999999999;
var colors = {
    range: "#93A6A2",
    armor: "#5C5D5E",
    resistance: "#6A5598",
    attack: "#DB2900",
    str: "#F07F2F",
    "int": "#3E6EED",
    dex: "#44B75C",
    speed: "#36B89E",
    cash: "#5DAC40",
    hp: "#FF2E46",
    mp: "#3a62ce",
    gold: "gold",
    male: "#43A1C6",
    female: "#C06C9B",
    server_success: "#85C76B",
    server_failure: "#C7302C",
    poison: "#41834A",
    ability: "#ff9100",
    xmas: "#C82F17",
    xmasgreen: "#33BF6D",
    codeblue: "#32A3B0",
    codepink: "#E13758",
    A: "#39BB54",
    B: "#DB37A3",
    npc_white: "#EBECEE",
    white_positive: "#C3FFC0",
    white_negative: "#FFDBDC",
    serious_red: "#BC0004",
    serious_green: "#428727",
    heal: "#EE4D93",
};
var trade_slots = []
    , check_slots = ["elixir"];
for (var i = 1; i <= 16; i++) {
    trade_slots.push("trade" + i),
        check_slots.push("trade" + i)
}
var character_slots = ["ring1", "ring2", "earring1", "earring2", "belt", "mainhand", "offhand", "helmet", "chest", "pants", "shoes", "gloves", "amulet", "orb", "elixir", "cape"];
var booster_items = ["xpbooster", "luckbooster", "goldbooster"];
var can_buy = {};
function process_game_data() {
    G.quests = {};
    for (var a in G.monsters) {
        if (G.monsters[a].charge) {
            continue
        }
        if (G.monsters[a].speed >= 60) {
            G.monsters[a].charge = round(G.monsters[a].speed * 1.2)
        } else {
            if (G.monsters[a].speed >= 50) {
                G.monsters[a].charge = round(G.monsters[a].speed * 1.3)
            } else {
                if (G.monsters[a].speed >= 32) {
                    G.monsters[a].charge = round(G.monsters[a].speed * 1.4)
                } else {
                    if (G.monsters[a].speed >= 20) {
                        G.monsters[a].charge = round(G.monsters[a].speed * 1.6)
                    } else {
                        if (G.monsters[a].speed >= 10) {
                            G.monsters[a].charge = round(G.monsters[a].speed * 1.7)
                        } else {
                            G.monsters[a].charge = round(G.monsters[a].speed * 2)
                        }
                    }
                }
            }
        }
        G.monsters[a].max_hp = G.monsters[a].hp
    }
    for (var b in G.maps) {
        var d = G.maps[b];
        if (d.ignore) {
            continue
        }
        var d = b.data = G.geometry[a];
        d.items = {};
        d.merchants = [];
        d.ref = d.ref || {};
        (d.npcs || []).forEach(function(f) {
            if (!f.position) {
                return
            }
            var e = {
                map: b,
                "in": b,
                x: f.position[0],
                y: f.position[1],
                id: f.id
            }
                , g = G.npcs[f.id];
            if (g.items) {
                d.merchants.push(e);
                g.items.forEach(function(h) {
                    if (!h) {
                        return
                    }
                    if (G.items[h].cash) {
                        G.items[h].buy_with_cash = true;
                        return
                    }
                    d.items[h] = d.items[h] || [];
                    d.items[h].push(e);
                    can_buy[h] = true;
                    G.items[h].buy = true
                })
            }
            d.ref[f.id] = e;
            if (g.role == "newupgrade") {
                d.upgrade = d.compound = e
            }
            if (g.role == "exchange") {
                d.exchange = e
            }
            if (g.quest) {
                G.quests[g.quest] = e
            }
        })
    }
    for (var c in G.items) {
        G.items[c].id = c
    }
    G.maps.desertland.transporter = {
        "in": "desertland",
        map: "desertland",
        id: "transporter",
        x: 0,
        y: 0
    }
}
function test_logic() {
    for (var a in G.items) {
        G.items[a].cash = 0;
        G.items[a].g = G.items[a].g || 1
    }
    for (var a in G.monsters) {
        G.monsters[a].xp = 0
    }
}
function hardcore_logic() {
    for (var a in G.items) {}
    G.npcs.premium.items.forEach(function(b) {
        if (b) {
            G.items[b].cash = 0;
            G.items[b].g = parseInt(G.items[b].g * 2)
        }
    });
    G.items.offering.g = parseInt(G.items.offering.g / 2);
    G.items.xptome.g = 99999999;
    G.items.computer.g = 1;
    G.items.gemfragment.e = 10;
    G.items.leather.e = 5;
    G.maps.main.monsters.push({
        type: "wabbit",
        boundary: [-282, 702, 218, 872],
        count: 1
    });
    G.npcs.scrolls.items[9] = "vitscroll";
    G.monsters.wabbit.evasion = 96;
    G.monsters.wabbit.reflection = 96;
    G.monsters.phoenix.respawn = 1;
    G.monsters.mvampire.respawn = 1
}
function object_sort(e, d) {
    function b(h, g) {
        if (h[0] < g[0]) {
            return -1
        }
        return 1
    }
    var c = [];
    for (var f in e) {
        c.push([f, e[f]])
    }
    if (!d) {
        c.sort(b)
    }
    return c
}
function within_xy_range(c, b) {
    if (c["in"] != b["in"]) {
        return false
    }
    if (!c.vision) {
        return false
    }
    var a = get_x(b)
        , f = get_y(b)
        , e = get_x(c)
        , d = get_y(c);
    if (e - c.vision[0] < a && a < e + c.vision[0] && d - c.vision[1] < f && f < d + c.vision[1]) {
        return true
    }
    return false
}
function distance(l, j) {
    if ("width"in l && "width"in j) {
        var f = 99999999, n = l.width, e = l.height, d = j.width, h = j.height, g;
        if ("awidth"in l) {
            n = l.awidth,
                e = l.aheight
        }
        if ("awidth"in j) {
            d = j.awidth,
                h = j.aheight
        }
        var m = get_x(l)
            , k = get_y(l)
            , c = get_x(j)
            , o = get_y(j);
        [{
            x: m - n / 2,
            y: k - e / 2
        }, {
            x: m + n / 2,
            y: k - e / 2
        }, {
            x: m,
            y: k
        }, {
            x: m,
            y: k - e
        }].forEach(function(a) {
            [{
                x: c - d / 2,
                y: o - h / 2
            }, {
                x: c + d / 2,
                y: o - h / 2
            }, {
                x: c,
                y: o
            }, {
                x: c,
                y: o - h
            }].forEach(function(b) {
                g = simple_distance(a, b);
                if (g < f) {
                    f = g
                }
            })
        });
        return f
    }
    return simple_distance(l, j)
}
function can_transport(a) {
    return can_walk(a)
}
function can_walk(a) {
    if (is_game && a.me && transporting && ssince(transporting) < 8 && !a.c.town) {
        return false
    }
    if (is_code && a.me && parent.transporting && ssince(parent.transporting) < 8 && !a.c.town) {
        return false
    }
    return !is_disabled(a)
}
function is_disabled(a) {
    if (!a || a.rip || (a.s && a.s.stunned)) {
        return true
    }
}
function calculate_item_grade(b, a) {
    if (!(b.upgrade || b.compound)) {
        return 0
    }
    if ((a && a.level || 0) >= (b.grades || [11, 12])[1]) {
        return 2
    }
    if ((a && a.level || 0) >= (b.grades || [11, 12])[0]) {
        return 1
    }
    return 0
}
function calculate_item_value(c) {
    if (!c) {
        return 0
    }
    if (c.gift) {
        return 1
    }
    var f = G.items[c.name]
        , e = f.cash && f.g || f.g * 0.6
        , h = 1;
    if (f.compound && c.level) {
        var g = 0
            , a = f.grades || [11, 12]
            , d = 0;
        for (var b = 1; b <= c.level; b++) {
            if (b > a[1]) {
                g = 2
            } else {
                if (b > a[0]) {
                    g = 1
                }
            }
            if (f.cash) {
                e *= 1.5
            } else {
                e *= 3.2
            }
            e += G.items["cscroll" + g].g / 2.4
        }
    }
    if (f.upgrade && c.level) {
        var g = 0
            , a = f.grades || [11, 12]
            , d = 0;
        for (var b = 1; b <= c.level; b++) {
            if (b > a[1]) {
                g = 2
            } else {
                if (b > a[0]) {
                    g = 1
                }
            }
            d += G.items["scroll" + g].g / 2;
            if (b >= 7) {
                e *= 3,
                    d *= 1.32
            } else {
                if (b == 6) {
                    e *= 2.4
                } else {
                    if (b >= 4) {
                        e *= 2
                    }
                }
            }
            if (b == 9) {
                e *= 2.64,
                    e += 400000
            }
            if (b == 10) {
                e *= 5
            }
            if (b == 11) {
                e *= 2
            }
            if (b == 12) {
                e *= 1.8
            }
        }
        e += d
    }
    if (c.expires) {
        h = 8
    }
    return round(e / h) || 0
}
var prop_cache = {};
function damage_multiplier(a) {
    return min(1.32, max(0.05, 1 - (max(0, min(100, a)) * 0.001 + max(0, min(100, a - 100)) * 0.001 + max(0, min(100, a - 200)) * 0.00095 + max(0, min(100, a - 300)) * 0.0009 + max(0, min(100, a - 400)) * 0.00082 + max(0, min(100, a - 500)) * 0.0007 + max(0, min(100, a - 600)) * 0.0006 + max(0, min(100, a - 700)) * 0.0005 + max(0, a - 800) * 0.0004) + max(0, min(50, 0 - a)) * 0.001 + max(0, min(50, -50 - a)) * 0.00075 + max(0, min(50, -100 - a)) * 0.0005 + max(0, -150 - a) * 0.00025))
}
function calculate_item_properties(e, d) {
    var a = e.name + (e.card || "") + "|" + d.level + "|" + d.stat_type + "|" + d.p;
    if (prop_cache[a]) {
        return prop_cache[a]
    }
    var g = {
        gold: 0,
        luck: 0,
        xp: 0,
        "int": 0,
        str: 0,
        dex: 0,
        charisma: 0,
        cuteness: 0,
        awesomeness: 0,
        bling: 0,
        vit: 0,
        hp: 0,
        mp: 0,
        attack: 0,
        range: 0,
        armor: 0,
        resistance: 0,
        stat: 0,
        speed: 0,
        level: 0,
        evasion: 0,
        miss: 0,
        reflection: 0,
        lifesteal: 0,
        attr0: 0,
        attr1: 0,
        rpiercing: 0,
        apiercing: 0,
        crit: 0,
        dreturn: 0,
        frequency: 0,
        mp_cost: 0,
        output: 0,
    };
    if (e.upgrade || e.compound) {
        var c = e.upgrade || e.compound;
        level = d.level || 0;
        g.level = level;
        for (var b = 1; b <= level; b++) {
            var f = 1;
            if (e.upgrade) {
                if (b == 7) {
                    f = 1.25
                }
                if (b == 8) {
                    f = 1.5
                }
                if (b == 9) {
                    f = 2
                }
                if (b == 10) {
                    f = 3
                }
                if (b == 11) {
                    f = 1.25
                }
                if (b == 12) {
                    f = 1.5
                }
            } else {
                if (e.compound) {
                    if (b == 5) {
                        f = 1.25
                    }
                    if (b == 6) {
                        f = 1.5
                    }
                    if (b == 7) {
                        f = 2
                    }
                    if (b >= 8) {
                        f = 3
                    }
                }
            }
            for (p in c) {
                if (p == "stat") {
                    g[p] += round(c[p] * f)
                } else {
                    g[p] += c[p] * f
                }
                if (p == "stat" && b >= 7) {
                    g.stat++
                }
            }
        }
    }
    for (p in e) {
        if (g[p] != undefined) {
            g[p] += e[p]
        }
    }
    for (p in g) {
        if (!in_arr(p, ["evasion", "reflection", "lifesteal", "attr0", "attr1", "crit"])) {
            g[p] = round(g[p])
        }
    }
    if (e.stat && d.stat_type) {
        g[d.stat_type] += g.stat * {
            str: 1,
            vit: 1,
            dex: 1,
            "int": 1,
            evasion: 0.125,
            reflection: 0.875,
            rpiercing: 1.25,
            apiercing: 1.25
        }[d.stat_type];
        g.stat = 0
    }
    if (d.p == "shiny") {
        if (g.attack) {
            g.attack += 5
        } else {
            if (g.stat) {
                g.stat += 2
            } else {
                if (g.armor) {
                    g.armor += 15;
                    g.resistance = (g.resistance || 0) + 10
                }
            }
        }
    }
    prop_cache[a] = g;
    return g
}
function random_one(a) {
    return a[parseInt(a.length * Math.random())]
}
function to_pretty_num(a) {
    if (!a) {
        return "0"
    }
    a = round(a);
    var b = "";
    while (a) {
        var c = a % 1000;
        if (!c) {
            c = "000"
        } else {
            if (c < 10 && c != a) {
                c = "00" + c
            } else {
                if (c < 100 && c != a) {
                    c = "0" + c
                }
            }
        }
        if (!b) {
            b = c
        } else {
            b = c + "," + b
        }
        a = (a - a % 1000) / 1000
    }
    return "" + b
}
function e_array(a) {
    var c = [];
    for (var b = 0; b < a; b++) {
        c.push(null)
    }
    return c
}
function set_xy(b, a, c) {
    if ("real_x"in b) {
        b.real_x = a,
            b.real_y = c
    } else {
        b.x = a,
            b.y = c
    }
}
function get_xy(a) {
    return [get_x(a), get_y(a)]
}
function get_x(a) {
    if ("real_x"in a) {
        return a.real_x
    }
    return a.x
}
function get_y(a) {
    if ("real_y"in a) {
        return a.real_y
    }
    return a.y
}
function simple_distance(e, d) {
    var c = get_x(e)
        , h = get_y(e)
        , g = get_x(d)
        , f = get_y(d);
    if (e.map && d.map && e.map != d.map) {
        return 9999999
    }
    return Math.sqrt((c - g) * (c - g) + (h - f) * (h - f))
}
function calculate_vxy(a, c) {
    if (!c) {
        c = 1
    }
    a.ref_speed = a.speed;
    var b = 0.0001 + sq(a.going_x - a.from_x) + sq(a.going_y - a.from_y);
    b = sqrt(b);
    a.vx = a.speed * c * (a.going_x - a.from_x) / b;
    a.vy = a.speed * c * (a.going_y - a.from_y) / b;
    if (1 || is_game) {
        a.angle = Math.atan2(a.going_y - a.from_y, a.going_x - a.from_x) * 180 / Math.PI
    }
}
function recalculate_vxy(a) {
    if (a.moving && a.ref_speed != a.speed) {
        if (is_server) {
            a.move_num++
        }
        calculate_vxy(a)
    }
}
function is_in_front(b, a) {
    var c = Math.atan2(get_y(a) - get_y(b), get_x(a) - get_x(b)) * 180 / Math.PI;
    if (b.angle !== undefined && Math.abs(b.angle - c) <= 45) {
        return true
    }
    return false
}
function calculate_movex(A, k, j, f, e) {
    if (f == Infinity) {
        f = CINF
    }
    if (e == Infinity) {
        e = CINF
    }
    var s = j < e;
    var B = k < f;
    var l = A.x_lines || [];
    var x = A.y_lines || [];
    var r = min(k, f);
    var z = max(k, f);
    var q = min(j, e);
    var y = max(j, e);
    var o = f - k;
    var n = e - j;
    var g = n / (o + REPS);
    var v = 1 / g;
    var u = 10 * EPS;
    for (var w = bsearch_start(l, r); w < l.length; w++) {
        var m = l[w];
        var b = m[0]
            , d = b + u;
        if (B) {
            d = b - u
        }
        if (z < b) {
            break
        }
        if (z < b || r > b || y < m[1] || q > m[2]) {
            continue
        }
        var h = j + (b - k) * g;
        if (eps_equal(k, f) && eps_equal(k, b)) {
            d = b;
            if (s) {
                h = min(m[1], m[2]) - u,
                    e = min(e, h),
                    y = e
            } else {
                q = h = max(m[1], m[2]) + u,
                    e = min(e, h),
                    q = e
            }
            continue
        }
        if (h < m[1] || h > m[2]) {
            continue
        }
        if (s) {
            e = min(e, h);
            y = e
        } else {
            e = max(e, h);
            q = e
        }
        if (B) {
            f = min(f, d);
            z = f
        } else {
            f = max(f, d);
            r = f
        }
    }
    for (var w = bsearch_start(x, q); w < x.length; w++) {
        var m = x[w];
        var a = m[0]
            , t = a + u;
        if (s) {
            t = a - u
        }
        if (y < a) {
            break
        }
        if (y < a || q > a || z < m[1] || r > m[2]) {
            continue
        }
        var c = k + (a - j) * v;
        if (eps_equal(j, e) && eps_equal(j, a)) {
            t = a;
            if (B) {
                c = min(m[1], m[2]) - u,
                    f = min(f, c),
                    z = f
            } else {
                r = c = max(m[1], m[2]) + u,
                    f = min(f, c),
                    r = f
            }
            continue
        }
        if (c < m[1] || c > m[2]) {
            continue
        }
        if (B) {
            f = min(f, c);
            z = f
        } else {
            f = max(f, c);
            r = f
        }
        if (s) {
            e = min(e, t);
            y = e
        } else {
            e = max(e, t);
            q = e
        }
    }
    return {
        x: f,
        y: e
    }
}

function get_height(a) {
    if (a.me) {
        return a.aheight
    } else {
        if (a.mscale) {
            return a.height / a.mscale
        } else {
            return a.height
        }
    }
}
function get_width(a) {
    if (a.me) {
        return a.awidth
    } else {
        if (a.mscale) {
            return a.width / a.mscale
        } else {
            return a.width
        }
    }
}
function set_base(a) {
    var b = a.mtype || a.type;
    a.base = {
        h: 8,
        v: 7,
        vn: 2
    };
    if (G.actual_dimensions[b] && G.actual_dimensions[b][3]) {
        a.base.h = G.actual_dimensions[b][3];
        a.base.v = min(9.9, G.actual_dimensions[b][4])
    } else {
        a.base.h = min(12, get_width(a) * 0.8);
        a.base.v = min(9.9, get_height(a) / 4)
    }
}
function calculate_move_v2(e, g, f, d, c) {
    if (d == Infinity) {
        d = CINF
    }
    if (c == Infinity) {
        c = CINF
    }
    var b = calculate_movex(e, g, f, d, c);
    if (b.x != d && b.y != c) {
        var a = calculate_movex(e, g, f, d, b.y);
        if (a.x == b.x) {
            var a = calculate_movex(e, g, f, a.x, c)
        }
        return a
    }
    return b
}
var m_calculate = false, m_line_x = false, m_line_y = false, line_hit_x = null, line_hit_y = null, m_dx, m_dy;
function calculate_move(k, g, e) {
    m_calculate = true;
    var a = k.map
        , j = get_x(k)
        , f = get_y(k);
    var l = [[0, 0]];
    var b = [[g, e]]
        , c = [];
    if (k.base) {
        l = [[-k.base.h, k.base.vn], [k.base.h, k.base.vn], [-k.base.h, -k.base.v], [k.base.h, -k.base.v]]
    }
    l.forEach(function(r) {
        for (var t = 0; t < 3; t++) {
            var w = r[0]
                , u = r[1];
            var s = g + w
                , q = e + u;
            if (t == 1) {
                s = j + w
            }
            if (t == 2) {
                q = f + u
            }
            var o = calculate_movex(G.geometry[a] || {}, j + w, f + u, s, q);
            var v = point_distance(j + w, f + u, o.x, o.y);
            w = o.x - w;
            u = o.y - u;
            if (!in_arrD2([w, u], b)) {
                b.push([w, u])
            }
        }
    });
    var m = -1
        , d = {
        x: j,
        y: f
    }
        , h = CINF;
    function n(q) {
        var o = q[0]
            , s = q[1];
        if (can_move({
                map: a,
                x: j,
                y: f,
                going_x: o,
                going_y: s,
                base: k.base
            })) {
            var r = point_distance(g, e, o, s);
            if (r < h) {
                h = r;
                d = {
                    x: o,
                    y: s
                }
            }
        }
        if (line_hit_x !== null) {
            c.push([line_hit_x, line_hit_y]),
                line_hit_x = null,
                line_hit_y = null
        }
    }
    b.forEach(n);
    c.forEach(n);
    if (point_distance(j, f, d.x, d.y) < 10 * EPS) {
        d = {
            x: j,
            y: f
        }
    }
    m_calculate = false;
    return d
}
function point_distance(b, d, a, c) {
    return Math.sqrt((a - b) * (a - b) + (c - d) * (c - d))
}
function recalculate_move(a) {
    move = calculate_move(a, a.going_x, a.going_y);
    a.going_x = move.x;
    a.going_y = move.y
}
function bsearch_start(a, c) {
    var e = 0, b = a.length - 1, d;
    while (e < b - 1) {
        d = parseInt((e + b) / 2);
        if (a[d][0] < c) {
            e = d
        } else {
            b = d - 1
        }
    }
    return e
}
function can_move(l, t) {
    var a = G.geometry[l.map] || {}
        , x = 0;
    var w = l.x, f = l.y, v = l.going_x, e = l.going_y, q, k = min(w, v), h = min(f, e), j = max(w, v), g = max(f, e);
    if (!t && l.base) {
        var n = true;
        [[-l.base.h, l.base.vn], [l.base.h, l.base.vn], [-l.base.h, -l.base.v], [l.base.h, -l.base.v]].forEach(function(c) {
            var z = c[0]
                , y = c[1];
            if (!n || !can_move({
                    map: l.map,
                    x: w + z,
                    y: f + y,
                    going_x: v + z,
                    going_y: e + y
                }, 1)) {
                n = false
            }
        });
        if (1) {
            var u = l.base.h
                , s = -l.base.h;
            m_line_x = max;
            if (v > w) {
                u = -l.base.h,
                    s = l.base.h,
                    mcy = m_line_x = min
            }
            var d = l.base.vn
                , b = -l.base.v;
            m_line_y = max;
            if (e > f) {
                d = -l.base.v,
                    b = l.base.vn,
                    m_line_y = min
            }
            m_dx = -s;
            m_dy = -b;
            if (!n || !can_move({
                    map: l.map,
                    x: v + s,
                    y: e + d,
                    going_x: v + s,
                    going_y: e + b
                }, 1)) {
                n = false
            }
            if (!n || !can_move({
                    map: l.map,
                    x: v + u,
                    y: e + b,
                    going_x: v + s,
                    going_y: e + b
                }, 1)) {
                n = false
            }
            m_line_x = m_line_y = false
        }
        return n
    }
    function m(y, c, A, z) {
        line_hit_x = m_line_x(y, A),
            line_hit_x = m_line_x(line_hit_x + 6 * EPS, line_hit_x - 6 * EPS) + m_dx;
        line_hit_y = m_line_y(c, z),
            line_hit_y = m_line_y(line_hit_y + 6 * EPS, line_hit_y - 6 * EPS) + m_dy
    }
    for (var r = bsearch_start(a.x_lines || [], k); r < (a.x_lines || []).length; r++) {
        var o = a.x_lines[r];
        if (o[0] == v && (o[1] <= e && o[2] >= e || o[0] == w && f <= o[1] && e > o[1])) {
            if (m_line_y) {
                m(o[0], o[1], o[0], o[2])
            }
            return false
        }
        if (k > o[0]) {
            continue
        }
        if (j < o[0]) {
            break
        }
        q = f + (e - f) * (o[0] - w) / (v - w + REPS);
        if (!(o[1] - EPS <= q && q <= o[2] + EPS)) {
            continue
        }
        if (m_line_y) {
            m(o[0], o[1], o[0], o[2])
        }
        return false
    }
    for (var r = bsearch_start(a.y_lines || [], h); r < (a.y_lines || []).length; r++) {
        var o = a.y_lines[r];
        if (o[0] == e && (o[1] <= v && o[2] >= v || o[0] == f && w <= o[1] && v > o[1])) {
            if (m_line_x) {
                m(o[1], o[0], o[2], o[0])
            }
            return false
        }
        if (h > o[0]) {
            continue
        }
        if (g < o[0]) {
            break
        }
        q = w + (v - w) * (o[0] - f) / (e - f + REPS);
        if (!(o[1] - EPS <= q && q <= o[2] + EPS)) {
            continue
        }
        if (m_line_x) {
            m(o[1], o[0], o[2], o[0])
        }
        return false
    }
    return true
}

function closest_line(c, a, d) {
    var b = 16000;
    [[0, 16000], [0, -16000], [16000, 0], [-16000, 0]].forEach(function(f) {
        var j = f[0]
            , g = f[1];
        var e = calculate_move({
            map: c,
            x: a,
            y: d
        }, a + j, d + g);
        var h = point_distance(a, d, e.x, e.y);
        if (h < b) {
            b = h
        }
    });
    return b
}
function stop_logic(b) {
    if (!b.moving) {
        return
    }
    var a = get_x(b)
        , c = get_y(b);
    if (((b.from_x <= b.going_x && a >= b.going_x - 0.1) || (b.from_x >= b.going_x && a <= b.going_x + 0.1)) && ((b.from_y <= b.going_y && c >= b.going_y - 0.1) || (b.from_y >= b.going_y && c <= b.going_y + 0.1))) {
        set_xy(b, b.going_x, b.going_y);
        if (b.loop) {
            b.going_x = b.positions[(b.last + 1) % b.positions.length][0];
            b.going_y = b.positions[(++b.last) % b.positions.length][1];
            b.u = true;
            start_moving_element(b);
            return
        }
        b.moving = false;
        b.vx = b.vy = 0
    }
}
function trigger(a) {
    setTimeout(a, 0)
}
function to_number(a) {
    try {
        a = round(parseInt(a));
        if (a < 0) {
            return 0
        }
        if (!a) {
            a = 0
        }
    } catch (b) {
        a = 0
    }
    return a
}
function is_number(b) {
    try {
        if (!isNaN(b) && 0 + b === b) {
            return true
        }
    } catch (a) {}
    return false
}
function is_string(b) {
    try {
        return Object.prototype.toString.call(b) == "[object String]"
    } catch (a) {}
    return false
}
function is_array(b) {
    try {
        if (Array.isArray(b)) {
            return true
        }
    } catch (c) {}
    return false
}
function is_function(b) {
    try {
        var a = {};
        return b && a.toString.call(b) === "[object Function]"
    } catch (c) {}
    return false
}
function is_object(b) {
    try {
        return b !== null && typeof b === "object"
    } catch (a) {}
    return false
}
function clone(d, b) {
    if (!b) {
        b = {}
    }
    if (!b.seen && b.seen !== []) {
        b.seen = []
    }
    if (null == d) {
        return d
    }
    if (b.simple_functions && is_function(d)) {
        return "[clone]:" + d.toString().substring(0, 40)
    }
    if ("object" != typeof d) {
        return d
    }
    if (d instanceof Date) {
        var e = new Date();
        e.setTime(d.getTime());
        return e
    }
    if (d instanceof Array) {
        b.seen.push(d);
        var e = [];
        for (var c = 0; c < d.length; c++) {
            e[c] = clone(d[c], b)
        }
        return e
    }
    if (d instanceof Object) {
        b.seen.push(d);
        var e = {};
        for (var a in d) {
            if (d.hasOwnProperty(a)) {
                if (b.seen.indexOf(d[a]) !== -1) {
                    e[a] = "circular_attribute[clone]";
                    continue
                }
                e[a] = clone(d[a], b)
            }
        }
        return e
    }
    throw "type not supported"
}
function safe_stringify(d, b) {
    var a = [];
    try {
        return JSON.stringify(d, function(e, f) {
            if (f != null && typeof f == "object") {
                if (a.indexOf(f) >= 0) {
                    return
                }
                a.push(f)
            }
            return f
        }, b)
    } catch (c) {
        return "safe_stringify_exception"
    }
}
function smart_eval(code, args) {
    if (!code) {
        return
    }
    if (args && !is_array(args)) {
        args = [args]
    }
    if (is_function(code)) {
        if (args) {
            code.apply(this, clone(args))
        } else {
            code()
        }
    } else {
        if (is_string(code)) {
            eval(code)
        }
    }
}
function is_substr(d, c) {
    if (is_array(c)) {
        for (var f = 0; f < c.length; f++) {
            try {
                if (d && d.toLowerCase().indexOf(c[f].toLowerCase()) != -1) {
                    return true
                }
            } catch (g) {}
        }
    } else {
        try {
            if (d && d.toLowerCase().indexOf(c.toLowerCase()) != -1) {
                return true
            }
        } catch (g) {}
    }
    return false
}
function seed0() {
    return parseInt((new Date()).getMinutes() / 10)
}
function seed1() {
    return parseInt((new Date()).getSeconds() / 10)
}
function to_title(a) {
    return a.replace(/\w\S*/g, function(b) {
        return b.charAt(0).toUpperCase() + b.substr(1).toLowerCase()
    })
}
function ascending_comp(d, c) {
    return d - c
}
function delete_indices(c, a) {
    a.sort(ascending_comp);
    for (var b = a.length - 1; b >= 0; b--) {
        c.splice(a[b], 1)
    }
}
function array_delete(c, a) {
    var b = c.indexOf(a);
    if (b > -1) {
        c.splice(b, 1)
    }
}
function in_arr(b, d) {
    if (is_array(b)) {
        for (var a = 0; a < b.length; a++) {
            for (var c in d) {
                if (b[a] === d[c]) {
                    return true
                }
            }
        }
    }
    for (var c in d) {
        if (b === d[c]) {
            return true
        }
    }
    return false
}
function in_arrD2(c, a) {
    for (var b = 0; b < a.length; b++) {
        if (c[0] == a[b][0] && c[1] == a[b][1]) {
            return true
        }
    }
    return false
}
function c_round(a) {
    if (floor_xy) {
        return Math.floor(a)
    }
    if (!round_xy) {
        return a
    }
    return Math.round(a)
}
function round(a) {
    return Math.round(a)
}
function sq(a) {
    return a * a
}
function sqrt(a) {
    return Math.sqrt(a)
}
function floor(a) {
    return Math.floor(a)
}
function ceil(a) {
    return Math.ceil(a)
}
function eps_equal(d, c) {
    return Math.abs(d - c) < 5 * EPS
}
function abs(a) {
    return Math.abs(a)
}
function min(d, c) {
    return Math.min(d, c)
}
function max(d, c) {
    return Math.max(d, c)
}
function shuffle(c) {
    var d, b, e;
    for (e = c.length; e; e--) {
        d = Math.floor(Math.random() * e);
        b = c[e - 1];
        c[e - 1] = c[d];
        c[d] = b
    }
    return c
}
function randomStr(a) {
    var e = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
        , c = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var f = "";
    for (var d = 0; d < a; d++) {
        if (d == 0) {
            var b = Math.floor(Math.random() * c.length);
            f += c.substring(b, b + 1)
        } else {
            var b = Math.floor(Math.random() * e.length);
            f += e.substring(b, b + 1)
        }
    }
    return f
}
String.prototype.replace_all = function(c, a) {
    var b = this;
    return b.replace(new RegExp(c.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),"g"), a)
}
;
function html_escape(a) {
    var d = a;
    var b = [[/&/g, "&amp;"], [/</g, "&lt;"], [/>/g, "&gt;"], [/"/g, "&quot;"]];
    for (var c in b) {
        d = d.replace(b[c][0], b[c][1])
    }
    return d
}
function he(a) {
    return html_escape(a)
}
function future_ms(a) {
    var b = new Date();
    b.setMilliseconds(b.getMilliseconds() + a);
    return b
}
function future_s(a) {
    var b = new Date();
    b.setSeconds(b.getSeconds() + a);
    return b
}
function mssince(a, b) {
    if (!b) {
        b = new Date()
    }
    return b.getTime() - a.getTime()
}
function ssince(a, b) {
    return mssince(a, b) / 1000
}
function msince(a, b) {
    return mssince(a, b) / 60000
}
function hsince(a, b) {
    return mssince(a, b) / 3600000
}
function randomStr(a) {
    var e = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz"
        , c = "ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var f = "";
    for (var d = 0; d < a; d++) {
        if (d == 0) {
            var b = Math.floor(Math.random() * c.length);
            f += c.substring(b, b + 1)
        } else {
            var b = Math.floor(Math.random() * e.length);
            f += e.substring(b, b + 1)
        }
    }
    return f
}
function rough_size(d) {
    var c = [];
    var a = [d];
    var b = 0;
    while (a.length) {
        var f = a.pop();
        if (typeof f === "boolean") {
            b += 4
        } else {
            if (typeof f === "string") {
                b += f.length * 2
            } else {
                if (typeof f === "number") {
                    b += 8
                } else {
                    if (typeof f === "object" && c.indexOf(f) === -1) {
                        c.push(f);
                        for (var e in f) {
                            a.push(f[e])
                        }
                    }
                }
            }
        }
    }
    return b
};