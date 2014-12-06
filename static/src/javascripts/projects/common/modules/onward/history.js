/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/template',
    'common/utils/storage'
], function (
    $,
    _,
    config,
    template,
    storage
) {

    var editions = [
            'uk',
            'us',
            'au'
        ],

        editionalised = [
            'business',
            'commentisfree',
            'culture',
            'environment',
            'media',
            'money',
            'sport',
            'technology'
        ],

        pageMeta = [
            {tid: 'section',    tname: 'sectionName'},
            {tid: 'keywordIds', tname: 'keywords'},
            {tid: 'seriesId',   tname: 'series'},
            {tid: 'authorIds',  tname: 'author'}
        ],

        summaryPeriodDays = 30,
        forgetUniqueAfter = 10,
        historySize = 50,
        popularSize = 20,

        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',
        storageKeyNavPrimary  = 'gu.history.nav.primary',
        storageKeyNavSecondary = 'gu.history.nav.secondary',

        historyCache,
        summaryCache,
        popularCache,

        today =  Math.floor(Date.now() / 86400000), // 1 day in ms

        isEditionalisedRx = new RegExp('^(' + editions.join('|') + ')\/(' + editionalised.join('|') + ')$'),
        stripEditionRx = new RegExp('^(' + editions.join('|') + ')\/');


    function saveHistory(history) {
        historyCache = history;
        return storage.local.set(storageKeyHistory, history);
    }

    function saveSummary(summary) {
        summaryCache = summary;
        return storage.local.set(storageKeySummary, summary);
    }

    function getHistory() {
        historyCache = historyCache || storage.local.get(storageKeyHistory) || [];
        return historyCache;
    }

    function getSummary() {
        if (summaryCache) {
            return summaryCache;
        }

        summaryCache = storage.local.get(storageKeySummary);

        if (!_.isObject(summaryCache) || !_.isObject(summaryCache.tags) || !_.isNumber(summaryCache.periodEnd)) {
            summaryCache = {
                periodEnd: today,
                tags: {}
            };
        }
        return summaryCache;
    }

    function isRevisit(pageId) {
        return (_.find(getHistory(), function (page) {
            return (page[0] === pageId);
        }) || [])[1] > 1;
    }

    function pruneSummary(summary, mockToday) {
        var newToday = mockToday || today,
            updateBy = newToday - summary.periodEnd;

        if (updateBy !== 0) {
            summary.periodEnd = newToday;

            _.each(summary.tags, function (nameAndFreqs, tid) {
                var freqs = _.chain(nameAndFreqs[1])
                    .map(function (freq) {
                        var newAge = freq[0] + updateBy;
                        return newAge < summaryPeriodDays && newAge >= 0 ? [newAge, freq[1]] : false;
                    })
                    .compact()
                    .value();

                if (freqs.length > 1 || (freqs.length === 1 && freqs[0][0] < forgetUniqueAfter)) {
                    summary.tags[tid] = [nameAndFreqs[0], freqs];
                } else {
                    delete summary.tags[tid];
                }
            });

            if (_.isEmpty(summary.tags)) {
                summary.periodEnd = newToday;
            }
        }

        return summary;
    }

    function getPopular() {
        if (!popularCache) {
            popularCache = _.chain(getSummary().tags)
                .map(function (nameAndFreqs, tid) {
                    var freqs = nameAndFreqs[1];

                    if (freqs.length >= 3) {
                        return {
                            keep: [tid, nameAndFreqs[0]],
                            rank: tallyFreqs(freqs) / (10 + habitFactor(freqs))
                        };
                    }
                })
                .compact()
                .sortBy('rank')
                .last(popularSize)
                .reverse()
                .pluck('keep')
                .value();
        }
        return popularCache;
    }

    function tallyFreqs(freqs) {
        return _.reduce(freqs, function (tally, freq) {
            return tally + dayScore(freq[1]) * (summaryPeriodDays - freq[0]);
        }, 0);
    }

    function dayScore(n) {
        return 1 + Math.min(n, 20) * 0.2;
    }

    function habitFactor(freqs) {
        var len = freqs.length;

        return len < 3 ? 0 : _.reduce(deltas(deltas(_.pluck(freqs, 0))), function (sum, n) {
            return sum + n;
        }, 0) / (len - 2);
    }

    function deltas(ints) {
        return _.map(_.initial(_.zip(ints, _.rest(ints))), function (pair) {
            return pair[1] - pair[0];
        });
    }

    function firstCsv(str) {
        return (str || '').split(',')[0];
    }

    function collapseTag(t) {
        t = t.replace(/^\/|\/$/g, '');
        if (t.match(isEditionalisedRx)) {
            t = t.replace(stripEditionRx, '');
        }
        t = t.split('/');
        t = t.length === 2 && t[0] === t[1] ? [t[0]] : t;
        return t.join('/');
    }

    function reset() {
        historyCache = undefined;
        summaryCache = undefined;
        popularCache = undefined;
        storage.local.remove(storageKeyHistory);
        storage.local.remove(storageKeySummary);
    }

    function logHistory(pageConfig) {
        var pageId = pageConfig.pageId,
            history,
            foundCount = 0;

        if (!pageConfig.isFront) {
            history = getHistory()
                .filter(function (item) {
                    var isArr = _.isArray(item),
                        found = isArr && (item[0] === pageId);

                    foundCount = found ? item[1] : foundCount;
                    return isArr && !found;
                });

            history.unshift([pageId, foundCount + 1]);
            saveHistory(history.slice(0, historySize));
        }
    }

    function logSummary(pageConfig, mockToday) {
        var summary = pruneSummary(getSummary(), mockToday);

        _.chain(pageMeta)
            .reduceRight(function (tags, tag) {
                var tid = firstCsv(pageConfig[tag.tid]),
                    tname = tid && firstCsv(pageConfig[tag.tname]);

                if (tid && tname) {
                    tags[collapseTag(tid)] = tname;
                }
                return tags;
            }, {})
            .each(function (tname, tid) {
                var nameAndFreqs = summary.tags[tid],
                    freqs = nameAndFreqs && nameAndFreqs[1],
                    freq = freqs && _.find(freqs, function (freq) { return freq[0] === 0; });

                if (freq) {
                    freq[1] = freq[1] + 1;
                } else if (freqs) {
                    freqs.unshift([0, 1]);
                } else {
                    summary.tags[tid] = [tname, [[0, 1]]];
                }

                if (nameAndFreqs) {
                    nameAndFreqs[0] = tname;
                }
            });

        saveSummary(summary);
    }

    function renderNavs(withVisibleSecondary) {
        var switches = config.switches,
            popular,
            priNavCanonical,
            priNav,
            priNavItems,
            priNavItemsFirst,
            priNavItemsMap = {},
            secNavHtml,
            secNavTags = [];

        if (!(switches.historyNavPrimaryStore
           || switches.historyNavPrimaryInject
           || switches.historyNavSecondaryStore
           || switches.historyNavSecondaryInject
        )) { return; }

        popular = getPopular();
        if (popular.length === 0) { return; }

        priNavCanonical = document.querySelector('.js-top-navigation');
        if (!priNavCanonical) { return; }

        priNav = document.createElement('div');
        priNav.innerHTML = priNavCanonical.innerHTML;

        priNavItems = $('.top-navigation__item', priNav);
        priNavItems.each(function (item) {
            priNavItemsMap[collapseTag($('a', item).attr('href'))] = item;
        });

        priNavItemsFirst = priNavItems[0];

        _.chain(popular)
            .reverse()
            .forEach(function (tag) {
                var item = priNavItemsMap[tag[0]];

                if (!item) {
                    secNavTags.unshift(tag);
                } else if (item !== priNavItemsFirst && (switches.historyNavPrimaryStore || switches.historyNavPrimaryInject)) {
                    $(item).detach().insertAfter(priNavItemsFirst);
                }
            });

        if (switches.historyNavPrimaryStore) {
            // On purpose not using storage module, to avoid a JSON parse on extraction
            window.localStorage.setItem(storageKeyNavPrimary, priNav.innerHTML.replace(/\s{2,}/g, ' '));
        }

        if (switches.historyNavPrimaryInject) {
            $(document.getElementById('history-nav-primary')).html(priNav);
        }

        if (secNavTags.length === 0) { return; }

        secNavHtml = secNavTags.reduce(function (html, tag) { return html + template(
            '<li class="local-navigation__item">' +
                '<a href="/{{id}}" class="local-navigation__action" data-link-name="nav : secondary : {{name}}">{{name}}</a>' +
            '</li>',
            {id: tag[0], name: tag[1]}
        ); }, '');

        if (switches.historyNavSecondaryStore) {
            // On purpose not using storage module, to avoid a JSON parse on extraction
            window.localStorage.setItem(storageKeyNavSecondary, secNavHtml);
        }

        if (withVisibleSecondary && switches.historyNavSecondaryInject) {
            $(document.getElementById('history-nav-secondary')).html(secNavHtml);
        }

        if (switches.historyNavMegaInject) {
            $(document.querySelectorAll('.js-global-navigation')).prepend(
                '<li class="global-navigation__section global-navigation__section--history">' +
                    '<a class="global-navigation__title" href="/" data-link-name="nav : globalTop : jump to">jump to</a>' +
                    '<ul class="global-navigation__children">' + secNavHtml + '</ul>' +
                '</li>'
            );
        }
    }

    return {
        logHistory: logHistory,
        logSummary: logSummary,
        renderNavs: renderNavs,
        getPopular: getPopular,
        isRevisit: isRevisit,
        reset: reset,

        test: {
            getSummary: getSummary,
            getHistory: getHistory,
            pruneSummary: pruneSummary
        }
    };
});
