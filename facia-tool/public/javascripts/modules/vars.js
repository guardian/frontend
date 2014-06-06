/* global _: true */
define(['knockout'], function(ko) {
    var CONST = {
        editions: ['uk', 'us', 'au'],

        types: [
            {name: 'news', groups: ['standard', 'big', 'very big', 'huge']},
            {name: 'news/auto'},
            {name: 'news/most-popular'},
            {name: 'news/people'},
            {name: 'news/special'},
            {name: 'features'},
            {name: 'features/auto'}, // Behind FeaturesAutoContainerSwitch
            {name: 'features/multimedia'},
            {name: 'comment/comment-and-debate'}
        ],

        detectPressFailureMs: 10000,

        maxFronts: 100,

        imageCdnDomain: 'guim.co.uk',

        viewer: 'http://s3-eu-west-1.amazonaws.com/facia/responsive-viewer.html',

        filterTypes: {
            section: { display: 'in section:', param: 'section', path: 'sections', placeholder: 'e.g. news' },
            tag:     { display: 'with tag:',   param: 'tag',     path: 'tags',     placeholder: 'e.g. sport/triathlon' }
        },

        searchPageSize:        50,

        capiBatchSize:         10,

        collectionsPollMs:     10000,
        latestArticlesPollMs:  20000,
        configSettingsPollMs:  5000,
        cacheExpiryMs:         60000,
        sparksRefreshMs:       300000,
        pubTimeRefreshMs:      30000,

        apiBase:               '',
        apiSearchBase:         '/api/proxy',

        sparksServer:          'http://sparklines.ophan.co.uk',
        sparksParams: {
            graphs: 'other:3279F1,google:65b045,guardian:376ABF',
            showStats: 1,
            showHours: 1,
            width: 100,
            height: 35
        },
        sparksFrontParams: {
            graphs: 'other:3279F1,google:65b045,guardian:376ABF',
            hotLevel: 250,
            showStats: 1,
            width: 100,
            height: 35
        }
    };

    function sparksBaseUrl(args) {
        return CONST.sparksServer + '/png?' + _.map(args, function(v,k) { return k + '=' + v; }).join('&') + '&page=/';
    }

    return {
        CONST: CONST,
        model: undefined,
        sparksBase:      sparksBaseUrl(CONST.sparksParams),
        sparksBaseFront: sparksBaseUrl(CONST.sparksFrontParams),
        state: {
            config: {},
            liveMode: ko.observable(false),
            pending: ko.observable(false),
            openFronts: {}
        }
    };
});


