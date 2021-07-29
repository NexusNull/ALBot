var inside = "login";
var user_id = "", user_auth = "";
var base_url = "https://adventure.land";
var server_addr = "", server_port = "";
var server_names = {"US": "Americas", "EU": "Europas", "ASIA": "Eastlands"};
var sound_music = '', sound_sfx = '', xmas_tunes = false, music_level = 0.3;
var perfect_pixels = '1';
var screenshot_mode = '';
var pro_mode = '1';
var tutorial_ui = '1';
var new_attacks = '1';
var recording_mode = '';
var cached_map = '1', scale = '2';
var d_lines = '1';
var sd_lines = '1';
var is_sdk = '';
var is_electron = '', electron_data = {};
var is_comm = false;
var no_eval = false;
var VERSION = '';
var platform = 'web';
var engine_mode = '';
var no_graphics = '1';
var border_mode = ''; // use after adding a new monster
var no_html = 'bot';
var is_bot = '1';
var is_cli = '', harakiri = '';
var explicit_slot = '';
var is_mobile = false;
var is_bold = false;
var c_enabled = '1', stripe_enabled = '';
var auto_reload = "auto", reload_times = '0', character_to_load = '', mstand_to_load = null;
// It's pretty complicated but there are 2 persistence, auto login routines, the above one is the first, the below one is the second, second one uses the URL data
var url_ip = '', url_port = '', url_character = '';
var update_notes = [];
var server_regions = {"US": "Americas", "EU": "Europas", "ASIA": "Eastlands"};
var X = {};

function payment_logic() {
};


if (!is_sdk) {
    for (var f in log_flags) log_flags[f] = 0;
}

X.servers = [{
    "name": "I",
    "region": "EU",
    "players": 10,
    "key": "EUI",
    "port": 2053,
    "addr": "eu1.adventure.land"
}, {
    "name": "II",
    "region": "EU",
    "players": 23,
    "key": "EUII",
    "port": 2083,
    "addr": "eu2.adventure.land"
}, {
    "name": "PVP",
    "region": "EU",
    "players": 3,
    "key": "EUPVP",
    "port": 2087,
    "addr": "eupvp.adventure.land"
}, {
    "name": "I",
    "region": "US",
    "players": 18,
    "key": "USI",
    "port": 2053,
    "addr": "us1.adventure.land"
}, {
    "name": "II",
    "region": "US",
    "players": 10,
    "key": "USII",
    "port": 2083,
    "addr": "us2.adventure.land"
}, {
    "name": "III",
    "region": "US",
    "players": 51,
    "key": "USIII",
    "port": 2053,
    "addr": "us3.adventure.land"
}, {
    "name": "PVP",
    "region": "US",
    "players": 14,
    "key": "USPVP",
    "port": 2087,
    "addr": "uspvp.adventure.land"
}, {"name": "I", "region": "ASIA", "players": 12, "key": "ASIAI", "port": 2053, "addr": "asia1.adventure.land"}];
X.characters = [];
X.tutorial = {"step": 0, "completed": []};
X.unread = 0;
X.codes = {}

code_logic();