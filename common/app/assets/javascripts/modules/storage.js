/*
    Module: storage.js
    Description: Wrapper around localStorage functionality
*/
define([], function () {
    
    var w = window;
    
    var storage = {
            
        _setWindow: function(window) {
            w = window;
        },
            
        isAvailable: function() {
            try {
                // to fully test, need to set item
                // http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue#answer-12976988
                var testKey = 'local-storage-module-test';
                w.localStorage.setItem(testKey, 'test');
                w.localStorage.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        set: function(key, data) {
            if (!storage.isAvailable) {
                return false;
            }
            var type = typeof data;
            // handle object data
            if (type === 'object') {
                data = JSON.stringify(data);
            }
            return w.localStorage.setItem(key, data + '|' + type);
        },
        
        get: function(key) {
            var dataWithType = w.localStorage.getItem(key);
            if (dataWithType === null) {
                return null;
            }
            
            // what's its type
            var typeLastIndex = dataWithType.lastIndexOf('|'),
                data = dataWithType.substring(0, typeLastIndex),
                type = dataWithType.substring(typeLastIndex + 1);
            
            switch (type) {
                case 'object':
                    return JSON.parse(data);
                case 'boolean':
                    return (data === 'true') ? true : false;
                case 'number':
                    return parseInt(data, 10);
                default:
                    return data;
            }
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
        }
            
    };
    
    return storage;

});
