/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'lodash/objects/assign',
    'common/utils/storage'
], function (
    assign,
    storage
) {

    var history,
        summary,
        storageKeyHistory = 'gu.history',
        storageKeySummary = 'gu.history.summary',
        maxSize = 100;

    function HistoryItem(item) {
        assign(this, item.meta);
        this.id = item.id;
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

    function updateSummary(summary, meta) {
        var section = meta.section,
            keyword = (meta.keywords || [])[0];

        if (section) {
            summary.sections[section] = (summary.sections[section] || 0) + 1;
        }

        if (keyword) {
            summary.keywords[keyword] = (summary.keywords[keyword] || 0) + 1;
        }
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
            summary = summary || storage.local.get(storageKeySummary) || {sections: {}, keywords: {}};
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

        log: function (newItem) {
            var foundItem,
                summary = {sections: {}, keywords: {}},
                hist = this.get().filter(function (item) {
                    var found = (item.id === newItem.id);

                    updateSummary(summary, item);
                    foundItem = found ? item : foundItem;
                    return !found;
                });

            if (foundItem) {
                foundItem.count = (foundItem.count || 0) + 1;
                foundItem.timestamp = Date.now();
                hist.unshift(foundItem);
            } else {
                updateSummary(summary, newItem.meta);
                hist.unshift(new HistoryItem(newItem));
                hist = hist.slice(0, maxSize);
            }

            summary.count = hist.length;

            setSummary(summary);
            setHistory(hist);
        }
    };
});
