define([
    '$',
    'utils/mediator',
    'utils/deferToLoad',
    'utils/extend',
    'utils/debounce',
    'utils/rate-limit',
    'utils/to-array',
    'utils/lazy-load-css',
    'utils/hard-refresh',
    'utils/atob',
    'utils/request-animation-frame'
], function (
    $,
    mediator,
    deferToLoad,
    extend,
    debounce,
    rateLimit,
    toArray,
    lazyLoadCss,
    hardRefresh,
    atob,
    requestAnimationFrame
) {
    return {
        mediator: mediator,
        $g: $,
        deferToLoadEvent: deferToLoad,
        extend: extend,
        debounce: debounce,
        rateLimit: rateLimit,
        toArray: toArray,
        lazyLoadCss: lazyLoadCss,
        hardRefresh: hardRefresh,
        atob: atob,
        requestAnimationFrame: requestAnimationFrame
    };
});
