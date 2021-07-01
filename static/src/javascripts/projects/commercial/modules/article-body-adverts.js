import config from '../../../lib/config';
import { isBreakpoint } from '../../../lib/detect';
import fastdom from '../../../lib/fastdom-promise';
import mediator from '../../../lib/mediator';
import { spaceFiller } from '../../common/modules/article/space-filler';
import { adSizes } from './ad-sizes';
import { addSlot } from './dfp/add-slot';
import { trackAdRender } from './dfp/track-ad-render';
import { createSlots } from './dfp/create-slots';

import { commercialFeatures } from '../../common/modules/commercial/commercial-features';
import { initCarrot } from './carrot-traffic-driver';



const isPaidContent = config.get('page.isPaidContent', false);

const adSlotClassSelectorSizes = {
    minAbove: 500,
    minBelow: 500,
};

const insertAdAtPara = (
    para,
    name,
    type,
    classes,
    sizes
) => {
    const ads = createSlots(type, {
        name,
        classes,
        sizes,
    });

    return fastdom
        .mutate(() =>
            ads.forEach(ad => {
                if (para.parentNode) {
                    para.parentNode.insertBefore(ad, para);
                }
            })
        )
        .then(() => {
            const shouldForceDisplay = ['im', 'carrot'].includes(name);
            // Only add the first ad (the DFP one) to GTP
            addSlot(ads[0], shouldForceDisplay);
        });
};

let previousAllowedCandidate;

// this facilitates a second filtering, now taking into account the candidates' position/size relative to the other candidates
const filterNearbyCandidates = (maximumAdHeight) => (
    candidate
) => {
    if (
        !previousAllowedCandidate ||
        Math.abs(candidate.top - previousAllowedCandidate.top) -
            maximumAdHeight >=
            adSlotClassSelectorSizes.minBelow
    ) {
        previousAllowedCandidate = candidate;
        return true;
    }
    return false;
};

const isDotcomRendering = config.get('isDotcomRendering', false);
const articleBodySelector = isDotcomRendering ? '.article-body-commercial-selector' : '.js-article__body';

const addDesktopInlineAds = (isInline1) => {
    const isImmersive = config.get('page.isImmersive');
    const defaultRules = {
        bodySelector: articleBodySelector,
        slotSelector: ' > p',
        minAbove: isImmersive ? 700 : 300,
        minBelow: isDotcomRendering ? 300 : 700,
        selectors: {
            ' > h2': {
                minAbove: 5,
                minBelow: 190,
            },
            ' .ad-slot': adSlotClassSelectorSizes,
            ' > :not(p):not(h2):not(.ad-slot)': {
                minAbove: 35,
                minBelow: 400,
            },
            ' figure.element--immersive': {
                minAbove: 0,
                minBelow: 600,
            },
            ' figure.element--supporting': {
                minAbove: 500,
                minBelow: 0,
            },
        },
        filter: filterNearbyCandidates(adSizes.mpu.height),
    };

    // For any other inline
    const relaxedRules = {
        bodySelector: articleBodySelector,
        slotSelector: ' > p',
        minAbove: isPaidContent ? 1600 : 1000,
        minBelow: isDotcomRendering ? 300 : 800,
        selectors: {
            ' .ad-slot': adSlotClassSelectorSizes,
            ' figure.element--immersive': {
                minAbove: 0,
                minBelow: 600,
            },
            ' [data-spacefinder-ignore="numbered-list-title"]': {
				minAbove: 25,
				minBelow: 0,
			},
        },
        filter: filterNearbyCandidates(adSizes.halfPage.height),
    };

    const rules = isInline1 ? defaultRules : relaxedRules;

    const insertAds = (paras) => {
        const slots = paras
            .slice(0, isInline1 ? 1 : paras.length)
            .map((para, i) => {
                const inlineId = i + (isInline1 ? 1 : 2);

                return insertAdAtPara(
                    para,
                    `inline${inlineId}`,
                    'inline',
                    `inline${isInline1 ? '' : ' offset-right'}`,
                    isInline1
                        ? null
                        : { desktop: [adSizes.halfPage, adSizes.skyscraper] }
                );
            });

        return Promise.all(slots).then(() => slots.length);
    };

    return spaceFiller.fillSpace(rules, insertAds, {
        waitForImages: true,
        waitForLinks: true,
        waitForInteractives: true,
    });
};

const addMobileInlineAds = () => {
    const rules = {
        bodySelector: articleBodySelector,
        slotSelector: ' > p',
        minAbove: 200,
        minBelow: 200,
        selectors: {
            ' > h2': {
                minAbove: 100,
                minBelow: 250,
            },
            ' .ad-slot': adSlotClassSelectorSizes,
            ' > :not(p):not(h2):not(.ad-slot)': {
                minAbove: 35,
                minBelow: 200,
            },
            fromBottom: true,
        },
        filter: filterNearbyCandidates(adSizes.mpu.height),
    };

    const insertAds = (paras) => {
        const slots = paras.map((para, i) =>
            insertAdAtPara(
                para,
                i === 0 ? 'top-above-nav' : `inline${i}`,
                i === 0 ? 'top-above-nav' : 'inline',
                'inline'
            )
        );

        return Promise.all(slots).then(() => slots.length);
    };

    // This just returns whatever is passed in the second argument
    return spaceFiller.fillSpace(rules, insertAds, {
        waitForImages: true,
        waitForLinks: true,
        waitForInteractives: true,
    });
};

const addInlineAds = () => {
    const isMobile = isBreakpoint({
        max: 'mobileLandscape',
    });

    if (isMobile) {
        return addMobileInlineAds();
    }
    if (isPaidContent) {
        return addDesktopInlineAds(false);
    }
    return addDesktopInlineAds(true).then(() => addDesktopInlineAds(false));
};

const attemptToAddInlineMerchAd = () => {
    const rules = {
        bodySelector: articleBodySelector,
        slotSelector: ' > p',
        minAbove: 300,
        minBelow: 0,
        selectors: {
            ' > .merch': {
                minAbove: 0,
                minBelow: 0,
            },
            ' > header': {
                minAbove: isBreakpoint({
                    max: 'tablet',
                })
                    ? 300
                    : 700,
                minBelow: 0,
            },
            ' > h2': {
                minAbove: 100,
                minBelow: 250,
            },
            ' .ad-slot': adSlotClassSelectorSizes,
            ' > :not(p):not(h2):not(.ad-slot)': {
                minAbove: 200,
                minBelow: 400,
            },
        },
    };

    return spaceFiller.fillSpace(
        rules,
        paras => insertAdAtPara(paras[0], 'im', 'im').then(() => true),
        {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true,
        }
    );
};

const doInit = () => {
    if (!commercialFeatures.articleBodyAdverts) {
        return Promise.resolve(false);
    }

    const im = config.get('page.hasInlineMerchandise')
        ? attemptToAddInlineMerchAd()
        : Promise.resolve(false);
    im.then((inlineMerchAdded) =>
        inlineMerchAdded ? trackAdRender('dfp-ad--im') : Promise.resolve()
    )
        .then(addInlineAds)
        .then(initCarrot);

    return im;
};

export const init = () => {
    // Also init when the main article is redisplayed
    // For instance by the signin gate.
    mediator.on('page:article:redisplayed', doInit);
    // DCR doesn't have mediator, so listen for CustomEvent
    document.addEventListener('dcr:page:article:redisplayed', doInit);
    return doInit();
};
