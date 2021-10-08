module.exports = (gameContext, runnerContext) => {
    return {
        shutdown: () => process.exit(0),
        reload: this.shutdown,
        send_cm: (receiver, data) => {
            process.send({type: "cm", data: {receiver: receiver, data: data}});
        },
        switchServer: (server) => {
            process.send({type: "config", data: {type: "switchServer", server: server}});
        }
    }
}