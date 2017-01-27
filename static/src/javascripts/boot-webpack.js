import domready from 'domready';
import raven from 'common/utils/raven';
import bootStandard from 'bootstraps/standard/main';
import config from 'common/utils/config';

// let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.page.assetsPath}javascripts/`;

domready(() => {
    // 1. boot standard, always
    bootStandard();

    // 2. once standard is done, next is commercial
    if (config.switches.commercial) {
        if (config.page.isDev) {
            window.guardian.adBlockers.onDetect.push((isInUse) => {
                const needsMessage = isInUse && window.console && window.console.warn;
                const message = 'Do you have an adblocker enabled? Commercial features might fail to run, or throw exceptions.';
                if (needsMessage) {
                    window.console.warn(message);
                }
            });
        }

        require(['bootstraps/commercial'], raven.wrap({ tags: { feature: 'commercial' } },
            (commercial) => {
                commercial.init();

                // 3. finally, try enhanced
                // this is defined here so that webpack's code-splitting algo
                // excludes all the modules bundled in the commercial chunk from this one
                if (window.guardian.isEnhanced) {
                    require(['bootstraps/enhanced/main'], (bootEnhanced) => {
                        bootEnhanced();
                    });
                }
            })
        );
    }
});
