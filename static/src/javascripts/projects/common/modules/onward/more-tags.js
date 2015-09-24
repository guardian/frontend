/*
 Module: more-tags.js
 Description: upgrades the 'Tags' list on content with a show more.
 */
define([
    'common/utils/$',
    'bean'
], function (
    $,
    bean
) {
    var ACTIVE_STATE = 'is-available';

    function MoreTags() {
        this.init = function () {
            var $more = $('.js-more-tags');
            if ($more.length !== 0) {
                $more.addClass(ACTIVE_STATE);
                bean.on(document.querySelector('.js-more-tags__link'), 'click', function () {
                    $('.modern-hidden-tag').removeClass('modern-hidden');
                    $more.removeClass(ACTIVE_STATE);
                });
            }
        };
    }

    return MoreTags;

});
