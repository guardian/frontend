define([
    'common/$',
    'bean',
    'bonzo',
    'qwery',
    'common/utils/config',
    'common/utils/context',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/twitter'
], function(
    $,
    bean,
    bonzo,
    qwery,
    config,
    context,
    detect,
    mediator,
    twitter
) {
    context = context();
    var truncatedClass = 'truncated-block',
        numBlocks = config.page.section === 'football' ? 1 : 2,
        $truncatedBlocks = bonzo(qwery('.live-blog__blocks', context).slice(numBlocks));

    function shouldTruncate() {
        var truncatableLiveBlogs = config.page.section !== 'football' || detect.getBreakpoint() === 'mobile';
        return config.page.isLiveBlog && $('.live-blog__blocks').length > 1 && truncatableLiveBlogs;
    }

    function removeTruncation() {
        // Reinstate tweets and enhance them.
        $('.truncated-block blockquote.tweet-truncated', context).removeClass('tweet-truncated').addClass('tweet');
        twitter.enhanceTweets();

        $truncatedBlocks.removeClass(truncatedClass);
        $('.article-elongator').addClass('u-h');
    }

    function truncate() {

        if (shouldTruncate()) {

            $.create(
                '<button class="u-fauxlink u-button-reset button button--show-more article-elongator" data-link-name="continue reading">'+
                    '<span class="i-center"><i class="i i-plus-white-med"></i></span>'+
                    'View all updates'+
                '</button>'
            ).each(function(el) {
                $('.article-body', context).append(el);
            });

            bean.on(context, 'click', '.article-elongator', removeTruncation.bind(this));
            mediator.on('module:liveblog:showkeyevents', removeTruncation.bind(this));

            $truncatedBlocks.addClass(truncatedClass);
            // Avoid running the twitter widget on truncated tweets.
            $('.truncated-block blockquote.tweet', context).removeClass('tweet').addClass('tweet-truncated');
        }
    }

    return truncate;

}); // define
