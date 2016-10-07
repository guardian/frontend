define([
    'fastdom',
    'common/utils/$',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/experiments/ab',
    'lodash/functions/memoize'
], function (
    fastdom,
    $,
    detect,
    mediator,
    ab,
    memoize
) {

    var selectorTopEl = '.social--top',
        selectorBottomEl = '.social--bottom',
        stickyClassName = 'meta__social--sticky',
        stickyRevealClassName = 'meta__social--sticky--reveal',
        stickyRevealableClassName = 'meta__social--sticky--revealable',

        deadzone = 100,

        topEl = memoize(function () { return $(selectorTopEl)[0]; }),
        bottomEl = memoize(function () { return $(selectorBottomEl)[0]; }),

        inited = false,
        revealed = false;

    function setStickiness() {
        fastdom.read(function () {
            if (topEl().getBoundingClientRect().top + deadzone < 0) {
                reveal();
            } else {
                unreveal();
            }
        });
    }

    function determineStickiness() {
        if (inited) {
            setStickiness();

        } else if (!topEl() || !bottomEl()) {
            return;

        } else {
            fastdom.write(function () {
                $(bottomEl()).addClass(stickyClassName);
                setTimeout(makeRevealable);
                inited = true;
            });
        }
    }

    function makeRevealable() {
        fastdom.write(function () { $(bottomEl()).addClass(stickyRevealableClassName); });
    }

    function reveal() {
        if (!revealed) {
            revealed = true;
            fastdom.write(function () { $(bottomEl()).addClass(stickyRevealClassName); });
        }
    }

    function unreveal() {
        if (revealed) {
            revealed = false;
            fastdom.write(function () { $(bottomEl()).removeClass(stickyRevealClassName); });
        }
    }

    function moveToFirstPosition($el) {
        $el.parent().prepend($el.detach());
    }

    function init() {
        var testVariant = ab.getTestVariantId('ShareButtons2'),
            socialContext;

        if (testVariant.indexOf('referrer') > -1) {
            socialContext = detect.socialContext();

            if (socialContext) {
                fastdom.read(function () {
                    [topEl(), bottomEl()].forEach(function (el) {
                        if (el) {
                            fastdom.write(function () {
                                if (testVariant.indexOf('only') > -1) {
                                    $(el).addClass('social--referred-only');
                                }

                                moveToFirstPosition($('.social__item--' + socialContext, el).addClass('social__item--referred'));
                            });
                        }
                    });
                });
            }
        }

        if (testVariant.indexOf('sticky') > -1) {
            mediator.on('window:thottledScroll', determineStickiness);
        }
    }

    return {
        init: init
    };
});
