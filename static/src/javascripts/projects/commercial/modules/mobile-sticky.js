import fastdom from '../../../lib/fastdom-promise';
import { addSlot } from './dfp/add-slot';
import { createSlots } from './dfp/create-slots';
import { shouldIncludeMobileSticky } from './header-bidding/utils';
import config from '../../../lib/config';

const createAdWrapperClassic = () => {
    const wrapper = document.createElement('div');
    wrapper.className = 'mobilesticky-container';
    const adSlot = createSlots('mobile-sticky', {})[0];
    wrapper.appendChild(adSlot);
    return wrapper;
};

const createAdWrapperDCR = () => {
    const wrapper = document.querySelector('.mobilesticky-container');
    if (wrapper) {
        const adSlot = createSlots('mobile-sticky', {})[0];
        wrapper.appendChild(adSlot);
    }
    return wrapper;
};

const createAdWrapper = () => {
    if (!config.get('isDotcomRendering', false)) {
        return createAdWrapperClassic();
    }
    return createAdWrapperDCR();
};

export const init = () => {
    if (shouldIncludeMobileSticky()) {
        const mobileStickyWrapper = createAdWrapper();
        return fastdom
            .mutate(() => {
                if (document.body && mobileStickyWrapper)
                    document.body.appendChild(mobileStickyWrapper);
            })
            .then(() => {
                if (mobileStickyWrapper) {
                    const mobileStickyAdSlot = mobileStickyWrapper.querySelector(
                        '#dfp-ad--mobile-sticky'
                    );
                    if (mobileStickyAdSlot) addSlot(mobileStickyAdSlot, true);
                }
            });
    }

    return Promise.resolve();
};
