// @flow
import config from 'lib/config';
import { catchErrorsWithContext } from 'lib/robust';
import { markTime } from 'lib/user-timing';
import reportError from 'lib/report-error';
import highMerch from 'commercial/modules/high-merch';
import {
    articleAsideAdvertsInit,
} from 'commercial/modules/article-aside-adverts';
import {
    articleBodyAdvertsInit,
} from 'commercial/modules/article-body-adverts';
import closeDisabledSlots from 'commercial/modules/close-disabled-slots';
import prepareGoogletag from 'commercial/modules/dfp/prepare-googletag';
import prepareSonobiTag from 'commercial/modules/dfp/prepare-sonobi-tag';
import prepareSwitchTag from 'commercial/modules/dfp/prepare-switch-tag';
import { fillAdvertSlots } from 'commercial/modules/dfp/fill-advert-slots';
import hostedAbout from 'commercial/modules/hosted/about';
import { initHostedVideo } from 'commercial/modules/hosted/video';
import hostedGallery from 'commercial/modules/hosted/gallery';
import hostedOJCarousel
    from 'commercial/modules/hosted/onward-journey-carousel';
import hostedOnward from 'commercial/modules/hosted/onward';
import liveblogAdverts from 'commercial/modules/liveblog-adverts';
import stickyTopBanner from 'commercial/modules/sticky-top-banner';
import thirdPartyTags from 'commercial/modules/third-party-tags';
import paidforBand from 'commercial/modules/paidfor-band';
import { paidContainers } from 'commercial/modules/paid-containers';
import {
    defer,
    wrap,
    addStartTimeBaseline,
    addEndTimeBaseline,
    primaryBaseline,
} from 'commercial/modules/dfp/performance-logging';
import { trackPerformance } from 'common/modules/analytics/google';
import userFeatures from 'commercial/modules/user-features';

const commercialModules: Array<Array<any>> = [
    ['cm-highMerch', highMerch.init],
    ['cm-thirdPartyTags', thirdPartyTags.init],
    ['cm-prepare-sonobi-tag', prepareSonobiTag.init, true],
    ['cm-prepare-switch-tag', prepareSwitchTag.init, true],
    ['cm-articleAsideAdverts', articleAsideAdvertsInit, true],
    ['cm-prepare-googletag', prepareGoogletag.init, true],
    ['cm-articleBodyAdverts', articleBodyAdvertsInit],
    ['cm-liveblogAdverts', liveblogAdverts.init, true],
    ['cm-closeDisabledSlots', closeDisabledSlots.init],
    ['cm-stickyTopBanner', stickyTopBanner.init],
    ['cm-fill-advert-slots', fillAdvertSlots, true],
    ['cm-paidContainers', paidContainers],
    ['cm-paidforBand', paidforBand.init],
];

if (config.page.isHosted) {
    commercialModules.push(
        ['cm-hostedAbout', hostedAbout.init],
        ['cm-hostedVideo', initHostedVideo, true],
        ['cm-hostedGallery', hostedGallery.init],
        ['cm-hostedOnward', hostedOnward.init, true],
        ['cm-hostedOJCarousel', hostedOJCarousel.init]
    );
}

const loadModules = (modules, baseline): Promise<void> => {
    addStartTimeBaseline(baseline);

    const modulePromises = [];

    modules.forEach(module => {
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
        addEndTimeBaseline(baseline);
    });
};

export default (): Promise<void> => {
    if (config.switches.adFreeMembershipTrial && userFeatures.isAdFreeUser()) {
        closeDisabledSlots.init(true);
        return Promise.resolve();
    }

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

    return loadModules(commercialModules, primaryBaseline)
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
