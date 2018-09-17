// @flow
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import { FollowCardList } from 'common/modules/identity/upsell/consent-card/FollowCardList';
import { ExpandableFollowCardList } from 'common/modules/identity/upsell/consent-card/ExpandableFollowCardList';
import loadEnhancers from 'common/modules/identity/modules/loadEnhancers';
import { AccountCreationCompleteConsentsFlow } from 'common/modules/identity/upsell/account-creation/AccountCreationCompleteConsentsFlow';
import { OptOutsList } from 'common/modules/identity/upsell/opt-outs/OptOutsList';
import { Block } from 'common/modules/identity/upsell/block/Block';
import { get as getConsents } from 'common/modules/identity/upsell/store/consents';
import { get as getNewsletters } from 'common/modules/identity/upsell/store/newsletters';
import { AccountCreationBlock } from './account-creation/AccountCreationBlock';

const ConfirmEmailThankYou = (
    <Block title="Interested in any of this content?">
        <FollowCardList
            displayWhiteList={['supporter']}
            loadFollowables={getConsents}
        />
        <FollowCardList
            displayWhiteList={['today-uk']}
            loadFollowables={getNewsletters}
        />
        <ExpandableFollowCardList
            list={
                <FollowCardList
                    displayWhiteList={['jobs', 'offers']}
                    loadFollowables={getConsents}
                />
            }
        />
    </Block>
);

const Optouts = (
    <Block
        title="One more thing..."
        subtitle="These are your privacy settings. You’re in full control of them.">
        <OptOutsList />
    </Block>
);

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

const bindBlockList = (el): void => {
    fastdom
        .read(() => {
            const jsonEl: HTMLScriptElement = el.querySelector(
                'script[data-for-prefill]'
            );
            if (!jsonEl) throw new Error('Missing prefill');
            return JSON.parse(jsonEl.innerText || '');
        })
        .then(prefill =>
            fastdom.write(() => {
                render(
                    <div>
                        {ConfirmEmailThankYou}
                        {Optouts}
                        <AccountCreationBlock {...prefill} />
                    </div>,
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
