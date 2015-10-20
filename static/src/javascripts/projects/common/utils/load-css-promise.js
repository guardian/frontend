define(['Promise'], function (Promise) {
    var loadCssThen = function (fn) {
        if (window.guardian.css.loaded) {
            // CSS has loaded, go
            fn();
        } else {
            // Push a listener for when the JS loads
            window.guardian.css.loadedListeners.push(fn);
        }
    };

    return new Promise(function (resolve) {
        loadCssThen(resolve);
    });
})
