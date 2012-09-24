define(['common'], function (common) {

        var options = {
            'storagePrefix': 'gu.prefs.',
            'store': localStorage,
            'location': document.location
        };

        options.qs = (options.location.search.substr(1) + '&' + options.location.hash.substr(1)).split('&');

        var model = {

            setPreferences: function () {
                for (var i = 0, j = options.qs.length; i<j; ++i) {
                    var m = options.qs[i].match(/^gu\.prefs\.(.*)=(.*)$/);
                    if (m) {
                        key = m[1];
                        switch (m[2]) {
                            case "0":
                                model.remove(key);
                                break;
                            case "1":
                                model.set(key, m[2]);
                                break;
                            default:
                        }
                    }
                }
            },

            set: function (name, value) {
                options.store[options.storagePrefix + name] = value;
            },

            remove: function (name) {
                options.store.removeItem(options.storagePrefix + name);
            },
            
            get: function (name) {
                return options.store[options.storagePrefix + name];
            },

            exists: function (name) {
                return (get(name) !== undefined);
            }
        };

        // can't use common.mediator here because it doesn't exist at call time
        this.init = function (mediator) {
            model.setPreferences();
            mediator.on('gu:prefs:get', model.get);
            mediator.on('gu:prefs:set', model.set);
            mediator.on('gu:prefs:remove', model.remove);
            mediator.on('gu:prefs:exists', model.exists);
        };

        return {
            'init': init,
            'get': model.get,
            'exists': model.exists
        };
        
});