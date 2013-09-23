define([
    'EventEmitter',
    'knockout'
], function(
    EventEmitter,
    ko
) {
    return {
        config: {
            searchPageSize:        20,
            maxDisplayableLists:   20,
            ophanCallsPerSecond:   4,     // n.b. times number of blocks
            collectionsPollMs:     10000, // 10 seconds
            latestArticlesPollMs:  10000, // 10 seconds
            cacheExpiryMs:         60000, // 1 min
            defaultToLiveMode:     true,
            sectionSearches: {
                "default": "news|uk|uk-news|world",
                "culture": "culture|film|music|books|artanddesign|tv-and-radio|stage"
            },

            apiBase:               '/fronts',
            apiSearchBase:         '/api/proxy/search'
        },

        state: {},

        util: {
            mediator: new EventEmitter(),

            hasNestedProperty: function (obj, path) {
                if(obj.hasOwnProperty(path[0])) {
                    return path.length === 1 ? true : this.hasNestedProperty(obj[path[0]], _.rest(path));
                }
                return false;
            },

            ammendedQueryStr: function(key, val) {
                var qp = this.queryParams();
                qp[key] = val;
                return _.pairs(qp)
                    .filter(function(p){ return !!p[0]; })
                    .map(function(p){ return p[0] + (p[1] ? '=' + p[1] : ''); })
                    .join('&');
            },

            parseQueryParams: function(url) {
                return _.object(this.urlQuery(url).split('&').map(function(keyVal){
                    return keyVal.split('=').map(function(s){
                        return decodeURIComponent(s);
                    });
                }));
            },

            queryParams: function() {
                return this.parseQueryParams(window.location.search);
            },

            urlQuery: function(url) {
                var a;
                if(typeof url !== 'string') { return; }
                a = document.createElement('a');
                a.href = url;
                return a.search.slice(1);
            },

            urlAbsPath: function(url) {
                var a, path;
                if(typeof url !== 'string') { return; }
                a = document.createElement('a');
                a.href = url;
                path = a.pathname;
                return path.indexOf('/') === 0 ? path.substr(1) : path; // because IE doesn't return a leading '/'
            },

            urlHost: function(url) {
                var a;
                if(typeof url !== 'string') { return; }
                a = document.createElement('a');
                a.href = url;
                return a.hostname;
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
            }
        }

    };
});
