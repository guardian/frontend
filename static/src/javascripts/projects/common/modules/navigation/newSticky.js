define([
    'common/utils/fastdom-promise',
    'Promise',
    'common/utils/$',
    'common/utils/create-store',
    'common/utils/mediator',
    'common/utils/config',
    'common/utils/detect',
    'lodash/objects/assign'
], function (
    fastdom,
    Promise,
    $,
    createStore,
    mediator,
    config,
    detect,
    assign) {

    var $adBanner = $('.top-banner-ad-container--above-nav');
    var $adBannerInner = $('.ad-slot--top-above-nav', $adBanner);
    var $header = $('.js-header');

    var topAdRenderedPromise = new Promise(function (resolve) {
        mediator.on('modules:commercial:dfp:rendered', function (event) {
            var dfpAdSlotId = 'dfp-ad--top-above-nav';
            var isEventForTopAdBanner = event.slot.getSlotElementId() === dfpAdSlotId;
            if (isEventForTopAdBanner) { resolve(); }
        });
    });

    var getClientAdHeight = function () {
        return fastdom.read(function () {
            return $adBannerInner[0].clientHeight;
        });
    };

    var getAdIframe = function () { return $('iframe', $adBanner); };

    // Rubicon ads are loaded via DFP like all other ads, but they can
    // render themselves again at any time
    var rubiconAdRenderedPromise = new Promise(function (resolve) {
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
                    resolve();
                }
            }
        });
    });

    var getLatestAdHeight = function () {
        var $iframe = getAdIframe();
        var slotWidth = $iframe.attr('width');
        var slotHeight = $iframe.attr('height');
        // iframe may not have been injected at this point
        var isFluidAd = $iframe.length > 0 && [slotWidth, slotHeight].join(',') === '88,70';
        // fluid ads are currently always 250px high. We can't just read the client height as fluid ads are
        // injected asynchronously, so we can't be sure when they will be in the dom
        var fluidAdInnerHeight = 250;
        var fluidAdPadding = 18;
        var fluidAdHeight = fluidAdInnerHeight + fluidAdPadding;

        return isFluidAd
            ? Promise.resolve(fluidAdHeight)
            : getClientAdHeight();
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
        // Reset so we have a clean slate
        els.$header.css({
            'transition': '',
            'margin-top': ''
        });
        els.$adBanner.css({
            'position': '',
            'top': '',
            'max-height': '',
            'overflow': '',
            'transition': ''
        });

        // Set
        // TODO: move into stylesheets when productionised
        els.$document.addClass('new-sticky-ad');
        els.$header.css({ 'margin-top': state.adHeight });
        els.$adBanner.css({ 'max-height': state.adHeight });

        var pageYOffset = state.scrollCoords[1];
        var isScrollPastStickyZone = pageYOffset > state.headerHeight;
        if (isScrollPastStickyZone) {
            els.$adBanner.css({
                'position': 'absolute',
                'top': state.headerHeight
            });
        } else {
            els.$adBanner.css({ 'position': 'fixed' });
        }

        var diff = state.adHeight - state.previousAdHeight;
        var adHeightHasIncreased = diff > 0;
        if (state.shouldTransition) {
            var transitionTimingFunction = 'cubic-bezier(0, 0, 0, .985)';
            var transitionDuration = '1s';
            els.$header.css({ 'transition': ['margin-top', transitionDuration, transitionTimingFunction].join(' ') });
            els.$adBanner.css({
                'transition': ['max-height', transitionDuration, transitionTimingFunction].join(' '),
                // Stop the ad from overflowing while we transition
                'overflow': 'hidden'
            });
        } else if (adHeightHasIncreased) {
            // If we shouldn't transition, we want to offset their scroll position
            var pageXOffset = state.scrollCoords[0];
            els.window.scrollTo(pageXOffset, pageYOffset + diff);
        }
    };

    var setupDispatchers = function (dispatch) {
        window.addEventListener('scroll', function () {
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
        rubiconAdRenderedPromise.then(dispatchNewAdHeight);

        $adBanner[0].addEventListener('transitionend', function (event) {
            // Protect against any other events which have bubbled
            var isEventForAdBanner = event.target === $adBanner[0];
            if (isEventForAdBanner) {
                dispatch({ type: 'AD_BANNER_TRANSITION_END' });
            }
        });
    };

    var initialise = function () {
        getInitialState().then(function (initialState) {
            var reducer = function (previousState, action) {
                // Default param value
                if (!previousState) {
                    previousState = initialState;
                }
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

            var store = createStore(reducer);

            setupDispatchers(store.dispatch);

            var elements = {
                $document: $(document.body),
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
    };

    return {
        initialise: initialise,
        // Needed for testing
        render: render
    };
});
