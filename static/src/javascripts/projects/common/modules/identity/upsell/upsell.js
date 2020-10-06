// @flow
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import loadEnhancers from 'common/modules/identity/modules/loadEnhancers';
import { AccountCreationCompleteConsentsFlow } from 'common/modules/identity/upsell/account-creation/AccountCreationCompleteConsentsFlow';
import { StatefulConfirmEmailPage } from './page/StatefulConfirmEmailPage';

const trackInteraction = (interaction: string): void => {
    ophan.record({
        component: 'set-password',
        value: interaction,
    });
    trackNonClickInteraction(interaction);
};

const bindAccountCreation = (el): void => {
    trackInteraction('set-password : display');
    fastdom.write(() => {
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

type Prefill = {
    csrfToken: string,
    accountToken: ?string,
    email: string,
    hasPassword: boolean,
    hasSocialLinks: boolean,
};

const getPrefill = (el: HTMLElement): Prefill => ({
    csrfToken: el.dataset.csrfToken,
    accountToken: el.dataset.accountToken,
    email: el.dataset.email,
    hasPassword: el.dataset.hasPassword === 'true',
    hasSocialLinks: el.dataset.hasSocialLinks === 'true',
});

const bindBlockList = (el): void => {
    fastdom
        .measure(() => getPrefill(el))
        .then(prefill =>
            fastdom.write(() => {
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

const enhanceUpsell = (): void => {
    loadEnhancers([
        ['.js-identity-upsell-account-creation', bindAccountCreation],
        ['.js-identity-block-list', bindBlockList],
    ]);
};

export { enhanceUpsell };
