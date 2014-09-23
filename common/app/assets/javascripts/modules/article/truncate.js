define([
    'common/utils/$',
    'bean',
    'bonzo',
    'qwery',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/article/twitter'
], function(
    $,
    bean,
    bonzo,
    qwery,
    config,
    detect,
    mediator,
    twitter
) {
    var truncatedClass = 'truncated-block',
        numBlocks = detect.getBreakpoint() === 'mobile' ? 5 : 10,
        $truncatedBlocks = bonzo(qwery('.block').slice(numBlocks));

    function removeTruncation() {
        // Reinstate tweets and enhance them.
        $('.truncated-block blockquote.tweet-truncated').removeClass('tweet-truncated').addClass('tweet');
        twitter.enhanceTweets();

        $truncatedBlocks.removeClass(truncatedClass);
        $('.article-elongator').addClass('u-h');
    }

    function truncate() {

        if (config.page.isLiveBlog && qwery('.block').length > numBlocks && window.location.hash === '') {

            $.create(
                '<button class="u-fauxlink u-button-reset button button--large liveblog__show-more article-elongator" data-link-name="continue reading" data-test-id="article-expand">'+
                    '<i class="i i-plus-white-small"></i>'+
                    'View all updates'+
                '</button>'
            ).each(function(el) {
                $('.js-liveblog-body').append(el);
            });

            bean.on(document.body, 'click', '.article-elongator', removeTruncation.bind(this));
            mediator.on('module:liveblog:showkeyevents', removeTruncation.bind(this));
            mediator.on('module:filter:toggle', removeTruncation.bind(this));

            $truncatedBlocks.addClass(truncatedClass);
            // Avoid running the twitter widget on truncated tweets.
            $('.truncated-block blockquote.tweet').removeClass('tweet').addClass('tweet-truncated');
        }
    }

    return truncate;

}); // define
