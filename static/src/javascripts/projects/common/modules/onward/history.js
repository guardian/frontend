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
    var forgetAfterDays = 30,
        today =  Math.floor(Date.now() / 86400000), // 1 day in ms
        historyCache,
        summaryCache,
        popularCache,
        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',
        storageKeyPopular = 'gu.history.popular',
        maxSize = 100,
        taxonomy = [
            {tid: 'section',    tname: 'sectionName'},
            {tid: 'keywordIds', tname: 'keywords'},
            {tid: 'seriesId',   tname: 'series'},
            {tid: 'authorIds',  tname: 'author'}
        ];

    function HistoryItem(item) {
        _.assign(this, item);
        this.count = 1;
        return this;
    }

    function saveHistory(data) {
        historyCache = data;
        return storage.local.set(storageKeyHistory, data);
    }

    function saveSummary(summary) {
        return storage.local.set(storageKeySummary, summary);
    }

    function savePopular(summary) {
        popularCache = calculatePopular(summary);
        return storage.local.set(storageKeyPopular, popularCache);
    }

    function getSummary() {
        summaryCache = summaryCache || storage.local.get(storageKeySummary);

        if (!_.isObject(summaryCache) || !_.isObject(summaryCache.tags) || !_.isNumber(summaryCache.start)) {
            summaryCache = {
                start: today,
                tags: {}
            };
        }

        return summaryCache;
    }

    function pruneSummary() {
        var summary = getSummary(),
            newStart = today - forgetAfterDays,
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
            .last(10)
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
            storage.local.remove(storageKeyHistory);
            storage.local.remove(storageKeySummary);
            storage.local.remove(storageKeyPopular);
        },

        get: function () {
            historyCache = historyCache || storage.local.get(storageKeyHistory) || [];
            return historyCache;
        },

        getPopular: function () {
            popularCache = popularCache || storage.local.get(storageKeyPopular) || [];
            return popularCache;
        },

        getSize: function () {
            return this.get().length;
        },

        contains: function (id) {
            return this.get().some(function (el) {
                return el.id === id;
            });
        },

        isRevisit: function (pageId) {
            return (_.find(this.get(), function (page) {
                return (page.id === pageId);
            }) || {}).count > 1;
        },

        log: function (pageConfig) {
            var pageId = '/' + pageConfig.pageId,
                history,
                summary,
                foundItem,
                sinceStart;

            history = this.get().filter(function (item) {
                var found = (item.id === pageId);

                foundItem = found ? item : foundItem;
                return !found;
            });
            if (foundItem) {
                foundItem.count = (foundItem.count || 0) + 1;
                history.unshift(foundItem);
            } else {
                history.unshift(new HistoryItem({id: pageId}));
                history = history.slice(0, maxSize);
            }
            saveHistory(history);

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
