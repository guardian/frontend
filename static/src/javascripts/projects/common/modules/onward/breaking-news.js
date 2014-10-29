define([
    'bean',
    'bonzo',
    'raven',
    'lodash/arrays/flatten',
    'lodash/arrays/intersection',
    'lodash/objects/assign',
    'lodash/objects/isArray',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/storage',
    'common/modules/onward/history'
], function (
    bean,
    bonzo,
    raven,
    flatten,
    intersection,
    assign,
    isArray,
    ajax,
    config,
    storage,
    history
) {
    var breakingNewsSource = '/breaking-news/lite.json',
        storageKeyHidden = 'gu.breaking-news.hidden',
        interestThreshold = 5,
        maxSimultaneousAlerts = 1,
        container;

    function slashDelimit() {
        return Array.prototype.slice.call(arguments).filter(function (str) { return str;}).join('/');
    }

    return function () {
        var page = config.page,
            hiddenIds = storage.local.get(storageKeyHidden) || [];

        if (!page || hiddenIds.indexOf(page.pageId) > -1) { return; }

        ajax({
            url: breakingNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function (resp) {
                var collections = (resp.collections || [])
                    .filter(function (collection) { return isArray(collection.content) && collection.content.length; })
                    .map(function (collection) {
                        collection.href = collection.href.toLowerCase();
                        return collection;
                    }),

                    keyword = page.keywordIds ? page.keywordIds.split(',')[0] : '',

                    pageMatchers = [
                        page.edition,
                        page.section,
                        slashDelimit(page.edition, page.section),
                        window.location.pathname.slice(1),
                        keyword,
                        keyword.split('/')[0]
                    ]
                    .filter(function (match) { return match; })
                    .reduce(function (matchers, term) {
                        matchers[term.toLowerCase()] = true;
                        return matchers;
                    }, {}),

                    historyMatchers = assign({}, assign(history.getSummary().sections, history.getSummary().keywords)),

                    articles = flatten([
                        collections.filter(function (c) { return c.href === 'global'; }).map(function (c) { return c.content; }),
                        collections.filter(function (c) { return pageMatchers[c.href]; }).map(function (c) { return c.content; }),
                        collections.filter(function (c) { return historyMatchers[c.href] >= interestThreshold; }).map(function (c) { return c.content; })
                    ]),

                    articleIds = articles.map(function (article) { return article.id; });

                if (articleIds.indexOf(page.pageId) > -1) {
                    hiddenIds.push(page.pageId);
                    storage.local.set(storageKeyHidden, intersection(hiddenIds, articleIds));
                    // when displaying a breaking news item, don't show any other breaking news:
                    return;
                }

                articles
                .filter(function (article) {
                    return (hiddenIds.indexOf(article.id) === -1);
                })
                .slice(0, maxSimultaneousAlerts)
                .forEach(function (article) {
                    var $el = bonzo.create('<div class="breaking-news-item" data-link-name="breaking news"><a data-link-name="article" href="/' + article.id + '">Breaking news: ' + article.headline + '</a></div>'),
                        $closer = bonzo.create('<i class="breaking-news-item__close i-close-icon-white" data-link-name="close"></i>');

                    bonzo($el).append($closer);
                    container = container || bonzo(document.querySelector('.js-breaking-news-placeholder'));
                    container.append($el);

                    bean.on($closer[0], 'click', function () {
                        bonzo($el).hide();
                        hiddenIds.push(article.id);
                        storage.local.set(storageKeyHidden, intersection(hiddenIds, articleIds));
                    });
                });
            }
        );
    };

});
