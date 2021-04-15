class Logger {
    constructor() {
        this.prefixString = "{{h}}:{{m}}:{{s}} {{characterName}}: ";
        this.characterName = "";
        this.characterId = "";
        this.runScript = "";
        this.serverRegion = "";
        this.serverIdentifier = "";
    }

    setPrefixString(prefixString) {
        this.prefixString = prefixString;
    }

    set({characterName, characterId, runScript, serverRegion, serverIdentifier}) {
        if (characterName != undefined)
            this.characterName = characterName;
        if (characterId != undefined)
            this.characterId = characterId;
        if (runScript != undefined)
            this.runScript = runScript;
        if (serverRegion != undefined)
            this.serverRegion = serverRegion;
        if (serverIdentifier != undefined)
            this.serverIdentifier = serverIdentifier;
    }

    log(message, color) {
        console.log(this.prefixBuilder() + message);
    }

    prefixBuilder() {
        const time = new Date();
        return this.prefixString.replace(/{{(\w+)}}/g, (fullMatch, group) => {
            switch (group) {
                case "characterName":
                    return this.characterName.slice(0, 10).padEnd(10);
                case "h":
                    return time.getHours();
                case "m":
                    return time.getMinutes();
                case "s":
                    return time.getSeconds();
                default:
                    return "";
            }
        })
    }
}

module.exports = new Logger();