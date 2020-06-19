// @flow

import dynamicImportPolyfill from 'dynamic-import-polyfill';

// Provides an import function to use for dynamic imports. **Only works on
// browsers that support modules.**
const initialiseDynamicImport = () => {
    try {
        /* eslint-disable no-new-func */
        window.guardian.functions.import = new Function(
            'url',
            `return import(url)`,
        );
    } catch (e) {
        dynamicImportPolyfill.initialize({
            importFunctionName: 'guardian.functions.import',
        });
    }
};

// Provides an import function to use for dynamic imports. **Designed for
// legacy browsers. Dynamic loads a ~4k bundle.**
const initialiseDynamicImportLegacy = () =>
    import(/* webpackChunkName: "shimport" */ '@guardian/shimport').then(
        shimport => {
            shimport.initialise(); // note this adds a __shimport__ global
            window.guardian.functions.import = shimport.load;
        },
    );

export const init = (): void => {
    window.guardian.functions = {
        import: (url: string) =>
            Promise.reject(
                new Error(`import not polyfilled; attempted import(${url})`),
            ),
    };

    if (window.guardian.supportsModules) {
        initialiseDynamicImport();
    }

    initialiseDynamicImportLegacy();
};
