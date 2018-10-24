// @flow
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import ophan from 'ophan/ng';
import { FollowCardList } from 'common/modules/identity/upsell/consent-card/FollowCardList';
import loadEnhancers from 'common/modules/identity/modules/loadEnhancers';
import { AccountCreationCompleteConsentsFlow } from 'common/modules/identity/upsell/account-creation/AccountCreationCompleteConsentsFlow';
import { OptOutsList } from 'common/modules/identity/upsell/opt-outs/OptOutsList';
import { Block } from 'common/modules/identity/upsell/block/Block';
import {
    getUserConsent,
    getNewsletterConsent,
} from 'common/modules/identity/upsell/store/consents';
import { LegalTextBlock } from 'common/modules/identity/upsell/block/LegalTextBlock';
import { AccountCreationBlock } from 'common/modules/identity/upsell/account-creation/AccountCreationBlock';
import { Header } from 'common/modules/identity/upsell/header/Header';
import config from 'lib/config';

const ConfirmEmailThankYou = (
    <Block title="Guardian favourites:">
        <FollowCardList
            consents={[
                getUserConsent('supporter'),
                getNewsletterConsent('the-long-read'),
                getUserConsent('holidays'),
                getNewsletterConsent('bookmarks'),
                getUserConsent('events'),
                getNewsletterConsent('brexit-briefing'),
                getUserConsent('offers'),
                getUserConsent('jobs'),
                getNewsletterConsent('green-light'),
                getNewsletterConsent('lab-notes'),
            ]}
            cutoff={2}
        />
    </Block>
);

const Optouts = (
    <Block sideBySideBackwards title="Your communication preferences">
        <LegalTextBlock>
            You can change these preferences at any time via the&nbsp;
            <a
                data-link-name="upsell-optout-preferences-link"
                className="u-underline identity-upsell-consent-card__link"
                href={`${config.get('page.idUrl')}/email-prefs`}>
                Emails & marketing
            </a>
            &nbsp;section of your account.
        </LegalTextBlock>
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
                        <Header
                            title="Thank you!"
                            subtitle="You’re now subscribed"
                        />
                        <div className="identity-upsell-layout">
                            {ConfirmEmailThankYou}
                            {Optouts}
                            {prefill.hasPassword !== 'true' &&
                            prefill.hasSocialLinks !== 'true' &&
                            typeof prefill.accountToken !== 'undefined' ? (
                                <AccountCreationBlock {...prefill} />
                            ) : null}
                        </div>
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
