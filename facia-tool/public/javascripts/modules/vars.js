/* global _: true */
define(['knockout'], function(ko) {
    var CONST = {
        types: [
            'news',
            'news/most-popular',
            'news/people',
            'news/section',
            'news/special',
            'news/sport',
            'features',
            'features/multimedia',
            'features/section',
            'comment',
            'comment/comment-and-debate',
            'comment/section'
        ],

        detectPressFailureMs: 10000,

        maxFronts: 100,

        groups: ['standard,big,very big,huge'],

        viewer: 'http://s3-eu-west-1.amazonaws.com/facia/responsive-viewer.html',
        filterTypes: {
            section: { display: 'in section:', param: 'section', path: 'sections', placeholder: 'e.g. news' },
            tag:     { display: 'with tag:',   param: 'tag',     path: 'tags',     placeholder: 'e.g. sport/triathlon' }
        },
        searchPageSize:        50,

        collectionsPollMs:     10000,
        latestArticlesPollMs:  20000,
        configSettingsPollMs:  30000,
        cacheExpiryMs:         60000,
        sparksRefreshMs:       300000,

        apiBase:               '',
        apiSearchBase:         '/api/proxy',

        sparksServer:          'http://sparklines.ophan.co.uk',
        sparksParams: {
            graphs: 'other:3279F1,google:65b045,guardian:376ABF',
            showStats: 1,
            showHours: 1,
            width: 100,
            height: 40
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
        sparksBase:      sparksBaseUrl(CONST.sparksParams),
        sparksBaseFront: sparksBaseUrl(CONST.sparksFrontParams),
        state: {
            config: {},
            switches: {},
            liveMode: ko.observable(false),
            pending: ko.observable(false),
            openFronts: {}
        }
    };
});


