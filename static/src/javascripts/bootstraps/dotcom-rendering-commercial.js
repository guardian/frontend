// @flow
/*
import config from 'lib/config';
import { catchErrorsWithContext } from 'lib/robust';
import { markTime } from 'lib/user-timing';
import reportError from 'lib/report-error';
*/
// import { init as initCmpService } from 'commercial/modules/cmp/cmp';
// import { trackConsent as trackCmpConsent } from 'commercial/modules/cmp/consent-tracker';
// import { init as prepareGoogletag } from 'commercial/modules/dfp/prepare-googletag';
// import { init as initThirdPartyTags } from 'commercial/modules/third-party-tags';
/*
import {
    defer,
    wrap,
    addStartTimeBaseline,
    addEndTimeBaseline,
    primaryBaseline,
} from 'commercial/modules/dfp/performance-logging';
import { trackPerformance } from 'common/modules/analytics/google';
*/
/*
const commercialModules: Array<Array<any>> = [
    //['cm-prepare-cmp', initCmpService],
    //['cm-track-cmp-consent', trackCmpConsent],
    //['cm-thirdPartyTags', initThirdPartyTags],
    //['cm-prepare-googletag', prepareGoogletag, true],
];
*/
/*
const loadHostedBundle = (): Promise<void> => {
    if (config.page.isHosted) {
        return new Promise(resolve => {
            require.ensure(
                [],
                require => {
                    const hostedAbout = require('commercial/modules/hosted/about');
                    const initHostedVideo = require('commercial/modules/hosted/video');
                    const hostedGallery = require('commercial/modules/hosted/gallery');
                    const initHostedCarousel = require('commercial/modules/hosted/onward-journey-carousel');
                    const loadOnwardComponent = require('commercial/modules/hosted/onward');
                    commercialModules.push(
                        ['cm-hostedAbout', hostedAbout.init],
                        [
                            'cm-hostedVideo',
                            initHostedVideo.initHostedVideo,
                            true,
                        ],
                        ['cm-hostedGallery', hostedGallery.init],
                        [
                            'cm-hostedOnward',
                            loadOnwardComponent.loadOnwardComponent,
                            true,
                        ],
                        [
                            'cm-hostedOJCarousel',
                            initHostedCarousel.initHostedCarousel,
                        ]
                    );
                    resolve();
                },
                'commercial-hosted'
            );
        });
    }
    return Promise.resolve();
};
const loadModules = (): Promise<void> => {
    addStartTimeBaseline(primaryBaseline);

    const modulePromises = [];

    commercialModules.forEach(module => {
        const moduleName: string = module[0];
        const moduleInit: () => void = module[1];
        const moduleDefer: boolean = module[2];

        catchErrorsWithContext([
            [
                moduleName,
                function pushAfterComplete(): void {
                    // These modules all have async init procedures which don't block, and return a promise purely for
                    // perf logging, to time when their async work is done. The command buffer guarantees execution order,
                    // so we don't use the returned promise to order the bootstrap's module invocations.
                    const wrapped = moduleDefer
                        ? defer(moduleName, moduleInit)
                        : wrap(moduleName, moduleInit);
                    const result = wrapped();
                    modulePromises.push(result);
                },
            ],
        ]);
    });
    return Promise.all(modulePromises).then(
        (): void => {
            addEndTimeBaseline(primaryBaseline);
        }
    );
};
*/
const bootCommercial = () => {
    /*
    markTime('commercial start');

    catchErrorsWithContext([
        [
            'ga-user-timing-commercial-start',
            function runTrackPerformance(): void {
                trackPerformance(
                    'Javascript Load',
                    'commercialStart',
                    'Commercial start parse time'
                );
            },
        ],
    ]);

    // Stub the command queue
    window.googletag = {
        cmd: [],
    };

    return loadHostedBundle()
        .then(loadModules)
        .then(() => {
            markTime('commercial end');
            catchErrorsWithContext([
                [
                    'ga-user-timing-commercial-end',
                    function runTrackPerformance(): void {
                        trackPerformance(
                            'Javascript Load',
                            'commercialEnd',
                            'Commercial end parse time'
                        );
                    },
                ],
            ]);
        })
        .catch(err => {
            // Just in case something goes wrong, we don't want it to
            // prevent enhanced from loading
            reportError(err, {
                feature: 'commercial',
            });
        });
    */
};

bootCommercial();
