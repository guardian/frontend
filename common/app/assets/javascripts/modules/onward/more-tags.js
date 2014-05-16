/*
 Module: more-tags.js
 Description: upgrades the 'Tags' list on content with a show more.
 */
define([
    'common/$',
    'bean'
], function (
    $,
    bean
) {

    function MoreTags() {
        this.init = function() {
            var $more = $('.js-more-tags');
            if ($more.length !== 0) {
                $more.removeClass('js-hidden');
                bean.on(document.querySelector('.js-more-tags__link'), 'click', function(){
                    $('.js-hidden-tag').removeClass('js-hidden');
                    $more.addClass('js-hidden');
                });
            }
        };
    }

    return MoreTags;

});
