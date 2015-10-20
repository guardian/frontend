define(['Promise'], function (Promise) {
    return new Promise(function (resolve) {
        if (window.guardian.css.loaded) {
            // CSS has loaded, go
            resolve();
        } else {
            // Push a listener for when the JS loads
            window.guardian.css.loadedListeners.push(resolve);
        }
    });
})
