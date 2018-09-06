// @flow
import React, { render } from 'preact-compat';
import fastdom from 'lib/fastdom-promise';
import loadEnhancers from './../modules/loadEnhancers';
import { ConsentCardList } from './consent-card/ConsentCardList';

const bindConfirmEmailThankYou = (el): void => {
    fastdom.write(() => {
        render(<ConsentCardList />, el);
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
