// @flow

// es7 polyfills not provided by pollyfill.io
import 'core-js/modules/es7.object.values';
import 'core-js/modules/es7.object.get-own-property-descriptors';
import 'core-js/modules/es7.string.pad-start';
import 'core-js/modules/es7.string.pad-end';

import domready from 'domready';
import raven from 'lib/raven';
import { bootStandard } from 'bootstraps/standard/main';
import config from 'lib/config';
import { markTime } from 'lib/user-timing';
import { capturePerfTimings } from 'lib/capture-perf-timings';

// Let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.get('page.assetsPath')}javascripts/`;

// Start downloading these ASAP
const commercialBaselineControl =
    config.get('tests.commercialBaselineControl') === 'control';

// eslint-disable-next-line no-nested-ternary
const fetchCommercial = config.get('switches.commercial')
    ? (markTime('commercial request'), commercialBaselineControl)
      ? import(/* webpackChunkName: "commercial-control" */ 'bootstraps/commercial-control')
      : import(/* webpackChunkName: "commercial" */ 'bootstraps/commercial')
    : Promise.resolve({ bootCommercial: () => {} });

const fetchEnhanced = window.guardian.isEnhanced
    ? (markTime('enhanced request'),
      import(/* webpackChunkName: "enhanced" */ 'bootstraps/enhanced/main'))
    : Promise.resolve({ bootEnhanced: () => {} });

// kick off the app
const go = () => {
    domready(() => {
        // 1. boot standard, always
        markTime('standard boot');
        bootStandard();

        // 2. once standard is done, next is commercial
        if (config.get('page.isDev')) {
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

        raven.context(
            {
                tags: {
                    feature: commercialBaselineControl
                        ? 'commercial-control'
                        : 'commercial',
                },
            },
            () => {
                Promise.all([
                    fetchCommercial.then(({ bootCommercial }) => {
                        markTime('commercial boot');
                        return bootCommercial();
                    }),
                    fetchEnhanced.then(({ bootEnhanced }) => {
                        markTime('enhanced boot');
                        return bootEnhanced();
                    }),
                ]).then(() => {
                    if (document.readyState === 'complete') {
                        capturePerfTimings();
                    } else {
                        window.addEventListener('load', capturePerfTimings);
                    }
                });
            }
        );
    });
};

// make sure we've patched the env before running the app
if (window.guardian.polyfilled) {
    go();
} else {
    window.guardian.onPolyfilled = go;
}
