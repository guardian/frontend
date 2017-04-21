// @flow

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef,guardian-frontend/global-config
__webpack_public_path__ = `${window.guardian.config.page.assetsPath}javascripts/`;

// kick off the app
const go = () => {
    require.ensure(
        [],
        require => {
            // es7 polyfills not provided by pollyfill.io
            require('core-js/modules/es7.object.values');
            require('core-js/modules/es7.object.get-own-property-descriptors');
            require('core-js/modules/es7.string.pad-start');
            require('core-js/modules/es7.string.pad-end');

            const domready = require('domready');
            const raven = require('lib/raven');
            const bootStandard = require('bootstraps/standard/main');
            const config = require('lib/config');
            const { markTime } = require('lib/user-timing');
            const capturePerfTimings = require('lib/capture-perf-timings');

            domready(() => {
                // 1. boot standard, always
                markTime('standard boot');
                bootStandard();

                // 2. once standard is done, next is commercial
                if (config.page.isDev) {
                    window.guardian.adBlockers.onDetect.push(isInUse => {
                        const needsMessage =
                            isInUse && window.console && window.console.warn;
                        const message =
                            'Do you have an adblocker enabled? Commercial features might fail to run, or throw exceptions.';
                        if (needsMessage) {
                            window.console.warn(message);
                        }
                    });
                }

                markTime('commercial request');
                require.ensure(
                    [],
                    // webpack needs the require function to be called 'require'
                    // eslint-disable-next-line no-shadow
                    require => {
                        raven.context(
                            { tags: { feature: 'commercial' } },
                            () => {
                                markTime('commercial boot');
                                const commercialBoot = config.switches
                                    .commercial
                                    ? require('bootstraps/commercial')
                                    : Promise.resolve;

                                commercialBoot().then(() => {
                                    // 3. finally, try enhanced
                                    // this is defined here so that webpack's code-splitting algo
                                    // excludes all the modules bundled in the commercial chunk from this one
                                    if (window.guardian.isEnhanced) {
                                        markTime('enhanced request');
                                        require.ensure(
                                            [],
                                            // webpack needs the require function to be called 'require'
                                            // eslint-disable-next-line no-shadow
                                            require => {
                                                markTime('enhanced boot');
                                                require('bootstraps/enhanced/main')();

                                                if (
                                                    document.readyState ===
                                                    'complete'
                                                ) {
                                                    capturePerfTimings();
                                                } else {
                                                    window.addEventListener(
                                                        'load',
                                                        capturePerfTimings
                                                    );
                                                }
                                            },
                                            'enhanced'
                                        );
                                    }
                                });
                            }
                        );
                    },
                    'commercial'
                );
            });
        },
        'standard'
    );
};

// make sure we've patched the env before running the app
if (window.guardian.polyfilled) {
    go();
} else {
    window.guardian.onPolyfilled = go;
}
