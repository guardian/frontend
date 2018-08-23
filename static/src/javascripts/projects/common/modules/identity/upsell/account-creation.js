// @flow
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import loadEnhancers from './../modules/loadEnhancers';
import { AccountCreationFlow } from './account-creation/AccountCreationFlow';

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
            <AccountCreationFlow
                csrfToken={el.dataset.csrf}
                returnUrl={el.dataset.returnUrl}
                accountToken={el.dataset.accountToken}
            />,
            el
        );
    });
};

const enhanceAccountCreation = (): void => {
    loadEnhancers([
        ['.js-identity-upsell-account-creation', bindAccountCreation],
    ]);
};

export { enhanceAccountCreation };
