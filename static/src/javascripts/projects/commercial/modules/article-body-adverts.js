// @flow
import config from 'lib/config';
import { isBreakpoint, getBreakpoint } from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import type { SpacefinderItem } from 'common/modules/spacefinder';
import { spaceFiller } from 'common/modules/article/space-filler';
import { adSizes } from 'commercial/modules/ad-sizes';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { trackAdRender } from 'commercial/modules/dfp/track-ad-render';
import { createSlot } from 'commercial/modules/dfp/create-slot';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { getTestVariantId } from 'common/modules/experiments/utils.js';

type AdSize = {
    width: number,
    height: number,
    switchUnitId: ?number,
    toString: (_: void) => string,
};

/* bodyAds is a counter that keeps track of the number of inline MPUs
 * inserted dynamically. */
let bodyAds: number;
const isMobileBreakpoint: boolean = isBreakpoint({
    max: 'phablet',
});

const shouldUseVariantRules =
    config.get('switches.abSpacefinderSimplify', false) &&
    getTestVariantId('SpacefinderSimplify') === 'variant' &&
    !isMobileBreakpoint;

const getSlotNameForMobile = (): string =>
    bodyAds === 1 ? 'top-above-nav' : `inline${bodyAds - 1}`;

const getSlotNameForDesktop = (): string => `inline${bodyAds}`;

const getSlotTypeForMobile = (): string =>
    bodyAds === 1 ? 'top-above-nav' : 'inline';

const getSlotTypeForDesktop = (): string => 'inline';

const getSlotName = isMobileBreakpoint
    ? getSlotNameForMobile
    : getSlotNameForDesktop;
const getSlotType = isMobileBreakpoint
    ? getSlotTypeForMobile
    : getSlotTypeForDesktop;

type Sizes = { desktop: Array<AdSize> };

const insertAdAtPara = (
    para: Node,
    name: string,
    type: string,
    classes: ?string,
    sizes: ?Sizes
): Promise<void> => {
    const ad: HTMLElement = createSlot(type, {
        name,
        classes,
        sizes,
    });

    return fastdom
        .write(() => {
            if (para.parentNode) {
                para.parentNode.insertBefore(ad, para);
            }
        })
        .then(() => {
            addSlot(ad, name === 'im');
        });
};

// Add new ads while there is still space
const addArticleAds = (rules: Object, count: ?number): Promise<number> => {
    const insertInlineAds = (paras: HTMLElement[]): Promise<number> => {
        const slots: Array<Promise<void>> = paras
            .slice(
                0,
                count && count > 0
                    ? Math.min(paras.length, count)
                    : paras.length
            )
            .map((para: Node) => {
                bodyAds += 1;
                return insertAdAtPara(
                    para,
                    getSlotName(),
                    getSlotType(),
                    `inline${bodyAds > 1 ? ' offset-right' : ''}`,
                    bodyAds > 1 ? { desktop: [adSizes.halfPage] } : null
                );
            });

        return Promise.all(slots).then(() => slots.length);
    };

    // This just returns whatever is passed in the second argument
    return spaceFiller.fillSpace(rules, insertInlineAds, {
        waitForImages: true,
        waitForLinks: true,
        waitForInteractives: true,
    });
};

const getRules = (): Object => {
    let prevSlot: SpacefinderItem;

    const adSlotClassSelectorSizes = {
        minAbove: 500,
        minBelow: 500,
    };

    // this can be used to ensure that _nothing_ can be placed above a given selector element
    const blockadeMinAbove = 999999;

    const filter = (slot: SpacefinderItem) => {
        if (
            !prevSlot ||
            Math.abs(slot.top - prevSlot.top) - adSizes.mpu.height >=
                adSlotClassSelectorSizes.minBelow
        ) {
            prevSlot = slot;
            return true;
        }
        return false;
    };

    const defaultRules = {
        bodySelector: '.js-article__body',
        slotSelector: ' > p',
        minAbove:
            isBreakpoint({
                max: 'tablet',
            }) || shouldUseVariantRules
                ? 300
                : 700,
        minBelow: 300,
        selectors: {
            ' > h2': {
                minAbove: getBreakpoint() === 'mobile' ? 100 : 0,
                minBelow: 250,
            },
            ' .ad-slot': adSlotClassSelectorSizes,
            ' > :not(p):not(h2):not(.ad-slot)': {
                minAbove: 35,
                minBelow: 400,
            },
        },
        filter,
    };

    const variantRules = {
        bodySelector: '.js-article__body',
        slotSelector: ' > p',
        minAbove: 300,
        minBelow: 300,
        selectors: {
            ' .ad-slot': adSlotClassSelectorSizes,
            ' .ad-slot--inline1': {
                minAbove: 0,
                minBelow: blockadeMinAbove,
            },
        },
        filter,
    };

    return shouldUseVariantRules && bodyAds > 0 ? variantRules : defaultRules;
};

const addInlineAds = (): Promise<number> =>
    addArticleAds(getRules(), 1).then(() => addArticleAds(getRules()));

const getInlineMerchRules = (): Object => {
    const inlineMerchRules: Object = getRules();
    inlineMerchRules.minAbove = 300;
    inlineMerchRules.selectors[' > h2'].minAbove = 100;
    inlineMerchRules.selectors[
        ' > :not(p):not(h2):not(.ad-slot)'
    ].minAbove = 200;
    return inlineMerchRules;
};

const addInlineMerchAd = (): Promise<any> =>
    spaceFiller.fillSpace(
        getInlineMerchRules(),
        paras => insertAdAtPara(paras[0], 'im', 'im').then(() => 1),
        {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true,
        }
    );

const waitForMerch = (countAdded: number): Promise<void> =>
    countAdded === 1 ? trackAdRender('dfp-ad--im') : Promise.resolve();

export const init = (start: () => void, stop: () => void): Promise<boolean> => {
    start();
    if (!commercialFeatures.articleBodyAdverts) {
        stop();
        return Promise.resolve(false);
    }

    bodyAds = 0;

    if (config.page.hasInlineMerchandise) {
        const im = addInlineMerchAd();
        // Whether an inline merch has been inserted or not,
        // we still want to try to insert inline MPUs. But
        // we must wait for DFP to return, since if the merch
        // component is empty, it might completely change the
        // positions where we insert those MPUs.
        im
            .then(waitForMerch)
            .then(addInlineAds)
            .then(stop);

        return im;
    }

    addInlineAds().then(stop);
    return Promise.resolve(true);
};
