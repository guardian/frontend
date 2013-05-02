/*
    Module: storage.js
    Description: Wrapper around localStorage functionality
*/
define(['common'], function (common) {
    
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
                common.mediator.emit('module:error', 'Unable to save to local storage: ' + e.message, 'modules/storage.js');
                return false;
            }
        },
        
        set: function(key, data) {
            var type = typeof data;
            // handle object data
            if (type === 'object') {
                data = JSON.stringify(data);
            }
            var dataWithType = data + '|' + type;
            if (!storage.isAvailable(dataWithType)) {
                return false;
            }
            return w.localStorage.setItem(key, dataWithType);
        },
        
        get: function(key) {
            var dataWithType = w.localStorage.getItem(key);
            if (dataWithType === null) {
                return null;
            }
            
            // what's its type
            var typeLastIndex = dataWithType.lastIndexOf('|'),
                data, type;
            // migration code, can be deleted eventually
            if (typeLastIndex === -1) {
                data = dataWithType,
                type = storage._migrate(key, data);
            } else {
                data = dataWithType.substring(0, typeLastIndex),
                type = dataWithType.substring(typeLastIndex + 1);
                // fix bug(s)
                if (type === 'type' || ((key === 'gu.prefs.ab.participation' || key === 'gu.prefs.ab.current') && type === 'string')) {
                    type = storage._migrate(key, data);
                }
            }
            
            switch (type) {
                case 'object':
                    return JSON.parse(data);
                case 'boolean':
                    return (data === 'true') ? true : false;
                case 'number':
                    return parseFloat(data, 10);
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
        },
        
        _migrate: function(key, data) {
            var type = 'string';
            switch (key) {
                case 'gu.ads.audsci':
                case 'gu.prefs.ab.participation':
                case 'gu.prefs.ab.current':
                    type = 'object';
                    break;
                case 'gu.prefs.switch.shared-wisdom-toolbar':
                case 'gu.prefs.switch.showErrors':
                    type = 'boolean';
                    break;
            }
            w.localStorage.removeItem(key);
            w.localStorage.setItem(key, data + '|' + type);
            return type;
        }
            
    };
    
    return storage;

});
