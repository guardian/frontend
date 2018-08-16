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

const bindAccountUpsell = (): void => {
    trackInteraction('set-password : display');
};

const enhanceAccountUpsell = (): void => {
    loadEnhancers([['.js-identity-uppsala-account-upsell', bindAccountUpsell]]);
};

export { enhanceAccountUpsell };
