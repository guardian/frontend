/*
    Module: storage.js
    Description: Wrapper around localStorage functionality
*/
define(function () {

    var w = window,
        Storage = function (type) {
            this.type = type;
        };

    Storage.prototype.setWindow = function (window) {
        w = window;
    };

    Storage.prototype.isAvailable = function (data) {
        var testKey = 'local-storage-module-test',
            d = data || 'test';
        try {
            // to fully test, need to set item
            // http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue#answer-12976988
            w[this.type].setItem(testKey, d);
            w[this.type].removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    };

    /**
     * @param {String}  key
     * @param {Any}     data
     * @param {Object} [options]
     *     {Date} expires - When should the storage expire
     */
    Storage.prototype.set = function (key, data, options) {
        try {
            if (!w[this.type]) { return; }
            var opts = options || {},
                value = JSON.stringify({
                    value: data,
                    expires: opts.expires
                });
            if (!this.isAvailable(value)) {
                return false;
            }
            return w[this.type].setItem(key, value);
        } catch(e) { }
    };

    Storage.prototype.get = function (key) {
        var data,
            dataParsed;
        try {
            if (!w[this.type]) {
                return;
            }
            data = w[this.type].getItem(key);
        } catch (e) { }
        if (data === null) {
            return null;
        }

        // try and parse the data
        try {
            dataParsed = JSON.parse(data);
        } catch (e) {
            // remove the key
            this.remove(key);
            return null;
        }

        // has it expired?
        if (dataParsed.expires && new Date() > new Date(dataParsed.expires)) {
            try {
                this.remove(key);
                return null;
            } catch(e) { }
        }

        return dataParsed.value;
    };

    Storage.prototype.remove = function (key) {
        try {
            return w[this.type].removeItem(key);
        } catch(e) { }
    };

    Storage.prototype.removeAll = function () {
        try {
            return w[this.type].clear();
        } catch(e) { }
    };

    Storage.prototype.length = function () {
        try {
            return w[this.type].length;
        } catch(e) { }
    };

    Storage.prototype.getKey = function (i) {
        try {
            return w[this.type].key(i);
        } catch(e) { }
    };

    Storage.prototype.clearByPrefix = function (prefix) {
        // Loop in reverse because storage indexes will change as you delete items.
        var i,
            name;
        for (i = this.length() - 1; i > -1; --i) {
            name = this.getKey(i);
            if (name.indexOf(prefix) === 0) {
                try {
                    this.remove(name);
                } catch(e) { }
            }
        }
    };

    return {
        local: new Storage('localStorage'),
        session: new Storage('sessionStorage')
    };

});
