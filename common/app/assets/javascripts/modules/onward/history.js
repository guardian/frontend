/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'common',
    'modules/storage'
], function(
    common,
    storage
    ) {

    var HistoryItem = function(item) {
        this.id = item.id;
        this.timestamp = Date.now();
        common.extend(this, item.meta);
        return this;
    };

    var History = function(config) {
        this.config = common.extend(this.DEFAULTS, config);
        return this;
    };

    History.prototype.DEFAULTS = {
        storageKey: 'gu.history',
        maxSize: 100
    };

    History.prototype.set = function(data) {
        return storage.set(this.config.storageKey, data);
    };

    History.prototype.get = function() {
        var hist = storage.get(this.config.storageKey);
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
        var size = this.getSize(),
            overflow = -Math.abs(desiredSize - size);

        return (size > desiredSize) ? this.get().slice(0, overflow) : this.get();
    };

    History.prototype.log = function(item) {
        var hist = this.capToSize(this.config.maxSize -1),
            newItem = new HistoryItem(item);

        hist.unshift(newItem);
        this.set(hist);
    };

    return History;

});
