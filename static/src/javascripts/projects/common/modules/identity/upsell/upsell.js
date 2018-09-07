// @flow
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import { ConsentCardList } from 'common/modules/identity/upsell/consent-card/ConsentCardList';
import { ExpandableConsentCardList } from 'common/modules/identity/upsell/consent-card/ExpandableConsentCardList';
import loadEnhancers from './../modules/loadEnhancers';
import { AccountCreationFlow } from './account-creation/AccountCreationFlow';
import { OptOutsList } from './opt-outs/OptOutsList';

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
                accountToken={el.dataset.accountToken}
                email={el.dataset.email}
            />,
            el
        );
    });
};

const bindOptouts = (el): void => {
    fastdom.write(() => {
        render(<OptOutsList />, el);
    });
};

const bindConfirmEmailThankYou = (el): void => {
    fastdom.write(() => {
        render(
            <div>
                <ConsentCardList displayWhiteList={['supporter']} />
                <ExpandableConsentCardList
                    list={
                        <ConsentCardList
                            displayWhiteList={['jobs', 'offers']}
                        />
                    }
                />
            </div>,
            el
        );
    });
};

const enhanceUpsell = (): void => {
    loadEnhancers([
        ['.js-identity-upsell-account-creation', bindAccountCreation],
        ['.js-identity-upsell-optputs', bindOptouts],
        [
            '.js-identity-upsell-confirm-email-thank-you',
            bindConfirmEmailThankYou,
        ],
    ]);
};

export { enhanceUpsell };
