define([
    'bean',
    'bonzo',
    'qwery',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/onward/history',
    'common/views/svgs',
    'text!common/views/breaking-news.html'
], function (
    bean,
    bonzo,
    qwery,
    _,
    ajax,
    config,
    storage,
    template,
    history,
    svgs,
    alertHtml
) {
    var breakingNewsSource = '/breaking-news/lite.json',
        storageKeyHidden = 'gu.breaking-news.hidden',
        maxSimultaneousAlerts = 1,
        $breakingNews,
        $body;

    function slashDelimit() {
        return Array.prototype.slice.call(arguments).filter(function (str) { return str;}).join('/');
    }

    function cleanIDs(articleIds, hiddenIds) {
        var cleanedIDs = {};
        _.forEach(articleIds, function (articleID) {
            cleanedIDs[articleID] = hiddenIds[articleID] || false;
        });
        return cleanedIDs;
    }

    return function () {
        var page = config.page,
            hiddenIds = storage.local.get(storageKeyHidden) || {};

        if (!page || hiddenIds[page.pageId] === true) { return; }

        ajax({
            url: breakingNewsSource,
            type: 'json',
            crossOrigin: true
        }).then(
            function (resp) {
                var collections = (resp.collections || [])
                    .filter(function (collection) { return _.isArray(collection.content) && collection.content.length; })
                    .map(function (collection) {
                        collection.href = collection.href.toLowerCase();
                        return collection;
                    }),

                    keyword = page.keywordIds ? page.keywordIds.split(',')[0] : '',

                    pageMatchers = _.chain(history.getPopular())
                        .map(function (idAndName) { return idAndName[0]; })
                        .union([
                            page.edition,
                            _.contains(['uk', 'us', 'au'], page.section) ? null : page.section,
                            slashDelimit(page.edition, page.section),
                            keyword,
                            keyword.split('/')[0]
                        ])
                        .compact()
                        .reduce(function (matchers, term) {
                            matchers[term.toLowerCase()] = true;
                            return matchers;
                        }, {})
                        .value(),

                    articles = _.flatten([
                        collections.filter(function (c) { return c.href === 'global'; }).map(function (c) { return c.content; }),
                        collections.filter(function (c) { return pageMatchers[c.href]; }).map(function (c) { return c.content; })
                    ]),

                    articleIds = articles.map(function (article) { return article.id; }),
                    showAlert = false,
                    alertDelay = 3000;

                // if we're on the page that an alert is for, hide alerts for it
                if (articleIds.indexOf(page.pageId) > -1) {
                    hiddenIds[page.pageId] = true;
                }

                // update stored IDs with current batch, so we know we've seen these
                storage.local.set(storageKeyHidden, cleanIDs(articleIds, hiddenIds));

                _.chain(articles)
                .filter(function (article) { return hiddenIds[article.id] !== true; })
                .first(maxSimultaneousAlerts)
                .forEach(function (article) {
                    article.marque_36_icon = svgs('marque_36_icon');
                    var $el = bonzo.create(template(alertHtml, article));

                    $breakingNews = $breakingNews || bonzo(qwery('.js-breaking-news-placeholder'));
                    $breakingNews.append($el);

                    bean.on($breakingNews[0], 'click', '.js-breaking-news__item__close', function (e) {
                        var id;
                        e.preventDefault();
                        id = e.currentTarget.getAttribute('data-article-id');
                        hiddenIds[id] = true;
                        storage.local.set(storageKeyHidden, cleanIDs(articleIds, hiddenIds));
                        bonzo(qwery('.js-breaking-news__item[href$="' + id + '"]')).remove();
                    });

                    showAlert = true;

                    if (hiddenIds[article.id] === false) {
                        alertDelay = 0;
                    }
                });

                if (showAlert) {
                    setTimeout(function () {
                        $body = $body || bonzo(document.body);
                        $body.append(bonzo(bonzo.create($breakingNews[0])).addClass('breaking-news--spectre').removeClass('breaking-news--hidden'));

                        if (alertDelay === 0) {
                            $breakingNews.removeClass('breaking-news--fade-in');
                            s.tl(this, 'o', 'breaking news alert shown 2 or more times');
                        } else {
                            s.tl(this, 'o', 'breaking news alert shown');
                        }

                        $breakingNews.removeClass('breaking-news--hidden');
                    }, alertDelay);
                }
            }
        );
    };

});
