var reviving = false;
var targetMonster = "crab";
var fighting = false;

function find(name, level) {
    for (var i in character.items) {
        if (character.items[i] != null && character.items[i].name == name)
            return i;
    }
    return -1;
}


smart_move(targetMonster, function () {
    fighting = true;
});

setInterval(function () {
    if (!fighting) {
        return;
    }

    if (character.rip && !reviving) {
        reviving = true;
        var position = {
            x: character.real_x,
            y: character.real_y,
            map: character.map,
        };
        setTimeout(function () {
            respawn();
            setTimeout(function () {
                reviving = false;
                smart_move(position);
            }, 1000)
        }, 12000)
    }




    if ( character.esize < 5 || (find("hpot0") === -1 || character.items[find("hpot0")].q < 100) || (find("mpot0") === -1 || character.items[find("mpot0")].q < 100) ) {
        fighting = false;
        smart_move({x: -130, y: -100}, function () {
            buy("hpot0", 9998-((find("hpot0")=== -1)?0:character.items[find("hpot0")].q));
            buy("mpot0", 9998-((find("mpot0")=== -1)?0:character.items[find("mpot0")].q));

            let i = 0;
            let sendTo = "Emerald";
            let itemBlacklist = ["hpot0", "hpot1", "mpot0", "mpot1", "luckbooster", "goldbooster", "xpbooster"]
            let reciever = get_player(sendTo);
            let interval = setInterval(function () {
                if(i >= 42){
                    clearInterval(interval);
                    smart_move(targetMonster,function(){
                        fighting = true;
                    });
                }
                if (reciever && distance(character, reciever) < 200) {
                    let item = character.items[i];
                    if (item && itemBlacklist.indexOf(item.name) === -1) {
                        send_item(sendTo, i, (item.q) ? item.q : 1);
                    }
                }
                i++;
            }, 250);
        });
        return;
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
            move(target.real_x, target.real_y);
        }
    }
}, 1000 / 4);
