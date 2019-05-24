// @flow
import config from 'lib/config';
import fastdom from 'lib/fastdom-promise';
// import { getCookie } from 'lib/cookies';
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

const createAdCloseDiv = (): HTMLDivElement => {
    const closeDiv: HTMLDivElement = document.createElement('div');
    closeDiv.className = 'mobilesticky-closer';
    closeDiv.innerHTML =
        '<svg viewbox="0 0 40 40"><path class="mobilesticky-container_close-x" d="M 10,10 L 30,30 M 30,10 L 10,30" /></svg>';
    closeDiv.onclick = function onclickMobileStickyCloser() {
        const wrapperEl = this.parentElement;
        if (wrapperEl)
            wrapperEl.classList.add('mobilesticky-container--hidden');
    };
    return closeDiv;
};

const createAdWrapper = (): HTMLDivElement => {
    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.className = 'mobilesticky-container';
    wrapper.appendChild(createAdCloseDiv());
    wrapper.appendChild(createAdSlot());
    return wrapper;
};

// const isInNA = (): boolean =>
//     (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() === 'NA';

export const init = (): Promise<void> => {
    if (
        // isInNA() &&
        config.get('page.contentType') === 'Article' &&
        isInVariantSynchronous(commercialUsMobileSticky, 'variant')
    ) {
        const mobileStickyWrapper = createAdWrapper();

        fastdom
            .write(() => {
                if (document.body)
                    document.body.appendChild(mobileStickyWrapper);
            })
            .then(() => {
                const mobileStickyAdSlot = mobileStickyWrapper.querySelector(
                    '#dfp-ad--mobilesticky'
                );
                if (mobileStickyAdSlot) addSlot(mobileStickyAdSlot, false);
            });
    }

    return Promise.resolve();
};
