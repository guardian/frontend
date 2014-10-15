define([
    'common/utils/$',
    'common/utils/ajax',
    'bonzo'
], function ($, ajax, bonzo) {
    var selector = '.js-live-blog-latest-block',
        articleIdAttribute = 'data-article-id',
        updateIntervalInMillis = 15000;

    function start() {
        var elementsByArticleId = {},
            elements = $(selector);

        elements.each(function (element) {
            if (element.hasAttribute(articleIdAttribute)) {
                var articleId = element.getAttribute(articleIdAttribute);

                if (!elementsByArticleId[articleId]) {
                    elementsByArticleId[articleId] = [];
                }

                elementsByArticleId[articleId].push(element);
            }
        });

        function updateLatestBlocks() {
            ajax({
                url: '/live-blog-updates.json',
                type: 'json',
                method: 'get',
                crossOrigin: true,
                success: function (response) {
                    if (response && response.latestBlocks) {
                        response.latestBlocks.forEach(function (latestBlock) {
                            var elements = elementsByArticleId[latestBlock.articleId];

                            elements.forEach(function (element) {
                                if (element && element.getAttribute('data-blockId') !== latestBlock.blockId) {
                                    var $el = bonzo(element).addClass('fc-item__latest-block--unloading');

                                    setTimeout(function () {
                                        $el.addClass('fc-item__latest-block--loading');
                                        setTimeout(function () {
                                            $el.toggleClass('fc-item__latest-block--loading fc-item__latest-block--unloading')
                                            .html(latestBlock.body)
                                            .attr('href', latestBlock.articleId + '#' + latestBlock.blockId);
                                            element.setAttribute('data-blockId', latestBlock.blockId);
                                        }, 50);
                                    }, 250); // wait for transform to finish
                                }
                            });
                        });
                    }
                }
            });
        }

        if (elements) {
            setInterval(updateLatestBlocks, updateIntervalInMillis);
            updateLatestBlocks();
        }
    }

    return start;
});
