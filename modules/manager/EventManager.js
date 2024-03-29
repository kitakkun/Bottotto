module.exports.EventManager = class EventManager {

    queue = [];

    constructor() {
    }

    reset() {
        this.queue = [];
    }

    push(params) {
        this.queue.push(params);
    }

    pop() {
        return this.queue.pop();
    }

    hasEvent() {
        return this.queue.length > 0;
    }

}