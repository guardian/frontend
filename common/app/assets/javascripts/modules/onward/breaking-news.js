define([
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/onward/history',
    'common/utils/storage',
    'lodash/objects/assign',
    'lodash/arrays/flatten',
    'bonzo'
], function (
    $,
    mediator,
    ajax,
    history,
    storage,
    _assign,
    _flatten,
    bonzo
) {
    var breakignNewsSource = '/breaking-news/lite.json',
        storageKeyOmit = 'gu.breaking-news.omit',
        threshold = 2,
        maxDisplayed = 1,
        header;

    function slashDelimit() {
        return Array.prototype.slice.call(arguments).filter(function(str) { return str;}).join('/');
    }

    return function (config) {
        var page = (config || {}).page,
            keyword = page.keywordIds ? (page.keywordIds + '').split(',')[0] : '';

        if (!page) { return; }

        ajax({
            url: breakignNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                var matchers = [
                        page.edition,
                        page.section,
                        slashDelimit(page.edition, page.section),
                        window.location.pathname.slice(1),
                        keyword,
                        keyword.split('/')[0]
                    ]
                    .filter(function(match) { return match; })
                    .reduce(function(matchers, str) {
                        matchers[str.toLowerCase()] = threshold;
                        return matchers;
                    }, {}),

                    articles = _flatten(
                        (resp.collections || [])
                        .filter(function(collection) {
                            return (collection.content.length && (collection.href === 'global' || matchers[collection.href] >= threshold));
                        })
                        .map(function(collection) {
                            return collection.content;
                        })
                    ),

                    articleIds = articles.map(function(article) { return article.id; }),

                    omitted = storage.local.get(storageKeyOmit) || [];

                _assign(matchers, history.getSummary().sections);
                _assign(matchers, history.getSummary().keywords);

                //console.log(matchers);
                //console.log(articles);
                //console.log(articleIds);

                articles
                .filter(function(article) {
                    return [page.pageId].concat(omitted).indexOf(article.id) === -1;
                })
                .slice(0, maxDisplayed)
                .forEach(function(article) {
                    header = header || bonzo(document.querySelector('#header'));
                    header.after('<div id="breaking-news" class="gs-container"><a href="/' + article.id + '">' + article.headline + '</a></div>');
                });
            },
            function() {
                mediator.emit(
                    'module:error', 'Failed to load breaking news'
                );  
            }
        );
    };

});
