// @flow
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import { FollowCardList } from 'common/modules/identity/upsell/consent-card/FollowCardList';
import { ExpandableFollowCardList } from 'common/modules/identity/upsell/consent-card/ExpandableFollowCardList';
import loadEnhancers from 'common/modules/identity/modules/loadEnhancers';
import { AccountCreationFlow } from 'common/modules/identity/upsell/account-creation/AccountCreationFlow';
import { OptOutsList } from 'common/modules/identity/upsell/opt-outs/OptOutsList';
import { Block } from 'common/modules/identity/upsell/block/Block';

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
        render(
            <Block
                title="One more thing..."
                subtitle="These are your privacy settings. You’re in full control of them.">
                <OptOutsList />
            </Block>,
            el
        );
    });
};

const bindBlock = (el): void => {
    fastdom.write(() => {
        render(<Block title="Hello!">Test</Block>, el);
    });
};

const bindConfirmEmailThankYou = (el): void => {
    fastdom.write(() => {
        render(
            <Block title="Interested in any of this content?">
                <FollowCardList displayWhiteList={['supporter']} />
                <ExpandableFollowCardList
                    list={
                        <FollowCardList displayWhiteList={['jobs', 'offers']} />
                    }
                />
            </Block>,
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
        ['.js-identity-upsell-block', bindBlock],
    ]);
};

export { enhanceUpsell };
