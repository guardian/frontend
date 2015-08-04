class Memory {
    constructor(location) {
        this.location = location;
    }

    getItem(defaultValue) {
        var inMemory, location = this.location;
        try {
            inMemory = localStorage.getItem(location);
        } catch (ex) {/**/}

        if (!inMemory) {
            return defaultValue;
        }

        try {
            inMemory = JSON.parse(inMemory);
        } catch (ex) {
            localStorage.removeItem(location);
            return defaultValue;
        }

        return inMemory;
    }

    setItem(item) {
        try {
            localStorage.setItem(this.location, JSON.stringify(item));
        } catch (ex) {/**/}
    }
}

function bind(location) {
    return new Memory(location);
}

export {
    bind
};
