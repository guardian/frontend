// @flow
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
import { getCookie } from 'lib/cookies';
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

const isInNA = (): boolean =>
    (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() === 'NA';

export const init = (): Promise<void> => {
    if (
        isInNA() &&
        config.get('page.contentType') === 'Article' &&
        isInVariantSynchronous(commercialUsMobileSticky, 'variant')
    ) {
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
