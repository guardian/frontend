// @flow strict
import fastdom from 'lib/fastdom-promise';
import { addSlot } from 'commercial/modules/dfp/add-slot';
import { createSlots } from 'commercial/modules/dfp/create-slots';
import { shouldIncludeMobileSticky } from 'commercial/modules/prebid/utils';

const createAdWrapper = (): HTMLDivElement => {
    const wrapper: HTMLDivElement = document.createElement('div');
    wrapper.className = 'mobilesticky-container';
    const adSlot = createSlots('mobile-sticky', {})[0];
    wrapper.appendChild(adSlot);
    return wrapper;
};

export const init = (): Promise<void> => {
    if (shouldIncludeMobileSticky()) {
        const mobileStickyWrapper = createAdWrapper();

        return fastdom
            .write(() => {
                if (document.body)
                    document.body.appendChild(mobileStickyWrapper);
            })
            .then(() => {
                const mobileStickyAdSlot = mobileStickyWrapper.querySelector(
                    '#dfp-ad--mobile-sticky'
                );
                if (mobileStickyAdSlot) addSlot(mobileStickyAdSlot, true);
            });
    }

    return Promise.resolve();
};
