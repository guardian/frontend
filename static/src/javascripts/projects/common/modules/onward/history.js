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
        forgetUniquesAfter = 10,
        historySize = 50,
        minDisplayedTags = 3,

        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',

        today =  Math.floor(Date.now() / 86400000), // 1 day in ms
        historyCache,
        summaryCache,
        popularCache,
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

                if (freqs.length > 1 || (freqs.length === 1 && freqs[0][0] < forgetUniquesAfter)) {
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
                .last(100)
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

    function renderTags(opts) {
        var topNavItems = {},
            tagsHtml;

        if (getPopular().length && (opts.inPage || opts.inMegaNav)) {

            $('.js-navigation-header .js-top-navigation a').each(function (item) {
                topNavItems[collapseTag($(item).attr('href'))] = true;
            });

            tagsHtml = _.chain(getPopular())
                .filter(function (tag) { return !topNavItems[tag[0]]; })
                .first(20)
                .map(tagHtml)
                .value();

            if (tagsHtml.length < minDisplayedTags) { return; }

            if (opts.inMegaNav) {
                $('.js-global-navigation').prepend(
                    '<li class="global-navigation__section"  data-link-name="history">' +
                        '<a class="global-navigation__title" href="/" data-link-name="nav : globalTop : shortcuts">shortcuts</a>' +
                        '<ul class="global-navigation__children global-navigation__children---tags">' + tagsHtml.join('') + '</ul>' +
                    '</li>'
                );
            }

            if (opts.inPage) {
                $('.js-history-tags').append(
                    '<ul class="gs-container keyword-list inline-list">' + tagsHtml.slice(0, 10).join('') + '</ul>'
                );
            }
        }
    }

    function tagHtml(tag) {
        return template(
            '<li class="inline-list__item">' +
                '<a href="/{{id}}" class="button button--small button--tag button--secondary" data-link-name="nav : globalSub : {{name}}">{{name}}</a>' +
            '</li>',
            {id: tag[0], name: tag[1]}
        );
    }

    return {
        logHistory: logHistory,
        logSummary: logSummary,
        renderTags: renderTags,
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
