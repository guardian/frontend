/*
    Module: storage.js
    Description: Wrapper around localStorage functionality
*/
define(['utils/mediator'], function (mediator) {
    
    var w = window;
    
    var storage = {
            
        _setWindow: function(window) {
            w = window;
        },
            
        isAvailable: function(data) {
            var testKey = 'local-storage-module-test',
                d = data || 'test';
            try {
                // to fully test, need to set item
                // http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue#answer-12976988
                w.localStorage.setItem(testKey, d);
                w.localStorage.removeItem(testKey);
                return true;
            } catch (e) {
                mediator.emit('module:error', 'Unable to save to local storage: ' + e.message, 'modules/storage.js');
                return false;
            }
        },
        
        /**
         * @param {String}  key
         * @param {Any}     data
         * @param {Object} [options]
         *     {Date} expires - When should the storage expire
         */
        set: function(key, data, options) {
            var opts = options || {},
                value = JSON.stringify({
                    'value': data,
                    'expires': opts.expires
                });
            if (!storage.isAvailable(value)) {
                return false;
            }
            return w.localStorage.setItem(key, value);
        },
        
        get: function(key) {
            var data = w.localStorage.getItem(key);
            if (data === null) {
                return null;
            }
            
            // try and parse the data
            var dataParsed;
            try{
                dataParsed = JSON.parse(data);
            } catch (e) {
                // remove the key
                storage.remove(key);
                return null;
            }
            
            // has it expired?
            if (dataParsed.expires && new Date() > new Date(dataParsed.expires)) {
                storage.remove(key);
                return null;
            }

            return dataParsed.value;
        },
        
        remove: function(key) {
            return w.localStorage.removeItem(key);
        },
        
        removeAll: function() {
            return w.localStorage.clear();
        },
        
        length: function() {
            return w.localStorage.length;
        },
        
        getKey: function(i) {
            return w.localStorage.key(i);
        },

        clearByPrefix: function(prefix) {
            // Loop in reverse because storage indexes will change as you delete items.
            for (var i = storage.length() - 1; i > -1; --i) {
                var name = storage.getKey(i);
                if (name.indexOf(prefix) === 0) {
                    storage.remove(name);
                }
            }
        }
            
    };
    
    return storage;

});
