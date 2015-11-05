/*eslint-disable consistent-return*/
/*
 Module: storage.js
 Description: Wrapper around localStorage functionality
 */
define([
    'common/utils/_',
    'lodash/objects/isUndefined'
], function (
    _,
    isUndefined) {

    var w = window,
        Storage = function (type) {
            this.type = type;
        },
        isAvailable;

    Storage.prototype.setWindow = function (window) {
        w = window;
    };

    Storage.prototype.isStorageAvailable = function (refresh) {
        if (isUndefined(isAvailable) || refresh) {
            isAvailable = this.isAvailable();
        }
        return isAvailable;
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
        if (this.isStorageAvailable()) {
            if (!w[this.type]) {
                return;
            }
            var opts = options || {},
                value = JSON.stringify({
                    value: data,
                    expires: opts.expires
                });
            if (!this.isAvailable(value)) {
                return false;
            }
            return w[this.type].setItem(key, value);
        }
    };

    Storage.prototype.get = function (key) {
        if (this.isStorageAvailable()) {
            var data,
                dataParsed;
            if (!w[this.type]) {
                return;
            }
            data = w[this.type].getItem(key);
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
                this.remove(key);
                return null;
            }

            return dataParsed.value;
        }
    };

    /**
     * Retrieve a value from storage without parsing as JSON
     *
     * @param  {String} key
     * @return {String} value
     */
    Storage.prototype.getRaw = function (key) {
        if (this.isStorageAvailable()) {
            return w[this.type].getItem(key);
        }
    };

    Storage.prototype.remove = function (key) {
        if (this.isStorageAvailable()) {
            return w[this.type].removeItem(key);
        }
    };

    Storage.prototype.removeAll = function () {
        if (this.isStorageAvailable()) {
            return w[this.type].clear();
        }
    };

    Storage.prototype.length = function () {
        if (this.isStorageAvailable()) {
            return w[this.type].length;
        }
    };

    Storage.prototype.getKey = function (i) {
        if (this.isStorageAvailable()) {
            return w[this.type].key(i);
        }
    };

    Storage.prototype.clearByPrefix = function (prefix) {
        if (this.isStorageAvailable()) {
            // Loop in reverse because storage indexes will change as you delete items.
            var i,
                name;
            for (i = this.length() - 1; i > -1; --i) {
                name = this.getKey(i);
                if (name.indexOf(prefix) === 0) {
                    this.remove(name);
                }
            }
        }
    };

    return {
        local: new Storage('localStorage'),
        session: new Storage('sessionStorage')
    };

});
