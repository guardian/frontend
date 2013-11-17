/*
    Module: storage.js
    Description: Wrapper around localStorage functionality
*/
define([
    'utils/mediator'
], function (
    mediator
) {
    
    var w = window;
    
    var Storage = function(type) {
        this.type = type;
    };
    
    Storage.prototype.setWindow = function(window) {
        w = window;
    };
            
    Storage.prototype.isAvailable = function(data) {
        var testKey = 'local-storage-module-test',
            d = data || 'test';
        try {
            // to fully test, need to set item
            // http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue#answer-12976988
            w[this.type].setItem(testKey, d);
            w[this.type].removeItem(testKey);
            return true;
        } catch (e) {
            mediator.emit('module:error', 'Unable to save to local storage: ' + e.message, 'utils/storage.js');
            return false;
        }
    };
    
    /**
     * @param {String}  key
     * @param {Any}     data
     * @param {Object} [options]
     *     {Date} expires - When should the storage expire
     */
    Storage.prototype.set = function(key, data, options) {
        var opts = options || {},
            value = JSON.stringify({
                'value': data,
                'expires': opts.expires
            });
        if (!this.isAvailable(value)) {
            return false;
        }
        return w[this.type].setItem(key, value);
    };
        
    Storage.prototype.get = function(key) {
        var data = w[this.type].getItem(key);
        if (data === null) {
            return null;
        }
        
        // try and parse the data
        var dataParsed;
        try{
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
    };
        
    Storage.prototype.remove = function(key) {
        return w[this.type].removeItem(key);
    };
        
    Storage.prototype.removeAll = function() {
        return w[this.type].clear();
    };
    
    Storage.prototype.length = function() {
        return w[this.type].length;
    };
    
    Storage.prototype.getKey = function(i) {
        return w[this.type].key(i);
    };

    Storage.prototype.clearByPrefix = function(prefix) {
        // Loop in reverse because storage indexes will change as you delete items.
        for (var i = this.length() - 1; i > -1; --i) {
            var name = this.getKey(i);
            if (name.indexOf(prefix) === 0) {
                this.remove(name);
            }
        }
    };
    
    return {
        local: new Storage('localStorage'),
        session: new Storage('sessionStorage')
    };

});
