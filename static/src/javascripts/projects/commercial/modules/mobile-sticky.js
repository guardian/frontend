// @flow
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { commercialUsMobileSticky } from 'common/modules/experiments/tests/commercial-us-mobile-sticky';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';

const createAdSlot = (): HTMLDivElement => {
    const adSlot: HTMLDivElement = document.createElement('div');
    adSlot.id = 'dfp-ad--mobilesticky';
    adSlot.className = 'js-ad-slot ad-slot ad-slot--mobile-sticky';
    adSlot.setAttribute('data-link-name', 'ad slot mobilesticky');
    adSlot.setAttribute('data-name', 'mobilesticky');
    adSlot.setAttribute('data-mobile', '320,50');
    adSlot.setAttribute('aria-hidden', 'true');

    return adSlot;
};

export const init = (): Promise<void> => {
    // If !inUS() || !inTestVariant

    if (isInVariantSynchronous(commercialUsMobileSticky, 'variant')) {
        const mobileStickySlot = createAdSlot();

        fastdom
            .write(() => {
                if (document.body) document.body.appendChild(mobileStickySlot);
            })
            .then(() => {
                addSlot(mobileStickySlot, false);
            });
    }

    return Promise.resolve();
};
