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

        /* sonobiEnabled: boolean. Set to true if sonobi real-time-bidding is enabled*/
        sonobiEnabled: config.switches.sonobiHeaderBidding,

        /* lazyLoadEnabled: boolean. Set to true when adverts are lazy-loaded */
        lazyLoadEnabled: false,

        /* creativeIDs: array<string>. List of loaded creative IDs */
        creativeIDs: [],

        /* advertIds: map<string -> int>. Keeps track of slot IDs and their position in the array of adverts */
        advertIds: {},

        /* advertsToLoad: array<Advert>. Lists adverts waiting to be loaded */
        advertsToLoad: [],

        /* advertsToRefresh: array<Advert>. Lists adverts refreshed when a breakpoint has been crossed */
        advertsToRefresh: [],

        /* adverts: array<Advert>?. Keeps track of adverts and their state */
        adverts: null,

        /* shouldLazyLoad: () -> boolean. Determines whether ads should be lazy loaded */
        shouldLazyLoad: function () {
            // We do not want lazy loading on pageskins because it messes up the roadblock
            return !config.page.hasPageSkin;
        }
    };
    return dfpEnv;
});
