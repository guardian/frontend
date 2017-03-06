import domready from 'domready';
import raven from 'lib/raven';
import bootStandard from 'bootstraps/standard/main';
import config from 'lib/config';
import userTiming from 'lib/user-timing';
import capturePerfTimings from 'lib/capture-perf-timings';

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.page.assetsPath}javascripts/`;

// Selectively attempt to pollute the global namespace with babel polfills.
// The polyfills babel provides from core-js will be browser natives where
// available anyway, so this shouldn't muck about with UAs that don't need it.
if (!window.Promise) {
    // used by webpack `import`
    window.Promise = Promise;
}

domready(() => {
    // 1. boot standard, always
    userTiming.mark('standard boot');
    bootStandard();

    // 2. once standard is done, next is commercial
    if (config.switches.commercial) {
        if (config.page.isDev) {
            window.guardian.adBlockers.onDetect.push(isInUse => {
                const needsMessage = isInUse &&
                    window.console &&
                    window.console.warn;
                const message = 'Do you have an adblocker enabled? Commercial features might fail to run, or throw exceptions.';
                if (needsMessage) {
                    window.console.warn(message);
                }
            });
        }

        userTiming.mark('commercial request');
        import('bootstraps/commercial').then(
            raven.wrap({ tags: { feature: 'commercial' } }, commercial => {
                userTiming.mark('commercial boot');
                commercial.init().then(() => {
                    // 3. finally, try enhanced
                    // this is defined here so that webpack's code-splitting algo
                    // excludes all the modules bundled in the commercial chunk from this one
                    if (window.guardian.isEnhanced) {
                        userTiming.mark('enhanced request');
                        import(
                            'bootstraps/enhanced/main'
                        ).then(bootEnhanced => {
                            userTiming.mark('enhanced boot');
                            bootEnhanced();
                            if (document.readyState === 'complete') {
                                capturePerfTimings();
                            } else {
                                window.addEventListener(
                                    'load',
                                    capturePerfTimings
                                );
                            }
                        });
                    }
                });
            })
        );
    }
});
