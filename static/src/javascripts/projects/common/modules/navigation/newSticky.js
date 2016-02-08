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
    var $document = $(document.body);

    var getClientAdHeight = function () {
        return fastdom.read(function () {
            return $adBannerInner[0].clientHeight;
        });
    };

    var getAdIframe = function () { return $('iframe', $adBanner); };

    var topAdRenderedPromise = new Promise(function (resolve) {
        mediator.on('modules:commercial:dfp:rendered', function (event) {
            var dfpAdSlotId = 'dfp-ad--top-above-nav';
            var isEventForTopAdBanner = event.slot.getSlotElementId() === dfpAdSlotId;
            if (isEventForTopAdBanner) { resolve(); }
        });
    });

    var newRubiconAdHeightPromise = new Promise(function (resolve) {
        window.addEventListener('message', function (event) {
            var data;

            // other DFP events get caught by this listener, but if they're not json we don't want to parse them or use them
            /* eslint-disable no-empty */
            try {
                data = JSON.parse(event.data);
            } catch (e) {}
            /* eslint-enable no-empty */

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
        // iframe may not have been injected at this point
        var isFluidAd = $iframe.length > 0 && [slotWidth, slotHeight].join(',') === '88,70';
        // fluid ads are currently always 250px high. We can't just read the client height as fluid ads are
        // injected asynchronously, so we can't be sure when they will be in the dom
        var fluidAdInnerHeight = 250;
        var fluidAdPadding = 18;
        var fluidAdHeight = fluidAdInnerHeight + fluidAdPadding;

        var adHeightPromise = isFluidAd
            ? Promise.resolve(fluidAdHeight)
            : getClientAdHeight();
        return Promise.race([newRubiconAdHeightPromise, adHeightPromise]);
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

    var render = function (state) {
        // Reset so we have a clean slate
        $header.css({
            'transition': '',
            'margin-top': ''
        });
        $adBanner.css({
            'position': '',
            'top': '',
            'max-height': '',
            'overflow': ''
        });

        // Set
        // TODO: move into stylesheets when productionised
        $document.addClass('new-sticky-ad');
        $header.css({ 'margin-top': state.adHeight });
        $adBanner.css({ 'max-height': state.adHeight });

        var pageYOffset = state.scrollCoords[1];
        var userHasScrolledPastHeader = pageYOffset > state.headerHeight;
        if (userHasScrolledPastHeader) {
            $adBanner.css({
                'position': 'absolute',
                'top': state.headerHeight
            });
        } else {
            $adBanner.css({ 'position': 'fixed' });
        }

        var diff = state.adHeight - state.previousAdHeight;
        var adHeightHasIncreased = diff > 0;
        var scrollIsNotAtTop = pageYOffset > 0;
        if (state.shouldTransition) {
            // If the user is at the top and the ad is resizing, we want to
            // transition the change.
            // Avoid an initial transition when we apply the margin top for the first time
            var transitionTimingFunction = 'cubic-bezier(0, 0, 0, .985)';
            var transitionDuration = '1s';
            $header.css({ 'transition': ['margin-top', transitionDuration, transitionTimingFunction].join(' ') });
            $adBanner.css({
                'transition': ['max-height', transitionDuration, transitionTimingFunction].join(' '),
                // Stop the ad from overflowing while we transition
                'overflow': 'hidden'
            });
        } else if (adHeightHasIncreased && scrollIsNotAtTop) {
            // If the user is not at the top and the ad height has increased,
            // we want to offset their scroll position
            var pageXOffset = state.scrollCoords[0];
            window.scrollTo(pageXOffset, pageYOffset + diff);
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
        newRubiconAdHeightPromise.then(dispatchNewAdHeight);

        $adBanner[0].addEventListener('transitionend', function (event) {
            // Protect against any other events which have bubbled
            var isEventForAdBanner = event.target === $adBanner[0];
            if (isEventForAdBanner) {
                dispatch({ type: 'AD_BANNER_TRANSITION_END' });
            }
        });
    };

    return function () {
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
                        return assign({}, previousState, {
                            shouldTransition: scrollIsAtTop,
                            adHeight: action.adHeight,
                            previousAdHeight: previousState.adHeight
                        });
                    case 'AD_BANNER_TRANSITION_END':
                        return assign({}, previousState, {
                            shouldTransition: false
                        });
                    default:
                        return previousState;
                }
            };

            var store = createStore(reducer);

            setupDispatchers(store.dispatch);

            var update = function () {
                return fastdom.write(function () {
                    render(store.getState());
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
});
