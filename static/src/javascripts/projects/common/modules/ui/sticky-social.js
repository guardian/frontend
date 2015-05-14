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

    function setStickiness() {
        fastdom.read(function () {
            topEl = topEl || $(selectorTopEl)[0];

            if (!topEl) {
                failed = true;

            } else if (topEl.getBoundingClientRect().top + deadzone < 0) {
                reveal();

            } else {
                unreveal();
            }
        });
    }

    function determineStickiness() {
        if (failed) {
            return;

        } else if (!bottomEl) {
            fastdom.read(function () {
                bottomEl = $(selectorBottomEl);

                if (bottomEl) {
                    fastdom.write(function () {
                        bottomEl.addClass(stickyClassName);
                        makeRevealable();
                    });
                } else {
                    failed = true;
                }
            });

        } else {
            setStickiness();
        }
    }

    function makeRevealable() {
        bottomEl.addClass(stickyRevealableClassName);
    }

    function reveal() {
        if (!revealed) {
            revealed = true;
            fastdom.write(function () { bottomEl.addClass(stickyRevealClassName); });
        }
    }

    function unreveal() {
        if (revealed) {
            revealed = false;
            fastdom.write(function () { bottomEl.removeClass(stickyRevealClassName); });
        }
    }

    function init() {
        determineStickiness();
        mediator.on('window:scroll', _.throttle(determineStickiness, 10));
    }

    return {
        init: init
    };
});
