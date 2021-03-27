class EventSystem {

    constructor() {
        this.listeners = new Map();
    }

    on(eventName, callback) {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).push(callback);
        } else {
            this.listeners.set(eventName, [callback]);
        }
    }

    async emit(eventName, data) {
        const listeners = this.listeners.get(eventName);
        if (!listeners) {
            return;
        }

        for (const listener of listeners) {
            try {
                await listener(data);
            } catch (e) {
                console.error(e);
            }
        }
    }

    remove(eventName, callback) {
        const listeners = this.listeners.get(eventName);
        const i = listeners.indexOf(callback);
        listeners.splice(i, 1);
    }
}

module.exports = EventSystem;