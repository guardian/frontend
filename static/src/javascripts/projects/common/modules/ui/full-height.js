define([
    'common/utils/fastdom-promise',
    'common/utils/$',
    'common/utils/mediator',
    'lodash/functions/debounce',
    'common/utils/detect'
], function (
    fastdomPromise,
    $,
    mediator,
    debounce,
    detect
) {
    // Helper for full height elements as 100vh on mobile Chrome and Safari
    // changes as the url bar slides in and out
    // http://code.google.com/p/chromium/issues/detail?id=428132

    var heightSet = false,
        ready = function () {
            mediator.on('window:resize', debounce(function () {
                if (heightSet && detect.getBreakpoint() !== 'mobile') {
                    // If the height has been set and we're not on mobile
                    stickHeight(true);
                } else if (detect.getBreakpoint() === 'mobile') {
                    // If we are on mobile, we need to just set the new height
                    stickHeight();
                }
            }, 200));

            if (detect.getBreakpoint() === 'mobile') {
                // We only want to initially set the height if we are on mobile
                stickHeight();
            }
        },
        stickHeight = function (setHeightToAuto) {

            // This simply sticks the height of 100vh elements to the initial viewport height
            // which means there will be a gap once the url bar goes away,
            // but this is fine for the current use case

            $('.js-is-fixed-height').each(function (el) {
                var $el = $(el),
                    elHeight;

                fastdomPromise.read(function () {
                    elHeight = (setHeightToAuto) ? '' : $el.height();
                }).then(fastdomPromise.write(function () {
                    $el.css('height', elHeight);
                    heightSet = true;
                }));
            });
        };

    return {
        init: ready
    };
});
