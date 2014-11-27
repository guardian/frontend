define([
    'bean',
    'bonzo',
    'qwery',
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
    qwery,
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
        maxSimultaneousAlerts = 1,
        $breakingNews,
        $breakingNewsItems;

    function slashDelimit() {
        return Array.prototype.slice.call(arguments).filter(function (str) { return str;}).join('/');
    }

    return function () {
        var page = config.page,
            hiddenIds = storage.local.get(storageKeyHidden) || [];

        this.init = function(type) {
            type = (type || 'top');

            switch(type) {
                case 'top':

                break;
            }
        }

        if (!page || hiddenIds.indexOf(page.pageId) > -1) { return; }

        // just for tests
        if (location.pathname === '/us') { return; }

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

                    pageMatchers = history.getPopular().map(function (idAndName) { return idAndName[0]; })
                        .concat([
                            page.edition,
                            page.section,
                            slashDelimit(page.edition, page.section),
                            window.location.pathname.slice(1),
                            keyword,
                            keyword.split('/')[0]
                        ])
                        .filter(function (match) { return match; })
                        .reduce(function (matchers, term) {
                            matchers[term.toLowerCase()] = true;
                            return matchers;
                        }, {}),

                    articles = flatten([
                        collections.filter(function (c) { return c.href === 'global'; }).map(function (c) { return c.content; }),
                        collections.filter(function (c) { return pageMatchers[c.href]; }).map(function (c) { return c.content; })
                    ]),

                    articleIds = articles.map(function (article) { return article.id; }),
                    showAlert = false;

                // FOR TESTS, WE NEED TO CONTROL DISPLAY MORE THAN THIS
                // if (articleIds.indexOf(page.pageId) > -1) {
                //     hiddenIds.push(page.pageId);
                //     storage.local.set(storageKeyHidden, intersection(hiddenIds, articleIds));
                //     // when displaying a breaking news item, don't show any other breaking news:
                //     return;
                // }

                articles
                .filter(function (article) {
                    return (hiddenIds.indexOf(article.id) === -1);
                })
                .slice(0, maxSimultaneousAlerts)
                .forEach(function (article) {
                    var src = '<div class="breaking-news__item" data-link-name="breaking news">' +
                            '<em class="breaking-news__item-label">Breaking News</em> ' +
                            '<p class="breaking-news__item-headline">' + article.headline + '</p>' +
                            '<a class="breaking-news__item-headline" data-link-name="article" href="/' + article.id + '">' + article.headline + '</a>' +
                            '<div class="js-breaking-news__item__close button button--tertiary breaking-news__item__close"><i class="i i-close-icon-white-small" data-link-name="close"></i> Close</div>' +
                            '<a href="/' + article.id + '" class="button button--tertiary">Open story</a>' +
                        '</div>',
                        $el = bonzo.create(src);

                    $breakingNews = $breakingNews || bonzo(qwery('.js-breaking-news-placeholder'));
                    $breakingNewsItems = $breakingNewsItems || bonzo(qwery('.breaking-news__items'));

                    $breakingNewsItems.append($el);

                    bean.on($el[0], 'click', '.button', function (e) {
                        bonzo($breakingNews).hide();
                        hiddenIds.push(article.id);
                        storage.local.set(storageKeyHidden, intersection(hiddenIds, articleIds));
                    });

                    showAlert = true;
                });

                if(showAlert) {
                    setTimeout(function() {
                        $breakingNews.removeClass('breaking-news--loading');
                    }, 1000);
                }
            }
        );
    };

});
