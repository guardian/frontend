define([
    'common/$',
    'bean',
    'bonzo',
    'common/utils/config',
    'common/utils/context',
    'common/utils/detect'
], function(
    $,
    bean,
    bonzo,
    config,
    context,
    detect
) {

    context = context();
    function shouldTruncate() {
        return config.page.isLiveBlog &&
            detect.getBreakpoint() === 'mobile' &&
            config.page.section === 'football' &&
            $('.live-blog__blocks').length > 1;
    }

    function truncate() {
        var articleElongateClass = 'article-elongator',
            truncatedClass = 'article--truncated',
            $article = $('#article', context).addClass(truncatedClass);

        if (shouldTruncate()) {
            $.create(
                '<button class="u-fauxlink u-button-reset button--show-more '+ articleElongateClass +'">'+
                    '<i class="i i-plus-white-med tone-background"></i>'+
                    'View all updates'+
                '</button>'
            ).each(function(el) {
                $('.article-body', context).append(el);
            });

            bean.on(context, 'click', '.'+articleElongateClass, function(e) {
                e.preventDefault();
                $article.removeClass(truncatedClass);
                bonzo(e.currentTarget).addClass('u-h');
            });
        }
    }

    return truncate;

}); // define
