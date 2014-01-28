define(['knockout'], function(ko) {
    return {
        CONST: {
            viewer: 'http://s3-eu-west-1.amazonaws.com/facia/responsive-viewer.html',
            filterTypes: {
                section: { display: 'in section:', param: "section", path: "sections", placeholder: "e.g. news" },
                tag:     { display: 'with tag:',   param: "tag",     path: "tags",     placeholder: "e.g. sport/triathlon" }
            },
            searchPageSize:        50,

            pvmHot:                50,    // pageviews-per-min to qualify as 'hot'
            pvmWarm:               25,    // pageviews-per-min to qualify as 'warm'
            pvmPeriod:             5,     // num of recent datapoints over which to calc pageviews

            ophanCallsPerSecond:   4,     // n.b. times number of blocks
            collectionsPollMs:     10000,
            latestArticlesPollMs:  30000,
            cacheExpiryMs:         60000,

            sparksRefreshMs:       60000, // 1 min
            sparksBase:            'http://sparklines.ophan.co.uk/png?graphs=other:09f,google:090,guardian:009&showStats=1&showHours=1&width=100&height=40&page=/',
            sparksBaseFront:       'http://sparklines.ophan.co.uk/png?graphs=other:09f,google:090,guardian:009&showStats=1&width=100&height=35&hotLevel=250&page=/',

            apiBase:               '',
            apiSearchBase:         '/api/proxy'
        },

        state: {
            liveMode: ko.observable(false) // default to live mode?
        }
    };
});
