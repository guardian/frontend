define([
    'bean',
    'common/utils/$',
    'common/utils/_',
    'common/utils/detect',
    'common/utils/mediator'
], function (
    bean,
    $,
    _,
    detect,
    mediator
    ) {

    var selectorTopEl = '.meta__social',
        selectorBottomEl = '.social--bottom',
        stickyClassName = 'meta__social--sticky',
        stickyRevealClassName = 'meta__social--sticky--reveal',
        deadzone = 50,

        topEl,
        bottomEl,
        revealed = false;

    function reveal() {
        if (!revealed) {
            bottomEl.addClass(stickyRevealClassName);
            revealed = true;
        }
    }

    function unreveal() {
        if (revealed) {
            bottomEl.removeClass(stickyRevealClassName);
            revealed = false;
        }
    }

    function getTopPosition() {
        return topEl.getBoundingClientRect().top;
    }

    function setBottomPosition() {
        if (getTopPosition() + deadzone > 0) {
            setTimeout(unreveal);
        } else {
            setTimeout(reveal);
        }
    }

    function init() {
        var breakpoint = detect.getBreakpoint(true);

        topEl = $(selectorTopEl)[0];
        bottomEl = $(selectorBottomEl);

        if (topEl && bottomEl /* && breakpoint === 'mobile' */) {
            bottomEl.addClass(stickyClassName);
            mediator.on('window:scroll', _.throttle(setBottomPosition, 10));
        }
    }

    return {
        init: init
    };
});
