import { trackNonClickInteraction } from 'common/modules/analytics/google';
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import loadEnhancers from 'common/modules/identity/modules/loadEnhancers';
import { AccountCreationCompleteConsentsFlow } from 'common/modules/identity/upsell/account-creation/AccountCreationCompleteConsentsFlow';
import { StatefulConfirmEmailPage } from './page/StatefulConfirmEmailPage';

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


const getPrefill = (el) => ({
    csrfToken: el.dataset.csrfToken,
    accountToken: el.dataset.accountToken,
    email: el.dataset.email,
    hasPassword: el.dataset.hasPassword === 'true',
    hasSocialLinks: el.dataset.hasSocialLinks === 'true',
});

const bindBlockList = (el) => {
    fastdom
        .measure(() => getPrefill(el))
        .then(prefill =>
            fastdom.mutate(() => {
                render(
                    <StatefulConfirmEmailPage
                        csrfToken={prefill.csrfToken}
                        accountToken={prefill.accountToken}
                        email={prefill.email}
                        hasPassword={prefill.hasPassword}
                        hasSocialLinks={prefill.hasSocialLinks}
                    />,
                    el
                );
            })
        );
};

const enhanceUpsell = () => {
    loadEnhancers([
        ['.js-identity-upsell-account-creation', bindAccountCreation],
        ['.js-identity-block-list', bindBlockList],
    ]);
};

export { enhanceUpsell };
