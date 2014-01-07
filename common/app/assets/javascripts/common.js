define([
    'common/$',
    'common/utils/mediator',
    'common/utils/deferToLoad',
    'lodash/objects/assign',
    'lodash/functions/debounce',
    'lodash/functions/throttle',
    'common/utils/to-array',
    'common/utils/lazy-load-css',
    'common/utils/atob',
    'common/utils/request-animation-frame'
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
