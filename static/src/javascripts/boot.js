// @flow

// es7 polyfills not provided by pollyfill.io
import 'core-js/modules/es7.object.get-own-property-descriptors';

import domready from 'domready';
import { bootStandard } from 'bootstraps/standard/main';
import config from 'lib/config';
import { markTime } from 'lib/user-timing';
import { captureOphanInfo } from 'lib/capture-ophan-info';
import reportError from 'lib/report-error';
import 'projects/commercial/modules/cmp/stub';
import { isCcpaApplicable } from 'commercial/modules/cmp/ccpa-cmp';
import { isInUsa } from 'projects/common/modules/commercial/geo-utils.js';
import { cmp, oldCmp } from '@guardian/consent-management-platform';
import { isInTcfv2Test } from 'commercial/modules/cmp/tcfv2-test';

// Let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.get('page.assetsPath')}javascripts/`;

// Debug preact in DEV
if (process.env.NODE_ENV !== 'production') {
    import(/* webpackChunkName: "preact-debug" */ 'preact/debug');
}

// kick off the app
const go = () => {
    domready(() => {
        // 1. boot standard, always
        markTime('standard boot');
        bootStandard();

        // Start CMP
        console.log('[CMP—TCFv2]', {
            isInTcfv2Test: isInTcfv2Test(),
            isCcpaApplicable: isCcpaApplicable(),
            isInUsa: isInUsa(),
        });
        if (isCcpaApplicable()) {
            oldCmp.init({ useCcpa: true });
        } else if (isInTcfv2Test()) {
            cmp.init({ isInUsa: isInUsa() });
        }

        // 2. once standard is done, next is commercial
        if (process.env.NODE_ENV !== 'production') {
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

        // Start downloading these ASAP

        // eslint-disable-next-line no-nested-ternary
        const fetchCommercial = config.get('switches.commercial')
            ? (markTime('commercial request'),
              import(/* webpackChunkName: "commercial" */ 'bootstraps/commercial'))
            : Promise.resolve({ bootCommercial: () => {} });

        const fetchEnhanced = window.guardian.isEnhanced
            ? (markTime('enhanced request'),
              import(/* webpackChunkName: "enhanced" */ 'bootstraps/enhanced/main'))
            : Promise.resolve({ bootEnhanced: () => {} });

        Promise.all([
            fetchCommercial.then(({ bootCommercial }) => {
                markTime('commercial boot');
                try {
                    return bootCommercial();
                } catch (err) {
                    /**
                     * report sync errors in bootCommercial to
                     * Sentry with the commercial feature tag
                     *  */
                    reportError(
                        err,
                        {
                            feature: 'commercial',
                        },
                        false
                    );
                }
            }),
            fetchEnhanced.then(({ bootEnhanced }) => {
                markTime('enhanced boot');
                try {
                    return bootEnhanced();
                } catch (err) {
                    /**
                     * report sync errors in bootEnhanced to
                     * Sentry with the enhanced feature tag
                     *  */
                    reportError(
                        err,
                        {
                            feature: 'enhanced',
                        },
                        false
                    );
                }
            }),
        ]).then(() => {
            if (document.readyState === 'complete') {
                captureOphanInfo();
            } else {
                window.addEventListener('load', captureOphanInfo);
            }
        });
    });
};

// make sure we've patched the env before running the app
if (window.guardian.polyfilled) {
    go();
} else {
    window.guardian.onPolyfilled = go;
}
