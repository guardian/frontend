define([
    'common/utils/$',
    'bean',
    'bonzo',
    'qwery',
    'common/utils/_',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/views/svgs',
    'common/modules/article/twitter',
    'lodash/collections/find'
], function (
    $,
    bean,
    bonzo,
    qwery,
    _,
    config,
    detect,
    mediator,
    svgs,
    twitter,
    find) {
    var truncatedClass = 'truncated-block',
        minVisibleBlocks = detect.getBreakpoint() === 'mobile' ? 5 : 10,
        blocks = qwery('.block'),
        truncatedBlocks = blocks.slice(minVisibleBlocks),
        $truncatedBlocks = bonzo(truncatedBlocks);

    function removeTruncation() {
        // Reinstate tweets and enhance them.
        $('.truncated-block blockquote.tweet-truncated').removeClass('tweet-truncated').addClass('js-tweet');
        $truncatedBlocks.removeClass(truncatedClass);
        $('.article-elongator').addClass('u-h');
        twitter.enhanceTweets();
    }

    function hashLinkedBlockIsTruncated() {
        var id = window.location.hash.slice(1);
        return find(truncatedBlocks, function (el) { return el.id === id; });
    }

    function truncate() {

        var numBlocks        = blocks.length,
            remainingBlocks  = numBlocks - minVisibleBlocks,
            viewUpdatesLabel = '';

        if (config.page.isLiveBlog && numBlocks > minVisibleBlocks && !hashLinkedBlockIsTruncated()) {

            if (remainingBlocks === 1) {
                viewUpdatesLabel = 'View 1 more update';
            } else {
                viewUpdatesLabel = 'View ' + remainingBlocks + ' more updates';
            }

            $.create(
                '<button class="u-button-reset button button--large button--show-more liveblog__show-more article-elongator" data-link-name="continue reading" data-test-id="article-expand">' +
                    svgs('plus', ['icon']) +
                    viewUpdatesLabel +
                '</button>'
            ).each(function (el) {
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
