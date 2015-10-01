define([
    'bean',
    'bonzo',
    'common/utils/$',
    'fastdom',
    'qwery',
    'common/utils/_',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/storage',
    'common/utils/template',
    'common/modules/ui/relativedates',
    'common/modules/analytics/omniture',
    'common/views/svgs',
    'text!common/views/breaking-news.html'
], function (
    bean,
    bonzo,
    $,
    fastdom,
    qwery,
    _,
    ajax,
    config,
    storage,
    template,
    relativeDates,
    omniture,
    svgs,
    alertHtml
) {
    var alertWithinSeconds = 1200, // 20 minutes
        supportedSections = {
            'sport': 'sport',
            'football': 'sport'
        },
        breakingNewsSource = '/breaking-news/lite.json',
        storageKeyHidden = 'gu.breaking-news.hidden',
        maxSimultaneousAlerts = 1,
        $breakingNews,
        $body,
        marque36icon,
        closeIcon;

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
                        // collection.href is string or null
                        collection.href = (collection.href || '').toLowerCase();
                        return collection;
                    }),
                    edition = (page.edition || '').toLowerCase(),
                    section = supportedSections[page.section],

                    articles = _.chain([
                        collections.filter(function (c) { return c.href === 'global'; }).map(function (c) { return c.content; }),
                        collections.filter(function (c) { return c.href === edition;  }).map(function (c) { return c.content; }),
                        collections.filter(function (c) { return section && c.href === section; }).map(function (c) { return c.content; })
                    ])
                    .flatten()
                    .filter(function (article) {
                        var alertTime = article.frontPublicationDate;
                        return alertTime && relativeDates.isWithinSeconds(new Date(alertTime), alertWithinSeconds);
                    })
                    .value(),

                    articleIds = articles.map(function (article) { return article.id; }),
                    alertDelay = 3000,
                    alerts;

                // if we're on the page that an alert is for, hide alerts for it
                if (articleIds.indexOf(page.pageId) > -1) {
                    hiddenIds[page.pageId] = true;
                }

                // update stored IDs with current batch, so we know we've seen these
                storage.local.set(storageKeyHidden, cleanIDs(articleIds, hiddenIds));

                alerts = _.chain(articles)
                    .filter(function (article) { return hiddenIds[article.id] !== true; })
                    .first(maxSimultaneousAlerts)
                    .value();

                if (alerts.length) {
                    $breakingNews = $breakingNews || bonzo(qwery('.js-breaking-news-placeholder'));
                    marque36icon = svgs('marque36icon');
                    closeIcon = svgs('closeCentralIcon');

                    _.forEach(alerts, function (article) {
                        var el;

                        article.marque36icon = marque36icon;
                        article.closeIcon = closeIcon;
                        el = bonzo.create(template(alertHtml, article));

                        bean.on($('.js-breaking-news__item__close', el)[0], 'click', function () {
                            fastdom.write(function () {
                                $('[data-breaking-article-id]').hide();
                            });
                            hiddenIds[article.id] = true;
                            storage.local.set(storageKeyHidden, cleanIDs(articleIds, hiddenIds));
                        });

                        fastdom.write(function () {
                            $breakingNews.append(el);
                        });

                        if (hiddenIds[article.id] === false) {
                            alertDelay = 0;
                        }
                    });

                    setTimeout(function () {
                        var message = 'breaking news alert shown' + (alertDelay ? '' : ' 2 or more times'), $breakingNewsSpectre;

                        $body = $body || bonzo(document.body);
                        $breakingNewsSpectre = bonzo(bonzo.create($breakingNews[0])).addClass('breaking-news--spectre').removeClass('breaking-news--hidden');

                        fastdom.write(function () {
                            $body.append($breakingNewsSpectre);
                        });

                        if (!alertDelay) {
                            fastdom.write(function () {
                                $breakingNews.removeClass('breaking-news--fade-in');
                            });
                        }

                        fastdom.write(function () {
                            $breakingNews.removeClass('breaking-news--hidden');
                        });

                        omniture.trackLink(this, message);
                    }, alertDelay);
                }
            }
        );
    };

});
