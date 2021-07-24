const config = {
    position: {map: "level1", x: -296, y: 558},
    targetMonster: "prat",
    group: ["NexusNull", "Clover", "Arcus", "Emerald"]
}


setInterval(function () {
    if (character.name === config.group[0]) {
        for (let i = 1; i < config.group.length; i++) {
            let name = config.group[i];
            send_party_invite(name);
        }
    } else {
        if (character.party) {
            if (character.party !== config.group[0]) {
                parent.socket.emit("party", {event: "leave"})
            }
        } else {
            send_party_request(config.group[0]);
        }
    }
}, 1000 * 10);


function on_party_request(name) {
    console.log("Party Request");
    if (config.group.indexOf(name) !== -1) {
        accept_party_request(name);
    }
}

function on_party_invite(name) {
    console.log("Party Invite");
    if (config.group.indexOf(name) !== -1) {
        accept_party_invite(name);
    }
}


class StateManager {
    constructor() {
        this.states = {
            Attacking: new AttackingState(),
            Positioning: new PositioningState(),
            Reviving: new RevivingState(),
            Evade: new EvadeState(),
        }
        this.activeState = this.states.Positioning;
        this.activeState.enterState();

        setTimeout(() => {
            if (character.rip) {
                this.nextState(this.states)
            }
        }, 10000)
        setInterval(buyPotions, 10000);
    }

    nextState(state) {
        this.activeState.exitState();
        state.enterState();
        this.activeState = state;
    }
}

class EvadeState {
    constructor() {
        this.intervals = [];
        this.timeouts = [];
    }

    enterState() {
        this.intervals.push(setInterval(potionLogic, 250));
        parent.socket.emit("transport", {to: "level2", s: 1})//in
        this.timeouts.push(setTimeout(() => {
            parent.socket.emit("transport", {to: "level1", s: 4})//out
            this.timeouts.push(setTimeout(() => {
                move(config.position.x, config.position.y)
                stateManager.nextState(stateManager.states.Attacking);
            }, 200))
        }, 1000));
    }

    exitState() {
        for (let timeout of this.timeouts)
            clearTimeout(timeout);
        for (let interval of this.intervals)
            clearInterval(interval);
    }
}

class AttackingState {
    constructor() {
        this.intervals = [];
        this.timeouts = [];
    }

    enterState() {
        this.intervals.push(setInterval(potionLogic, 250));
        this.intervals.push(setInterval(() => {
            for (let id in parent.entities) {
                let entity = parent.entities[id];
                if (entity.mtype === "prat") {
                    if (simple_distance(character, entity) < 50) {
                        stateManager.nextState(stateManager.states.Evade)
                    }
                }
            }
        }, 250));
        this.intervals.push(setInterval(() => {
            let groupTargets = getTargets({type: config.targetMonster, group: config.group});
            let newTargets = getTargets({type: config.targetMonster, no_target: true,});
            groupTargets = groupTargets.concat(newTargets);

            loot();
            if (can_attack(groupTargets[0])) {
                if (character.mp < 300)
                    attack([groupTargets[0]]);
                else if (character.mp < 420) {
                    if (groupTargets.length == 1)
                        attack([groupTargets[0]]);
                    else if (groupTargets.length == 2)
                        attack([groupTargets[0], groupTargets[1]]);
                    else if (groupTargets.length == 3)
                        attack([groupTargets[0], groupTargets[1], groupTargets[2]]);
                } else
                    attack(groupTargets);
            }
        }, 250));

    }

    exitState() {
        for (let timeout of this.timeouts)
            clearTimeout(timeout);
        for (let interval of this.intervals)
            clearInterval(interval);
    }
}

class RevivingState {
    constructor() {
        this.intervals = [];
        this.timeouts = [];
    }

    enterState() {
        this.timeouts.push(setTimeout(() => {
            respawn();
            this.timeouts.push(setTimeout(() => {
                stateManager.nextState(stateManager.states.Positioning)
            }, 1000));
        }, 12000));
    }

    exitState() {
        for (let timeout of this.timeouts)
            clearTimeout(timeout);
        for (let interval of this.intervals)
            clearInterval(interval);
    }
}

class PositioningState {
    constructor() {
        this.intervals = [];
        this.timeouts = [];

    }

    enterState() {
        this.intervals.push(setInterval(potionLogic, 250));
        smart_move(config.position, () => {
            move(config.position.x, config.position.y)
            stateManager.nextState(stateManager.states.Attacking);
        });
    }

    exitState() {
        smart.moving = false;
        move(character.real_x, character.real_y)
        for (let timeout of this.timeouts)
            clearTimeout(timeout);
        for (let interval of this.intervals)
            clearInterval(interval);
    }
}

let stateManager = new StateManager();

function attack(targets) {
    if (Array.isArray(targets)) {
        for (let i in targets) {
            let current = targets[i];
            if (distance(character, current) > character.range) {
                targets = targets.slice(0, i);
                break;
            }
        }

        if (targets.length > 3) {
            let ids = [];
            targets.forEach(function (entity) {
                ids.push(entity.id);
            });
            parent.socket.emit("skill", {
                name: "5shot",
                ids: ids
            })
        } else if (targets.length <= 3 && targets.length > 1) {
            let ids = [];
            targets.forEach(function (entity) {
                ids.push(entity.id);
            });
            parent.socket.emit("skill", {
                name: "3shot",
                ids: ids
            })
        } else if (targets.length == 1) {
            let ids = [];
            parent.socket.emit("attack", {
                id: targets[0].id
            })
        }
    } else {
        parent.socket.emit("attack", {
            id: targets.id
        })
    }
}

function getTargets(args) {
    var targets = [];

    if (!args) args = {};
    if (args.target && args.target.name) args.target = args.target.name;

    for (let id in parent.entities) {

        var current = parent.entities[id];
        if (current.type != "monster" || current.dead) continue;
        if (args.type && current.mtype != args.type) continue;
        if (args.min_xp && current.xp < args.min_xp) continue;
        if (args.max_att && current.attack > args.max_att) continue;
        if (args.target && current.target != args.target) continue;
        if (args.no_target && current.target) continue;
        if (args.group && Array.isArray(args.group) && args.group.indexOf(current.target) === -1) continue;
        if (args.path_check && !can_move_to(current)) continue;
        if (args.no_last_hit && current.hp < character.attack * 1.3) continue;
        targets.push(current);
    }

    targets.sort(function (a, b) {
        return distance(a, character) - distance(b, character);
    });
    if (args.amount) {
        return targets.slice(0, args.amount);
    } else {
        return targets;
    }
}

function potionLogic() {

    if (can_use("use_mp") && character.mp <= 100) { // This prevents the bot from getting stuck trying to heal without attacking
        use("use_mp");
    }

    if (can_use("use_hp") && ((character.hp / character.max_hp <= .50) || (character.max_hp - character.hp > 200))) {
        use("use_hp");
    }

    if (can_use("use_mp") && ((character.mp / character.max_mp <= .50 || (character.max_mp - character.mp > 500)))) {
        use("use_mp");
    }
}

function buyPotions() {
    if (character.items[find("hpot1")].q < 9998)
        buy("hpot1", 9998 - ((find("hpot1") === -1) ? 0 : character.items[find("hpot1")].q));
    if (character.items[find("mpot1")].q < 9998)
        buy("mpot1", 9998 - ((find("mpot1") === -1) ? 0 : character.items[find("mpot1")].q));

    let i = 0;
    let itemBlacklist = ["hpot0", "hpot1", "mpot0", "mpot1", "luckbooster", "goldbooster", "xpbooster", "glitch", "computer", "suckerpunch", "egg0", "egg1", "egg2", "egg3", "egg4", "egg5", "egg6", "egg7", "egg8", "goldenegg", "svenom"];
    for (let i = 0; i < 42; i++) {
        let item = character.items[i];
        if (item && !itemBlacklist.includes(item.name)) {
            sell(i, (item.q) ? item.q : 1);
        }
    }
}

function find(name, level) {
    for (let i in character.items) {
        if (character.items[i] !== null && character.items[i].name === name)
            return i;
    }
    return -1;
}
