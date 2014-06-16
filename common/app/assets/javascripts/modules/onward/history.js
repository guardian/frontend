/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'lodash/objects/assign',
    'lodash/collections/map',
    'lodash/collections/sortBy',
    'lodash/collections/filter',
    'common/utils/storage'
], function(
    _assign,
    _map,
    _sortBy,
    _filter,
    storage
    ) {

    var HistoryItem = function(item) {
        this.id = item.id;
        this.timestamp = Date.now();
        _assign(this, item.meta);
        return this;
    };

    var History = function(config) {
        this.config = _assign(this.DEFAULTS, config);
        return this;
    };

    History.prototype.DEFAULTS = {
        storageKey: 'gu.history',
        maxSize: 100
    };

    History.prototype.set = function(data) {
        return storage.local.set(this.config.storageKey, data);
    };

    History.prototype.get = function() {
        var hist = storage.local.get(this.config.storageKey);
        return (hist === null) ? [] : hist;
    };

    History.prototype.getSize = function() {
        return this.get().length;
    };

    History.prototype.contains = function(id) {
        return this.get().some(function(el) {
            return el.id === id;
        });
    };

    History.prototype.capToSize = function(desiredSize) {
        var arr = this.get();
        if (arr.length > desiredSize) { arr.length = desiredSize; }
        return arr;
    };

    History.prototype.log = function(item) {
        var hist = this.capToSize(this.config.maxSize -1),
            newItem = new HistoryItem(item);

        hist.unshift(newItem);
        this.set(hist);
    };


    History.prototype.recentVisits = function () {
        var sorted = _sortBy(this.get(), 'timestamp').reverse();
        var curr_timestamp = 0,
            session_array = [],
            a_month_ago = new Date(Date.now());

        a_month_ago.setMonth(a_month_ago.getMonth() - 1);

        sorted.map(function (i) {
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
    };

    History.prototype.numberOfSessionsSince = function (date) {
        var aMonthAgoInMillis = date.getTime(), sessions = this.recentVisits();
        var sessionsInLastMonth = _filter(sessions, function(timestamp) { return parseInt(timestamp,10) > aMonthAgoInMillis; });
        return sessionsInLastMonth.length;
    };

    return History;

});
