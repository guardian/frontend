/*
 Module: more-tags.js
 Description: upgrades the 'Tags' list on content with a show more.
 */
define([
    'common/$',
    'bonzo',
    'bean'
], function (
    $,
    bonzo,
    bean
) {

    function MoreTags() {
        this.init = function() {
            var more = $('.js-more-tags')[0];
            if (more) {
                bonzo(more).removeClass('js-hidden');
                bean.on(document.querySelector('.js-more-tags__link'), 'click', function(){
                    bonzo($('.js-hidden-tag')).removeClass('js-hidden');
                    bonzo(more).addClass('js-hidden');
                });
            }
        };
    }

    return MoreTags;

});
