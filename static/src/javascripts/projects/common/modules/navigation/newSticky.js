define([
    'common/utils/fastdom-promise',
    'Promise',
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mount-component',
    'lodash/objects/assign'
], function (
    fastdom,
    Promise,
    $,
    mediator,
    config,
    detect,
    mountComponent,
    assign
) {
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

    var oldAdHeightPromise = getLatestAdHeight();
    var newAdHeightPromise = topAdRenderedPromise.then(getLatestAdHeight);

    var getCachedAdHeight = function () {
        return Promise.race([newRubiconAdHeightPromise, newAdHeightPromise, oldAdHeightPromise]);
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
        return Promise.all([getCachedAdHeight(), headerHeightPromise, getScrollCoords()])
            .then(function (args) {
                var adHeight = args[0];
                var headerHeight = args[1];
                var scrollCoords = args[2];
                return {
                    firstRender: true,
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
            'max-height': ''
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

        var scrollIsAtTop = state.pageYOffset === 0;
        var diff = state.adHeight - state.previousAdHeight;
        var adHeightHasIncreased = diff > 0;
        if (!scrollIsAtTop && adHeightHasIncreased) {
            // If the user is not at the top and the ad height has increased,
            // we want to offset their scroll position
            window.scrollTo(state.pageXOffset, state.pageYOffset + diff);
        } else if (!state.firstRender) {
            // Otherwise we want to transition the change when it happens.
            // Avoid an initial transition when we apply the margin top for the first time
            $header.css('transition', 'margin-top 1s cubic-bezier(0, 0, 0, 0.985)');
        }
    };

    var attachListeners = function (dispatch) {
        window.addEventListener('scroll', function () {
            getScrollCoords().then(function (scrollCoords) {
                dispatch({ type: 'SCROLL', scrollCoords: scrollCoords });
            });
        });
        newAdHeightPromise.then(function () {
            getCachedAdHeight().then(function (adHeight) {
                dispatch({ type: 'NEW_AD_HEIGHT', adHeight: adHeight });
            });
        });
        newRubiconAdHeightPromise.then(function () {
            getCachedAdHeight().then(function (adHeight) {
                dispatch({ type: 'NEW_RUBICON_AD_HEIGHT', adHeight: adHeight });
            });
        });
    };

    var reducer = function (previousState, action) {
        switch (action.type) {
            case 'SCROLL':
                return assign({}, previousState, {
                    firstRender: false,
                    previousAdHeight: previousState.adHeight,
                    pageXOffset: action.scrollCoords[0],
                    pageYOffset: action.scrollCoords[1]
                });
            case 'NEW_AD_HEIGHT':
                return assign({}, previousState, {
                    firstRender: false,
                    adHeight: action.adHeight,
                    previousAdHeight: previousState.adHeight
                });
            case 'NEW_RUBICON_AD_HEIGHT':
                return assign({}, previousState, {
                    firstRender: false,
                    adHeight: action.adHeight,
                    previousAdHeight: previousState.adHeight
                });
            default:
                return previousState;
        }
    };

    return function () {
        getInitialState().then(function (initialState) {
            mountComponent({
                initialState: initialState,
                reducer: reducer,
                render: render,
                attachListeners: attachListeners
            });
        });
    };
});
