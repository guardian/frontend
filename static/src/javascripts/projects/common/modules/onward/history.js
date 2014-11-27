/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'common/utils/_',
    'common/utils/storage'
], function (
    _,
    storage
) {
    var historySize = 50,
        summaryPeriodDays = 30,
        popularSize = 10,

        today =  Math.floor(Date.now() / 86400000), // 1 day in ms
        historyCache,
        summaryCache,
        popularCache,
        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',
        storageKeyPopular = 'gu.history.popular',
        taxonomy = [
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

    function savePopular(popular) {
        popularCache = popular;
        return storage.local.set(storageKeyPopular, popular);
    }

    function getHistory() {
        historyCache = historyCache || storage.local.get(storageKeyHistory) || [];
        return historyCache;
    }

    function getPopular() {
        popularCache = popularCache || storage.local.get(storageKeyPopular) || [];
        return popularCache;
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

    function pruneSummary(summary) {
        var updateBy = today - summary.periodEnd;

        if (updateBy > 0) {
            summary.periodEnd = today;

            _.each(summary.tags, function (nameAndFreqs, tid) {
                var freqs = _.chain(nameAndFreqs[1])
                    .map(function (freq) {
                        var newAge = freq[0] + updateBy;
                        return newAge < summaryPeriodDays ? [newAge, freq[1]] : false;
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
                summary.periodEnd = today;
            }
        }

        return summary;
    }

    function calculatePopular(summary) {
        return _.chain(summary.tags)
            .map(function (nameAndFreqs, tid) {
                return {
                    idAndName: [tid, nameAndFreqs[0]],
                    rank: _.reduce(nameAndFreqs[1], function (rank, freq) {
                        return rank + (freq[1] * (summaryPeriodDays - freq[0]));
                    }, 0)
                };
            })
            .sortBy('rank')
            .last(popularSize)
            .reverse()
            .pluck('idAndName')
            .value();
    }

    function firstCsv(str) {
        return (str || '').split(',')[0];
    }

    function collapseTag(t) {
        t = t.replace(/^(uk|us|au)\//, '');
        t = t.split('/');
        t = t.length === 2 && t[0] === t[1] ? [t[0]] : t;
        return t.join('/');
    }

    return {
        reset: function () {
            historyCache = undefined;
            summaryCache = undefined;
            popularCache = undefined;
            storage.local.remove(storageKeyHistory);
            storage.local.remove(storageKeySummary);
            storage.local.remove(storageKeyPopular);
        },

        getHistory: getHistory,

        getPopular: getPopular,

        getSize: function () {
            return getHistory().length;
        },

        contains: function (pageId) {
            return (_.find(getHistory(), function (page) {
                return (page[0] === pageId);
            }) || [])[1] > 0;
        },

        isRevisit: function (pageId) {
            return (_.find(getHistory(), function (page) {
                return (page[0] === pageId);
            }) || [])[1] > 1;
        },

        log: function (pageConfig) {
            var pageId = pageConfig.pageId,
                history,
                summary,
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

            summary = pruneSummary(getSummary());
            _.chain(taxonomy)
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
            savePopular(calculatePopular(summary));
        },

        test: {
            today: today,
            getSummary: getSummary,
            pruneSummary: pruneSummary
        }
    };
});
