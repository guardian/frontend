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
        summaryDays = 30,
        popularSize = 10,

        today =  Math.floor(Date.now() / 86400000), // 1 day in ms
        historyCache,
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
        return storage.local.set(storageKeySummary, summary);
    }

    function savePopular(summary) {
        popularCache = calculatePopular(summary);
        return storage.local.set(storageKeyPopular, popularCache);
    }

    function getSummary() {
        var summary = storage.local.get(storageKeySummary);

        if (!_.isObject(summary) || !_.isObject(summary.tags) || !_.isNumber(summary.start)) {
            summary = {
                start: today,
                tags: {}
            };
        }

        return summary;
    }

    function pruneSummary() {
        var summary = getSummary(),
            newStart = today - summaryDays,
            updateBy;

        if (newStart > summary.start) {
            updateBy = newStart - summary.start;
            summary.start = newStart;

            _.each(summary.tags, function (sTag, tid) {
                var ticks = _.chain(sTag[1])
                    .map(function (tick) {
                        var newSlot = tick[0] - updateBy;
                        return newSlot < 0 ? 0 : [newSlot, tick[1]];
                    })
                    .compact()
                    .value();

                if (ticks.length) {
                    summary.tags[tid] = [sTag[0], ticks];
                } else {
                    delete summary.tags[tid];
                }
            });

            if (_.isEmpty(summary.tags)) {
                summary.start = today;
            }
        }

        return summary;
    }

    function calculatePopular(summary) {
        return _.chain(summary.tags)
            .map(function (sTag, tid) {
                return {
                    idAndName: [tid, sTag[0]],
                    rank: _.reduce(sTag[1], function (rank, tick) {
                        return rank + (tick[1] * (tick[0] + 1));
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
            popularCache = undefined;
            storage.local.remove(storageKeyHistory);
            storage.local.remove(storageKeySummary);
            storage.local.remove(storageKeyPopular);
        },

        get: function () {
            historyCache = historyCache || storage.local.get(storageKeyHistory) || [];
            return historyCache;
        },

        getSummary: getSummary,

        getPopular: function () {
            popularCache = popularCache || storage.local.get(storageKeyPopular) || [];
            return popularCache;
        },

        getSize: function () {
            return this.get().length;
        },

        contains: function (pageId) {
            return (_.find(this.get(), function (page) {
                return (page[0] === pageId);
            }) || [])[1] > 0;
        },

        isRevisit: function (pageId) {
            return (_.find(this.get(), function (page) {
                return (page[0] === pageId);
            }) || [])[1] > 1;
        },

        log: function (pageConfig) {
            var pageId = pageConfig.pageId,
                history,
                summary,
                foundCount = 0,
                sinceStart;

            if (!pageConfig.isFront) {
                history = this.get()
                    .filter(function (item) {
                        var isArr = _.isArray(item),
                            found = isArr && (item[0] === pageId);

                        foundCount = found ? item[1] : foundCount;
                        return isArr && !found;
                    });
                history.unshift([pageId, foundCount + 1]);
                saveHistory(history.slice(0, historySize));
            }

            summary = pruneSummary();
            sinceStart = today - summary.start;
            _.chain(taxonomy)
                .reduce(function (tags, tag) {
                    var tid = firstCsv(pageConfig[tag.tid]),
                        tname = tid && firstCsv(pageConfig[tag.tname]);

                    if (tid && tname) {
                        tags[collapseTag(tid)] = tname;
                    }
                    return tags;
                }, {})
                .each(function (tname, tid) {
                    var sTag = summary.tags[tid],
                        ticks = sTag && sTag[1],
                        tick = ticks && _.find(ticks, function (tick) { return tick[0] === sinceStart; });

                    if (tick) {
                        tick[1] = tick[1] + 1;
                    } else if (ticks) {
                        ticks.unshift([sinceStart, 1]);
                    } else {
                        summary.tags[tid] = [tname, [[sinceStart, 1]]];
                    }

                    if (sTag) {
                        sTag[0] = tname;
                    }
                });
            saveSummary(summary);
            savePopular(summary);
        }
    };
});
