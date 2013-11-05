define(['EventEmitter'], function(EventEmitter) {
    var instance = null;
    if (!instance) {
        instance = new EventEmitter();
    }

    return instance;
});