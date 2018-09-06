// @flow
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import loadEnhancers from './../modules/loadEnhancers';
import { ConsentCard } from './consent-card/ConsentCard';
import type { Consent } from './consent-card/ConsentCard';

const bindConfirmEmailThankYou = (el): void => {
    const testConsent: Consent = {
        name: 'Test Consent',
        id: '42',
        text: 'Sign Up to the latest testing news!',
    };
    fastdom.write(() => {
        render(<ConsentCard consent={testConsent} hasConsented={false} />, el);
    });
};

const enhanceConfirmEmailThankYou = (): void => {
    loadEnhancers([
        [
            '.js-identity-upsell-confirm-email-thank-you',
            bindConfirmEmailThankYou,
        ],
    ]);
};

export { enhanceConfirmEmailThankYou };
