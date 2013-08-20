define([
    'EventEmitter',
    'knockout'
], function(
    EventEmitter,
    ko
) {
    var _listsContainerID = '#trailblocks',
        _masonryEl;

    return {
        config: {
            searchPageSize:        20,
            maxDisplayableLists:   6,
            maxOphanCallsPerBlock: 10,
            cacheExpiryMs:         300000, // 300000 = five mins 
            defaultToLiveMode:     true,

            apiBase:               '/fronts/api',
            apiSearchBase:         '/api/proxy/search'
        },

        state: {},

        util: {
            mediator: new EventEmitter(),

            queryParams: function() {
                return _.object(window.location.search.substring(1).split('&').map(function(keyVal){
                    return keyVal.split('=').map(function(s){
                        return decodeURIComponent(s);
                    });
                }));
            },

            urlAbsPath: function(url) {
                if(typeof url !== 'string') { return; }

                var a = document.createElement('a');
                a.href = url;
                a = a.pathname + a.search + a.hash;
                a = a.indexOf('/') === 0 ? a : '/' + a; // because IE doesn't return a leading '/'
                return a;
            },

            fullTrim: function(str){
                return str ? str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ') : undefined;
            },

            numberWithCommas: function(x) {
                var pattern = /(-?\d+)(\d{3})/;

                if(typeof x === 'undefined') { return ''; }

                x = x.toString();
                while (pattern.test(x))
                    x = x.replace(pattern, "$1,$2");
                return x;
            },

            asObservableProps: function(props) {
                return _.object(props.map(function(prop){
                    return [prop, ko.observable()];
                }));
            },

            populateObservables: function(target, opts) {
                if (!_.isObject(target) || !_.isObject(opts)) { return; };
                _.keys(target).forEach(function(key){
                    target[key](opts[key]);
                });
            },

            pageReflow: function() {
                if(_masonryEl) {
                    _masonryEl.masonry('destroy');
                } else {
                    _masonryEl = $(_listsContainerID);
                }
                _masonryEl.masonry();
            }
        }

    };
});
