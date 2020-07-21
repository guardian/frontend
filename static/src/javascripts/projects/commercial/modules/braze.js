// @flow

import { onIabConsentNotification } from '@guardian/consent-management-platform';
import config from 'lib/config';

const brazeUuid = 'XXX';
let didAlreadyRun = false;

export const init = (): Promise<any> => {
    const apiKey = config.get('page.brazeApiKey');
    if (!apiKey) return Promise.reject("Braze API key not set.");
    console.log("Initializing Braze");

    onIabConsentNotification(state => {
        console.log("consent state", state);
        const canRun = !didAlreadyRun && state[1] && state[2] && state[3] && state[4] && state[5];

        if (canRun) {
            import(/* webpackChunkName: "braze-web-sdk" */ '@braze/web-sdk').then(appboy => {
                didAlreadyRun = true;

                appboy.initialize(apiKey, {
                    enableLogging: true,
                    noCookies: true,
                    baseUrl: 'https://sdk.fra-01.braze.eu/api/v3',
                    enableHtmlInAppMessages: true
                });

                const f = function (configuration) {
                    console.log(configuration);
                    appboy.display.showInAppMessage(configuration);
                    return true;
                }

                appboy.subscribeToInAppMessage(f);

                appboy.changeUser(brazeUuid);
                appboy.openSession();
            });
        }
    })

    return Promise.resolve();
}
