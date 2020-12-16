// @flow
import fastdom from 'lib/fastdom-promise';
import { isDigitalSubscriber, isRecentOneOffContributor, isRecurringContributor } from 'common/modules/commercial/user-features';


// @flow
const showGiftingCTA = (): void => {
    // Unhide the gifting CTA for Subscribers and Contributors
    if (isDigitalSubscriber() || isRecurringContributor() || isRecentOneOffContributor()) {
        const giftingCTA = document.querySelector('.js-gifting-cta');

        if (!giftingCTA) {
            return;
        }

        fastdom.mutate(() => {
            giftingCTA.classList.remove('is-hidden');
        });
    }
}

export { showGiftingCTA };
