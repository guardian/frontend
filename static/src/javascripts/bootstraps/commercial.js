// @flow
import config from 'lib/config';
import { catchErrorsWithContext } from 'lib/robust';
import { markTime } from 'lib/user-timing';
import reportError from 'lib/report-error';
import { init as initHighMerch } from 'commercial/modules/high-merch';
import { init as initArticleAsideAdverts } from 'commercial/modules/article-aside-adverts';
import { init as initArticleBodyAdverts } from 'commercial/modules/article-body-adverts';
import { init as initMobileSticky } from 'commercial/modules/mobile-sticky';
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
import { trackPerformance } from 'common/modules/analytics/google';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { initCheckDispatcher } from 'commercial/modules/check-dispatcher';
import { initCommentAdverts } from 'commercial/modules/comment-adverts';

const commercialModules: Array<Array<any>> = [
    ['cm-adFreeSlotRemove', adFreeSlotRemove],
    ['cm-closeDisabledSlots', closeDisabledSlots],
    ['cm-prepare-cmp', initCmpService],
    ['cm-track-cmp-consent', trackCmpConsent],
    ['cm-checkDispatcher', initCheckDispatcher],
    ['cm-lotame-cmp', initLotameCmp],
    ['cm-lotame-data-extract', initLotameDataExtract],
];

if (!commercialFeatures.adFree) {
    commercialModules.push(
        ['cm-prepare-prebid', preparePrebid],
        ['cm-prepare-googletag', prepareGoogletag],
        ['cm-thirdPartyTags', initThirdPartyTags],
        ['cm-prepare-adverification', prepareAdVerification],
        ['cm-mobileSticky', initMobileSticky],
        ['cm-highMerch', initHighMerch],
        ['cm-articleAsideAdverts', initArticleAsideAdverts],
        ['cm-articleBodyAdverts', initArticleBodyAdverts],
        ['cm-liveblogAdverts', initLiveblogAdverts],
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
                        ['cm-hostedVideo', initHostedVideo.initHostedVideo],
                        ['cm-hostedGallery', hostedGallery.init],
                        [
                            'cm-hostedOnward',
                            loadOnwardComponent.loadOnwardComponent,
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

const loadModules = (): Promise<any> => {
    const modulePromises = [];

    commercialModules.forEach(module => {
        const moduleName: string = module[0];
        const moduleInit: () => void = module[1];

        catchErrorsWithContext(
            [
                [
                    moduleName,
                    function pushAfterComplete(): void {
                        const result = moduleInit();
                        modulePromises.push(result);
                    },
                ],
            ],
            {
                feature: 'commercial',
            }
        );
    });

    return Promise.all(modulePromises);
};

export const bootCommercial = (): Promise<void> => {
    markTime('commercial start');
    catchErrorsWithContext(
        [
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
        ],
        {
            feature: 'commercial',
        }
    );

    // Stub the command queue
    window.googletag = {
        cmd: [],
    };

    return loadHostedBundle()
        .then(loadModules)
        .then(() => {
            markTime('commercial end');
            catchErrorsWithContext(
                [
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
                ],
                {
                    feature: 'commercial',
                }
            );
        })
        .catch(err => {
            // report async errors in bootCommercial to Sentry with the commercial feature tag
            reportError(
                err,
                {
                    feature: 'commercial',
                },
                false
            );
        });
};
