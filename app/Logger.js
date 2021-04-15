class Logger {
    constructor() {
        this.prefixString = "";
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
                case "serverRegion":
                    return this.serverRegion;
                case "serverIdentifier":
                    return this.serverIdentifier;
                case "runScript":
                    return this.runScript;
                case "h":
                    const h = time.getHours();
                    return (h < 10) ? '0' + h : h;
                case "m":
                    const m = time.getMinutes();
                    return (m < 10) ? '0' + m : m;
                case "s":
                    const s = time.getSeconds();
                    return (s < 10) ? '0' + s : s;
                default:
                    return "";
            }
        })
    }
}

module.exports = new Logger();