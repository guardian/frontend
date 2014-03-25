define([
    'common/$',
    'common/utils/mediator',
    'common/utils/deferToLoad',
    'lodash/objects/assign',
    'lodash/functions/debounce',
    'lodash/functions/throttle',
    'common/utils/to-array',
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
        atob: atob,
        requestAnimationFrame: requestAnimationFrame
    };
});
