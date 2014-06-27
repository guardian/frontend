define([
    'common/utils/$',
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
    throttle,
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
        throttle: throttle,
        toArray: toArray,
        atob: atob,
        requestAnimationFrame: requestAnimationFrame
    };
});
