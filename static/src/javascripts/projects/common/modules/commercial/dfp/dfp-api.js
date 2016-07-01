// Be wary of renaming this file; some titles, like 'dfp.js',
// can trigger adblocker rules, and make the module fail to load in dev.

define([
    'common/utils/mediator',
    'common/modules/commercial/dfp/private/dfp-env',
    'common/modules/commercial/dfp/dfp-obj',

    /* load public api */
    'common/modules/commercial/dfp/init',
    'common/modules/commercial/dfp/load',
    'common/modules/commercial/dfp/get-adverts',
    'common/modules/commercial/dfp/get-creative-ids',
    'common/modules/commercial/dfp/track-ad-load',
    'common/modules/commercial/dfp/track-ad-render'
], function (mediator, dfpEnv, dfp) {
    /**
     * Right, so an explanation as to how this works...
     *
     * Create a new ad slot using the following code:
     *
     * <div id="SLOT_ID" class="js-ad-slot AD_SLOT_CLASS" data-name="AD_SLOT_NAME"
     *      data-mobile="300,50|320,50"
     *      data-desktop="300,250"
     *      data-refresh="false"
     *      data-label="false">
     * </div>
     *
     * You can set the set which size ad(s) should be loaded at which breakpoint by using the
     * data-[breakpoint] attributes (see detect). It works like a min-width media query.
     *
     * Labels are automatically prepended to an ad that was successfully loaded, unless the
     * data-label attribute is equal to "false".
     *
     * A slot is refreshed (i.e. a new DFP round-trip is triggered) if the window crosses a
     * breakpoint corresponding to a new data-[breakpoint] attribute, unless the attribute
     * data-refresh is equal to "false".
     *
     */

    dfp.reset = function () {
        dfpEnv.displayed = false;
        dfpEnv.rendered = false;
        dfpEnv.advertIds = {};
        dfpEnv.adverts = [];
        dfpEnv.advertsToRefresh = [];
        mediator.off('window:resize', dfpEnv.fn.windowResize);
    };

    return dfp;
});
