// @flow
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import ophan from 'ophan/ng';
import loadEnhancers from './../modules/loadEnhancers';

const trackInteraction = (interaction: string): void => {
    ophan.record({
        component: 'set-password',
        value: interaction,
    });
    trackNonClickInteraction(interaction);
};

const bindAccountCreation = (): void => {
    trackInteraction('set-password : display');
};

const enhanceAccountCreation = (): void => {
    loadEnhancers([
        ['.js-identity-upsell-account-creation', bindAccountCreation],
    ]);
};

export { enhanceAccountCreation };
