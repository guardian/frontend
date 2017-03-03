import domready from 'domready';
import raven from 'common/utils/raven';
import bootStandard from 'bootstraps/standard/main';
import config from 'common/utils/config';
import userTiming from 'common/utils/user-timing';
import capturePerfTimings from 'common/utils/capture-perf-timings';

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.page.assetsPath}javascripts/`;

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
        require(
            ['bootstraps/commercial'],
            raven.wrap({ tags: { feature: 'commercial' } }, commercial => {
                userTiming.mark('commercial boot');
                commercial.init().then(() => {
                    // 3. finally, try enhanced
                    // this is defined here so that webpack's code-splitting algo
                    // excludes all the modules bundled in the commercial chunk from this one
                    if (window.guardian.isEnhanced) {
                        userTiming.mark('enhanced request');
                        require(['bootstraps/enhanced/main'], bootEnhanced => {
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
