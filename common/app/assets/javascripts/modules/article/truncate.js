define([
    'common/$',
    'bean',
    'bonzo',
    'qwery',
    'common/utils/config',
    'common/utils/context',
    'common/utils/detect',
    'common/modules/article/twitter'
], function(
    $,
    bean,
    bonzo,
    qwery,
    config,
    context,
    detect,
    twitter
) {
    context = context();
    function shouldTruncate() {
        var truncatableLiveBlogs = config.page.section !== 'football' || detect.getBreakpoint() === 'mobile';
        return config.page.isLiveBlog && $('.live-blog__blocks').length > 1 && truncatableLiveBlogs;
    }

    function truncate() {
        var truncatedClass = 'truncated-block',
            numBlocks = config.page.section === 'football' ? 1 : 2,
            $truncatedBlocks = bonzo(qwery('.live-blog__blocks', context).slice(numBlocks));

        if (shouldTruncate()) {

            $.create(
                '<button class="u-fauxlink u-button-reset button button--show-more article-elongator" data-link-name="continue reading">'+
                    '<span class="tone-background i-center"><i class="i i-plus-white-med"></i></span>'+
                    'View all updates'+
                '</button>'
            ).each(function(el) {
                $('.article-body', context).append(el);
            });

            bean.on(context, 'click', '.article-elongator', function(e) {
                e.preventDefault();

                // Reinstate tweets and enhance them.
                $('.truncated-block blockquote.tweet-truncated', context).removeClass('tweet-truncated').addClass('tweet');
                twitter.enhanceTweets();

                $truncatedBlocks.removeClass(truncatedClass);
                bonzo(e.currentTarget).addClass('u-h');
            });

            $truncatedBlocks.addClass(truncatedClass);
            // Avoid running the twitter widget on truncated tweets.
            $('.truncated-block blockquote.tweet', context).removeClass('tweet').addClass('tweet-truncated');
        }
    }

    return truncate;

}); // define
