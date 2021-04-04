var reviving = false;
var targetMonster = "crab";
var fighting = false;

if (character.rip) {
    setTimeout(function () {
        respawn();
        setTimeout(function () {
            smart_move(targetMonster, function () {
                fighting = true;
            });
        }, 1000);
    }, 12000);
} else {
    smart_move(targetMonster, function () {
        fighting = true;
    });
}

setInterval(function () {
    if (!fighting) {
        return;
    }

    if (character.rip && !reviving) {
        reviving = true;
        fighting = false;
        var position = {
            x: character.real_x,
            y: character.real_y,
            map: character.map,
        };
        setTimeout(function () {
            respawn();
            setTimeout(function () {
                reviving = false;
                smart_move(position, function () {
                    fighting = true;
                });
            }, 1000)
        }, 12000)
    }

    if (can_use("hp") && (character.hp / character.max_hp <= .50) || (character.max_hp - character.hp > 200)) {
        use("hp");
    }

    if (can_use("mp") && character.mp / character.max_mp <= .50 || (character.max_mp - character.mp > 300)) {
        use("mp");
    }
    loot();


    let target;
    target = get_nearest_monster({type: targetMonster});
    change_target(target);
    if (target) {
        if (can_attack(target)) {
            attack(target);
        } else {
            let dist = Math.sqrt(Math.pow(target.real_x - character.real_x, 2) + Math.pow(target.real_y - character.real_y, 2))
            if (dist > character.range - 20)
                move((target.real_x + character.real_x) / 2, (target.real_y + character.real_y) / 2);
        }
    }
}, 1000 / 4);
