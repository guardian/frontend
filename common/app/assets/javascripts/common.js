define([
    '$',
    'utils/mediator',
    'utils/deferToLoad',
    'lodash/objects/assign',
    'lodash/functions/debounce',
    'lodash/functions/throttle',
    'utils/to-array',
    'utils/lazy-load-css',
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
        atob: atob,
        requestAnimationFrame: requestAnimationFrame
    };
});
