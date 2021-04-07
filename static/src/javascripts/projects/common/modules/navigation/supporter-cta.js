import fastdom from 'lib/fastdom-promise';
import { shouldHideSupportMessaging } from 'common/modules/commercial/user-features';

const showSupporterCTA = () => {
    // show supporter CTA if support messaging isn't shown
    if (shouldHideSupportMessaging()) {
        const supporterCTA = document.querySelector('.js-supporter-cta');

        if (!supporterCTA) {
            return;
        }

        fastdom.mutate(() => {
            supporterCTA.classList.remove('is-hidden');
        });
    }
}

export { showSupporterCTA };
