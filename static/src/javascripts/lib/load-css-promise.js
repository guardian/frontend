// @flow

const loadCssPromise: Promise<any> = new Promise(resolve => {
    if (window.guardian.css.loaded) {
        // CSS has loaded, go
        resolve();
    } else {
        // Push a listener for when the JS loads
        window.guardian.css.onLoad = resolve;
    }
});

export { loadCssPromise };
