define([
    'common/utils/config'
], function (config) {
    var dfpEnv = {
        /* renderStartTime: integer. Point in time when DFP kicks in */
        renderStartTime: -1,

        /* firstAdDisplayed: boolean. Set to true when the first advert is getting displayed (via googletag.display) */
        firstAdDisplayed: false,

        /* firstAdRendered: boolean. Set to true when the first advert has come back from DFP */
        firstAdRendered: false,

        /* adSlotSelector: string. A CSS selector to query ad slots in the DOM */
        adSlotSelector: '.js-ad-slot',

        /* prebidEnabled: boolean. Set to true if header bidding is enabled */
        prebidEnabled: config.switches.headerBiddingUs && config.page.edition == 'US',

        /* lazyLoadEnabled: boolean. Set to true when adverts are lazy-loaded */
        lazyLoadEnabled: false,

        /* prebidService: PrebidService?. Interface used to run header bidding */
        prebidService: null,

        /* creativeIDs: array<string>. List of loaded creative IDs */
        creativeIDs: [],

        /* advertIds: map<string -> int>. Keeps track of slot IDs and their position in the array of adverts */
        advertIds: {},

        /* advertsToLoad: array<Advert>. Lists adverts waiting to be loaded */
        advertsToLoad: [],

        /* advertsToRefresh: array<Advert>. Lists adverts refreshed when a breakpoint has been crossed */
        advertsToRefresh: [],

        /* adverts: array<Advert>?. Keeps track of adverts and their state */
        adverts: null
    };
    return dfpEnv;
});
