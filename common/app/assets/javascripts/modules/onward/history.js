/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'lodash/objects/assign',
    'lodash/collections/map',
    'lodash/collections/sortBy',
    'lodash/collections/filter',
    'lodash/collections/reduce',
    'common/utils/storage'
], function(
    _assign,
    _map,
    _sortBy,
    _filter,
    _reduce,
    storage
    ) {

    var history,
        summary,
        storageKey = 'gu.history',
        storageKeySummary = 'gu.history.summary',
        maxSize = 100,
        HistoryItem = function(item) {
            _assign(this, item.meta);
            this.id = item.id;
            this.timestamp = Date.now();
            this.count = 1;
            return this;
        };

    return {
        set: function(data) {
            history = data;
            return storage.local.set(storageKey, data);
        },

        get: function() {
            history = history || storage.local.get(storageKey) || [];
            return history;
        },

        reset: function() {
            history = undefined;
            summary = undefined;
            storage.local.remove(storageKey);
            storage.local.remove(storageKeySummary);
        },

        setSummary: function(data) {
            summary = data;
            return storage.local.set(storageKeySummary, data);
        },

        getSummary: function() {
            summary = summary || storage.local.get(storageKeySummary) || [];
            return summary;
        },

        getSize: function() {
            return this.get().length;
        },

        contains: function(id) {
            return this.get().some(function(el) {
                return el.id === id;
            });
        },

        capToSize: function(desiredSize) {
            var arr = this.get();
            if (arr.length > desiredSize) { arr.length = desiredSize; }
            return arr;
        },

        log: function(newItem) {
            var foundItem,
                hist = this.get().filter(function(item) {
                    var found = (item.id === newItem.id);

                    foundItem = found ? item : foundItem;
                    return !found;
                });

            if (foundItem) {
                foundItem.count = (foundItem.count || 0) + 1;
                foundItem.timestamp = Date.now();
                hist.unshift(foundItem);
            } else {
                hist.unshift(new HistoryItem(newItem));
                hist = hist.slice(0, maxSize);
                this.setSummary(
                    _reduce(hist, function(summary, item) {
                        if (item.section) {
                            summary.sections[item.section] = (summary.sections[item.section] || 0) + 1;
                        }
                        if (item.keywords && item.keywords[0]) {
                            summary.keywords[item.keywords[0]] = (summary.keywords[item.keywords[0]] || 0) + 1;
                        }
                        return summary;
                    }, {sections: {}, keywords: {}, count: hist.length})
                );
            }

            this.set(hist);
        },

        recentVisits: function () {
            var curr_timestamp = 0,
                session_array = [],
                a_month_ago = new Date(Date.now());

            a_month_ago.setMonth(a_month_ago.getMonth() - 1);

            this.get().map(function (i) {
                function diffInMins() {
                    var diff = (parseInt(curr_timestamp, 10) - parseInt(i.timestamp, 10));
                    return Math.ceil(diff / 1000 / 60);
                }

                if (diffInMins() >= 30) {
                    session_array.push(i.timestamp);
                }
                curr_timestamp = i.timestamp;
            });
            return session_array;
        },

        numberOfSessionsSince: function (date) {
            var aMonthAgoInMillis = date.getTime(), sessions = this.recentVisits();
            var sessionsInLastMonth = _filter(sessions, function(timestamp) { return parseInt(timestamp,10) > aMonthAgoInMillis; });
            return sessionsInLastMonth.length;
        }
    };
});
