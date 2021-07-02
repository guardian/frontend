import { trackNonClickInteraction } from 'common/modules/analytics/google';
import React, { render } from 'preact/compat';
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import loadEnhancers from 'common/modules/identity/modules/loadEnhancers';
import { AccountCreationCompleteConsentsFlow } from 'common/modules/identity/upsell/account-creation/AccountCreationCompleteConsentsFlow';

const trackInteraction = (interaction) => {
    ophan.record({
        component: 'set-password',
        value: interaction,
    });
    trackNonClickInteraction(interaction);
};

const bindAccountCreation = (el) => {
    trackInteraction('set-password : display');
    fastdom.mutate(() => {
        render(
            <AccountCreationCompleteConsentsFlow
                csrfToken={el.dataset.csrf}
                accountToken={el.dataset.accountToken}
                email={el.dataset.email}
            />,
            el
        );
    });
};

const enhanceUpsell = () => {
    loadEnhancers([
        ['.js-identity-upsell-account-creation', bindAccountCreation],
    ]);
};

export { enhanceUpsell };
