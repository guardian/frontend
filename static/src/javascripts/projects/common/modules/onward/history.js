/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'common/utils/$',
    'common/utils/_',
    'common/utils/config',
    'common/utils/template',
    'common/utils/storage',
    'text!common/views/history/tag.html',
    'text!common/views/history/tags.html',
    'text!common/views/history/mega-nav.html'
], function (
    $,
    _,
    config,
    template,
    storage,
    viewTag,
    viewTags,
    viewMegaNav
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
        popularCache = popularCache || getPopularFiltered({excludeRx: new RegExp(/^profile/)});
        return popularCache;
    }

    function getPopularFiltered(opts) {
        opts = opts || {};

        return _.chain(getSummary().tags)
            .map(function (nameAndFreqs, tid) {
                var freqs = nameAndFreqs[1];

                if ((!opts.includeRx ||  tid.match(opts.includeRx)) &&
                    (!opts.excludeRx || !tid.match(opts.excludeRx))) {
                    return {
                        keep: [tid, nameAndFreqs[0]],
                        rank: tally(freqs)
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

    function tally(freqs) {
        return _.reduce(freqs, function (tally, freq) {
            return tally + (9 + freq[1]) * (summaryPeriodDays - freq[0]);
        }, 0);
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
                topNavItems[collapseTag(urlPath($(item).attr('href')))] = true;
            });

            tagsHtml = _.chain(getPopular())
                .filter(function (tag) { return !topNavItems[tag[0]]; })
                .first(20)
                .map(tagHtml)
                .value();

            if (tagsHtml.length < minDisplayedTags) { return; }

            if (opts.inMegaNav) {
                $('.js-global-navigation').prepend(template(viewMegaNav, {tags: tagsHtml.join('')}));
            }

            if (opts.inPage) {
                $('.js-history-tags').append(template(viewTags, {tags: tagsHtml.slice(0, 10).join('')}));
            }
        }
    }

    function tagHtml(tag, index) {
        return template(viewTag, {id: tag[0], name: tag[1], index: index + 1});
    }

    function urlPath(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.pathname;
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
