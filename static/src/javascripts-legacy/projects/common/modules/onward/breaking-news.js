define([
    'bean',
    'bonzo',
    'lib/$',
    'fastdom',
    'qwery',
    'Promise',
    'lib/config',
    'lib/fetch-json',
    'lib/report-error',
    'lib/storage',
    'lodash/utilities/template',
    'lib/mediator',
    'common/modules/ui/relativedates',
    'common/views/svgs',
    'raw-loader!common/views/breaking-news.html',
    'lodash/objects/isArray',
    'lodash/objects/has',
    'lodash/arrays/flatten',
    'lodash/objects/pick'
], function (
    bean,
    bonzo,
    $,
    fastdom,
    qwery,
    Promise,
    config,
    fetchJson,
    reportError,
    storage,
    template,
    mediator,
    relativeDates,
    svgs,
    alertHtml,
    isArray,
    has,
    flatten,
    pick
) {
    var supportedSections = {
            'sport': 'sport',
            'football': 'sport'
        },
        breakingNewsURL = '/news-alert/alerts',
        page = config.page,

        // get the users breaking news alert history
        // {
        //     alertID: true, <- dismissed/visited
        //     alertID: false <- seen, but not dismissed/visited
        // }
        knownAlertIDsStorageKey = 'gu.breaking-news.hidden',
        knownAlertIDs;

    function storeKnownAlertIDs() {
        storage.localStorage.set(knownAlertIDsStorageKey, knownAlertIDs);
    }

    function markAlertAsSeen(id) {
        updateKnownAlertID(id, false);
    }

    function markAlertAsDismissed(id) {
        updateKnownAlertID(id, true);
    }

    function updateKnownAlertID(id, state) {
        knownAlertIDs[id] = state;
        storeKnownAlertIDs();
    }

    // if we can't record a dismissal, we won't show an alert
    function userCanDismissAlerts() {
        return storage.localStorage.isAvailable();
    }

    function fetchBreakingNews() {
        return fetchJson(breakingNewsURL, {
            mode: 'cors'
        });
    }

    // handle the breaking news JSON
    function parseResponse(response) {
        return (response.collections || [])
            .filter(function (collection) {
                return isArray(collection.content) && collection.content.length;
            })
            .map(function (collection) {
                // collection.href is string or null
                collection.href = (collection.href || '').toLowerCase();
                return collection;
            });
    }

    // pull out the alerts from the edition/section buckets that apply to us
    // global > current edition > current section
    function getRelevantAlerts(alerts) {
        var edition = (page.edition || '').toLowerCase(),
            section = supportedSections[page.section];

        return flatten([
            alerts
                .filter(function (alert) {return alert.href === 'global';})
                .map(function (alert) {return alert.content;}),
            alerts
                .filter(function (alert) {return alert.href === edition;})
                .map(function (alert) {return alert.content;}),
            alerts
                .filter(function (alert) {return section && alert.href === section;})
                .map(function (alert) {return alert.content;})
        ]);
    }

    // keep the local alert history in sync with live alerts
    function pruneKnownAlertIDs(alerts) {
        // 'dismiss' this page ID, since if there's an alert for it,
        // we don't want to show it ever
        knownAlertIDs[page.pageId] = true;

        // then remove all known alert ids that are not
        // in the current breaking news alerts
        knownAlertIDs = pick(knownAlertIDs, function (state, id) {
            return alerts.some(function (alert) {return alert.id === id;});
        });

        storeKnownAlertIDs();
        return alerts;
    }

    // don't show alerts if we've already dismissed them
    function filterAlertsByDismissed(alerts) {
        return alerts.filter(function (alert) {
            return knownAlertIDs[alert.id] !== true;
        });
    }

    // don't show alerts if they're over a certain age
    function filterAlertsByAge(alerts) {
        return alerts.filter(function (alert) {
            var alertTime = alert.frontPublicationDate;
            return alertTime && relativeDates.isWithinSeconds(new Date(alertTime), 1200); // 20 mins
        });
    }

    // we only show one alert at a time, pick the youngest available
    function pickNewest(alerts) {
        return alerts.sort(function (a, b) {
            return b.frontPublicationDate - a.frontPublicationDate;
        })[0];
    }

    // show an alert
    function alert(alert) {
        if (alert) {
            var $body = bonzo(document.body);
            var $breakingNews = bonzo(qwery('.js-breaking-news-placeholder'));

            // if its the first time we've seen this alert, we wait 3 secs to show it
            // otherwise we show it immediately
            var alertDelay = has(knownAlertIDs, alert.id) ? 0 : init.DEFAULT_DELAY;

            // $breakingNews is hidden, so this won't trigger layout etc
            $breakingNews.append(renderAlert(alert));

            // copy of breaking news banner (with blank content) used inline at the
            // bottom of the body, so the bottom of the body can visibly scroll
            // past the pinned alert
            var $spectre = renderSpectre($breakingNews);

            // inject the alerts into DOM
            setTimeout(function () {
                fastdom.write(function () {
                    if (alertDelay === 0) {
                        $breakingNews.removeClass('breaking-news--fade-in');
                    }
                    $body.append($spectre);
                    $breakingNews.removeClass('breaking-news--hidden');
                    markAlertAsSeen(alert.id);
                });
            }, alertDelay);

            mediator.emit('modules:onwards:breaking-news:ready', true);
        } else {
            mediator.emit('modules:onwards:breaking-news:ready', false);
        }
        return alert;
    }

    function renderAlert(alert) {
        alert.marque36icon = svgs('marque36icon');
        alert.closeIcon = svgs('closeCentralIcon');

        var $alert = bonzo.create(template(alertHtml, alert));

        bean.on($('.js-breaking-news__item__close', $alert)[0], 'click', function () {
            fastdom.write(function () {
                $('[data-breaking-article-id]').hide();
            });
            markAlertAsDismissed(alert.id);
        });

        return $alert;
    }

    function renderSpectre($breakingNews) {
        return bonzo(bonzo.create($breakingNews[0]))
            .addClass('breaking-news--spectre')
            .removeClass('breaking-news--fade-in breaking-news--hidden');
    }

    function init () {
        if (userCanDismissAlerts()) {
            knownAlertIDs = storage.localStorage.get(knownAlertIDsStorageKey) || {};

            return fetchBreakingNews()
                .then(parseResponse)
                .then(getRelevantAlerts)
                .then(pruneKnownAlertIDs)
                .then(filterAlertsByDismissed)
                .then(filterAlertsByAge)
                .then(pickNewest)
                .then(alert)
                .catch(function (ex) {
                    reportError(ex, { feature: 'breaking-news' });
                });
        } else {
            return Promise.reject(new Error('cannot dismiss'));
        }
    }

    init.DEFAULT_DELAY = 3000;
    return init;
});
