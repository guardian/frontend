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

    function moveItem(item) {
        item.getElementsByClassName('item__meta')[0].classList.add('js-append-commentcount');
        replaceClasses(item);
        qwery('*', item).forEach(replaceClasses);
        var leftSlot = SlotController.getSlot('left');
        bonzo(leftSlot).append(item);
    }

    return {
        test: function() {
            var slot = SlotController.getSlot('left');
            slot.innerHTML = '<div class="inline-story inline-story--test"><div class="inline-story__container"></div></div>';
            slot = SlotController.getSlot('left');
            slot.innerHTML = '<div class="inline-story inline-story--test"><div class="inline-story__container"></div></div>';
            slot = SlotController.getSlot('right');
            slot.innerHTML = '<div class="inline-ad-test"></div>';
            slot = SlotController.getSlot('right');
            slot.innerHTML = '<div class="inline-ad-test"></div>';

        },
        init: function() {

            //this.test();
            //return;

            if (!window.guardian.config.page.hasStoryPackage) { return false; }

            var inlineables = $('.item--gallery, .item--video', '.more-on-this-story');

            if (inlineables.length > 0 && $('.article-body .img').length === 0) {
                for (var i = 0; i < Math.min(2, inlineables.length); i++) {
                    moveItem(inlineables[i]);
                }

                if ($('.item', '.more-on-this-story').length === 0) {
                    $('.more-on-this-story').addClass('u-h');
                }
            }
        }
    };
});
