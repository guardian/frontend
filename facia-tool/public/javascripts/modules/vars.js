/* global _: true */
define([
    'knockout',
    'config'
], function(
    ko,
    pageConfig
){
    var CONST = {
        editions: ['uk', 'us', 'au'],

        types: [
            {name: 'news', groups: ['standard', 'big', 'very big', 'huge']},
            {name: 'news/auto'},
            {name: 'news/headline', groups: ['standard', 'big', 'very big']},
            {name: 'news/most-popular'},
            {name: 'news/people'},
            {name: 'news/small-list'},
            {name: 'news/special'},
            {name: 'features'},
            {name: 'features/auto'},
            {name: 'features/multimedia'},
            {name: 'features/picks', groups: ['standard', 'big']},
            {name: 'features/volumes', groups: ['standard', 'big', 'very big', 'huge']},
            {name: 'comment/comment-and-debate'},
            {name: 'prototype/cassoulet'},
            {name: 'prototype/quichelorraine'},
            {name: 'prototype/raclette'}
        ],

        headlineLength: 200,
        restrictedHeadlineLength: 90,

        restrictHeadlinesOn: [
            'breaking-news'
        ],

        restrictedLiveMode: [
            'breaking-news'
        ],

        detectPressFailureMs: 10000,

        maxFronts: 200,

        imageCdnDomain: 'guim.co.uk',

        previewBase: 'http://preview.gutools.co.uk',

        viewer: 'http://s3-eu-west-1.amazonaws.com/facia/responsive-viewer.html',

        filterTypes: {
            section: { display: 'in section:', param: 'section', path: 'sections', placeholder: 'e.g. news' },
            tag:     { display: 'with tag:',   param: 'tag',     path: 'tags',     placeholder: 'e.g. sport/triathlon' }
        },

        searchPageSize:        50,

        capiBatchSize:         20,

        collectionsPollMs:     10000,
        latestArticlesPollMs:  30000,
        configSettingsPollMs:  30000,
        cacheExpiryMs:         60000,
        sparksRefreshMs:       300000,
        pubTimeRefreshMs:      30000,

        frontAgeAlertMs: {
            front:      60000 * 2 * pageConfig.highFrequency,
            editorial:  60000 * 2 * pageConfig.standardFrequency,
            commercial: 60000 * 2 * pageConfig.commercialFrequency
        },

        apiBase:               '',
        apiSearchBase:         '/api/proxy',

        ophanBase:             'http://dashboard.ophan.co.uk/graph/breakdown',

        sparksServer:          'http://sparklines.ophan.co.uk',
        sparksParams: {
            graphs: 'other:3279F1,google:65b045,guardian:376ABF',
            showStats: 1,
            showHours: 1,
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
        sparksBase: sparksBaseUrl(CONST.sparksParams),
        priority: pageConfig.priority === 'editorial' ? undefined : pageConfig.priority,
        state: {
            config: {},
            liveMode: ko.observable(false),
            pending: ko.observable(false),
            openFronts: {}
        }
    };
});
