

import dynamicImportPolyfill from "dynamic-import-polyfill";

// Provides an import function to use for dynamic imports. **Only works on
// browsers that support modules.**
const initialiseDynamicImport = () => {
  try {
    // Resolves to: import = (url) => import(url);

    /* eslint-disable no-new-func */
    window.guardianPolyfilledImport = new Function('url', `return import(url)`);
  } catch (e) {
    dynamicImportPolyfill.initialize({
      importFunctionName: 'guardianPolyfilledImport'
    });
  }
};

// Provides an import function to use for dynamic imports. **Designed for
// legacy browsers. Dynamic loads a ~4k bundle.**
const initialiseDynamicImportLegacy = () => import(
/* webpackChunkName: "shimport" */
'@guardian/shimport').then(shimport => {
  shimport.initialise(); // note this adds a __shimport__ global
  window.guardianPolyfilledImport = shimport.load;
});

export const init = (): void => {
  window.guardianPolyfilledImport = (url: string) => Promise.reject(new Error(`import not polyfilled; attempted import(${url})`));

  if (window.guardian.supportsModules) {
    initialiseDynamicImport();
  } else {
    initialiseDynamicImportLegacy();
  }
};