define(function () {
    function Memory (location) {
        this.location = location;
    }

    Memory.prototype.getItem = function (defaultValue) {
        var inMemory, location = this.location;
        try {
            inMemory = localStorage.getItem(location);
        } catch (ex) {}

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
    };

    Memory.prototype.setItem = function (item) {
        try {
            localStorage.setItem(this.location, JSON.stringify(item));
        } catch (ex) {}
    };

    return {
        bind: function (location) {
            return new Memory(location);
        }
    };
});
