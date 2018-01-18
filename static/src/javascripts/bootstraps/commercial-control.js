// @flow
import config from 'lib/config';
import { catchErrorsWithContext } from 'lib/robust';
import { markTime } from 'lib/user-timing';
import reportError from 'lib/report-error';
import highMerch from 'commercial-control/modules/high-merch';
import { articleAsideAdvertsInit } from 'commercial-control/modules/article-aside-adverts';
import { articleBodyAdvertsInit } from 'commercial-control/modules/article-body-adverts';
import { closeDisabledSlots } from 'commercial-control/modules/close-disabled-slots';
import prepareGoogletag from 'commercial-control/modules/dfp/prepare-googletag';
import prepareSonobiTag from 'commercial-control/modules/dfp/prepare-sonobi-tag';
import { initLiveblogAdverts } from 'commercial-control/modules/liveblog-adverts';
import { initStickyTopBanner } from 'commercial-control/modules/sticky-top-banner';
import { initThirdPartyTags } from 'commercial-control/modules/third-party-tags';
import { initPaidForBand } from 'commercial-control/modules/paidfor-band';
import { paidContainers } from 'commercial-control/modules/paid-containers';
import {
    defer,
    wrap,
    addStartTimeBaseline,
    addEndTimeBaseline,
    primaryBaseline,
} from 'commercial-control/modules/dfp/performance-logging';
import { trackPerformance } from 'common/modules/analytics/google';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { initCheckDispatcher } from 'commercial-control/modules/check-dispatcher';
import commentAdverts from 'commercial-control/modules/comment-adverts';

const commercialModules: Array<Array<any>> = [
    ['cm-highMerch', highMerch.init],
    ['cm-thirdPartyTags', initThirdPartyTags],
    ['cm-prepare-googletag', prepareGoogletag.init, true],
    ['cm-closeDisabledSlots', closeDisabledSlots],
    ['cm-paidContainers', paidContainers],
    ['cm-paidforBand', initPaidForBand],
    ['cm-checkDispatcher', initCheckDispatcher],
    ['cm-commentAdverts', commentAdverts],
];

if (!commercialFeatures.adFree) {
    commercialModules.push(
        ['cm-prepare-sonobi-tag', prepareSonobiTag.init, true],
        ['cm-articleAsideAdverts', articleAsideAdvertsInit, true],
        ['cm-articleBodyAdverts', articleBodyAdvertsInit],
        ['cm-liveblogAdverts', initLiveblogAdverts, true],
        ['cm-stickyTopBanner', initStickyTopBanner]
    );
}

const loadHostedBundle = (): Promise<void> => {
    if (config.page.isHosted) {
        return new Promise(resolve => {
            require.ensure(
                [],
                require => {
                    const hostedAbout = require('commercial-control/modules/hosted/about');
                    const initHostedVideo = require('commercial-control/modules/hosted/video');
                    const hostedGallery = require('commercial-control/modules/hosted/gallery');
                    const initHostedCarousel = require('commercial-control/modules/hosted/onward-journey-carousel');
                    const loadOnwardComponent = require('commercial-control/modules/hosted/onward');
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
                'commercial-hosted-control'
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
    return Promise.all(modulePromises).then((): void => {
        addEndTimeBaseline(primaryBaseline);
    });
};

export default (): Promise<void> => {
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
};
