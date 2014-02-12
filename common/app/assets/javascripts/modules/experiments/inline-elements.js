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
	var leftSlot = SlotController.getLeftSlot();
	bonzo(leftSlot).append(item);
    }

    return {
        init: function() {

            if (!window.guardian.config.page.hasStoryPackage) { return false; }

            var inlineables = $('.item--gallery, .item--video', '.more-on-this-story');

            if (inlineables.length > 0 && $('.article-body .img').length === 0) {
                moveItem(inlineables[0]);

                if ($('.item', '.more-on-this-story').length === 0) {
                    $('.more-on-this-story').addClass('u-h');
                }
            }
        }
    };
});
