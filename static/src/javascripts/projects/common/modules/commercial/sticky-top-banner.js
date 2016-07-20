define([
    'common/utils/fastdom-promise',
    'Promise',
    'common/modules/commercial/dfp/track-ad-render',
    'common/modules/commercial/ad-sizes',
    'common/utils/$',
    'common/utils/create-store',
    'common/utils/mediator',
    'common/utils/config',
    'common/utils/detect',
    'lodash/objects/assign'
], function (
    fastdom,
    Promise,
    trackAdRender,
    adSizes,
    $,
    createStore,
    mediator,
    config,
    detect,
    assign
) {

    // All ads are loaded via DFP, including the following types. DFP does
    // report which ad slot size has been chosen, however there are several
    // cases where an asynchronous resize may occur. This feature supports the
    // following ad formats:
    //
    // Fluid ads break out of the iframe and resize asynchronously. There is no
    // resize event, but we know they are always 250px high.
    //
    // Expandable ads expand (overflowing the banner) upon user interaction.
    //
    // Rubicon ads may resize asynchronously. They have a resize event we can
    // subscribe to.

    var $adBanner = $('.js-top-banner');
    var $adBannerInner = $('.ad-slot', $adBanner);
    var $header = $('.js-header');

    var topAdRenderedPromise = trackAdRender('dfp-ad--top-above-nav');

    var getAdIframe = function () { return $('iframe', $adBanner); };

    // Rubicon ads are loaded via DFP like all other ads, but they can
    // render themselves again at any time
    var newRubiconAdHeightPromise = new Promise(function (resolve) {
        window.addEventListener('message', function (event) {
            var data;
            // other DFP events get caught by this listener, but if they're not json we don't want to parse them or use them
            try {
                data = JSON.parse(event.data);
            } catch (e) {/**/}

            if (data) {
                var $iframe = getAdIframe();
                var isRubiconAdEvent = data.type === 'set-ad-height';
                var isEventForTopAdBanner = isRubiconAdEvent && data.value.id === $iframe[0].id;

                if (isRubiconAdEvent && isEventForTopAdBanner) {
                    fastdom.read(function () {
                        var padding = parseInt($adBannerInner.css('padding-top'))
                            + parseInt($adBannerInner.css('padding-bottom'));
                        var clientHeight = parseInt(data.value.height) + padding;
                        resolve(clientHeight);
                    });
                }
            }
        });
    });

    var getLatestAdHeight = function () {
        var $iframe = getAdIframe();
        var slotWidth = $iframe.attr('width');
        var slotHeight = $iframe.attr('height');
        var slotSize = slotWidth + ',' + slotHeight;
        // iframe may not have been injected at this point
        var isFluid250 = adSizes.fluid250.toString() === slotSize;
        var isFabricV1 = adSizes.fabric.toString() === slotSize;
        var isFluidAd = $iframe.length > 0 && (isFluid250 || isFabricV1);

        if (isFluidAd) {
            // fluid ads are currently always 250px high. We can't just read the client height as fluid ads are
            // injected asynchronously, so we can't be sure when they will be in the dom
            var fluidAdInnerHeight = 250;
            return fastdom.read(function () {
                var label = $adBannerInner[0].getElementsByClassName('ad-slot__label');
                return label.length ? label[0].offsetHeight : 0;
            }).then(function (fluidAdPadding) {
                return fluidAdInnerHeight + fluidAdPadding;
            });
        } else {
            var adHeightPromise = fastdom.read(function () { return $adBannerInner[0].clientHeight; });
            // We can't calculate the height of Rubicon ads because they transition
            // themselves, so we use the event instead.
            return Promise.race([newRubiconAdHeightPromise, adHeightPromise]);
        }
    };

    var getScrollCoords = function () {
        return fastdom.read(function () {
            return [window.pageXOffset, window.pageYOffset];
        });
    };

    var getInitialState = function () {
        var headerHeightPromise = fastdom.read(function () {
            return $header.height();
        });
        return Promise.all([getLatestAdHeight(), headerHeightPromise, getScrollCoords()])
            .then(function (args) {
                var adHeight = args[0];
                var headerHeight = args[1];
                var scrollCoords = args[2];
                return {
                    shouldTransition: false,
                    adHeight: adHeight,
                    previousAdHeight: adHeight,
                    headerHeight: headerHeight,
                    scrollCoords: scrollCoords
                };
            });
    };

    var render = function (els, state) {
        var transitionTimingFunction = 'cubic-bezier(0, 0, 0, .985)';
        var transitionDuration = '1s';

        els.$header.css({
            'transition': state.shouldTransition
                ? ['margin-top', transitionDuration, transitionTimingFunction].join(' ')
                : '',
            'margin-top': state.adHeight
        });

        var pageYOffset = state.scrollCoords[1];
        var userHasScrolledPastHeader = pageYOffset > state.headerHeight;

        els.$adBanner.addClass('sticky-top-banner-ad');
        els.$adBanner.css({
            'position': !config.page.hasSuperStickyBanner && userHasScrolledPastHeader ? 'absolute' : 'fixed',
            'top': !config.page.hasSuperStickyBanner && userHasScrolledPastHeader ? state.headerHeight : '',
            'height': state.adHeight,
            // Stop the ad from overflowing while we transition
            'overflow': state.shouldTransition ? 'hidden' : '',
            'transition': state.shouldTransition
                ? ['height', transitionDuration, transitionTimingFunction].join(' ')
                : ''
        });

        var diff = state.adHeight - state.previousAdHeight;
        var adHeightHasIncreased = diff > 0;
        if (!state.shouldTransition && adHeightHasIncreased) {
            // If we shouldn't transition, we want to offset their scroll position
            var pageXOffset = state.scrollCoords[0];
            els.window.scrollTo(pageXOffset, pageYOffset + diff);
        }
    };

    var setupDispatchers = function (dispatch) {
        mediator.on('window:throttledScroll', function () {
            getScrollCoords().then(function (scrollCoords) {
                dispatch({ type: 'SCROLL', scrollCoords: scrollCoords });
            });
        });

        var dispatchNewAdHeight = function () {
            getLatestAdHeight().then(function (adHeight) {
                dispatch({ type: 'NEW_AD_HEIGHT', adHeight: adHeight });
            });
        };
        topAdRenderedPromise.then(dispatchNewAdHeight);
        newRubiconAdHeightPromise.then(dispatchNewAdHeight);

        $adBanner[0].addEventListener('transitionend', function (event) {
            // Protect against any other events which have bubbled
            var isEventForAdBanner = event.target === $adBanner[0];
            if (isEventForAdBanner) {
                dispatch({ type: 'AD_BANNER_TRANSITION_END' });
            }
        });
    };

    var reducer = function (previousState, action) {
        switch (action.type) {
            case 'SCROLL':
                return assign({}, previousState, {
                    previousAdHeight: previousState.adHeight,
                    scrollCoords: action.scrollCoords
                });
            case 'NEW_AD_HEIGHT':
                var scrollIsAtTop = previousState.scrollCoords[1] === 0;
                var previousAdHeight = previousState.adHeight;
                var adHeight = action.adHeight;
                var diff = adHeight - previousAdHeight;
                var adHeightHasIncreased = diff > 0;
                return assign({}, previousState, {
                    // This flag must be set at the reducer level
                    // so we can control over when it is cleared.
                    shouldTransition: adHeightHasIncreased && scrollIsAtTop,
                    adHeight: adHeight,
                    previousAdHeight: previousAdHeight
                });
            case 'AD_BANNER_TRANSITION_END':
                return assign({}, previousState, {
                    shouldTransition: false,
                    previousAdHeight: previousState.adHeight
                });
            default:
                return previousState;
        }
    };

    var initialise = function () {
        // Although we check as much config as possible to decide whether to run sticky-top-banner,
        // it is still entirely possible for the ad slot to be closed.
        if (detect.isBreakpoint({ min: 'desktop' }) && $adBannerInner[0]) {
            return getInitialState().then(function (initialState) {
                var store = createStore(reducer, initialState);

                setupDispatchers(store.dispatch);

                var elements = {
                    $adBanner: $adBanner,
                    $adBannerInner: $adBannerInner,
                    $header: $header,
                    window: window
                };
                var update = function () {
                    return fastdom.write(function () {
                        render(elements, store.getState());
                    });
                };
                // Initial update
                // Ensure we only start listening after the first update
                update().then(function () {
                    // Update when actions occur
                    store.subscribe(update);
                });
            });
        } else {
            return Promise.resolve();
        }
    };

    return {
        init: initialise,
        // Needed for testing
        render: render
    };
});
