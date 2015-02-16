define([
    'knockout',
    'underscore',
    'config',
    'fixed-containers',
    'dynamic-containers'
], function(
    ko,
    _,
    pageConfig,
    fixedContainers,
    dynamicContainers
){
    var CONST = {
        editions: ['uk', 'us', 'au'],

        types: dynamicContainers.concat(fixedContainers).concat([
            {name: 'nav/list'},
            {name: 'nav/media-list'},
            {name: 'news/most-popular'}
        ]),

        typesDynamic: dynamicContainers,

        headlineLength: 200,
        restrictedHeadlineLength: 90,

        restrictHeadlinesOn: [
            'breaking-news'
        ],

        restrictedLiveMode: [
            'breaking-news'
        ],

        askForConfirmation: [
            'breaking-news'
        ],

        restrictedEditor: [
            'breaking-news'
        ],

        detectPressFailureMs: 10000,

        maxFronts: 500,

        filterTypes: {
            section: { display: 'in section:', param: 'section', path: 'sections', placeholder: 'e.g. news' },
            tag:     { display: 'with tag:',   param: 'tag',     path: 'tags',     placeholder: 'e.g. sport/triathlon' }
        },

        searchPageSize:        50,

        capiBatchSize:         10,

        collectionsPollMs:     10000,
        latestArticlesPollMs:  30000,
        configSettingsPollMs:  30000,
        cacheExpiryMs:         60000,
        sparksRefreshMs:       300000,
        pubTimeRefreshMs:      30000,

        frontAgeAlertMs: {
            front:      60000 * 2 * (pageConfig.highFrequency || 1),
            editorial:  60000 * 2 * (pageConfig.standardFrequency || 5),
            commercial: 60000 * 2 * (pageConfig.lowFrequency || 60)
        },
        highFrequencyPaths:    ['uk', 'us', 'au', 'uk/sport', 'us/sport', 'au/sport'],

        mainDomain:            'www.theguardian.com',

        apiBase:               '',
        apiSearchBase:         '/api/proxy',
        apiSearchParams:       'show-elements=video&show-tags=all&show-fields=internalContentCode,isLive,firstPublicationDate,scheduledPublicationDate,headline,trailText,byline,thumbnail,liveBloggingNow',

        imageCdnDomain:        'guim.co.uk',
        previewBase:           'http://preview.gutools.co.uk',

        latestSnapPrefix:      'Latest from ',

        ophanBase:             'http://dashboard.ophan.co.uk/graph/breakdown',
        ophanFrontBase:        'http://dashboard.ophan.co.uk/info?path=',

        sparksServer:          'http://sparklines.ophan.co.uk',
        sparksParams: {
            graphs: 'other:3279F1,google:65b045,guardian:376ABF',
            showStats: 1,
            showHours: 1,
            width: 100,
            height: 35
        },

        internalContentPrefix: 'internal-code/content/'
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
            openFronts: {}
        }
    };
});
