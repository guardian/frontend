export default {
    editions: ['uk', 'us', 'au'],

    environmentUrlBase: {
        'prod': 'http://theguardian.com/',
        'code': 'http://m.code.dev-theguardian.com/'
    },

    extendDynamicContainers: [
        {name: 'nav/list'},
        {name: 'nav/media-list'},
        {name: 'news/most-popular'},
        {name: 'breaking-news/not-for-other-fronts', groups: ['minor', 'major']}
    ],

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

    defaultPriority: 'editorial',
    maxFronts: {
        'editorial': 200,
        'commercial': 350,
        'training': 50
    },

    filterTypes: {
        section: { display: 'in section:', param: 'section', path: 'sections', placeholder: 'e.g. news' },
        tag:     { display: 'with tag:',   param: 'tag',     path: 'tags',     placeholder: 'e.g. sport/triathlon' }
    },

    searchPageSize:        50,

    capiBatchSize:         10,

    maxSlideshowImages:    5,

    collectionsPollMs:     10000,
    latestArticlesPollMs:  30000,
    configSettingsPollMs:  30000,
    cacheExpiryMs:         60000,
    sparksRefreshMs:      300000,
    pubTimeRefreshMs:      30000,
    searchDebounceMs:        300,

    highFrequencyPaths:    ['uk', 'us', 'au', 'uk/sport', 'us/sport', 'au/sport'],

    mainDomain:            'www.theguardian.com',

    apiBase:               '',
    apiSearchBase:         '/api/proxy',
    apiSearchParams:       [
        'show-elements=video',
        'show-tags=all',
        'show-fields=' + [
            'internalContentCode',
            'internalPageCode',
            'isLive',
            'firstPublicationDate',
            'scheduledPublicationDate',
            'headline',
            'trailText',
            'byline',
            'thumbnail',
            'secureThumbnail',
            'liveBloggingNow',
            'membershipAccess'
        ].join(',')
    ].join('&'),

    draggableTypes: {
        configCollection: 'config-collection'
    },


    frontendApiBase:       '/frontend',

    reauthPath:            '/login/status',
    reauthInterval:        60000 * 10, // 10 minutes
    reauthTimeout:         60000,

    imageCdnDomain:        '.guim.co.uk',
    imgIXBasePath:         '/img/static/',
    previewBase:           'http://preview.gutools.co.uk',

    latestSnapPrefix:      'Latest from ',

    ophanBase:             'http://dashboard.ophan.co.uk/summary',
    ophanFrontBase:        'http://dashboard.ophan.co.uk/info-front?path=',

    internalContentPrefix: 'internal-code/content/',
    internalPagePrefix:    'internal-code/page/',

    sparksBatchQueue:      15
};
