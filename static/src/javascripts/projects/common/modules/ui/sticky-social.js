define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/mediator'
], function (
    $,
    _,
    mediator
    ) {

    var selectorTopEl = '.meta__social',
        selectorBottomEl = '.social--bottom',
        stickyClassName = 'meta__social--sticky',
        stickyRevealClassName = 'meta__social--sticky--reveal',
        stickyRevealableClassName = 'meta__social--sticky--revealable',
        deadzone = 100,
        topEl,
        bottomEl,
        revealed = false,
        failed = false;

    function getTopPosition() {
        topEl = topEl || $(selectorTopEl)[0];
        return topEl ? topEl.getBoundingClientRect().top + deadzone : 0;
    }

    function setBottomPosition() {
        if (failed) {
            return;

        } else if (!bottomEl) {
            bottomEl = $(selectorBottomEl);
            if (bottomEl) {
                bottomEl.addClass(stickyClassName);
                setTimeout(makeRevealable);
            } else {
                failed = true;
            }

        } else if (getTopPosition() < 0) {
            setTimeout(reveal);

        } else {
            setTimeout(unreveal);
        }
    }

    function makeRevealable() {
        bottomEl.addClass(stickyRevealableClassName);
    }

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

    function init() {
        mediator.on('window:scroll', _.throttle(setBottomPosition, 10));
    }

    return {
        init: init
    };
});
