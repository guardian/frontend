define([
    'common/utils/$',
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/onward/history',
    'common/utils/storage',
    'lodash/objects/assign',
    'lodash/arrays/flatten',
    'lodash/arrays/intersection',
    'bonzo'
], function (
    $,
    mediator,
    ajax,
    history,
    storage,
    _assign,
    _flatten,
    _intersection,
    bonzo
) {
    var breakignNewsSource = '/breaking-news/lite.json',
        storageKeyHidden = 'gu.breaking-news.hidden',
        threshold = 2,
        maxDisplayed = 1,
        header;

    function slashDelimit() {
        return Array.prototype.slice.call(arguments).filter(function(str) { return str;}).join('/');
    }

    return function (config) {
        var page = (config || {}).page,
            keyword = page.keywordIds ? (page.keywordIds + '').split(',')[0] : '',
            hidden = storage.local.get(storageKeyHidden) || [];

        if (!page || hidden.indexOf(page.pageId) > -1) { return; }

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
                    .reduce(function(matchers, key) {
                        matchers[key.toLowerCase()] = threshold;
                        return matchers;
                    }, _assign(history.getSummary().sections, history.getSummary().keywords)),

                    articles = _flatten(
                        (resp.collections || [])
                        .filter(function(collection) {
                            return (collection.content.length && (collection.href === 'global' || matchers[collection.href] >= threshold));
                        })
                        .map(function(collection) {
                            return collection.content;
                        })
                    ),

                    articleIds = articles.map(function(article) { return article.id; });

                if (articleIds.indexOf(page.pageId) > -1) {
                    hidden.unshift(page.pageId);
                    storage.local.set(storageKeyHidden, _intersection(hidden, articleIds));
                    // when displaying a breaking news item, don't show and other breaking news:
                    return;
                }

                articles
                .filter(function(collection) {
                    return (hidden.indexOf(collection.id) === -1);
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
