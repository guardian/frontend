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

    var history,
        summary,
        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',
        maxSize = 100,
        taxonomy = [
            {tid: "section",    tname: "sectionName"},
            {tid: "keywordIds", tname: "keywords"},
            {tid: "authorIds",  tname: "author"},
            {tid: "seriesId",   tname: "series"},
            {tid: "blogIds",    tname: "blogs"}
        ];


    function HistoryItem(item) {
        _.assign(this, item);
        this.timestamp = Date.now();
        this.count = 1;
        return this;
    }

    function setHistory(data) {
        history = data;
        return storage.local.set(storageKeyHistory, data);
    }

    function setSummary(data) {
        summary = data;
        return storage.local.set(storageKeySummary, data);
    }

    function incrementSummaryTags(summary, tags) {
        tags.forEach(function(t) {
            var sTag = summary[t];

            if (sTag) {
                sTag = [sTag[0] + 1, sTag[1]];
            }
        });
    }

    function addTagToSummary(summary, tid, tname) {
        var sTag = summary[tid];

        summary[tid] = [sTag ? sTag[0] + 1 : 1, tname];
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
            history = undefined;
            summary = undefined;
            storage.local.remove(storageKeyHistory);
            storage.local.remove(storageKeySummary);
        },

        get: function () {
            history = history || storage.local.get(storageKeyHistory) || [];
            return history;
        },

        getSummary: function () {
            summary = summary || storage.local.get(storageKeySummary) || {};
            return summary;
        },

        getSize: function () {
            return this.get().length;
        },

        contains: function (id) {
            return this.get().some(function (el) {
                return el.id === id;
            });
        },

        log: function (pageConfig) {
            var foundItem,
                summary = this.getSummary(),

                pageId = '/' + pageConfig.pageId,
                pageTags = _.chain(taxonomy)
                    .reduce(function(tags, tag) {
                        var tid = firstCsv(pageConfig[tag.tid]),
                            tname = tid && firstCsv(pageConfig[tag.tname]);

                        if (tid && tname) {
                            tid = collapseTag(tid);
                            tags[tid] = true;
                            addTagToSummary(summary, tid, tname);
                        }
                        return tags;
                    }, {})
                    .keys()
                    .value(),

                historyTags = {},
                history = this.get().filter(function (item) {
                    var found = (item.id === pageId);

                    incrementSummaryTags(summary, item.tags);

                    foundItem = found ? item : foundItem;

                    item.tags.forEach(function(t) {
                        historyTags[t] = true;}
                    );

                    return !found;
                });

            _.assign(historyTags, pageTags);

            _.each(_.keys(summary), function(t) {
                if (!historyTags[t]) {
                    delete summary[t];
                }
            });

            setSummary(summary);

            if (foundItem) {
                foundItem.count = (foundItem.count || 0) + 1;
                foundItem.timestamp = Date.now();
                history.unshift(foundItem);
            } else {
                history.unshift(new HistoryItem({id: pageId, tags: pageTags}));
                history = history.slice(0, maxSize);
            }

            setHistory(history);
        }
    };
});
