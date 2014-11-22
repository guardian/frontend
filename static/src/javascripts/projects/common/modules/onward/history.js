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

    var periodUnitInMs = 60000,
        forgetAfterPeriods = 5,

        now =  Math.floor(Date.now() / periodUnitInMs),
        historyCache,
        summaryCache,
        storageKeyHistory = 'gu.trace',
        storageKeySummary = 'gu.trace.summary',
        storageKeyPopular = 'gu.trace.popular',
        maxSize = 100,
        taxonomy = [
            {tid: 'section',    tname: 'sectionName'},
            {tid: 'keywordIds', tname: 'keywords'},
            {tid: 'authorIds',  tname: 'author'},
            {tid: 'seriesId',   tname: 'series'},
            {tid: 'blogIds',    tname: 'blogs'}
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

    function saveSummary() {
        saveFavourites();
        return storage.local.set(storageKeySummary, summaryCache);
    }

    function saveFavourites() {
        return storage.local.set(storageKeyPopular, mostPopular());
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

    function purgeSummary() {
        var summary = getSummary(),
            start = summary.start,
            startNew = now - forgetAfterPeriods,
            updateBy = startNew - start;

        if (updateBy > 0) {
            summary.start = startNew;

            _.each(summary.tags, function (sTag, tid) {
                var ticks = _.chain(sTag[1])
                    .map(function (n) { return n - updateBy; })
                    .filter(function (n) { return n >= 0; })
                    .value();

                if (ticks.length === 0) {
                    delete summary.tags[tid];
                } else {
                    summary.tags[tid] = [sTag[0], ticks];
                }
            });
        }
    }

    function mostPopular() {
        return _.chain(getSummary().tags)
            .map(function (sTag, tid) {
                return {
                    id: tid,
                    name: sTag[0],
                    rank: _.reduce(sTag[1], function (rank, n) { return rank + n; }, 0)
                };
            })
            .sortBy(function (tag) { return tag.rank * -1; })
            .first(10)
            .map(function (tag) { return [tag.id, tag.name]; })
            .value();
    }

    function updateSummary(tid, tname) {
        var summary = getSummary(),
            ctid = collapseTag(tid),
            sTag = summary.tags[ctid];

        summary.tags[ctid] = [tname, sTag ? sTag[1].concat(now - summary.start) : [0]];
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
                foundItem;

            // Update history

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

            // Update summary

            purgeSummary();

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
                    updateSummary(tid, tname);
                });

            saveSummary();
        }
    };
});
