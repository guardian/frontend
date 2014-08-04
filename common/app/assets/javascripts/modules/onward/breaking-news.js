define([
    'common/utils/mediator',
    'common/utils/ajax',
    'common/modules/onward/history',
    'common/utils/storage',
    'lodash/objects/assign',
    'lodash/arrays/flatten',
    'lodash/arrays/intersection',
    'bean',
    'bonzo'
], function (
    mediator,
    ajax,
    history,
    storage,
    _assign,
    _flatten,
    _intersection,
    bean,
    bonzo
) {
    var breakignNewsSource = '/breaking-news/lite.json',
        storageKeyHidden = 'gu.breaking-news.hidden',
        interestThreshold = 3,
        maxSimultaneousAlerts = 1,
        container;

    function slashDelimit() {
        return Array.prototype.slice.call(arguments).filter(function(str) { return str;}).join('/');
    }

    return function (config) {
        var page = (config || {}).page,
            hiddenIds = storage.local.get(storageKeyHidden) || [];

        if (!page || hiddenIds.indexOf(page.pageId) > -1) { return; }

        ajax({
            url: breakignNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function(resp) {
                var keyword = page.keywordIds ? (page.keywordIds + '').split(',')[0] : '',

                    matchers = [
                        page.edition,
                        page.section,
                        slashDelimit(page.edition, page.section),
                        window.location.pathname.slice(1),
                        keyword,
                        keyword.split('/')[0]
                    ]
                    .filter(function(match) { return match; })
                    .reduce(function(matchers, term) {
                        matchers[term] = interestThreshold;
                        return matchers;
                    }, _assign(history.getSummary().sections, history.getSummary().keywords)),

                    articles = _flatten(
                        (resp.collections || [])
                        .filter(function(collection) {
                            return (collection.content.length && (collection.href === 'global' || matchers[collection.href] >= interestThreshold));
                        })
                        .map(function(collection) {
                            return collection.content;
                        })
                    ),

                    articleIds = articles.map(function(article) { return article.id; });

                if (articleIds.indexOf(page.pageId) > -1) {
                    hiddenIds.unshift(page.pageId);
                    storage.local.set(storageKeyHidden, _intersection(hiddenIds, articleIds));
                    // when displaying a breaking news item, don't show and other breaking news:
                    return;
                }

                articles
                .filter(function(article) {
                    return (hiddenIds.indexOf(article.id) === -1);
                })
                .slice(0, maxSimultaneousAlerts)
                .forEach(function(article) {
                    var el = bonzo.create('<div class="breaking-news" data-link-name="breaking news"><a data-link-name="article" href="/' + article.id + '">Breaking news: ' + article.headline + '</a></div>'),
                        closer = bonzo.create('<i class="breaking-news__close i-close-icon-white" data-link-name="close"></i>');

                    bonzo(el).append(closer);
                    container = container || bonzo(document.querySelector('#breaking-news'));
                    container.append(el);

                    bean.on(closer[0], 'click', function() {
                        bonzo(el).hide();
                        storage.local.set(storageKeyHidden, _intersection(hiddenIds.concat(article.id), articleIds));
                    });
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
