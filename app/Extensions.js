module.exports = (gameContext, runnerContext) => {
    return {
        shutdown: () => process.exit(0),
        relog: this.shutdown,
        send_cm: (receiver, data) => {
            process.send({type: "cm", data: {receiver: receiver, data: data}});
        }
    }
}