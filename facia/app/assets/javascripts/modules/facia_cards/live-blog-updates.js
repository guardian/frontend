define([
    'common/utils/$',
    'common/utils/ajax',
    'bonzo'
], function ($, ajax, bonzo) {
    var selector = '.js-live-blog-latest-block',
        articleIdAttribute = 'data-article-id',
        updateIntervalInMillis = 15000;

    function start() {
        var elementByArticleId = {},
            elements = $(selector);

        elements.each(function (element) {
            if (element.hasAttribute(articleIdAttribute)) {
                elementByArticleId[element.getAttribute(articleIdAttribute)] = element;
            } else {
                console.error(selector + ' element without ' + articleIdAttribute, element);
            }
        });

        function updateLatestBlocks() {
            ajax({
               url: "/live-blog-updates.json",
               type: "json",
               method: "get",
               crossOrigin: true,
               success: function (response) {
                   if (response && response.latestBlocks) {
                       response.latestBlocks.forEach(function (latestBlock) {
                           var element = elementByArticleId[latestBlock.articleId];

                           if (element) {
                               bonzo(element).html(latestBlock.body);
                           }
                       });
                   }
               }
            });
        }

        if (elements.length > 0) {
            setInterval(updateLatestBlocks, updateIntervalInMillis);
            updateLatestBlocks();
        }
    }

    return start;
});
