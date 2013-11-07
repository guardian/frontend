/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'lodash/objects/assign',
    'modules/storage'
], function(
    _assign,
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

    return History;

});
