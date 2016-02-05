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

    var adId = 'dfp-ad--top-above-nav';
    var $adBanner = $('.js-top-banner-above-nav');
    var $adBannerInner = $('#' + adId, $adBanner);
    var $header = $('.js-header');

    var getClientAdHeight = function () {
        return fastdom.read(function () {
            return $adBannerInner[0].clientHeight;
        });
    };

    var getAdIframe = function () { return $('iframe', $adBanner); };

    var topAdRenderedPromise = new Promise(function (resolve) {
        mediator.on('modules:commercial:dfp:rendered', function (event) {
            if (event.slot.getSlotElementId() === adId) {
                resolve();
            }
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
                    adIsResizing: false,
                    adHeight: adHeight,
                    previousAdHeight: adHeight,
                    headerHeight: headerHeight,
                    pageXOffset: scrollCoords[0],
                    pageYOffset: scrollCoords[1]
                };
            });
    };

    var $document = $(document.body);
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

        var userHasScrolledPastHeader = state.pageYOffset > state.headerHeight;
        if (userHasScrolledPastHeader) {
            $adBanner.css({
                'position': 'absolute',
                'top': state.headerHeight
            });
        } else {
            $adBanner.css({ 'position': 'fixed' });
        }

        var scrollIsNotAtTop = state.pageYOffset > 0;
        if (scrollIsNotAtTop) {
            var diff = state.adHeight - state.previousAdHeight;
            var adHeightHasIncreased = diff > 0;
            if (adHeightHasIncreased) {
                // If the user is not at the top and the ad height has increased,
                // we want to offset their scroll position
                window.scrollTo(state.pageXOffset, state.pageYOffset + diff);
            }
        } else if (state.adIsResizing) {
            // If the user is at the top and the ad is resizing, we want to
            // transition the change.
            // Avoid an initial transition when we apply the margin top for the first time
            $header.css('transition', 'margin-top 1s cubic-bezier(0, 0, 0, 0.985)');
            // Stop the ad from overflowing while we transition
            $adBanner.css({ 'overflow': 'hidden' });
        }
    };

    var attachListeners = function (dispatch) {
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
                dispatch({ type: 'AD_TRANSITION_END' });
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
                            pageXOffset: action.scrollCoords[0],
                            pageYOffset: action.scrollCoords[1]
                        });
                    case 'NEW_AD_HEIGHT':
                        return assign({}, previousState, {
                            adIsResizing: true,
                            adHeight: action.adHeight,
                            previousAdHeight: previousState.adHeight
                        });
                    case 'AD_TRANSITION_END':
                        return assign({}, previousState, {
                            adIsResizing: false
                        });
                    default:
                        return previousState;
                }
            };

            var store = createStore(reducer);
            var update = function () {
                return fastdom.write(function () {
                    render(store.getState());
                });
            };

            attachListeners(store.dispatch);

            // Initial update
            // Ensure we only start listening after the first update
            update().then(function () {
                // Update when actions occur
                store.subscribe(update);
            });
        });
    };
});
