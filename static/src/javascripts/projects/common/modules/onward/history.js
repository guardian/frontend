/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/template',
    'common/utils/storage'
], function (
    $,
    _,
    template,
    storage
) {
    var summaryPeriodDays = 30,
        historySize = 50,
        popularSize = 20,

        today =  Math.floor(Date.now() / 86400000), // 1 day in ms
        historyCache,
        summaryCache,
        popularCache,
        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',
        storageKeyNav  = 'gu.history.nav',
        storageKeyNav2 = 'gu.history.nav.2',
        pageMeta = [
            {tid: 'section',    tname: 'sectionName'},
            {tid: 'keywordIds', tname: 'keywords'},
            {tid: 'seriesId',   tname: 'series'},
            {tid: 'authorIds',  tname: 'author'}
        ];

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
        var summary = summaryCache || storage.local.get(storageKeySummary);

        if (!_.isObject(summary) || !_.isObject(summary.tags) || !_.isNumber(summary.periodEnd)) {
            summary = summaryCache = {
                periodEnd: today,
                tags: {}
            };
        }
        return summary;
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

                if (freqs.length) {
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

    function stripOuterSlashes(path) {
        return (path || '').replace(/^\/|\/$/g, '');
    }

    function collapseTag(t) {
        t = t.replace(/^(uk|us|au)\//, '');
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

    function generateNavs() {
        var popular = getPopular(),
            topNav = popular.length && document.querySelector('.js-top-navigation'),
            myNav,
            myNavItems,
            myNavItemIds,
            mySecondaryTags = [];

        if (topNav) {
            myNav = document.createElement('div');
            myNav.innerHTML = topNav.innerHTML;

            myNavItems = $('.top-navigation__item', myNav);
            myNavItemIds = myNavItems.map(function (item) {
                return collapseTag(stripOuterSlashes($('a', item).attr('href')));
            });

            _.chain(popular)
                .reverse()
                .forEach(function (tag) {
                    var pos = myNavItemIds.indexOf(tag[0]);

                    if (pos > -1) {
                        $(myNavItems[pos]).detach().insertAfter(myNavItems[0]);
                    } else {
                        mySecondaryTags.unshift(tag);
                    }
                });

            // On purpose not using storage module, to avoid a JSON parse on extraction:
            window.localStorage.setItem(storageKeyNav, myNav.innerHTML.replace(/\s{2,}/g, ' '));

            if (mySecondaryTags.length) {
                // On purpose not using storage module, to avoid a JSON parse on extraction:
                window.localStorage.setItem(storageKeyNav2,
                    '<ul class="signposting">' +
                        '<li class="signposting__item signposting__item--home">' +
                            '<a class="signposting__action" href="/" data-link-name="nav : signposting : jump to">jump to</a>' +
                        '</li>' +
                    '</ul>' +
                    '<ul class="local-navigation">' +
                        mySecondaryTags.map(function (tag) {
                            return template(
                                '<li class="local-navigation__item">' +
                                    '<a href="/{{id}}" class="local-navigation__action" data-link-name="nav : history : {{name}}">{{name}}</a>' +
                                '</li>',
                                {id: tag[0], name: tag[1]}
                            );
                        }).join('') +
                    '</ul>'
                );
            }
        }
    }

    return {
        logHistory: logHistory,
        logSummary: logSummary,
        generateNavs: generateNavs,
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
