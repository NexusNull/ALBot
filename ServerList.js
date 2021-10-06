sleep = async function (num) {
    return new Promise(function (resolve) {
        setTimeout(resolve, num);
    });
};

class ServerList {
    constructor(httpWrapper) {
        this.httpWrapper = httpWrapper;
        this.lastUpdate = 0;
        this.serverList = [];
    }

    async getServerInfo(serverIdentifier) {
        await this.updateServerList();
        let [region, name] = serverIdentifier.split(" ");
        for (let server of this.serverList) {
            if (region === server.region && name === server.name) {
                return server;
            }
        }
    }

    async updateServerList() {
        if (this.lastUpdate < (new Date().getTime()) - 60 * 1000) {
            let data;
            do {
                try {
                    data = await this.httpWrapper.getServersAndCharacters();
                } catch (e) {
                    console.log(e);
                    await sleep(15000);
                }
            } while (!data);
            this.serverList = data.servers
            this.lastUpdate = new Date().getTime();
        }
    }
}

module.exports = ServerList;