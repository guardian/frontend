// @flow
import fastdom from 'lib/fastdom-promise';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';


// @flow
const showGiftingCTA = (): void => {
    // show gifting if support messaging isn't shown
    if (shouldHideSupportMessaging()) {
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
