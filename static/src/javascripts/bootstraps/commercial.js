// @flow
import config from 'lib/config';
import { catchErrorsWithContext } from 'lib/robust';
import { markTime } from 'lib/user-timing';
import reportError from 'lib/report-error';
import { init as initHighMerch } from 'commercial/modules/high-merch';
import { init as initArticleAsideAdverts } from 'commercial/modules/article-aside-adverts';
import { init as initArticleBodyAdverts } from 'commercial/modules/article-body-adverts';
import { closeDisabledSlots } from 'commercial/modules/close-disabled-slots';
import { adFreeSlotRemove } from 'commercial/modules/ad-free-slot-remove';
import { init as initCmpService } from 'commercial/modules/cmp/cmp';
import { init as initLotameCmp } from 'commercial/modules/cmp/lotame-cmp';
import { init as initLotameDataExtract } from 'commercial/modules/lotame-data-extract';
import { trackConsent as trackCmpConsent } from 'commercial/modules/cmp/consent-tracker';
import { init as prepareAdVerification } from 'commercial/modules/ad-verification/prepare-ad-verification';
import { init as prepareGoogletag } from 'commercial/modules/dfp/prepare-googletag';
import { init as preparePrebid } from 'commercial/modules/dfp/prepare-prebid';
import { init as initLiveblogAdverts } from 'commercial/modules/liveblog-adverts';
import { init as initStickyTopBanner } from 'commercial/modules/sticky-top-banner';
import { init as initThirdPartyTags } from 'commercial/modules/third-party-tags';
import { init as initPaidForBand } from 'commercial/modules/paidfor-band';
import { paidContainers } from 'commercial/modules/paid-containers';
import {
    defer,
    wrap,
    addStartTimeBaseline,
    addEndTimeBaseline,
    primaryBaseline,
} from 'commercial/modules/dfp/performance-logging';
import { trackPerformance } from 'common/modules/analytics/google';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { initCheckDispatcher } from 'commercial/modules/check-dispatcher';
import { initCommentAdverts } from 'commercial/modules/comment-adverts';

const commercialModules: Array<Array<any>> = [
    ['cm-adFreeSlotRemove', adFreeSlotRemove],
    ['cm-closeDisabledSlots', closeDisabledSlots],
    ['cm-prepare-cmp', initCmpService],
    ['cm-track-cmp-consent', trackCmpConsent],
    ['cm-thirdPartyTags', initThirdPartyTags],
    ['cm-prepare-prebid', preparePrebid, true],
    ['cm-prepare-googletag', prepareGoogletag, true],
    ['cm-checkDispatcher', initCheckDispatcher],
    ['cm-lotame-cmp', initLotameCmp],
    ['cm-lotame-data-extract', initLotameDataExtract, true],
];

if (!commercialFeatures.adFree) {
    commercialModules.push(
        ['cm-prepare-adverification', prepareAdVerification, true],
        ['cm-highMerch', initHighMerch],
        ['cm-articleAsideAdverts', initArticleAsideAdverts, true],
        ['cm-articleBodyAdverts', initArticleBodyAdverts, true],
        ['cm-liveblogAdverts', initLiveblogAdverts, true],
        ['cm-stickyTopBanner', initStickyTopBanner],
        ['cm-paidContainers', paidContainers],
        ['cm-paidforBand', initPaidForBand],
        ['cm-commentAdverts', initCommentAdverts]
    );
}

const loadHostedBundle = (): Promise<void> => {
    if (config.get('page.isHosted')) {
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

export const bootCommercial = (): Promise<void> => {
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
