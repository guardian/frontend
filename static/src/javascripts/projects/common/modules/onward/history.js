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

    var periodUnitInMs = 86400000, // 1 day
        forgetAfterPeriods = 50,

        now =  Math.floor(Date.now() / periodUnitInMs),
        historyCache,
        summaryCache,
        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',
        storageKeyPopular = 'gu.history.popular',
        maxSize = 100,
        taxonomy = [
            {tid: 'section',    tname: 'sectionName'},
            {tid: 'keywordIds', tname: 'keywords'},
            {tid: 'seriesId',   tname: 'series'}
        ];

    function HistoryItem(item) {
        _.assign(this, item);
        this.timestamp = Date.now();
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
        return storage.local.set(storageKeyPopular, mostPopular(summary));
    }

    function getSummary() {
        summaryCache = summaryCache || storage.local.get(storageKeySummary);

        if (!_.isObject(summaryCache) || !_.isObject(summaryCache.tags) || !_.isNumber(summaryCache.start)) {
            summaryCache = {
                start: now,
                tags: {}
            };
        }

        return summaryCache;
    }

    function pruneSummary() {
        var summary = getSummary(),
            newStart = now - forgetAfterPeriods,
            updateBy;

        if (newStart > summary.start) {
            updateBy = newStart - summary.start;
            summary.start = newStart;

            _.each(summary.tags, function (sTag, tid) {
                var ticks = _.reduce(sTag[1], function (ticks, count, sinceStart) {
                        var newSinceStart = parseInt(sinceStart, 10) - updateBy;

                        if (newSinceStart > 0) {
                            ticks[newSinceStart] = count;
                        }
                        return ticks;
                    }, {});

                if (_.isEmpty(ticks)) {
                    delete summary.tags[tid];
                } else {
                    summary.tags[tid] = [sTag[0], ticks];
                }
            });

            if (_.isEmpty(summary.tags)) {
                summary.start = now;
            }
        }

        return summary;
    }

    function mostPopular(summary) {
        return _.chain(summary.tags)
            .map(function (sTag, tid) {
                return {
                    id: tid,
                    name: sTag[0],
                    rank: _.reduce(sTag[1], function (rank, count, sinceStart) {
                        return rank + (count * (1 + parseInt(sinceStart, 10)));
                    }, 0)
                };
            })
            .sortBy('rank')
            .last(10)
            .reverse()
            .map(function (tag) { return [tag.id, tag.name]; })
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

        getSummary: getSummary,

        getSize: function () {
            return this.get().length;
        },

        contains: function (id) {
            return this.get().some(function (el) {
                return el.id === id;
            });
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
                foundItem.timestamp = now;
                history.unshift(foundItem);
            } else {
                history.unshift(new HistoryItem({id: pageId}));
                history = history.slice(0, maxSize);
            }
            saveHistory(history);

            summary = pruneSummary();
            sinceStart = now - summary.start;
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
                        ticks = sTag && sTag[1] || {};

                    ticks[sinceStart] = (ticks[sinceStart] || 0) + 1;

                    if (!sTag) {
                        summary.tags[tid] = [tname, ticks];
                    }
                });
            saveSummary(summary);
            savePopular(summary);
        }
    };
});
