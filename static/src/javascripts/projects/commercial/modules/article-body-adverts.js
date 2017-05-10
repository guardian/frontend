// @flow
import config from 'lib/config';
import detect from 'lib/detect';
import fastdom from 'lib/fastdom-promise';
import abUtils from 'common/modules/experiments/utils';
import spaceFiller from 'common/modules/article/space-filler';
import adSizes from 'commercial/modules/ad-sizes';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import trackAdRender from 'commercial/modules/dfp/track-ad-render';
import createSlot from 'commercial/modules/dfp/create-slot';
import commercialFeatures from 'commercial/modules/commercial-features';

/* bodyAds is a counter that keeps track of the number of inline MPUs
 * inserted dynamically. */
let bodyAds;
let replaceTopSlot;
let getSlotName;
let getSlotType;

const isOffsetingAds =
    abUtils.testCanBeRun('IncreaseInlineAdsRedux') &&
    abUtils.getTestVariantId('IncreaseInlineAdsRedux') === 'yes';

const getSlotNameForMobile = () =>
    bodyAds === 1 ? 'top-above-nav' : `inline${bodyAds - 1}`;

const getSlotNameForDesktop = () => `inline${bodyAds}`;

const getSlotTypeForMobile = () => (bodyAds === 1 ? 'top-above-nav' : 'inline');

const getSlotTypeForDesktop = () => 'inline';

const insertAdAtPara = (para, name, type, classes, sizes) => {
    const ad = createSlot(type, {
        name,
        classes,
        sizes,
    });

    return fastdom
        .write(() => {
            para.parentNode.insertBefore(ad, para);
        })
        .then(() => {
            addSlot(ad, name === 'im');
        });
};

// Add new ads while there is still space
const addArticleAds = (count, rules) => {
    const insertInlineAds = paras => {
        const slots = paras
            .slice(0, Math.min(paras.length, count))
            .map(para => {
                bodyAds += 1;
                return insertAdAtPara(
                    para,
                    getSlotName(),
                    getSlotType(),
                    `inline${isOffsetingAds && bodyAds > 1 ? ' offset-right' : ''}`,
                    isOffsetingAds && bodyAds > 1
                        ? {
                              desktop: [adSizes.halfPage],
                          }
                        : null
                );
            });

        return Promise.all(slots).then(() => slots.length);
    };

    return spaceFiller.fillSpace(rules, insertInlineAds, {
        waitForImages: true,
        waitForLinks: true,
        waitForInteractives: true,
    });
};

const getRules = (): Object => {
    let prevSlot;
    return {
        bodySelector: '.js-article__body',
        slotSelector: ' > p',
        minAbove: detect.isBreakpoint({
            max: 'tablet',
        })
            ? 300
            : 700,
        minBelow: 300,
        selectors: {
            ' > h2': {
                minAbove: detect.getBreakpoint() === 'mobile' ? 100 : 0,
                minBelow: 250,
            },
            ' .ad-slot': {
                minAbove: 500,
                minBelow: 500,
            },
            ' > :not(p):not(h2):not(.ad-slot)': {
                minAbove: 35,
                minBelow: 400,
            },
        },
        filter(slot) {
            if (
                !prevSlot ||
                Math.abs(slot.top - prevSlot.top) - adSizes.mpu.height >=
                    this.selectors[' .ad-slot'].minBelow
            ) {
                prevSlot = slot;
                return true;
            }
            return false;
        },
    };
};

const getAltRules = () => {
    const altRules = getRules();
    altRules.selectors = {
        ' .ad-slot': {
            minAbove: 500,
            minBelow: 500,
        },
    };
    return altRules;
};

const getLongArticleRules = () => {
    const longArticleRules = isOffsetingAds ? getAltRules() : getRules();
    const viewportHeight = detect.getViewport().height;
    longArticleRules.selectors[' .ad-slot'].minAbove = viewportHeight;
    longArticleRules.selectors[' .ad-slot'].minBelow = viewportHeight;
    return longArticleRules;
};

const addInlineAds = () =>
    addArticleAds(
        2,
        isOffsetingAds ? getAltRules() : getRules()
    ).then(countAdded => {
        if (countAdded === 2) {
            return addArticleAds(8, getLongArticleRules()).then(
                innerCountAdded => 2 + innerCountAdded
            );
        }
        return countAdded;
    });

const getInlineMerchRules = () => {
    const inlineMerchRules = getRules();
    inlineMerchRules.minAbove = 300;
    inlineMerchRules.selectors[' > h2'].minAbove = 100;
    inlineMerchRules.selectors[
        ' > :not(p):not(h2):not(.ad-slot)'
    ].minAbove = 200;
    return inlineMerchRules;
};

const addInlineMerchAd = () =>
    spaceFiller.fillSpace(
        getInlineMerchRules(),
        paras => insertAdAtPara(paras[0], 'im', 'im').then(() => 1),
        {
            waitForImages: true,
            waitForLinks: true,
            waitForInteractives: true,
        }
    );

const waitForMerch = (countAdded: number) =>
    countAdded === 1 ? trackAdRender('dfp-ad--im') : Promise.resolve();

const articleBodyAdvertsInit = () => {
    if (!commercialFeatures.articleBodyAdverts) {
        return Promise.resolve(false);
    }

    bodyAds = 0;
    replaceTopSlot = detect.isBreakpoint({
        max: 'phablet',
    });
    getSlotName = replaceTopSlot ? getSlotNameForMobile : getSlotNameForDesktop;
    getSlotType = replaceTopSlot ? getSlotTypeForMobile : getSlotTypeForDesktop;

    if (config.page.hasInlineMerchandise) {
        const im = addInlineMerchAd();
        // Whether an inline merch has been inserted or not,
        // we still want to try to insert inline MPUs. But
        // we must wait for DFP to return, since if the merch
        // component is empty, it might completely change the
        // positions where we insert those MPUs.
        im.then(waitForMerch).then(addInlineAds);
        return im;
    }

    addInlineAds();
    return Promise.resolve(true);
};

export { articleBodyAdvertsInit };

export const _ = {
    waitForMerch,
    addInlineMerchAd,
    addInlineAds,
};
