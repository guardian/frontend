// @flow strict
import config from 'lib/config';
import { isBreakpoint } from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import type { SpacefinderItem } from 'common/modules/spacefinder';
import { spaceFiller } from 'common/modules/article/space-filler';
import { adSizes } from 'commercial/modules/ad-sizes';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { initCarrot } from 'commercial/modules/carrot-traffic-driver';

type AdSize = {
    width: number,
    height: number,
    toString: (_: void) => string,
};

type Sizes = { desktop: Array<AdSize> };

const isPaidContent = config.get('page.isPaidContent', false);

const adSlotClassSelectorSizes = {
    minAbove: 500,
    minBelow: 500,
};

const insertAdAtPara = (
    para: Node,
    name: string,
    type: string,
    classes: ?string,
    sizes: ?Sizes
): Promise<void> => {
    const ads = createSlots(type, {
        name,
        classes,
        sizes,
    });

    return fastdom
        .write(() =>
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
const filterNearbyCandidates = (maximumAdHeight: number) => (
    candidate: SpacefinderItem
): boolean => {
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

const getBodySelector = (): string =>
    !config.get('isDotcomRendering', false)
        ? '.js-article__body'
        : '.article-body-commercial-selector';

const addDesktopInlineAds = (isInline1: boolean): Promise<number> => {
    const isImmersive = config.get('page.isImmersive');

    const defaultRules = {
        bodySelector: getBodySelector(),
        slotSelector: ' > p',
        minAbove: isImmersive ? 700 : 300,
        minBelow: 700,
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
        },
        filter: filterNearbyCandidates(adSizes.mpu.height),
    };

    // For any other inline
    const relaxedRules = {
        bodySelector: getBodySelector(),
        slotSelector: ' > p',
        minAbove: isPaidContent ? 1600 : 1000,
        minBelow: 800,
        selectors: {
            ' .ad-slot': adSlotClassSelectorSizes,
            ' figure.element--immersive': {
                minAbove: 0,
                minBelow: 600,
            },
        },
        filter: filterNearbyCandidates(adSizes.halfPage.height),
    };

    const rules = isInline1 ? defaultRules : relaxedRules;

    const insertAds = (paras: HTMLElement[]): Promise<number> => {
        const slots: Array<Promise<void>> = paras
            .slice(0, isInline1 ? 1 : paras.length)
            .map((para: Node, i: number) => {
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

const addMobileInlineAds = (): Promise<number> => {
    const rules = {
        bodySelector: getBodySelector(),
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

    const insertAds = (paras: HTMLElement[]): Promise<number> => {
        const slots: Array<Promise<void>> = paras.map((para: Node, i: number) =>
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

const addInlineAds = (): Promise<number> => {
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

const attemptToAddInlineMerchAd = (): Promise<boolean> => {
    const rules = {
        bodySelector: getBodySelector(),
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

export const init = (): Promise<boolean> => {
    if (!commercialFeatures.articleBodyAdverts) {
        return Promise.resolve(false);
    }

    const im = config.get('page.hasInlineMerchandise')
        ? attemptToAddInlineMerchAd()
        : Promise.resolve(false);
    im.then((inlineMerchAdded: boolean) =>
        inlineMerchAdded ? trackAdRender('dfp-ad--im') : Promise.resolve()
    )
        .then(addInlineAds)
        .then(initCarrot);

    return im;
};
