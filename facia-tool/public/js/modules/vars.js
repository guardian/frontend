define(function() {
    function inferPriority () {
        var priority = window.location.pathname.match(/^\/?([^\/]+)/);
        if (priority && priority[1] !== 'editorial') {
            return priority[1];
        }
    }

    var CONST = {
        editions: ['uk', 'us', 'au'],

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

        detectPendingChangesInClipboard: 4000,

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

        highFrequencyPaths:    ['uk', 'us', 'au', 'uk/sport', 'us/sport', 'au/sport'],

        mainDomain:            'www.theguardian.com',

        apiBase:               '',
        apiSearchBase:         '/api/proxy',
        apiSearchParams:       'show-elements=video&show-tags=all&show-fields=internalContentCode,isLive,firstPublicationDate,scheduledPublicationDate,headline,trailText,byline,thumbnail,liveBloggingNow,membershipAccess',

        frontendApiBase:       '/frontend',

        imageCdnDomain:        'guim.co.uk',
        previewBase:           'http://preview.gutools.co.uk',

        latestSnapPrefix:      'Latest from ',

        ophanBase:             'http://dashboard.ophan.co.uk/graph/breakdown',
        ophanFrontBase:        'http://dashboard.ophan.co.uk/info?path=',

        internalContentPrefix: 'internal-code/content/',

        sparksBatchQueue:      15
    };

    var vars = {
        CONST: CONST,
        model: undefined,
        priority: inferPriority(),
        identity: null,
        state: {
            config: {}
        },
        env: '',
        update: function (res) {
            vars.pageConfig = res.defaults;

            vars.CONST.types = res.defaults.dynamicContainers.concat(res.defaults.fixedContainers).concat([
                {name: 'nav/list'},
                {name: 'nav/media-list'},
                {name: 'news/most-popular'}
            ]);

            vars.CONST.typesDynamic = res.defaults.dynamicContainers;

            vars.CONST.frontAgeAlertMs = {
                front:      60000 * 2 * (res.defaults.highFrequency || 1),
                editorial:  60000 * 2 * (res.defaults.standardFrequency || 5),
                commercial: 60000 * 2 * (res.defaults.lowFrequency || 60)
            };

            vars.identity = {
                email: res.defaults.email,
                avatarUrl: res.defaults.avatarUrl
            };

            vars.env = res.defaults.env;
        }
    };

    return vars;
});
