/*
 Module: history.js
 Description: Gets and sets users reading history
 */
define([
    'modules/storage'
], function(
    storage
    ) {

    var history = {};

    history.CONFIG = {
        storageKey: 'gu.history',
        maxSize: 100
    };

    history.set = function(data) {
        return storage.set(history.CONFIG.storageKey, data);
    };

    history.get = function() {
        var hist = storage.get(history.CONFIG.storageKey);
        return (hist === null) ? [] : hist;
    };

    history.getSize = function() {
        return history.get().length;
    };

    history.contains = function(id) {
        return history.get().indexOf(id) !== -1;
    };

    history.store = function(id) {
        var hist = history.get();

        if(history.getSize() >= history.CONFIG.maxSize) {
            hist.pop();
        }

        hist.unshift(id);
        history.set(hist);
    };

    history.queueJump = function(id) {
        var hist = history.get(),
            index = hist.indexOf(id);

        hist.splice(index, 1);
        hist.unshift(id);
        history.set(hist);
    };

    history.log = function(id) {
        if(!/\/p\/\w*/g.test(id)) {
            throw new Error("Article id did not match short URL");
        }

        if(history.contains(id)) {
            history.queueJump(id);
        } else {
            history.store(id);
        }
    };

    return {
        get: history.get,
        log: history.log
    };

});
