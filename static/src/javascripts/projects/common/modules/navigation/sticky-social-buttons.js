define([
    'fastdom',
    'common/utils/$',
    'common/utils/_',
    'common/utils/mediator'
], function (
    fastdom,
    $,
    _,
    mediator
) {

    var selectorTopEl = '.social--top',
        selectorBottomEl = '.social--bottom',
        selectorNavSwapOutEl = '.l-header-pre',

        deadzone = 50,

        topEl = _.memoize(function () { return $(selectorTopEl)[0]; }),
        bottomEl = _.memoize(function () { return $(selectorBottomEl)[0]; }),
        navSwapOutEl = _.memoize(function () { return $(selectorNavSwapOutEl)[0]; }),

        isStuck = false;

    function setStickiness() {
        fastdom.read(function () {
            var topPos = topEl().getBoundingClientRect().top;

            if (!isStuck && topPos + deadzone * 2 < 0) {
                isStuck = stick();
            } else if (isStuck && topPos + deadzone > 0) {
                isStuck = unStick();
            }
        });
    }

    function stick() {
        fastdom.write(function () {
            $(bottomEl()).addClass('social--stickynav');
            $(navSwapOutEl()).css('visibility', 'hidden');
        });
        return true;
    }

    function unStick() {
        fastdom.write(function () {
            $(bottomEl()).removeClass('social--stickynav');
            $(navSwapOutEl()).css('visibility', 'visible');
        });
        return false;
    }

    return function () {
        mediator.on('window:scroll', _.throttle(setStickiness, 10));
    };
});
