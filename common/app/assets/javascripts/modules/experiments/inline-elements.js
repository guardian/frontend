define([
    'common/common',
    'common/$',
    'qwery',
    'bonzo',
    'common/modules/onward/slot-controller'
], function (
    common,
    $,
    qwery,
    bonzo,
    SlotController
    ) {

    function replaceClasses(el) {
        var classes = el.getAttribute('class');
        if (classes) {
            el.setAttribute('class', classes.replace(/item/g,'inline-story'));
        }
    }

    return {
        init: function() {

            if (!window.guardian.config.page.hasStoryPackage) { return false; }

            var inlineables = $('.item--gallery, .item--video', '.more-on-this-story');

            if (inlineables.length > 0 && $('.article-body .img').length === 0) {
                var leftSlot = SlotController.getLeftSlot();
                bonzo(leftSlot).append(inlineables[0]);
                replaceClasses(inlineables[0]);
                qwery('*', inlineables[0]).forEach(replaceClasses);

                if ($('.item', '.more-on-this-story').length === 0) {
                    $('.more-on-this-story').addClass('u-h');
                }
            }
        }
    };
});
