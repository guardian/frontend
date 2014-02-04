define([
    'common/common',
    'common/$'
], function (
    common,
    $
    ) {

    return {
        init: function() {

            if (!window.guardian.config.page.hasStoryPackage) { return false; }

            var inlineables = $('.item--gallery, .item--video', '.more-on-this-story');
            var hasImages = $('.js-article__container .img').length > 0;
            if (inlineables.length > 0 && !hasImages) {
                //new InlineComponent(inlineables[0].detach());
                if ($('.item', '.more-on-this-story').length === 0) {
                    $('.more-on-this-story').addClass('u-h');
                }
            }
        }
    };
});
