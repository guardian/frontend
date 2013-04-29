/*
    Module: local-storage.js
    Description: Wrapper around localStorage functionality
*/
define([], function () {
    
    var localStorage = {
            
        isAvailable: function() {
            try {
                // to fully test, need to set item
                // http://stackoverflow.com/questions/9077101/iphone-localstorage-quota-exceeded-err-issue#answer-12976988
                var testKey = 'local-storage-module-test';
                window.setItem(testKey, 'test');
                window.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        set: function(key, data) {
            if (!localStorage.isAvailable) {
                return false;
            }
            var type = typeof data;
            // handle object data
            if (type === 'object') {
                data = JSON.stringify(data);
            }
            return window.localStorage.setItem(key, data + '|' + type);
        },
        
        get: function(key) {
            var dataWithType = window.localStorage.getItem(key),
                // what's its type
                typeLastIndex = dataWithType.lastIndexOf('|'),
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
            return window.localStorage.removeItem(key);
        },
        
        clear: function() {
            return window.localStorage.clear();
        },
            
    };
    
    return localStorage;

});
