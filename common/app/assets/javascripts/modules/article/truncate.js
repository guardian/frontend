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
        minVisibleBlocks = detect.getBreakpoint() === 'mobile' ? 5 : 10,
        $truncatedBlocks = bonzo(qwery('.block').slice(minVisibleBlocks));

    function removeTruncation() {
        // Reinstate tweets and enhance them.
        $('.truncated-block blockquote.tweet-truncated').removeClass('tweet-truncated').addClass('js-tweet');
        $truncatedBlocks.removeClass(truncatedClass);
        $('.article-elongator').addClass('u-h');
        twitter.enhanceTweets();
    }

    function truncate() {

        var numBlocks = qwery('.block').length;

        if (config.page.isLiveBlog && numBlocks > minVisibleBlocks && window.location.hash === '') {

            var remainingBlocks = numBlocks - minVisibleBlocks;
            var viewUpdatesLabel = '';

            if (remainingBlocks === 1 ) {
                viewUpdatesLabel = 'View 1 more update';
            } else {
                viewUpdatesLabel = 'View ' + remainingBlocks + ' more updates';
            }

            $.create(
                '<button class="u-button-reset button button--large liveblog__show-more article-elongator" data-link-name="continue reading" data-test-id="article-expand">'+
                    '<i class="i i-plus-white-small"></i>'+
                    viewUpdatesLabel+
                '</button>'
            ).each(function(el) {
                $('.js-liveblog-body').append(el);
            });

            bean.on(document.body, 'click', '.article-elongator', removeTruncation.bind(this));
            mediator.on('module:liveblog:showkeyevents', removeTruncation.bind(this));
            mediator.on('module:filter:toggle', removeTruncation.bind(this));

            $truncatedBlocks.addClass(truncatedClass);
            // Avoid running the twitter widget on truncated tweets.
            $('.truncated-block blockquote.tweet').removeClass('js-tweet').addClass('tweet-truncated');
        }
    }

    return truncate;

}); // define
