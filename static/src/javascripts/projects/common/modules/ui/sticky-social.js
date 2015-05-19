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
        stickyClassName = 'meta__social--sticky',
        stickyRevealClassName = 'meta__social--sticky--reveal',
        stickyRevealableClassName = 'meta__social--sticky--revealable',

        deadzone = 100,

        topEl,
        bottomEl,
        revealed = false,
        failed = false;

    function getTopEl() {
        topEl = topEl || $(selectorTopEl);
        return topEl;
    }

    function getBottomEl() {
        bottomEl = bottomEl || $(selectorBottomEl);
        return bottomEl;
    }

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
                        setTimeout(makeRevealable);
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
        fastdom.write(function () { bottomEl.addClass(stickyRevealableClassName); });
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
        var socials = ['facebook', 'twitter'],
            referrer = ((window.location.hash + '').match(/referrer=([^&]+)/) || [])[1] || document.referrer,
            socialReferrer = referrer ? socials.filter(function (social) {
                return referrer.indexOf(social) > -1;
            })[0] : null;

        if (socialReferrer) {
            fastdom.read(function () {
                [selectorTopEl, selectorBottomEl].forEach(function (selector) {
                    var container = $(selector);

                    if (container) {
                        fastdom.write(function () {
                            container.addClass('social--referred');
                            $('.social__item--' + socialReferrer, container).addClass('social__item--referred');
                        });
                    }
                });
            });
        }

        mediator.on('window:scroll', _.throttle(determineStickiness, 10));
    }

    return {
        init: init
    };
});
