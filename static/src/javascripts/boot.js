// es7 polyfills not provided by pollyfill.io
import 'core-js/modules/es.object.get-own-property-descriptors';

import domready from 'domready';
import { bootStandard } from 'bootstraps/standard/main';
import config from 'lib/config';
import { markTime } from 'lib/user-timing';
import { captureOphanInfo } from 'lib/capture-ophan-info';
import { reportError } from 'lib/report-error';
import { cmp, getLocale, loadScript, onConsentChange } from '@guardian/libs';
import { getCookie } from 'lib/cookies';
import { trackPerformance } from 'common/modules/analytics/google';
import { init as detectAdBlockers } from 'commercial/detect-adblock';
import ophan from 'ophan/ng';

// Let webpack know where to get files from
// __webpack_public_path__ is a special webpack variable
// https://webpack.js.org/guides/public-path/#set-value-on-the-fly
// eslint-disable-next-line camelcase,no-undef
__webpack_public_path__ = `${config.get('page.assetsPath')}javascripts/`;

// Debug preact in DEV
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-unused-expressions
    import(/* webpackChunkName: "preact-debug" */ 'preact/debug');
}

// kick off the app
const go = () => {
    domready(async () => {

        /**
         * Boot Standard
         *
         */

        markTime('standard boot');
        bootStandard();

        /**
         * CMP
         *
         */

        // CCPA and TCFv2
        const browserId = getCookie('bwid') || undefined;
        const pageViewId = config.get('ophan.pageViewId');
        const pubData = {
            platform: 'next-gen',
            browserId,
            pageViewId,
        };

        // keep this in sync with CONSENT_TIMING in src/web/components/App.tsx in frontend
        // mark: CONSENT_TIMING
        let recordedConsentTime = false;
        onConsentChange((consentState) => {

            if (!recordedConsentTime) {
                recordedConsentTime = true;
                cmp.willShowPrivacyMessage().then(willShow => {
                    trackPerformance(
                        'consent',
                        'acquired',
                        willShow ? 'new' : 'existing'
                    );
                });
            }

            // ------------------------------------------------------
            // Sending Consent Data to Ophan through ComponentEvent

            /*

                Date: March 2022
                Author: Pascal

                We reproduce here the same code that we had developed for DCR.
                See this for details: https://github.com/guardian/dotcom-rendering/blob/4cb96485401398fdd88698493bdb75f56fcd8c96/dotcom-rendering/src/web/browser/bootCmp/init.ts#L69
                The mapping: documentation also exists at https://github.com/guardian/transparency-consent-docs/blob/main/docs/capturing-consent-from-client-side.md

            */

            if (!consentState) return;

            const decideConsentCarrierLabels = () => {
                if (consentState.tcfv2) {
                    const consentUUID = getCookie('consentUUID') || '';
                    const consentString = consentState.tcfv2?.tcString;
                    return [
                        '01:TCF.v2',
                        `02:${consentUUID}`,
                        `03:${consentString}`,
                    ];
                }
                if (consentState.ccpa) {
                    const ccpaUUID = getCookie('ccpaUUID') || '';
                    const flag = consentState.ccpa?.doNotSell ? 'true' : 'false';
                    return ['01:CCPA', `04:${ccpaUUID}`, `05:${flag}`];
                }
                if (consentState.aus) {
                    const ccpaUUID = getCookie('ccpaUUID') || '';
                    const consentStatus = getCookie('consentStatus') || '';
                    const personalisedAdvertising = consentState.aus?.personalisedAdvertising ? 'true' : 'false';
                    return [
                        '01:AUS',
                        `06:${ccpaUUID}`,
                        `07:${consentStatus}`,
                        `08:${personalisedAdvertising}`,
                    ];
                }
                return [];
            };

            const componentType = 'CONSENT';

            const action = 'MANAGE_CONSENT';

            const event = {
                component: {
                    componentType,
                    products: [],
                    labels: decideConsentCarrierLabels(),
                },
                action,
            };

            ophan.record({
                componentEvent: event
            });

            // ------------------------------------------------------

            // ------------------------------------------------------
            // Sending Consent Data to Ophan as its own record

            /*

                Date: Dec 2023
                Author: Anna Voelker

                We reproduce here the same code that we had developed for DCR:
                https://github.com/guardian/dotcom-rendering/pull/9546
            */

                if (!consentState) return;

                const consentDetails = () => {
                    if (consentState.tcfv2) {
                        return {
                            consentJurisdiction: 'TCF',
                            consentUUID: getCookie({ name: 'consentUUID' }) ?? '',
                            consent: consentState.tcfv2.tcString,
                        };
                    }
                    if (consentState.ccpa) {
                        return {
                            consentJurisdiction: 'CCPA',
                            consentUUID: getCookie({ name: 'ccpaUUID' }) ?? '',
                            consent: consentState.ccpa.doNotSell ? 'false' : 'true',
                        };
                    }
                    if (consentState.aus) {
                        return {
                            consentJurisdiction: 'AUS',
                            consentUUID: getCookie({ name: 'ccpaUUID' }) ?? '',
                            consent: consentState.aus.personalisedAdvertising
                                ? 'true'
                                : 'false',
                        };
                    }
                    return {
                        consentJurisdiction: 'OTHER',
                        consentUUID: '',
                        consent: '',
                    };
                };

                // Register changes in consent state with Ophan
                ophan.record(consentDetails());

                // ------------------------------------------------------

        });

        cmp.init({ pubData, country: await getLocale() });

        /**
         * Handle Ad blockers
         *
         */

        detectAdBlockers()

        window.guardian.adBlockers.onDetect.push((adblockInUse) => {
            if (!adblockInUse) return;

            // For the moment we'll hide the top-above-nav slot if we detect that the user has ad blockers enabled
            // in order to avoid showing them a large blank space.
            // TODO improve shady pie to make better use of the slot.
            document.querySelector('.top-banner-ad-container').style.display =
                'none';

            if (process.env.NODE_ENV !== 'production') {
                const needsMessage =
                    adblockInUse && window.console && window.console.warn;
                const message =
                    'Do you have an adblocker enabled? Commercial features might fail to run, or throw exceptions.';
                if (needsMessage) {
                    window.console.warn(message);
                }
            }
        });

        /**
         * Commercial boot promise
         *
         */

		const fetchCommercial = () => {
			const noop = () => Promise.resolve({ bootCommercial: () => {} });

			markTime('commercial request');

			if (!config.get('page.isHosted', false)) {
				return loadScript(config.get('page.commercialBundleUrl')).then(noop);
			}

			return import(
				/* webpackChunkName: "commercial" */
				'bootstraps/commercial-hosted-legacy'
			);
		};

        /**
         * Enhanced boot promise
         *
         */

        const fetchEnhanced = window.guardian.isEnhanced
            ? (markTime('enhanced request'),
                import(/* webpackChunkName: "enhanced" */ 'bootstraps/enhanced/main'))
            : Promise.resolve({ bootEnhanced: () => { } });

        /**
         * Boot commercial and enhanced
         *
         */

        Promise.all([
            fetchCommercial().then(({ bootCommercial }) => {
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
